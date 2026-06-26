import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';
import BankLogoFields from '../../../components/admin/BankLogoFields';
import { bankService, auditService } from '../../../services/apiServices';
import { resolveBankLogoUrl } from '../../../utils/bankBranding';
import { BANK_TYPE_OPTIONS, getBankTypeLabel } from '../../../constants/bankTypes';

const BankManagementTab = () => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBank, setEditingBank] = useState(null);
  const [pendingLogoFile, setPendingLogoFile] = useState(null);
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
    displayPriority: 0
  });

  useEffect(() => {
    loadBanks({ showFullLoader: true });
  }, []);

  const loadBanks = async ({ forceRefresh = false, showFullLoader = false } = {}) => {
    try {
      if (showFullLoader) setLoading(true);
      else if (forceRefresh) setRefreshing(true);
      setError('');
      const data = await bankService?.getAllBanks({ forceRefresh });
      setBanks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to load banks');
      console.error('Error loading banks:', err);
    } finally {
      if (showFullLoader) setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    await loadBanks({ forceRefresh: true });
  };

  const handleOpenModal = (bank = null) => {
    setPendingLogoFile(null);
    if (bank) {
      setEditingBank(bank);
      setFormData({
        name: bank?.name || '',
        logoUrl: bank?.logoUrl || '',
        logoAlt: bank?.logoAlt || '',
        bankType: bank?.bankType || 'private',
        status: bank?.status || 'active',
        rating: bank?.rating || 4.5,
        reviewsCount: bank?.reviewsCount || 0,
        customersServed: bank?.customersServed || '',
        partnershipDuration: bank?.partnershipDuration || '',
        certifications: bank?.certifications || [],
        applyUrl: bank?.applyUrl || '',
        displayPriority: bank?.displayPriority || 0
      });
    } else {
      setEditingBank(null);
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
        displayPriority: 0
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBank(null);
    setPendingLogoFile(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    try {
      setError('');
      let bankId = editingBank?.id;
      const bankPayload = { ...formData };
      if (pendingLogoFile && !editingBank) {
        bankPayload.logoUrl = null;
      }
      if (editingBank) {
        await bankService?.updateBank(editingBank?.id, bankPayload);
        await auditService?.logAction('UPDATE', 'banks', editingBank?.id, editingBank, bankPayload);
      } else {
        const created = await bankService?.createBank(bankPayload);
        bankId = created?.id;
        await auditService?.logAction('CREATE', 'banks', bankId, null, bankPayload);
      }
      if (bankId && pendingLogoFile) {
        await bankService.uploadBankLogo(bankId, pendingLogoFile);
        setPendingLogoFile(null);
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
      setError('');
      await bankService?.deleteBank(bank?.id);
      await auditService?.logAction('DELETE', 'banks', bank?.id, bank, null);
      await loadBanks({ forceRefresh: true });
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'Failed to delete bank');
    }
  };

  const handleStatusToggle = async (bank) => {
    const newStatus = bank?.status === 'active' ? 'inactive' : 'active';
    try {
      setError('');
      await bankService?.updateBank(bank?.id, { status: newStatus });
      await auditService?.logAction('UPDATE', 'banks', bank?.id, { status: bank?.status }, { status: newStatus });
      await loadBanks({ forceRefresh: true });
    } catch (err) {
      setError(err?.message || 'Failed to update bank status');
    }
  };

  const bankTypeOptions = BANK_TYPE_OPTIONS;

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Bank Management</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage banks for Marketplace and Approval Matrix
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            iconName="RefreshCw"
            className={refreshing ? 'animate-spin' : ''}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button onClick={() => handleOpenModal()} iconName="Plus">
            Add Bank
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-error hover:text-error/80">
            <Icon name="X" size={16} />
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading banks...</p>
        </div>
      ) : banks?.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <Icon name="Building" size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No banks found</p>
          <Button onClick={() => handleOpenModal()} iconName="Plus">
            Add Your First Bank
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {banks?.map((bank) => (
            <div key={bank?.id} className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                    {bank?.logoUrl ? (
                      <img
                        src={resolveBankLogoUrl(bank.logoUrl)}
                        alt={bank?.logoAlt || bank?.name}
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <Icon name="Building" size={32} className="text-muted-foreground" />
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-foreground">
                  {editingBank ? 'Edit Bank' : 'Add New Bank'}
                </h3>
                <button onClick={handleCloseModal} className="text-muted-foreground hover:text-foreground">
                  <Icon name="X" size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Bank Name *</label>
                <Input
                  value={formData?.name}
                  onChange={(e) => setFormData({ ...formData, name: e?.target?.value })}
                  placeholder="Enter bank name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Bank Type *</label>
                  <Select
                    value={formData?.bankType}
                    onChange={(value) => setFormData({ ...formData, bankType: value })}
                    options={bankTypeOptions}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Status *</label>
                  <Select
                    value={formData?.status}
                    onChange={(value) => setFormData({ ...formData, status: value })}
                    options={statusOptions}
                  />
                </div>
              </div>

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
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Rating</label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData?.rating}
                    onChange={(e) => setFormData({ ...formData, rating: parseFloat(e?.target?.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Reviews Count</label>
                  <Input
                    type="number"
                    min="0"
                    value={formData?.reviewsCount}
                    onChange={(e) => setFormData({ ...formData, reviewsCount: parseInt(e?.target?.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Customers Served</label>
                <Input
                  value={formData?.customersServed}
                  onChange={(e) => setFormData({ ...formData, customersServed: e?.target?.value })}
                  placeholder="e.g., 50K+"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Partnership Duration</label>
                <Input
                  value={formData?.partnershipDuration}
                  onChange={(e) => setFormData({ ...formData, partnershipDuration: e?.target?.value })}
                  placeholder="e.g., Partner since 2020"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Application URL (bank website)</label>
                <Input
                  type="url"
                  value={formData?.applyUrl}
                  onChange={(e) => setFormData({ ...formData, applyUrl: e?.target?.value })}
                  placeholder="https://www.bank.com/apply"
                />
                <p className="text-xs text-muted-foreground mt-1">Customers are sent here to apply directly on the bank&apos;s website</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Display Priority</label>
                <Input
                  type="number"
                  min="0"
                  value={formData?.displayPriority}
                  onChange={(e) => setFormData({ ...formData, displayPriority: parseInt(e?.target?.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground mt-1">Higher priority banks appear first</p>
              </div>

              {error && (
                <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingBank ? 'Update Bank' : 'Add Bank'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankManagementTab;