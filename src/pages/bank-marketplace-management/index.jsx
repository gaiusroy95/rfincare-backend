import React, { useState, useEffect } from 'react';

import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { formFromProduct, productDataFromForm } from '../../utils/bankMarketplace';
import { pickProductForCategory } from '../../utils/bankProductMatching';
import { useLoanProducts } from '../../contexts/LoanProductsContext';
import BankLogoFields from '../../components/admin/BankLogoFields';
import { bankService, auditService } from '../../services/apiServices';
import { resolveBankLogoUrl } from '../../utils/bankBranding';

const emptyProductForm = (categorySlug = 'personal') => ({
  id: '',
  productName: '',
  loanType: 'personal_loan',
  productCategorySlug: categorySlug,
  catalogApiKey: '',
  interestRateMin: '',
  interestRateMax: '',
  processingFeePercentage: '',
  otherCharges: '',
  maxLoanAmount: '',
  maxTenureYears: '',
  featuresText: '',
  eligibilityCriteriaText: '',
});

const BankMarketplaceManagement = () => {
  const { products: catalogProducts } = useLoanProducts();
  const [banks, setBanks] = useState([]);
  const [bankProducts, setBankProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [pendingLogoFile, setPendingLogoFile] = useState(null);
  const [productForm, setProductForm] = useState(emptyProductForm());
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('personal');

  const categoryOptions = (catalogProducts || []).map((p) => ({
    value: p.slug,
    label: p.label,
  }));

  const applyCategoryToForm = (categorySlug, products = bankProducts) => {
    const catalog = catalogProducts.find((p) => p.slug === categorySlug);
    const existing = pickProductForCategory(products, catalog || categorySlug);
    if (existing) {
      const form = formFromProduct(existing, catalog?.apiKey || 'personal_loan');
      setProductForm({
        ...form,
        productCategorySlug: categorySlug,
        catalogApiKey: catalog?.apiKey || form.catalogApiKey || '',
      });
    } else {
      setProductForm({
        ...emptyProductForm(categorySlug),
        loanType: catalog?.apiKey || 'personal_loan',
        productCategorySlug: categorySlug,
        catalogApiKey: catalog?.apiKey || '',
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
    displayPriority: 0
  });

  useEffect(() => {
    loadBanks({ showFullLoader: true });
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

  const loadProductForBank = async (bankId, categorySlug = selectedCategorySlug) => {
    try {
      const products = await bankService.getBankProducts(bankId);
      const list = Array.isArray(products) ? products : [];
      setBankProducts(list);
      applyCategoryToForm(categorySlug, list);
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
        displayPriority: bank?.displayPriority,
      });
      await loadProductForBank(bank.id);
    } else {
      setEditingBank(null);
      setBankProducts([]);
      setSelectedCategorySlug('personal');
      setProductForm(emptyProductForm('personal'));
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
        displayPriority: 0
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBank(null);
    setPendingLogoFile(null);
  };

  const saveBankProduct = async (bankId) => {
    const catalog = catalogProducts.find((p) => p.slug === productForm.productCategorySlug);
    const loanLabel = catalog?.label || 'Loan';
    const payload = {
      name: (productForm.productName || `${formData.name} ${loanLabel}`).trim(),
      ...productDataFromForm({
        ...productForm,
        catalogApiKey: catalog?.apiKey || productForm.catalogApiKey,
        loanType: catalog?.apiKey || productForm.loanType,
      }),
    };
    if (productForm.id) {
      await bankService.updateBankProduct(productForm.id, payload);
    } else {
      const created = await bankService.createBankProduct(bankId, payload);
      if (created?.id) {
        setProductForm((prev) => ({ ...prev, id: created.id }));
      }
    }
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

  const bankTypeOptions = [
    { value: 'public', label: 'Public Sector' },
    { value: 'private', label: 'Private Sector' },
    { value: 'foreign', label: 'Foreign Bank' },
    { value: 'cooperative', label: 'Cooperative Bank' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' }
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
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          bank?.status === 'active' ? 'bg-success/10 text-success' :
                          bank?.status === 'inactive' ? 'bg-muted text-muted-foreground' :
                          'bg-error/10 text-error'
                        }`}>
                          {bank?.status}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {bank?.bankType}
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
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                  onChange={(e) => setFormData({ ...formData, rating: parseFloat(e?.target?.value) })}
                />
                <Input
                  label="Display Priority"
                  type="number"
                  value={formData?.displayPriority}
                  onChange={(e) => setFormData({ ...formData, displayPriority: parseInt(e?.target?.value) })}
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
                onChange={(e) => setFormData({ ...formData, partnershipDuration: e?.target?.value })}
                placeholder="e.g., Partner since 2018"
              />

              <div className="border-t border-border pt-4 mt-2 space-y-4">
                <h3 className="text-base font-semibold text-foreground">
                  Bank product mapping
                </h3>
                <p className="text-xs text-muted-foreground">
                  Assign this bank to a product category. Only banks with a product mapped to a
                  category appear on that category&apos;s marketplace page.
                </p>
                <Select
                  label="Product category"
                  options={categoryOptions}
                  value={selectedCategorySlug}
                  onChange={(value) => {
                    setSelectedCategorySlug(value);
                    applyCategoryToForm(value, bankProducts);
                  }}
                />
                <Input
                  label="Product name (shown to customers)"
                  value={productForm.productName}
                  onChange={(e) =>
                    setProductForm({ ...productForm, productName: e.target.value })
                  }
                  placeholder="e.g. HDFC School Business Loan"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Interest rate min (% p.a.)"
                    type="number"
                    step="0.01"
                    value={productForm.interestRateMin}
                    onChange={(e) =>
                      setProductForm({ ...productForm, interestRateMin: e.target.value })
                    }
                  />
                  <Input
                    label="Interest rate max (% p.a.)"
                    type="number"
                    step="0.01"
                    value={productForm.interestRateMax}
                    onChange={(e) =>
                      setProductForm({ ...productForm, interestRateMax: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Processing fee (%)"
                    type="number"
                    step="0.01"
                    value={productForm.processingFeePercentage}
                    onChange={(e) =>
                      setProductForm({ ...productForm, processingFeePercentage: e.target.value })
                    }
                  />
                  <Input
                    label="Max loan amount (₹)"
                    type="number"
                    value={productForm.maxLoanAmount}
                    onChange={(e) =>
                      setProductForm({ ...productForm, maxLoanAmount: e.target.value })
                    }
                  />
                </div>
                <Input
                  label="Other charges"
                  value={productForm.otherCharges}
                  onChange={(e) =>
                    setProductForm({ ...productForm, otherCharges: e.target.value })
                  }
                  placeholder="e.g. Legal fee, stamp duty, GST on fees"
                />
                <Input
                  label="Max tenure (years)"
                  type="number"
                  value={productForm.maxTenureYears}
                  onChange={(e) =>
                    setProductForm({ ...productForm, maxTenureYears: e.target.value })
                  }
                />
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Key features (one per line)
                  </label>
                  <textarea
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={productForm.featuresText}
                    onChange={(e) =>
                      setProductForm({ ...productForm, featuresText: e.target.value })
                    }
                    placeholder="Up to ₹2 Cr.&#10;At least 5 years old school"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">
                    Eligibility criteria (one per line)
                  </label>
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={productForm.eligibilityCriteriaText}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        eligibilityCriteriaText: e.target.value,
                      })
                    }
                    placeholder="School operational 5+ years&#10;Minimum annual turnover"
                  />
                </div>
                {editingBank && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const catalog = catalogProducts.find((p) => p.slug === selectedCategorySlug);
                      setProductForm({
                        ...emptyProductForm(selectedCategorySlug),
                        loanType: catalog?.apiKey || 'personal_loan',
                        productCategorySlug: selectedCategorySlug,
                        catalogApiKey: catalog?.apiKey || '',
                      });
                    }}
                  >
                    Add new product for this category
                  </Button>
                )}
              </div>

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