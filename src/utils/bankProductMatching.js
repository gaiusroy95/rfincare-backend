import { getLoanProductBySlug } from '../constants/loanProducts';

const BASE_CATEGORY_SLUGS = new Set(['personal', 'home', 'business', 'auto', 'education']);

function normalizeKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/-/g, '_');
}

export function parseBankProductData(product) {
  if (!product) return {};
  let data = product.data;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      data = {};
    }
  }
  return data && typeof data === 'object' ? data : {};
}

export function getProductCategoryFields(product) {
  const d = parseBankProductData(product);
  return {
    loanType: normalizeKey(
      product?.loanType ||
        product?.loan_type ||
        d.loan_type ||
        d.loanType ||
        d.type ||
        d.productType,
    ),
    categorySlug: normalizeKey(
      d.product_category_slug ||
        d.productCategorySlug ||
        d.catalog_slug ||
        d.catalogSlug ||
        '',
    ),
    categoryApiKey: normalizeKey(
      d.catalog_api_key || d.catalogApiKey || d.product_category_api_key || '',
    ),
  };
}

export function resolveCatalogCategory(catalogProductOrSlug) {
  if (!catalogProductOrSlug) return null;
  const catalogProduct =
    typeof catalogProductOrSlug === 'string'
      ? getLoanProductBySlug(catalogProductOrSlug)
      : catalogProductOrSlug;
  if (!catalogProduct) return null;
  return {
    slug: normalizeKey(catalogProduct.slug),
    apiKey: normalizeKey(catalogProduct.apiKey),
    isBaseCategory: BASE_CATEGORY_SLUGS.has(normalizeKey(catalogProduct.slug)),
  };
}

export function bankProductMatchesCategory(product, category) {
  if (!category) return true;

  const { loanType, categorySlug, categoryApiKey } = getProductCategoryFields(product);
  const catSlug = normalizeKey(category.slug);
  const catApiKey = normalizeKey(category.apiKey);
  const productHasSubcategory = Boolean(categorySlug || categoryApiKey);

  if (!category.isBaseCategory) {
    if (categorySlug && categorySlug === catSlug) return true;
    if (categoryApiKey && categoryApiKey === catApiKey) return true;
    if (!categorySlug && !categoryApiKey && loanType === catApiKey) return true;
    return false;
  }

  if (categorySlug && categorySlug === catSlug) return true;
  if (categoryApiKey && categoryApiKey === catApiKey) return true;

  if (loanType === catApiKey) {
    return !productHasSubcategory;
  }

  return false;
}

export function filterProductsForCategory(products, catalogProductOrSlug) {
  const category = resolveCatalogCategory(catalogProductOrSlug);
  if (!category) return products || [];
  return (products || []).filter((product) => bankProductMatchesCategory(product, category));
}

export function pickProductForCategory(products, catalogProductOrSlug) {
  const matched = filterProductsForCategory(products, catalogProductOrSlug);
  return matched[0] || null;
}
