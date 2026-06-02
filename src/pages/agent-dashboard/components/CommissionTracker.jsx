import React from 'react';
import Icon from '../../../components/AppIcon';

const CommissionTracker = ({ commissions }) => {
  const totalEarned = commissions?.reduce((sum, comm) => sum + comm?.amount, 0);
  const pendingAmount = commissions?.filter(comm => comm?.status === 'pending')?.reduce((sum, comm) => sum + comm?.amount, 0);

  const getStatusColor = (status) => {
    const colors = {
      paid: 'bg-green-100 text-green-700 border-green-200',
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      processing: 'bg-blue-100 text-blue-700 border-blue-200'
    };
    return colors?.[status] || colors?.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      paid: 'CheckCircle',
      pending: 'Clock',
      processing: 'RefreshCw'
    };
    return icons?.[status] || 'Clock';
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 md:p-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-bold text-foreground">Commission Tracker</h2>
        <Icon name="IndianRupee" size={20} color="var(--color-primary)" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="TrendingUp" size={20} color="white" />
            <p className="text-sm opacity-90">Total Earned</p>
          </div>
          <p className="text-2xl md:text-3xl font-bold">₹{totalEarned?.toLocaleString('en-IN')}</p>
          <p className="text-xs opacity-75 mt-1">This month</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-4 text-white">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Clock" size={20} color="white" />
            <p className="text-sm opacity-90">Pending</p>
          </div>
          <p className="text-2xl md:text-3xl font-bold">₹{pendingAmount?.toLocaleString('en-IN')}</p>
          <p className="text-xs opacity-75 mt-1">Processing</p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Recent Commissions</h3>
          <button className="text-xs text-primary hover:underline">View All</button>
        </div>

        {!commissions?.length ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Submit customer applications via Add Client to see commission entries here.
          </p>
        ) : (
        commissions?.slice(0, 5)?.map((commission) => (
          <div
            key={commission?.id}
            className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon name={getStatusIcon(commission?.status)} size={18} color="var(--color-primary)" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{commission?.clientName}</p>
                <p className="text-xs text-muted-foreground">{commission?.loanType}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 flex-shrink-0">
              <div className="text-right">
                <p className="text-sm font-bold text-foreground whitespace-nowrap">₹{commission?.amount?.toLocaleString('en-IN')}</p>
                <p className="text-xs text-muted-foreground">{commission?.date}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(commission?.status)}`}>
                {commission?.status?.charAt(0)?.toUpperCase() + commission?.status?.slice(1)}
              </span>
            </div>
          </div>
        )))}
      </div>
    </div>
  );
};

export default CommissionTracker;