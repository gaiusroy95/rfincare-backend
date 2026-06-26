import React, { useState, useEffect } from 'react';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import {
  emptyProductForm,
  formFromProduct,
  productDataFromForm,
} from '../../utils/bankMarketplace';
import { pickProductForCategory } from '../../utils/bankProductMatching';
import {
  getMarketplaceProductCategory,
  mergeMarketplaceProductCategories,
} from '../../constants/bankMarketplaceProductCategories';
import BankLogoFields from '../../components/admin/BankLogoFields';
import BankProductEditor from '../../components/admin/BankProductEditor';
import { bankService, auditService } from '../../services/apiServices';
import { loanProductCatalogService } from '../../services/loanProductCatalogService';
import { resolveBankLogoUrl } from '../../utils/bankBranding';
import { BANK_TYPE_OPTIONS, getBankTypeLabel } from '../../constants/bankTypes';

const BankMarketplaceManagement = () => {
  const [productCategories, setProductCategories] = useState([]);
  const [banks, setBanks] = useState([]);
  const [bankProducts, setBankProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [pendingLogoFile, setPendingLogoFile] = useState(null);
  const [productForm, setProductForm] = useState(emptyProductForm());
  const [savingProduct, setSavingProduct] = useState(false);

  const applyCategoryToForm = (categorySlug, products = bankProducts) => {
    const category = getMarketplaceProductCategory(categorySlug);
    const normalizedSlug = category?.slug || categorySlug;
    const existing = pickProductForCategory(products, normalizedSlug);
    if (existing) {
      const form = formFromProduct(existing, category?.parentLoanType || 'personal_loan');
      setProductForm({
        ...form,
        productCategorySlug: normalizedSlug,
        catalogApiKey: category?.parentLoanType || form.catalogApiKey || '',
        loanType: category?.parentLoanType || form.loanType || 'personal_loan',
      });
    } else {
      setProductForm({
        ...emptyProductForm(normalizedSlug),
        productCategorySlug: normalizedSlug,
        catalogApiKey: category?.parentLoanType || '',
        loanType: category?.parentLoanType || 'personal_loan',
      });
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    logoUrl: '',
    logoAlt: '',
    bankType: 'private',
    status: 'active',
    rating: 4.5,
    reviewsCount: 0,
    customersServed: '',
    partnershipDuration: '',
    certifications: [],
    applyUrl: '',
    displayPriority: 0,
  });

  const loadProductCategories = async () => {
    const { data } = await loanProductCatalogService.listCategories();
    setProductCategories(mergeMarketplaceProductCategories(data || []));
  };

  useEffect(() => {
    loadBanks({ showFullLoader: true });
    loadProductCategories();
  }, []);

  const loadBanks = async ({ forceRefresh = false, showFullLoader = false } = {}) => {
    try {
      if (showFullLoader) setLoading(true);
      const data = await bankService?.getAllBanks({ forceRefresh });
      setBanks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message);
    } finally {
      if (showFullLoader) setLoading(false);
    }
  };

  const loadProductForBank = async (bankId, categorySlug = 'personal_loan') => {
    try {
      const products = await bankService.getBankProducts(bankId);
      const list = Array.isArray(products) ? products : [];
      setBankProducts(list);
      if (list.length > 0) {
        const first = list[0];
        const form = formFromProduct(first);
        const slug = form.productCategorySlug || categorySlug;
        applyCategoryToForm(slug, list);
      } else {
        applyCategoryToForm(categorySlug, list);
      }
    } catch {
      setBankProducts([]);
      setProductForm(emptyProductForm(categorySlug));
    }
  };

  const handleOpenModal = async (bank = null) => {
    setPendingLogoFile(null);
    if (bank) {
      setEditingBank(bank);
      setFormData({
        name: bank?.name,
        logoUrl: bank?.logoUrl,
        logoAlt: bank?.logoAlt,
        bankType: bank?.bankType,
        status: bank?.status,
        rating: bank?.rating,
        reviewsCount: bank?.reviewsCount,
        customersServed: bank?.customersServed,
        partnershipDuration: bank?.partnershipDuration,
        certifications: bank?.certifications || [],
        applyUrl: bank?.applyUrl || '',
        displayPriority: bank?.displayPriority,
      });
      await loadProductForBank(bank.id);
    } else {
      setEditingBank(null);
      setBankProducts([]);
      setProductForm(emptyProductForm('personal_loan'));
      setFormData({
        name: '',
        logoUrl: '',
        logoAlt: '',
        bankType: 'private',
        status: 'active',
        rating: 4.5,
        reviewsCount: 0,
        customersServed: '',
        partnershipDuration: '',
        certifications: [],
        applyUrl: '',
        displayPriority: 0,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBank(null);
    setPendingLogoFile(null);
  };

  const buildProductPayload = () => {
    const category = getMarketplaceProductCategory(productForm.productCategorySlug);
    const loanLabel = category?.label || 'Loan';
    return {
      name: (productForm.productName || `${formData.name} ${loanLabel}`).trim(),
      ...productDataFromForm({
        ...productForm,
        catalogApiKey: category?.parentLoanType || productForm.catalogApiKey,
        loanType: category?.parentLoanType || productForm.loanType,
      }),
    };
  };

  const handleCreateCategory = async (label) => {
    const { data, error } = await loanProductCatalogService.createCategory({ label });
    if (error) {
      setError(error.message || 'Failed to add product type');
      return null;
    }
    await loadProductCategories();
    return data;
  };

  const saveBankProduct = async (bankId) => {
    const payload = buildProductPayload();
    if (productForm.id) {
      await bankService.updateBankProduct(productForm.id, payload);
    } else {
      const created = await bankService.createBankProduct(bankId, payload);
      if (created?.id) {
        setProductForm((prev) => ({ ...prev, id: created.id }));
      }
    }
    const refreshed = await bankService.getBankProducts(bankId);
    setBankProducts(Array.isArray(refreshed) ? refreshed : []);
  };

  const handleSaveProductOnly = async () => {
    if (!editingBank?.id) {
      setError('Save the bank first, then save individual products.');
      return;
    }
    try {
      setSavingProduct(true);
      setError('');
      await saveBankProduct(editingBank.id);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to save product');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productForm.id) return;
    if (!window.confirm('Delete this product from the bank? It will no longer appear in marketplace comparison.')) {
      return;
    }
    try {
      setSavingProduct(true);
      await bankService.deleteBankProduct(productForm.id);
      const refreshed = await bankService.getBankProducts(editingBank.id);
      const list = Array.isArray(refreshed) ? refreshed : [];
      setBankProducts(list);
      if (list.length > 0) {
        const form = formFromProduct(list[0]);
        setProductForm(form);
      } else {
        setProductForm(emptyProductForm('personal_loan'));
      }
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to delete product');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleSelectProduct = (product) => {
    const form = formFromProduct(product);
    const category = getMarketplaceProductCategory(form.productCategorySlug);
    setProductForm({
      ...form,
      productCategorySlug: category?.slug || form.productCategorySlug,
      catalogApiKey: category?.parentLoanType || form.catalogApiKey,
      loanType: category?.parentLoanType || form.loanType,
    });
  };

  const handleAddProduct = (categorySlug) => {
    applyCategoryToForm(categorySlug, bankProducts);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    try {
      let bankId = editingBank?.id;
      const bankPayload = { ...formData };
      if (pendingLogoFile && !editingBank) {
        bankPayload.logoUrl = null;
      }
      if (editingBank) {
        await bankService.updateBank(editingBank.id, bankPayload);
        await auditService.logAction('UPDATE', 'banks', editingBank.id, editingBank, bankPayload);
      } else {
        const created = await bankService.createBank(bankPayload);
        bankId = created?.id;
        await auditService.logAction('CREATE', 'banks', bankId, null, bankPayload);
      }
      if (bankId && pendingLogoFile) {
        const updated = await bankService.uploadBankLogo(bankId, pendingLogoFile);
        if (updated?.logoUrl) {
          setFormData((prev) => ({ ...prev, logoUrl: updated.logoUrl }));
        }
        setPendingLogoFile(null);
      }
      if (bankId) {
        await saveBankProduct(bankId);
      }
      await loadBanks({ forceRefresh: true });
      handleCloseModal();
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to save bank');
    }
  };

  const handleDelete = async (bank) => {
    if (!window.confirm(`Are you sure you want to delete ${bank?.name}?`)) return;

    try {
      await bankService?.deleteBank(bank?.id);
      await auditService?.logAction('DELETE', 'banks', bank?.id, bank, null);
      await loadBanks({ forceRefresh: true });
    } catch (err) {
      setError(err?.message);
    }
  };

  const handleStatusToggle = async (bank) => {
    const newStatus = bank?.status === 'active' ? 'inactive' : 'active';
    try {
      await bankService?.updateBank(bank?.id, { status: newStatus });
      await auditService?.logAction('UPDATE', 'banks', bank?.id, { status: bank?.status }, { status: newStatus });
      await loadBanks({ forceRefresh: true });
    } catch (err) {
      setError(err?.response?.data?.error || err?.message);
    }
  };

  const bankTypeOptions = BANK_TYPE_OPTIONS;

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' },
  ];

  return (
    <div>
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Bank Marketplace Management
            </h1>
            <p className="text-muted-foreground">
              Manage banks, products, and marketplace display
            </p>
          </div>
          <Button onClick={() => handleOpenModal()} iconName="Plus">
            Add Bank
          </Button>
        </div>

        {error && (
          <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading banks...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {banks?.map((bank) => (
              <div key={bank?.id} className="feature-card">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {bank?.logoUrl && (
                        <img
                          src={resolveBankLogoUrl(bank.logoUrl)}
                          alt={bank?.logoAlt}
                          className="w-full h-full object-contain p-2"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-foreground">{bank?.name}</h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            bank?.status === 'active'
                              ? 'bg-success/10 text-success'
                              : bank?.status === 'inactive'
                                ? 'bg-muted text-muted-foreground'
                                : 'bg-error/10 text-error'
                          }`}
                        >
                          {bank?.status}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {getBankTypeLabel(bank?.bankType)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Rating:</span>
                          <span className="ml-2 font-medium">{bank?.rating} ⭐</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Reviews:</span>
                          <span className="ml-2 font-medium">{bank?.reviewsCount}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Customers:</span>
                          <span className="ml-2 font-medium">{bank?.customersServed}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Priority:</span>
                          <span className="ml-2 font-medium">{bank?.displayPriority}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusToggle(bank)}
                      iconName={bank?.status === 'active' ? 'EyeOff' : 'Eye'}
                    >
                      {bank?.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenModal(bank)}
                      iconName="Edit"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(bank)}
                      iconName="Trash2"
                      className="text-error hover:bg-error/10"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">
                {editingBank ? 'Edit Bank' : 'Add New Bank'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input
                label="Bank Name"
                value={formData?.name}
                onChange={(e) => setFormData({ ...formData, name: e?.target?.value })}
                required
              />
              <BankLogoFields
                logoUrl={formData?.logoUrl}
                logoAlt={formData?.logoAlt}
                bankId={editingBank?.id}
                onLogoUrlChange={(logoUrl) => setFormData((prev) => ({ ...prev, logoUrl }))}
                onLogoAltChange={(logoAlt) => setFormData((prev) => ({ ...prev, logoAlt }))}
                onPendingFile={setPendingLogoFile}
                onError={setError}
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Bank Type"
                  options={bankTypeOptions}
                  value={formData?.bankType}
                  onChange={(value) => setFormData({ ...formData, bankType: value })}
                  required
                />
                <Select
                  label="Status"
                  options={statusOptions}
                  value={formData?.status}
                  onChange={(value) => setFormData({ ...formData, status: value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData?.rating}
                  onChange={(e) =>
                    setFormData({ ...formData, rating: parseFloat(e?.target?.value) })
                  }
                />
                <Input
                  label="Display Priority"
                  type="number"
                  value={formData?.displayPriority}
                  onChange={(e) =>
                    setFormData({ ...formData, displayPriority: parseInt(e?.target?.value) })
                  }
                />
              </div>
              <Input
                label="Customers Served"
                value={formData?.customersServed}
                onChange={(e) => setFormData({ ...formData, customersServed: e?.target?.value })}
                placeholder="e.g., 15,000+"
              />
              <Input
                label="Partnership Duration"
                value={formData?.partnershipDuration}
                onChange={(e) =>
                  setFormData({ ...formData, partnershipDuration: e?.target?.value })
                }
                placeholder="e.g., Partner since 2018"
              />
              <Input
                label="Application URL (bank website)"
                type="url"
                value={formData?.applyUrl}
                onChange={(e) => setFormData({ ...formData, applyUrl: e?.target?.value })}
                placeholder="https://www.bank.com/apply"
                description="Customers are sent here to apply directly on the bank's website."
              />

              <BankProductEditor
                bankName={formData.name}
                bankProducts={bankProducts}
                productCategories={productCategories}
                productForm={productForm}
                onProductFormChange={setProductForm}
                onSelectProduct={handleSelectProduct}
                onAddProduct={handleAddProduct}
                onCreateCategory={handleCreateCategory}
                onSaveProduct={editingBank ? handleSaveProductOnly : null}
                onDeleteProduct={editingBank ? handleDeleteProduct : null}
                savingProduct={savingProduct}
              />

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingBank ? 'Update Bank' : 'Create Bank'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankMarketplaceManagement;
