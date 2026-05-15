import supabase from '../../../lib/supabaseClient';

const asObject = (value) => (Array.isArray(value) ? value[0] : value);

const generateRequestNo = () =>
  `PR-${new Date().toISOString().replace(/\D/g, '').slice(0, 14)}`;

const normalizePurchaseRequestItem = (item) => {
  const product = asObject(item.products);

  return {
    id: item.purchase_request_item_id,
    productId: item.product_id,
    productCode: product?.product_code ?? '',
    productName: product?.product_name ?? '',
    customItemName: item.custom_item_name ?? '',
    requestedQty: Number(item.requested_qty ?? 0),
    receivedQty: Number(item.received_qty ?? 0),
    reason: item.reason ?? '',
    notes: item.notes ?? '',
  };
};

const normalizePurchaseRequestRow = (row) => {
  const items = (row.purchase_request_items ?? []).map(
    normalizePurchaseRequestItem
  );

  return {
    id: row.purchase_request_id,
    requestNo: row.request_no,
    requestedBy: row.requested_by,
    requestedDate: row.requested_date,
    purpose: row.purpose ?? '',
    status: row.request_status,
    approvedBy: row.approved_by,
    approvedAt: row.approved_at,
    rejectedBy: row.rejected_by,
    rejectedAt: row.rejected_at,
    receivedBy: row.received_by,
    receivedAt: row.received_at,
    notes: row.notes ?? '',
    totalItems: items.length,
    totalRequestedQty: items.reduce(
      (sum, item) => sum + item.requestedQty,
      0
    ),
    totalReceivedQty: items.reduce((sum, item) => sum + item.receivedQty, 0),
    items,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const normalizeProductOption = (row) => ({
  id: row.product_id,
  code: row.product_code,
  name: row.product_name,
  label: `${row.product_code} - ${row.product_name}`,
});

const normalizeCreateItems = (items) => {
  const normalized = (items ?? [])
    .map((item) => {
      const productId = item.productId ? Number(item.productId) : null;
      const customItemName = item.customItemName?.trim() || '';

      return {
        productId,
        customItemName: productId ? '' : customItemName,
        requestedQty: Number(item.requestedQty ?? item.qty),
        reason: item.reason?.trim() || '',
        notes: item.notes?.trim() || '',
      };
    })
    .filter(
      (item) =>
        item.requestedQty > 0 && (item.productId || item.customItemName)
    );

  if (!normalized.length) {
    throw new Error('At least one requested item is required.');
  }

  return normalized;
};

export const fetchPurchaseRequests = async () => {
  const { data, error } = await supabase
    .from('purchase_requests')
    .select(`
      purchase_request_id,
      request_no,
      requested_by,
      requested_date,
      purpose,
      request_status,
      approved_by,
      approved_at,
      rejected_by,
      rejected_at,
      received_by,
      received_at,
      notes,
      created_at,
      updated_at,
      purchase_request_items (
        purchase_request_item_id,
        product_id,
        custom_item_name,
        requested_qty,
        received_qty,
        reason,
        notes,
        products (
          product_id,
          product_code,
          product_name
        )
      )
    `)
    .order('purchase_request_id', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizePurchaseRequestRow);
};

export const fetchProductsForPurchaseRequest = async () => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      product_id,
      product_code,
      product_name
    `)
    .order('product_name', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map(normalizeProductOption);
};

export const createPurchaseRequest = async (data) => {
  const requestedBy = data.requestedBy?.trim();
  const requestedDate = data.requestedDate || new Date().toISOString().slice(0, 10);
  const items = normalizeCreateItems(data.items);

  if (!requestedBy) {
    throw new Error('Requested by is required.');
  }

  const { data: requestRow, error: requestError } = await supabase
    .from('purchase_requests')
    .insert([
      {
        request_no: data.requestNo?.trim() || generateRequestNo(),
        requested_by: requestedBy,
        requested_date: requestedDate,
        purpose: data.purpose?.trim() || null,
        request_status: 'PENDING',
        notes: data.notes?.trim() || null,
      },
    ])
    .select('purchase_request_id')
    .single();

  if (requestError) {
    throw new Error(requestError.message);
  }

  const { error: itemError } = await supabase
    .from('purchase_request_items')
    .insert(
      items.map((item) => ({
        purchase_request_id: requestRow.purchase_request_id,
        product_id: item.productId || null,
        custom_item_name: item.customItemName || null,
        requested_qty: item.requestedQty,
        received_qty: 0,
        reason: item.reason || null,
        notes: item.notes || null,
      }))
    );

  if (itemError) {
    throw new Error(itemError.message);
  }

  return requestRow.purchase_request_id;
};

export const updatePurchaseRequest = async (id, data) => {
  const requestedBy = data.requestedBy?.trim();
  const requestedDate = data.requestedDate || new Date().toISOString().slice(0, 10);
  const items = normalizeCreateItems(data.items);

  if (!id) {
    throw new Error('Purchase request ID is required.');
  }

  if (!requestedBy) {
    throw new Error('Requested by is required.');
  }

  const { data: requestRow, error: requestError } = await supabase
    .from('purchase_requests')
    .update({
      requested_by: requestedBy,
      requested_date: requestedDate,
      purpose: data.purpose?.trim() || null,
      notes: data.notes?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('purchase_request_id', id)
    .eq('request_status', 'PENDING')
    .select('purchase_request_id')
    .maybeSingle();

  if (requestError) {
    throw new Error(requestError.message);
  }

  if (!requestRow) {
    throw new Error('Only pending purchase requests can be edited.');
  }

  const { data: existingItems, error: existingItemsError } = await supabase
    .from('purchase_request_items')
    .select('purchase_request_item_id')
    .eq('purchase_request_id', id);

  if (existingItemsError) {
    throw new Error(existingItemsError.message);
  }

  const { data: deletedItems, error: deleteError } = await supabase
    .from('purchase_request_items')
    .delete()
    .eq('purchase_request_id', id)
    .select('purchase_request_item_id');

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if ((existingItems?.length ?? 0) !== (deletedItems?.length ?? 0)) {
    throw new Error(
      'Could not replace old request items. Please check delete policy for purchase_request_items.'
    );
  }

  const { error: itemError } = await supabase
    .from('purchase_request_items')
    .insert(
      items.map((item) => ({
        purchase_request_id: id,
        product_id: item.productId || null,
        custom_item_name: item.customItemName || null,
        requested_qty: item.requestedQty,
        received_qty: 0,
        reason: item.reason || null,
        notes: item.notes || null,
      }))
    );

  if (itemError) {
    throw new Error(itemError.message);
  }

  return id;
};

const updatePurchaseRequestStatus = async ({
  id,
  status,
  actor = 'Admin',
}) => {
  if (!id) {
    throw new Error('Purchase request ID is required.');
  }

  if (!['APPROVED', 'REJECTED', 'CANCELLED'].includes(status)) {
    throw new Error('Invalid purchase request status.');
  }

  const now = new Date().toISOString();
  const payload = {
    request_status: status,
    updated_at: now,
  };

  if (status === 'APPROVED') {
    payload.approved_by = actor;
    payload.approved_at = now;
    payload.rejected_by = null;
    payload.rejected_at = null;
  }

  if (status === 'REJECTED') {
    payload.rejected_by = actor;
    payload.rejected_at = now;
  }

  const { data, error } = await supabase
    .from('purchase_requests')
    .update(payload)
    .eq('purchase_request_id', id)
    .eq('request_status', 'PENDING')
    .select('purchase_request_id, request_status')
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Only pending purchase requests can be changed.');
  }

  return data.purchase_request_id;
};

export const approvePurchaseRequest = (id, actor) =>
  updatePurchaseRequestStatus({ id, actor, status: 'APPROVED' });

export const rejectPurchaseRequest = (id, actor) =>
  updatePurchaseRequestStatus({ id, actor, status: 'REJECTED' });

export const cancelPurchaseRequest = (id, actor) =>
  updatePurchaseRequestStatus({ id, actor, status: 'CANCELLED' });
