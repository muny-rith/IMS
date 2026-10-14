import pool, { query } from '../../config/db.js';
import ApiError from '../../shared/errors/ApiError.js';

const normalizeIdList = (value) => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item > 0);
};

const normalizeAttributeValues = (value) => {
  const values = Array.isArray(value) ? value : [value];

  return values
    .map((item) => String(item ?? '').trim())
    .filter(Boolean);
};

const buildVariantSignature = (valueIds) =>
  [...new Set(valueIds.map((valueId) => Number(valueId)).filter(Boolean))]
    .sort((a, b) => a - b)
    .join(',');

const resolveVariantValueIds = async (client, attributes = {}) => {
  const resolvedValueIds = [];

  if (!attributes || typeof attributes !== 'object') {
    return resolvedValueIds;
  }

  for (const [attrId, attrValues] of Object.entries(attributes)) {
    const attributeId = Number(attrId);
    if (!Number.isInteger(attributeId) || attributeId <= 0) continue;

    for (const attrVal of normalizeAttributeValues(attrValues)) {
      const valRes = await client.query(
        'SELECT value_id FROM tb_attribute_value WHERE attribute_id = $1 AND value = $2',
        [attributeId, attrVal]
      );

      if (valRes.rows.length > 0) {
        resolvedValueIds.push(valRes.rows[0].value_id);
        continue;
      }

      const newValRes = await client.query(
        'INSERT INTO tb_attribute_value (attribute_id, value) VALUES ($1, $2) RETURNING value_id',
        [attributeId, attrVal]
      );
      resolvedValueIds.push(newValRes.rows[0].value_id);
    }
  }

  return [...new Set(resolvedValueIds)];
};

const getVariantValueIdsByVariant = async (client, variantIds) => {
  if (!variantIds.length) return new Map();

  const { rows } = await client.query(
    `
      SELECT variant_id, value_id
      FROM tb_variant_attribute_value
      WHERE variant_id = ANY($1);
    `,
    [variantIds]
  );

  const valueMap = new Map();
  for (const variantId of variantIds) {
    valueMap.set(Number(variantId), []);
  }

  for (const row of rows) {
    const variantId = Number(row.variant_id);
    valueMap.set(variantId, [...(valueMap.get(variantId) || []), row.value_id]);
  }

  return valueMap;
};

const assertNoDuplicateVariantSignatures = (signatureRows) => {
  const seen = new Map();

  for (const row of signatureRows) {
    const previous = seen.get(row.signature);
    if (previous) {
      throw new ApiError(
        400,
        `Duplicate variant: "${previous.label}" and "${row.label}" share the exact same attribute values.`
      );
    }
    seen.set(row.signature, row);
  }
};

const getVariantHistoryCounts = async (client, variantId) => {
  const { rows } = await client.query(
    `
      SELECT
        (SELECT COUNT(*)::INTEGER FROM tb_stock_movement WHERE variant_id = $1) AS stock_movements,
        (SELECT COUNT(*)::INTEGER FROM tb_loan_item WHERE variant_id = $1) AS loan_items,
        (SELECT COUNT(*)::INTEGER FROM tb_sale_item WHERE variant_id = $1) AS sale_items,
        (SELECT COUNT(*)::INTEGER FROM tb_stock_issue_item WHERE variant_id = $1) AS stock_issue_items,
        (SELECT COUNT(*)::INTEGER FROM tb_purchase_request_item WHERE variant_id = $1) AS purchase_request_items;
    `,
    [variantId]
  );

  return rows[0];
};

const assertVariantCanBeDeleted = async (client, variantId) => {
  const counts = await getVariantHistoryCounts(client, variantId);
  const hasHistory = Object.values(counts).some((count) => Number(count) > 0);

  if (hasHistory) {
    throw new ApiError(
      409,
      `Variant ${variantId} cannot be deleted because it already has stock, loan, sale, issue, or purchase request history.`
    );
  }
};

const insertVariantAttributeLinks = async (client, variantId, valueIds) => {
  for (const valueId of valueIds) {
    await client.query(
      'INSERT INTO tb_variant_attribute_value (variant_id, value_id) VALUES ($1, $2)',
      [variantId, valueId]
    );
  }
};

