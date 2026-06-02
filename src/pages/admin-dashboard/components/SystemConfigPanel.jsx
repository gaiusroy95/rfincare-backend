import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { adminService } from '../../../services/adminService';

const SystemConfigPanel = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingConfig, setEditingConfig] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'security', label: 'Security' },
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' },
    { value: 'payment', label: 'Payment' }
  ];

  useEffect(() => {
    loadConfigurations();
  }, [selectedCategory]);

  const loadConfigurations = async () => {
    setLoading(true);
    const category = selectedCategory === 'all' ? null : selectedCategory;
    const { data, error } = await adminService?.getSystemConfigurations(category);
    if (error) {
      setError(error?.message);
    } else {
      setConfigs(data || []);
    }
    setLoading(false);
  };

  const handleEdit = (config) => {
    setEditingConfig({
      ...config,
      newValue: config?.configValue
    });
  };

  const handleSave = async () => {
    if (!editingConfig) return;

    const { error } = await adminService?.updateSystemConfiguration(
      editingConfig?.configKey,
      editingConfig?.newValue
    );

    if (error) {
      setError(error?.message);
    } else {
      await loadConfigurations();
      setEditingConfig(null);
    }
  };

  const getCategoryBadge = (category) => {
    const categoryConfig = {
      general: { bg: 'bg-blue-500/10', text: 'text-blue-600' },
      security: { bg: 'bg-destructive/10', text: 'text-destructive' },
      email: { bg: 'bg-purple-500/10', text: 'text-purple-600' },
      sms: { bg: 'bg-green-500/10', text: 'text-green-600' },
      payment: { bg: 'bg-warning/10', text: 'text-warning' }
    };

    const config = categoryConfig?.[category] || categoryConfig?.general;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${config?.bg} ${config?.text}`}>
        {category?.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">System Configuration</h2>
          <p className="text-sm text-muted-foreground">Manage system-wide settings and parameters</p>
        </div>
        <Select
          options={categories}
          value={selectedCategory}
          onChange={setSelectedCategory}
          className="w-48"
        />
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {configs?.map((config) => (
            <div key={config?.id} className="bg-card rounded-lg border border-border p-4 md:p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-bold text-foreground">{config?.configKey?.replace(/_/g, ' ')?.toUpperCase()}</h3>
                    {getCategoryBadge(config?.category)}
                    {config?.isSensitive && (
                      <span className="inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-semibold bg-warning/10 text-warning">
                        <Icon name="Lock" size={12} />
                        <span>SENSITIVE</span>
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{config?.description}</p>
                  <div className="flex items-center space-x-4">
                    <div>
                      <span className="text-xs text-muted-foreground">Type:</span>
                      <span className="ml-2 text-sm font-medium text-foreground">{config?.configType}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">Current Value:</span>
                      <span className="ml-2 text-sm font-semibold text-primary">
                        {config?.configType === 'boolean' 
                          ? (config?.configValue === 'true' ? 'Enabled' : 'Disabled')
                          : config?.configValue}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Edit"
                  onClick={() => handleEdit(config)}
                >
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-foreground">Edit Configuration</h3>
              <Button variant="ghost" size="icon" onClick={() => setEditingConfig(null)}>
                <Icon name="X" size={20} />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {editingConfig?.configKey?.replace(/_/g, ' ')?.toUpperCase()}
                </label>
                {editingConfig?.configType === 'boolean' ? (
                  <Select
                    options={[
                      { value: 'true', label: 'Enabled' },
                      { value: 'false', label: 'Disabled' }
                    ]}
                    value={editingConfig?.newValue}
                    onChange={(value) => setEditingConfig({ ...editingConfig, newValue: value })}
                  />
                ) : (
                  <Input
                    type={editingConfig?.configType === 'number' ? 'number' : 'text'}
                    value={editingConfig?.newValue}
                    onChange={(e) => setEditingConfig({ ...editingConfig, newValue: e?.target?.value })}
                  />
                )}
                <p className="text-xs text-muted-foreground mt-1">{editingConfig?.description}</p>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" fullWidth onClick={() => setEditingConfig(null)}>
                  Cancel
                </Button>
                <Button variant="default" fullWidth onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemConfigPanel;
