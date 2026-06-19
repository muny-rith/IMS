import dotenv from 'dotenv';

dotenv.config();

const ECOM_API_URL = process.env.ECOM_API_URL || 'http://localhost:5001/api';

export const syncCategoryToEcom = async (categoryData) => {
  try {
    const payload = {
      name: categoryData.name,
      oldName: categoryData.oldName || null,
      description: categoryData.description || ''
    };

    const res = await fetch(`${ECOM_API_URL}/webhooks/ims-category`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000)
    });

    if (!res.ok) {
      console.error(`[E-Commerce Sync] Category Webhook responded with status ${res.status}`);
      return null;
    }

    const body = await res.json();
    console.log('[E-Commerce Sync] Category successfully synchronized:', categoryData.name);
    return body;
  } catch (err) {
    console.error(`[E-Commerce Sync] Failed to synchronize category ${categoryData.name}:`, err.message);
    return null;
  }
};

export const deleteCategoryFromEcom = async (categoryData) => {
  try {
    const res = await fetch(`${ECOM_API_URL}/webhooks/ims-category`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: categoryData.name }),
      signal: AbortSignal.timeout(5000)
    });

    if (!res.ok) {
      console.error(`[E-Commerce Sync] Category Delete webhook responded with status ${res.status}`);
      return null;
    }

    const body = await res.json();
    console.log('[E-Commerce Sync] Category successfully deleted from Ecom:', categoryData.name);
    return body;
  } catch (err) {
    console.error(`[E-Commerce Sync] Failed to sync delete of category ${categoryData.name}:`, err.message);
    return null;
  }
};

/**
 * Synchronize a product definition to E-Commerce catalog.
 * productData: { name, oldName, price, imageUrl, categoryName, isActive }
 */
export const syncProductToEcom = async (productData) => {
  try {
    const payload = {
      name: productData.name,
      oldName: productData.oldName || null,
      price: productData.price,
      imageUrl: productData.imageUrl || '',
      categoryName: productData.categoryName,
      isActive: productData.isActive !== undefined ? productData.isActive : true
    };

    const res = await fetch(`${ECOM_API_URL}/webhooks/ims-product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000) // 5 seconds timeout
    });

    if (!res.ok) {
      console.error(`[E-Commerce Sync] Webhook responded with status ${res.status}`);
      return null;
    }

    const body = await res.json();
    console.log('[E-Commerce Sync] Product successfully synchronized:', productData.name);
    return body;
  } catch (err) {
    console.error(`[E-Commerce Sync] Failed to synchronize product ${productData.name} to E-Commerce:`, err.message);
    return null;
  }
};

/**
 * Sync deletion of a product to E-Commerce.
 */
export const deleteProductFromEcom = async (productData) => {
  try {
    const res = await fetch(`${ECOM_API_URL}/webhooks/ims-product`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: productData.name }),
      signal: AbortSignal.timeout(5000)
    });

    if (!res.ok) {
      console.error(`[E-Commerce Sync] Delete webhook responded with status ${res.status}`);
      return null;
    }

    const body = await res.json();
    console.log('[E-Commerce Sync] Product successfully deleted from Ecom:', productData.name);
    return body;
  } catch (err) {
    console.error(`[E-Commerce Sync] Failed to sync delete of product ${productData.name} to E-Commerce:`, err.message);
    return null;
  }
};

