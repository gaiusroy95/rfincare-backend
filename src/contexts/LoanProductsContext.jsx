import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  LOAN_PRODUCTS as STATIC_LOAN_PRODUCTS,
  setLoanProductRegistry,
  ensureCreditCardProduct,
} from '../constants/loanProducts';
import { loanProductCatalogService } from '../services/loanProductCatalogService';
import { queryCacheFetch, queryCacheInvalidate } from '../lib/queryCache';

const CACHE_KEY = 'public:loan-product-catalog';
const CACHE_TTL_MS = 10 * 60 * 1000;

const LoanProductsContext = createContext({
  products: STATIC_LOAN_PRODUCTS,
  loading: true,
  refresh: async () => {},
});

export function LoanProductsProvider({ children }) {
  const [products, setProducts] = useState(STATIC_LOAN_PRODUCTS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async ({ bustCache = false } = {}) => {
    if (bustCache) queryCacheInvalidate(CACHE_KEY);
    setLoading(true);
    try {
      const data = await queryCacheFetch(
        CACHE_KEY,
        async () => {
          const { data: list, error } = await loanProductCatalogService.listPublic();
          if (error || !Array.isArray(list) || !list.length) return STATIC_LOAN_PRODUCTS;
          return ensureCreditCardProduct(list);
        },
        CACHE_TTL_MS,
      );
      const list = Array.isArray(data) && data.length ? data : STATIC_LOAN_PRODUCTS;
      setProducts(list);
      setLoanProductRegistry(list);
      return list;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const run = () => refresh();
    if (typeof requestIdleCallback !== 'undefined') {
      const id = requestIdleCallback(run, { timeout: 2000 });
      return () => cancelIdleCallback(id);
    }
    const t = window.setTimeout(run, 50);
    return () => window.clearTimeout(t);
  }, [refresh]);

  const value = useMemo(() => ({ products, loading, refresh }), [products, loading, refresh]);

  return (
    <LoanProductsContext.Provider value={value}>
      {children}
    </LoanProductsContext.Provider>
  );
}

export function useLoanProducts() {
  return useContext(LoanProductsContext);
}