const buildNextGeneratedSku = async (client, productId, startIndex) => {
  let nextIndex = startIndex;

  while (true) {
    const sku = `${productId}-${nextIndex}`;
    const existing = await client.query(
      'SELECT 1 FROM tb_product_variant WHERE sku = $1 LIMIT 1;',
      [sku]
    );

    if (existing.rows.length === 0) {
      return sku;
    }
    nextIndex += 1;
  }
};

export const findAll = async () => {
  const text = `
    SELECT 
      p.product_id,
      p.product_name,
      p.category_id,
      p.brand_id,
      p.department,
      p.is_active,
      COALESCE(p.image_url, (
        SELECT pv2.image_url 
        FROM tb_product_variant pv2 
        WHERE pv2.product_id = p.product_id AND pv2.image_url IS NOT NULL AND pv2.is_active = true 
        ORDER BY pv2.variant_id ASC 
        LIMIT 1
      )) AS image_url,
      p.created_at,
      p.updated_at,
      c.category_name,
      b.brand_name,
      COALESCE(SUM(sb.on_hand_qty), 0)::INTEGER AS on_hand_qty,
      COALESCE(SUM(sb.reserved_qty), 0)::INTEGER AS reserved_qty,
      COALESCE(MIN(pv.unit_price), 0)::NUMERIC AS unit_price,
      COALESCE(MIN(pv.variant_id), 0)::INTEGER AS default_variant_id,
      COALESCE(MIN(pv.sku), 'SKU-' || p.product_id::text) AS sku,
      COALESCE(MIN(pv.sku), 'SKU-' || p.product_id::text) AS product_code
    FROM tb_product p
    LEFT JOIN tb_category c ON p.category_id = c.category_id
    LEFT JOIN tb_brand b ON p.brand_id = b.brand_id
    LEFT JOIN tb_product_variant pv ON p.product_id = pv.product_id AND pv.is_active = true
    LEFT JOIN tb_stock_balance sb ON pv.variant_id = sb.variant_id
    GROUP BY p.product_id, c.category_name, b.brand_name
    ORDER BY p.product_id DESC;
  `;
  const { rows } = await query(text);
  return rows;
};

export const findById = async (id) => {
  const prodText = `
    SELECT 
      p.product_id,
      p.product_name,
      p.category_id,
      p.brand_id,
      p.department,
      p.is_active,
      p.image_url,
      p.created_at,
      p.updated_at,
      c.category_name,
      b.brand_name,
      COALESCE(SUM(sb.on_hand_qty), 0)::INTEGER AS on_hand_qty,
      COALESCE(SUM(sb.reserved_qty), 0)::INTEGER AS reserved_qty,
      COALESCE(MIN(pv.unit_price), 0)::NUMERIC AS unit_price,
      COALESCE(MIN(pv.variant_id), 0)::INTEGER AS default_variant_id,
      COALESCE(MIN(pv.sku), 'SKU-' || p.product_id::text) AS sku,
      COALESCE(MIN(pv.sku), 'SKU-' || p.product_id::text) AS product_code
    FROM tb_product p
    LEFT JOIN tb_category c ON p.category_id = c.category_id
    LEFT JOIN tb_brand b ON p.brand_id = b.brand_id
    LEFT JOIN tb_product_variant pv ON p.product_id = pv.product_id AND pv.is_active = true
    LEFT JOIN tb_stock_balance sb ON pv.variant_id = sb.variant_id
    WHERE p.product_id = $1
    GROUP BY p.product_id, c.category_name, b.brand_name;
  `;
  const { rows: prodRows } = await query(prodText, [id]);
  const product = prodRows[0];
  if (!product) return null;

  const attrText = `
    SELECT a.attribute_id, a.attribute_name
    FROM tb_product_attribute pa
    JOIN tb_attribute a ON pa.attribute_id = a.attribute_id
    WHERE pa.product_id = $1
    ORDER BY a.attribute_name ASC;
  `;
  const { rows: productAttributes } = await query(attrText, [id]);
  product.product_attributes = productAttributes;

  // Fetch individual variants with their stock balances
  const varText = `
    SELECT 
      pv.variant_id,
      pv.product_id,
      pv.sku,
      pv.unit_price,
      pv.image_url,
      pv.other,
      pv.is_active,
      COALESCE(sb.on_hand_qty, 0)::INTEGER AS on_hand_qty,
      COALESCE(sb.reserved_qty, 0)::INTEGER AS reserved_qty,
      COALESCE(
        json_agg(
          json_build_object(
            'attribute_id', av.attribute_id,
            'attribute_name', a.attribute_name,
            'value_id', av.value_id,
            'value', av.value,
            'other', av.other
          )
          ORDER BY a.attribute_name, av.value
        ) FILTER (WHERE av.value_id IS NOT NULL),
        '[]'::json
      ) AS attribute_values
    FROM tb_product_variant pv
    LEFT JOIN tb_stock_balance sb ON pv.variant_id = sb.variant_id
    LEFT JOIN tb_variant_attribute_value vav ON pv.variant_id = vav.variant_id
    LEFT JOIN tb_attribute_value av ON vav.value_id = av.value_id
    LEFT JOIN tb_attribute a ON av.attribute_id = a.attribute_id
    WHERE pv.product_id = $1
    GROUP BY pv.variant_id, sb.on_hand_qty, sb.reserved_qty
    ORDER BY pv.variant_id ASC;
  `;
  const { rows: variantRows } = await query(varText, [id]);
  product.variants = variantRows.map((variant) => {
    const attributes = {};
    for (const value of variant.attribute_values || []) {
      const key = String(value.attribute_id);
      attributes[key] = [...(attributes[key] || []), value.value];
    }

    return {
      ...variant,
      attributes,
    };
  });

  return product;
};

