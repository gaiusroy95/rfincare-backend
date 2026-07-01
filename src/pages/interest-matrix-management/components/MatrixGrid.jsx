import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const MatrixGrid = ({ 
  matrixData, 
  onEditRate, 
  onDeleteRate,
  selectedRows,
  onSelectRow,
  onSelectAll 
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig?.key === key && sortConfig?.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig?.key) return matrixData;

    return [...matrixData]?.sort((a, b) => {
      const aValue = a?.[sortConfig?.key];
      const bValue = b?.[sortConfig?.key];

      if (aValue < bValue) return sortConfig?.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig?.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [matrixData, sortConfig]);

  const getRateColor = (rate) => {
    if (rate < 5) return 'text-success';
    if (rate < 8) return 'text-warning';
    return 'text-destructive';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: 'bg-success/10', text: 'text-success', label: 'Active' },
      pending: { bg: 'bg-warning/10', text: 'text-warning', label: 'Pending' },
      scheduled: { bg: 'bg-primary/10', text: 'text-primary', label: 'Scheduled' },
      expired: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Expired' }
    };

    const config = statusConfig?.[status] || statusConfig?.active;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config?.bg} ${config?.text}`}>
        {config?.label}
      </span>
    );
  };

  const allSelected = matrixData?.length > 0 && selectedRows?.length === matrixData?.length;
  const someSelected = selectedRows?.length > 0 && selectedRows?.length < matrixData?.length;

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px]">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => el && (el.indeterminate = someSelected)}
                  onChange={(e) => onSelectAll(e?.target?.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                />
              </th>
              {[
                { key: 'bankName', label: 'Bank' },
                { key: 'productType', label: 'Product' },
                { key: 'loanType', label: 'Loan Type' },
                { key: 'creditScoreMin', label: 'Credit Min' },
                { key: 'creditScoreMax', label: 'Credit Max' },
                { key: 'loanAmountMin', label: 'Amount Min' },
                { key: 'loanAmountMax', label: 'Amount Max' },
                { key: 'termMin', label: 'Term Min' },
                { key: 'termMax', label: 'Term Max' },
                { key: 'interestRate', label: 'Rate (%)' },
                { key: 'status', label: 'Status' },
                { key: 'effectiveDate', label: 'Effective Date' }
              ]?.map((column) => (
                <th
                  key={column?.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => handleSort(column?.key)}
                >
                  <div className="flex items-center gap-2">
                    {column?.label}
                    {sortConfig?.key === column?.key && (
                      <Icon
                        name={sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown'}
                        size={14}
                      />
                    )}
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-semibold text-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedData?.map((row) => (
              <tr
                key={row?.id}
                className={`hover:bg-muted/30 transition-colors ${
                  selectedRows?.includes(row?.id) ? 'bg-primary/5' : ''
                }`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows?.includes(row?.id)}
                    onChange={() => onSelectRow(row?.id)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                  />
                </td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">
                  {row?.bankName || 'All Banks'}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-foreground">
                  {row?.productType}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {row?.loanType}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {row?.creditScoreMin}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {row?.creditScoreMax}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  ₹{row?.loanAmountMin?.toLocaleString('en-IN')}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  ₹{row?.loanAmountMax?.toLocaleString('en-IN')}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {row?.termMin}m
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {row?.termMax}m
                </td>
                <td className={`px-4 py-3 text-sm font-semibold ${getRateColor(row?.interestRate)}`}>
                  {Number(row?.interestRate || 0)?.toFixed(2)}%
                </td>
                <td className="px-4 py-3">
                  {getStatusBadge(row?.status)}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {new Date(row.effectiveDate)?.toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditRate(row)}
                      className="h-8 w-8"
                    >
                      <Icon name="Edit2" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteRate(row?.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sortedData?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Database" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
          <p className="text-muted-foreground text-sm md:text-base">No matrix data found. Add your first rate configuration.</p>
        </div>
      )}
    </div>
  );
};

export default MatrixGrid;