import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';

import Button from '../../../components/ui/Button/Button';
import { fetchAttributes, fetchAttributeValues } from '../../attributes/services/attributeService';
import { useProducts } from '../hooks/useProducts';
import ProductBasicInfoForm from '../components/ProductBasicInfoForm';
import ProductAttributesSelector from '../components/ProductAttributesSelector';
import ProductVariantsStudio from '../components/ProductVariantsStudio';
import ProductFormSkeleton from '../components/ProductFormSkeleton';
import './ProductFormPage.css';


const RULES = {
  name: { required: 'Name is required' },
  categoryId: { required: 'Category is required' },
};

const EMPTY_FORM = {
  name: '',
  categoryId: '',
  brandId: '',
  department: '',
  imageUrl: '',
};

const createEmptyVariant = () => ({
  id: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  variant_id: null,
  sku: '',
  unit_price: '',
  openingQty: '',
  openingNote: '',
  reservedQty: 0,
  other: '',
  attributes: {},
  imageFile: null,
  imageUrl: '',
  imagePreview: '',
});

const normalizeVariantRows = (variantRows = []) =>
  variantRows.map((variant) => ({
    id: variant.variant_id || variant.id || `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    variant_id: variant.variant_id || null,
    sku: variant.sku ?? '',
    unit_price: variant.unit_price ?? '',
    openingQty: variant.openingQty ?? variant.on_hand_qty ?? 0,
    openingNote: '',
    reservedQty: variant.reservedQty ?? variant.reserved_qty ?? 0,
    other: variant.other ?? '',
    attributes: variant.attributes ?? {},
    imageFile: null,
    imageUrl: variant.imageUrl ?? variant.image_url ?? '',
    imagePreview: variant.imagePreview ?? variant.imageUrl ?? variant.image_url ?? '',
    is_active: variant.isActive ?? variant.is_active ?? true,
  }));

const normalizeProductAttributes = (defaultValues, allAttributes) => {
  const values = defaultValues?.productAttributes ?? defaultValues?.product_attributes ?? [];

  return values
    .map((attribute) => {
      const attributeId = Number(attribute.attribute_id ?? attribute);
      return allAttributes.find((item) => item.attribute_id === attributeId) || {
        attribute_id: attributeId,
        attribute_name: attribute.attribute_name ?? `Attribute ${attributeId}`,
      };
    })
    .filter((attribute) => Number.isInteger(attribute.attribute_id));
};

const normalizeFormValues = (defaultValues, mode) => {
  if (!defaultValues || mode === 'create') {
    return EMPTY_FORM;
  }
  return {
    name: defaultValues.name ?? '',
    categoryId:
      defaultValues.categoryId !== undefined && defaultValues.categoryId !== null
        ? String(defaultValues.categoryId)
        : '',
    brandId:
      defaultValues.brandId !== undefined && defaultValues.brandId !== null
        ? String(defaultValues.brandId)
        : '',
    department: defaultValues.department ?? '',
    imageUrl: defaultValues.imageUrl ?? defaultValues.image ?? '',
  };
};

const ProductFormPage = () => {
  const { id } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isEdit = pathname.includes('/edit/');
  const isCreate = !isEdit;
  const mode = isEdit ? 'edit' : 'create';

  const {
    categories = [],
    brands = [],
    handleAdd,
    handleUpdate,
    fetchProductDetail,
  } = useProducts();

  const [loadingDetails, setLoadingDetails] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [defaultValues, setDefaultValues] = useState(null);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [allAttributes, setAllAttributes] = useState([]);
  const [attributeValuesMap, setAttributeValuesMap] = useState({});
  const [productAttributes, setProductAttributes] = useState([]);
  const [variants, setVariants] = useState([]);
  const [deletedVariantIds, setDeletedVariantIds] = useState([]);
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  const formValues = useMemo(
    () => normalizeFormValues(defaultValues, mode),
    [defaultValues, mode]
  );

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: EMPTY_FORM,
  });

  const selectedCategoryId = watch('categoryId');

  // Load product detail if editing
  useEffect(() => {
    if (isEdit && id) {
      setLoadingDetails(true);
      fetchProductDetail(id, true)
        .then((data) => {
          setDefaultValues(data);
          setLoadingDetails(false);
        })
        .catch((err) => {
          console.error(err);
          setLoadingDetails(false);
        });
    }
  }, [isEdit, id, fetchProductDetail]);

  // Load attributes globally
  useEffect(() => {
    const loadAttrs = async () => {
      try {
        const data = await fetchAttributes();
        setAllAttributes(data || []);
      } catch (e) {
        console.error(e);
      }
    };
    loadAttrs();
  }, []);

  // Initialize form state once defaultValues are loaded (or immediately if creating)
  useEffect(() => {
    if (!defaultValues && !isCreate) return;

    reset(formValues);
    setImageFile(null);
    setImagePreview(formValues.imageUrl || '');

    if (isCreate) {
      setVariants([createEmptyVariant()]);
    } else {
      setVariants(normalizeVariantRows(defaultValues?.variants || []));
    }
    setDeletedVariantIds([]);
  }, [formValues, reset, isCreate, defaultValues]);

  useEffect(() => {
    if (isCreate) {
      setProductAttributes([]);
      return;
    }
    setProductAttributes(normalizeProductAttributes(defaultValues, allAttributes));
  }, [isCreate, defaultValues, allAttributes]);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleClose = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else if (isEdit && id) {
      navigate(`/products/view/${id}`);
    } else {
      navigate('/products');
    }
  };

  const handleProductImageSelect = (file) => {
    if (!file) return;
    if (imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (imagePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview('');
  };

  const handleFormSubmit = async (values) => {
    setSubmitting(true);
    const data = {
      name: values.name.trim(),
      categoryId: values.categoryId ? Number(values.categoryId) : null,
      brandId: values.brandId ? Number(values.brandId) : null,
      department: values.department ? values.department.trim() : '',
      imageFile,
      imageUrl: formValues.imageUrl || '',
      variants: variants,
      deletedVariantIds: isEdit ? deletedVariantIds : [],
      productAttributes: productAttributes.map((a) => a.attribute_id),
    };

    const result = isCreate ? await handleAdd(data) : await handleUpdate(id, data);
    setSubmitting(false);

    if (result.success) {
      if (isEdit && id) {
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate(`/products/view/${id}`, { replace: true });
        }
      } else {
        navigate('/products');
      }
    } else {
      alert(result.message || 'Something went wrong.');
    }
  };

  // Compute category attributes
  const categoryAttributes = useMemo(() => {
    if (!selectedCategoryId) return [];
    const cat = categories.find((c) => String(c.id) === String(selectedCategoryId));
    if (!cat || !cat.attributes || !cat.attributes.length) return [];
    return allAttributes.filter((a) => cat.attributes.includes(a.attribute_id));
  }, [selectedCategoryId, categories, allAttributes]);

  const activeAttributes = useMemo(() => {
    const combined = [...categoryAttributes];
    productAttributes.forEach((pa) => {
      if (!combined.find((ca) => ca.attribute_id === pa.attribute_id)) {
        combined.push(pa);
      }
    });
    return combined;
  }, [categoryAttributes, productAttributes]);

  // Fetch attribute values for selected category's attributes
  useEffect(() => {
    const loadValues = async () => {
      const newMap = { ...attributeValuesMap };
      let changed = false;
      for (const attr of activeAttributes) {
        if (!newMap[attr.attribute_id]) {
          try {
            const vals = await fetchAttributeValues(attr.attribute_id);
            newMap[attr.attribute_id] = vals || [];
            changed = true;
          } catch (e) { }
        }
      }
      if (changed) setAttributeValuesMap(newMap);
    };
    if (activeAttributes.length > 0) loadValues();
  }, [activeAttributes, attributeValuesMap]);

  const handleAddVariant = () => {
    const newVariant = createEmptyVariant();
    setVariants((prev) => [...prev, newVariant]);
    setSelectedVariantId(newVariant.id);
  };

  const handleRemoveVariant = (varId) => {
    setVariants((prev) => {
      const target = prev.find((v) => v.id === varId);
      if (target?.imagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(target.imagePreview);
      }
      if (isEdit && target?.variant_id) {
        setDeletedVariantIds((current) => [...new Set([...current, Number(target.variant_id)])]);
      }
      return prev.filter((v) => v.id !== varId);
    });
  };

  const handleVariantImageChange = (varId, fileOrEvent) => {
    const file = fileOrEvent?.target ? fileOrEvent.target.files?.[0] : fileOrEvent;
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id !== varId) return v;
        if (v.imagePreview?.startsWith('blob:')) {
          URL.revokeObjectURL(v.imagePreview);
        }
        if (!file) {
          return { ...v, imageFile: null, imagePreview: '' };
        }
        return { ...v, imageFile: file, imagePreview: URL.createObjectURL(file) };
      })
    );
  };

  const handleVariantImageRemove = (varId) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id !== varId) return v;
        if (v.imagePreview?.startsWith('blob:')) {
          URL.revokeObjectURL(v.imagePreview);
        }
        return { ...v, imageFile: null, imagePreview: '' };
      })
    );
  };

  const handleVariantChange = (varId, field, value) => {
    setVariants((current) => current.map((v) => (v.id === varId ? { ...v, [field]: value } : v)));
  };

  const handleVariantAttrChange = (varId, attrId, value) => {
    setVariants((current) =>
      current.map((v) => {
        if (v.id === varId) {
          return { ...v, attributes: { ...v.attributes, [attrId]: value } };
        }
        return v;
      })
    );
  };

  if (loadingDetails) {
    return <ProductFormSkeleton isEdit={isEdit} />;
  }


  return (
    <div className="product-form-page">
      {/* ── 1. Top Header & Breadcrumbs ── */}
      <div className="product-form-header">
        <div className="product-form-header__left">
          <button
            type="button"
            className="product-form-back-btn"
            onClick={handleClose}
            title="Back to products"
          >
            <ArrowBackIcon fontSize="small" />
          </button>
          <div className="product-form-header__info">
            <div className="product-form-breadcrumbs">
              <span className="clickable" onClick={() => navigate('/products')}>
                Products
              </span>
              <span>/</span>
              {isEdit && defaultValues?.name && (
                <>
                  <span className="clickable" onClick={() => navigate(`/products/view/${id}`)}>
                    {defaultValues.name}
                  </span>
                  <span>/</span>
                </>
              )}
              <span className="product-form-breadcrumbs__current">
                {isCreate ? 'Add Product' : 'Edit Product'}
              </span>
            </div>
            <h1 className="product-form-header__title">
              {isCreate ? 'Add New Product' : defaultValues?.name || 'Edit Product'}
            </h1>
          </div>
        </div>

        <div className="product-form-header__actions">
          <Button
            type="button"
            variant="outline"
            icon={<CloseIcon sx={{ fontSize: 16 }} />}
            onClick={handleClose}
            disabled={submitting}
            className="product-form-header__btn--cancel"
            responsiveCollapse
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="product-form"
            variant="primary"
            icon={<SaveIcon sx={{ fontSize: 17 }} />}
            loading={submitting}
            disabled={variants.length === 0}
            className="product-form-header__btn--save"
            responsiveCollapse
          >
            {isCreate ? 'Create Product' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* ── 2. Split Workspace ── */}
      <form id="product-form" onSubmit={handleSubmit(handleFormSubmit)} className="product-form-split">
        {/* ── LEFT COLUMN: Core Registry (Modular Component) ── */}
        <ProductBasicInfoForm
          register={register}
          control={control}
          errors={errors}
          categories={categories}
          brands={brands}
          imagePreview={imagePreview}
          onImageSelect={handleProductImageSelect}
          onImageRemove={handleRemoveImage}
          rules={RULES}
        />

        {/* ── RIGHT COLUMN: Interactive Matrix Studio ── */}
        <div className="product-form-right-col">
          <div className="product-form-card product-form-card--studio">
            <div className="product-matrix-header">
              <div className="product-matrix-header__left">
                <h3 className="product-matrix-title">
                  <span>Variants Studio</span>
                  <span className="product-form-card__badge">{variants.length} Active</span>
                </h3>
                <p className="product-matrix-subtitle">
                  Manage SKU codes, pricing, inventory stock, photography, and attributes in a focused workbench.
                </p>
              </div>
            </div>

            {/* Dynamic Custom Attributes Banner (Modular Component) */}
            <ProductAttributesSelector
              allAttributes={allAttributes}
              categoryAttributes={categoryAttributes}
              productAttributes={productAttributes}
              onChange={setProductAttributes}
            />

            {/* Variants Studio: Master-Detail Split Workbench (Modular Component) */}
            <ProductVariantsStudio
              variants={variants}
              selectedVariantId={selectedVariantId}
              onSelectVariant={setSelectedVariantId}
              onAddVariant={handleAddVariant}
              onRemoveVariant={handleRemoveVariant}
              onVariantChange={handleVariantChange}
              onVariantAttrChange={handleVariantAttrChange}
              onVariantImageChange={handleVariantImageChange}
              onVariantImageRemove={handleVariantImageRemove}
              activeAttributes={activeAttributes}
              attributeValuesMap={attributeValuesMap}
            />
          </div>
        </div>
      </form>

      {/* ── 3. Static Bottom Actions (on screens <= 576px) ── */}
      <div className="product-form-bottom-actions">
        <Button
          type="button"
          variant="outline"
          icon={<CloseIcon sx={{ fontSize: 16 }} />}
          onClick={handleClose}
          disabled={submitting}
          className="product-form-bottom-btn"
        >
          Cancel
        </Button>

        <Button
          type="submit"
          form="product-form"
          variant="primary"
          icon={<SaveIcon sx={{ fontSize: 17 }} />}
          loading={submitting}
          disabled={variants.length === 0}
          className="product-form-bottom-btn"
        >
          {isCreate ? 'Create Product' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default ProductFormPage;