export const createProductWithBalance = async ({ product_name, category_id, brand_id, department, image_url, variants = [], product_attributes = [] }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Insert product
    const prodText = `
      INSERT INTO tb_product (product_name, category_id, brand_id, department, image_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const prodValues = [product_name, category_id, brand_id || null, department, image_url];
    const prodRes = await client.query(prodText, prodValues);
    const product = prodRes.rows[0];

    // 1.5 Insert custom product-level attributes
    for (const attrId of product_attributes) {
      await client.query(
        'INSERT INTO tb_product_attribute (product_id, attribute_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [product.product_id, attrId]
      );
    }

    // 2. Insert variants
    const insertedVariants = [];
    let totalOnHand = 0;
    // Duplicate-variant guard: tracks each variant's attribute-value signature
    // within THIS request, so two variants with the identical combo (e.g. Flavor:
    // Apple+Peach entered twice) can't both be created for the same product.
    const seenSignatures = new Set();

    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      const variantSku = v.sku || `${product.product_id}-${i + 1}`;

      // Resolve attribute values FIRST (lookup-or-insert) so we can build the
      // signature and check for duplicates before touching tb_product_variant.
      const resolvedValueIds = await resolveVariantValueIds(client, v.attributes);

      // Order-independent signature: sorted value_ids joined into one string.
      // Two variants with the same values in a different pick order (e.g.
      // Peach+Apple vs Apple+Peach) must be treated as the same duplicate.
      const signature = [...resolvedValueIds].sort((a, b) => a - b).join(',');
      if (seenSignatures.has(signature)) {
        throw new ApiError(
          400,
          'Duplicate variant: two variants in this request share the exact same attribute values.'
        );
      }
      seenSignatures.add(signature);

      const varText = `
        INSERT INTO tb_product_variant (product_id, sku, unit_price, image_url, other, is_active)
        VALUES ($1, $2, $3, $4, $5, true)
        RETURNING *;
      `;
      const varRes = await client.query(varText, [product.product_id, variantSku, v.unit_price || 0, v.image_url || null, v.other ? String(v.other).trim() : null]);
      const variant = varRes.rows[0];

      // Link the variant to every resolved attribute value
      await insertVariantAttributeLinks(client, variant.variant_id, resolvedValueIds);

      // 3. Update stock balance and record movement if opening stock > 0
      const openingQty = Number(v.openingQty || 0);
      if (openingQty > 0) {
        await client.query(`
          UPDATE tb_stock_balance 
          SET on_hand_qty = $1, updated_at = NOW()
          WHERE variant_id = $2;
        `, [openingQty, variant.variant_id]);

        const movText = `
          INSERT INTO tb_stock_movement (variant_id, movement_type, qty, notes)
          VALUES ($1, 'OPENING', $2, $3);
        `;
        await client.query(movText, [variant.variant_id, openingQty, v.openingNote || 'Opening stock balance']);
        totalOnHand += openingQty;
      }

      insertedVariants.push(variant);
    }

    await client.query('COMMIT');

    product.on_hand_qty = totalOnHand;
    product.reserved_qty = 0;
    product.variants = insertedVariants;
    if (insertedVariants.length > 0) {
      product.unit_price = insertedVariants[0].unit_price;
      product.default_variant_id = insertedVariants[0].variant_id;
    }

    return product;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const update = async (
  id,
  {
    product_name,
    category_id,
    brand_id,
    department,
    unit_price,
    image_url,
    is_active,
    variants,
    deleted_variant_ids = [],
    product_attributes = null,
  }
) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Update product base
    const text = `
      UPDATE tb_product
      SET product_name = $1, category_id = $2, brand_id = $3, department = $4, image_url = $5, is_active = $6, updated_at = CURRENT_TIMESTAMP
      WHERE product_id = $7
      RETURNING *;
    `;
    const { rows } = await client.query(text, [product_name, category_id, brand_id, department, image_url, is_active, id]);
    const product = rows[0];

    if (Array.isArray(product_attributes)) {
      await client.query('DELETE FROM tb_product_attribute WHERE product_id = $1;', [id]);

      for (const attrId of normalizeIdList(product_attributes)) {
        await client.query(
          'INSERT INTO tb_product_attribute (product_id, attribute_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [id, attrId]
        );
      }
    }

    if (Array.isArray(variants)) {
      const productId = Number(id);
      const deletedIds = new Set(normalizeIdList(deleted_variant_ids));
      const existingRes = await client.query(
        'SELECT * FROM tb_product_variant WHERE product_id = $1 ORDER BY variant_id ASC FOR UPDATE;',
        [productId]
      );
      const existingMap = new Map(
        existingRes.rows.map((variant) => [Number(variant.variant_id), variant])
      );
      const incomingResolutions = new Map();

      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];
        const variantId = Number(variant.variant_id || variant.variantId);

        if (variantId) {
          if (!existingMap.has(variantId)) {
            throw new ApiError(400, `Variant ${variantId} does not belong to product ${productId}.`);
          }
          if (deletedIds.has(variantId)) {
            throw new ApiError(400, `Variant ${variantId} cannot be both updated and deleted.`);
          }
        }

        incomingResolutions.set(i, {
          variantId: variantId || null,
          valueIds: await resolveVariantValueIds(client, variant.attributes),
        });
      }

      for (const deletedId of deletedIds) {
        if (!existingMap.has(deletedId)) {
          throw new ApiError(400, `Variant ${deletedId} does not belong to product ${productId}.`);
        }
        await assertVariantCanBeDeleted(client, deletedId);
      }

      const currentValueMap = await getVariantValueIdsByVariant(
        client,
        [...existingMap.keys()]
      );
      const incomingVariantIds = new Set(
        [...incomingResolutions.values()]
          .map((resolution) => resolution.variantId)
          .filter(Boolean)
      );
      const signatureRows = [];

      for (const [variantId, currentVariant] of existingMap.entries()) {
        if (deletedIds.has(variantId)) continue;

        if (incomingVariantIds.has(variantId)) {
          const matchingIndex = variants.findIndex((variant) =>
            Number(variant.variant_id || variant.variantId) === variantId
          );
          const resolution = incomingResolutions.get(matchingIndex);
          signatureRows.push({
            key: `existing-${variantId}`,
            label: variants[matchingIndex]?.sku || currentVariant.sku || `Variant ${variantId}`,
            signature: buildVariantSignature(resolution.valueIds),
          });
          continue;
        }

        signatureRows.push({
          key: `existing-${variantId}`,
          label: currentVariant.sku || `Variant ${variantId}`,
          signature: buildVariantSignature(currentValueMap.get(variantId) || []),
        });
      }

      for (let i = 0; i < variants.length; i++) {
        const resolution = incomingResolutions.get(i);
        if (resolution.variantId) continue;

        signatureRows.push({
          key: `new-${i}`,
          label: variants[i]?.sku || `New variant ${i + 1}`,
          signature: buildVariantSignature(resolution.valueIds),
        });
      }

      assertNoDuplicateVariantSignatures(signatureRows);

      for (const deletedId of deletedIds) {
        await client.query('DELETE FROM tb_stock_balance WHERE variant_id = $1;', [deletedId]);
        await client.query('DELETE FROM tb_variant_attribute_value WHERE variant_id = $1;', [deletedId]);
        await client.query('DELETE FROM tb_product_variant WHERE variant_id = $1 AND product_id = $2;', [deletedId, productId]);
      }

      let generatedSkuIndex = existingMap.size + 1;
      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];
        const resolution = incomingResolutions.get(i);
        const variantId = resolution.variantId;

        if (variantId) {
          const currentVariant = existingMap.get(variantId);
          const nextSku = String(variant.sku ?? currentVariant.sku ?? '').trim() || null;
          const nextUnitPrice = variant.unit_price !== undefined
            ? Number(variant.unit_price)
            : Number(currentVariant.unit_price || 0);
          const nextImageUrl = variant.image_url !== undefined
            ? variant.image_url
            : currentVariant.image_url;
          const nextIsActive = variant.is_active !== undefined
            ? (variant.is_active === true || variant.is_active === 'true')
            : currentVariant.is_active;

          const nextOther = variant.other !== undefined
            ? (variant.other ? String(variant.other).trim() : null)
            : currentVariant.other;

          await client.query(
            `
              UPDATE tb_product_variant
              SET sku = $1, unit_price = $2, image_url = $3, other = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP
              WHERE variant_id = $6 AND product_id = $7;
            `,
            [nextSku, nextUnitPrice, nextImageUrl || null, nextOther || null, nextIsActive, variantId, productId]
          );

          await client.query('DELETE FROM tb_variant_attribute_value WHERE variant_id = $1;', [variantId]);
          await insertVariantAttributeLinks(client, variantId, resolution.valueIds);
          continue;
        }

        const nextSku = String(variant.sku ?? '').trim()
          || await buildNextGeneratedSku(client, productId, generatedSkuIndex);
        generatedSkuIndex += 1;

        const insertVariantRes = await client.query(
          `
            INSERT INTO tb_product_variant (product_id, sku, unit_price, image_url, other, is_active)
            VALUES ($1, $2, $3, $4, $5, true)
            RETURNING *;
          `,
          [productId, nextSku, Number(variant.unit_price || 0), variant.image_url || null, variant.other ? String(variant.other).trim() : null]
        );
        const insertedVariant = insertVariantRes.rows[0];

        await insertVariantAttributeLinks(client, insertedVariant.variant_id, resolution.valueIds);

        const openingQty = Number(variant.openingQty || 0);
        if (openingQty > 0) {
          await client.query(
            `
              UPDATE tb_stock_balance
              SET on_hand_qty = $1, updated_at = NOW()
              WHERE variant_id = $2;
            `,
            [openingQty, insertedVariant.variant_id]
          );

          await client.query(
            `
              INSERT INTO tb_stock_movement (variant_id, movement_type, qty, notes)
              VALUES ($1, 'OPENING', $2, $3);
            `,
            [insertedVariant.variant_id, openingQty, variant.openingNote || 'Opening stock balance']
          );
        }
      }

      product.variants = variants;
    } else if (unit_price !== undefined) {
      // Keep the legacy edit path for callers that only send a product-level price.
      await client.query(`
        UPDATE tb_product_variant
        SET unit_price = $1, is_active = $2, updated_at = CURRENT_TIMESTAMP
        WHERE product_id = $3;
      `, [unit_price, is_active, id]);
      product.unit_price = unit_price;
    }

    await client.query('COMMIT');
    return product;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const remove = async (id) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Delete child records for variants
    const varRows = (await client.query('SELECT variant_id FROM tb_product_variant WHERE product_id = $1;', [id])).rows;
    const variantIds = varRows.map(v => v.variant_id);

    if (variantIds.length > 0) {
      await client.query('DELETE FROM tb_stock_movement WHERE variant_id = ANY($1);', [variantIds]);
      await client.query('DELETE FROM tb_stock_balance WHERE variant_id = ANY($1);', [variantIds]);
      await client.query('DELETE FROM tb_variant_attribute_value WHERE variant_id = ANY($1);', [variantIds]);
      await client.query('DELETE FROM tb_product_variant WHERE product_id = $1;', [id]);
    }

    await client.query('DELETE FROM tb_product_attribute WHERE product_id = $1;', [id]);
    const { rows } = await client.query('DELETE FROM tb_product WHERE product_id = $1 RETURNING product_id;', [id]);

    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const bulkRemove = async (ids) => {
  const cleanIds = normalizeIdList(ids);
  if (cleanIds.length === 0) return { deletedCount: 0, deletedIds: [], imageUrls: [] };

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Find all variants and their images for these products
    const varRows = (
      await client.query(
        'SELECT variant_id, image_url FROM tb_product_variant WHERE product_id = ANY($1);',
        [cleanIds]
      )
    ).rows;
    const variantIds = varRows.map((v) => v.variant_id);
    const variantImageUrls = varRows.map((v) => v.image_url).filter(Boolean);

    if (variantIds.length > 0) {
      await client.query('DELETE FROM tb_stock_movement WHERE variant_id = ANY($1);', [variantIds]);
      await client.query('DELETE FROM tb_stock_balance WHERE variant_id = ANY($1);', [variantIds]);
      await client.query('DELETE FROM tb_variant_attribute_value WHERE variant_id = ANY($1);', [variantIds]);
      await client.query('DELETE FROM tb_product_variant WHERE variant_id = ANY($1);', [variantIds]);
    }

    await client.query('DELETE FROM tb_product_attribute WHERE product_id = ANY($1);', [cleanIds]);
    const { rows } = await client.query(
      'DELETE FROM tb_product WHERE product_id = ANY($1) RETURNING product_id, image_url;',
      [cleanIds]
    );

    await client.query('COMMIT');

    const productImages = rows.map((r) => r.image_url).filter(Boolean);

    return {
      deletedCount: rows.length,
      deletedIds: rows.map((r) => r.product_id),
      imageUrls: [...productImages, ...variantImageUrls],
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const bulkSetStatus = async (ids, isActive) => {
  const cleanIds = normalizeIdList(ids);
  if (cleanIds.length === 0) return { updatedCount: 0, updatedIds: [], isActive: Boolean(isActive) };

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const statusBool = Boolean(isActive);

    const { rows } = await client.query(
      `
        UPDATE tb_product
        SET is_active = $1, updated_at = CURRENT_TIMESTAMP
        WHERE product_id = ANY($2)
        RETURNING product_id;
      `,
      [statusBool, cleanIds]
    );

    await client.query(
      `
        UPDATE tb_product_variant
        SET is_active = $1, updated_at = CURRENT_TIMESTAMP
        WHERE product_id = ANY($2);
      `,
      [statusBool, cleanIds]
    );

    await client.query('COMMIT');
    return {
      updatedCount: rows.length,
      updatedIds: rows.map((r) => r.product_id),
      isActive: statusBool,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const findExternalStocks = async () => {
  const text = `
    SELECT p.product_name, pv.sku, sb.on_hand_qty
    FROM tb_product p
    JOIN tb_product_variant pv ON p.product_id = pv.product_id
    JOIN tb_stock_balance sb ON pv.variant_id = sb.variant_id
    WHERE p.is_active = true AND pv.is_active = true;
  `;
  const { rows } = await query(text);
  return rows;
};

