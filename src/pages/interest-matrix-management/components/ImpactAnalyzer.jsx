import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ImpactAnalyzer = ({ isOpen, onClose, impactData }) => {
  if (!isOpen) return null;

  const { affectedApplications, revenueImpact, customerImpact } = impactData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-card border-b border-border px-4 md:px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-bold text-foreground flex items-center gap-2">
            <Icon name="TrendingUp" size={24} color="var(--color-primary)" />
            Rate Change Impact Analysis
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="p-4 md:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Icon name="FileText" size={20} color="var(--color-primary)" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Affected Applications</p>
                  <p className="text-2xl font-bold text-foreground">{affectedApplications}</p>
                </div>
              </div>
            </div>

            <div className="bg-success/10 rounded-lg p-4 border border-success/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                  <Icon name="IndianRupee" size={20} color="var(--color-success)" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Revenue Impact</p>
                  <p className="text-2xl font-bold text-foreground">${revenueImpact?.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-warning/10 rounded-lg p-4 border border-warning/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                  <Icon name="Users" size={20} color="var(--color-warning)" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Customer Impact</p>
                  <p className="text-2xl font-bold text-foreground">{customerImpact}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Icon name="BarChart3" size={20} color="var(--color-primary)" />
              Before vs After Comparison
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">Average Interest Rate</p>
                  <p className="text-xs text-muted-foreground mt-1">Current portfolio average</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-muted-foreground line-through">7.25%</p>
                  <p className="text-lg font-bold text-success">6.85%</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">Monthly Payment Impact</p>
                  <p className="text-xs text-muted-foreground mt-1">Average customer savings</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-success">-₹45/month</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">Approval Rate Change</p>
                  <p className="text-xs text-muted-foreground mt-1">Expected increase</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-success">+8.5%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-warning/10 rounded-lg p-4 border border-warning/20">
            <div className="flex items-start gap-3">
              <Icon name="AlertTriangle" size={20} color="var(--color-warning)" className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">Important Notice</p>
                <p className="text-xs text-muted-foreground">
                  This rate change will affect {affectedApplications} pending applications. Customers will be notified automatically. 
                  Ensure all stakeholders are informed before implementing this change.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={onClose}
              fullWidth
              className="sm:w-auto"
            >
              Close
            </Button>
            <Button
              variant="default"
              iconName="CheckCircle"
              iconPosition="left"
              fullWidth
              className="sm:w-auto"
            >
              Approve & Implement
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactAnalyzer;