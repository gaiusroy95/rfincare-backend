import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../../services/adminService';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const CustomersTab = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data, error: err } = await adminService.getCustomers(search);
    if (err) setError(err.message);
    else setCustomers(data || []);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const toggleActive = async (customer) => {
    setUpdatingId(customer.id);
    const nextActive = !customer.isActive;
    const { data, error: err } = await adminService.updateCustomer(customer.id, {
      is_active: nextActive,
      account_status: nextActive ? 'active' : 'inactive',
    });
    setUpdatingId(null);
    if (err) {
      alert(err.message);
      return;
    }
    setCustomers((prev) => prev.map((c) => (c.id === customer.id ? { ...c, ...data } : c)));
  };

  if (loading && !customers.length) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-foreground">Customer accounts</h2>
        <div className="flex gap-2 max-w-md w-full sm:w-auto">
          <Input
            placeholder="Search name, email, phone, CUST-ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="outline" iconName="RefreshCw" onClick={load}>
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          {error}
        </p>
      )}

      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Customer ID</th>
              <th className="text-left px-4 py-3 font-semibold">Name</th>
              <th className="text-left px-4 py-3 font-semibold">Email</th>
              <th className="text-left px-4 py-3 font-semibold">Applications</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
              <th className="text-right px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t border-border">
                <td className="px-4 py-3 font-mono text-xs">{c.customerCode || '—'}</td>
                <td className="px-4 py-3">{c.fullName || '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                <td className="px-4 py-3">{c.applicationCount ?? 0}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      c.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    size="sm"
                    variant={c.isActive ? 'outline' : 'default'}
                    loading={updatingId === c.id}
                    onClick={() => toggleActive(c)}
                  >
                    {c.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!customers.length && !loading && (
          <p className="text-center text-muted-foreground py-8">No customers found.</p>
        )}
      </div>
    </div>
  );
};

export default CustomersTab;
