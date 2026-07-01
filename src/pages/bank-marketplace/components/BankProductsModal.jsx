import React, { useEffect, useRef } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { getMarketplaceCompareKey } from '../../../utils/bankMarketplace';

const DetailRow = ({ label, value }) => {
  if (!value || value === '—') return null;
  return (
    <div className="py-2 border-b border-border last:border-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground mt-0.5">{value}</dd>
    </div>
  );
};

const ProductSection = ({ title, items }) => {
  if (!items?.length) return null;
  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground mb-2">{title}</h4>
      <ul className="space-y-1.5">
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className="flex items-start gap-2 text-sm text-muted-foreground">
            <Icon name="CheckCircle2" size={14} className="text-success shrink-0 mt-0.5" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const BankProductsModal = ({
  bankName,
  bankOffer,
  products,
  activeProductKey,
  isOpen,
  onClose,
  onApply,
}) => {
  const activeRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const timer = window.setTimeout(() => {
      activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    return () => window.clearTimeout(timer);
  }, [isOpen, activeProductKey]);

  if (!isOpen || !bankOffer) return null;

  const list = products?.length ? products : [bankOffer];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card rounded-xl border border-border w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl">
        <div className="flex items-start justify-between gap-4 p-4 md:p-6 border-b border-border shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
              <Image
                src={bankOffer.logo}
                alt={bankOffer.logoAlt}
                className="w-full h-full object-contain p-2"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-foreground truncate">{bankName}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {list.length} loan product{list.length === 1 ? '' : 's'} available
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <span>{bankOffer.rating} ★</span>
                <span>({bankOffer.reviews})</span>
                {bankOffer.customersServed && (
                  <>
                    <span>·</span>
                    <span>{bankOffer.customersServed} customers</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 md:p-6 space-y-6">
          {list.map((product) => {
            const productKey = getMarketplaceCompareKey(product);
            const isActive = activeProductKey && productKey === activeProductKey;
            return (
            <div
              key={productKey || product.productId}
              ref={isActive ? activeRef : null}
              className={`rounded-lg border p-4 md:p-5 ${
                isActive
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                  : 'border-border bg-muted/20'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div>
                  {isActive && (
                    <p className="text-xs font-semibold text-primary mb-1">Selected from marketplace</p>
                  )}
                  <h3 className="text-lg font-semibold text-foreground">
                    {product.productName || product.productCategoryLabel}
                  </h3>
                  {product.productCategoryLabel &&
                    product.productName !== product.productCategoryLabel && (
                      <p className="text-xs text-primary mt-0.5">{product.productCategoryLabel}</p>
                    )}
                </div>
                <Button size="sm" onClick={() => onApply?.(product)} iconName="ArrowRight" iconPosition="right">
                  Apply for this product
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-card rounded-lg p-3 border border-border">
                  <p className="text-xs text-muted-foreground">Interest rate</p>
                  <p className="text-base font-bold text-primary mt-1">
                    {product.interestRateLabel}
                    {product.interestRateLabel !== 'On request' ? '% p.a.' : ''}
                  </p>
                </div>
                <div className="bg-card rounded-lg p-3 border border-border">
                  <p className="text-xs text-muted-foreground">Processing fee</p>
                  <p className="text-sm font-semibold mt-1">{product.processingFee}</p>
                </div>
                <div className="bg-card rounded-lg p-3 border border-border">
                  <p className="text-xs text-muted-foreground">Max amount</p>
                  <p className="text-sm font-semibold mt-1">{product.maxAmount}</p>
                </div>
                <div className="bg-card rounded-lg p-3 border border-border">
                  <p className="text-xs text-muted-foreground">Max tenure</p>
                  <p className="text-sm font-semibold mt-1">{product.maxTenure}</p>
                </div>
              </div>

              <dl className="grid md:grid-cols-2 gap-x-6 mb-4">
                <DetailRow label="Other charges" value={product.otherCharges} />
                <DetailRow label="Prepayment charges" value={product.prepaymentCharges} />
                <DetailRow label="Foreclosure charges" value={product.foreclosureCharges} />
                <DetailRow label="Late payment charges" value={product.latePaymentCharges} />
                <DetailRow label="Documentation charges" value={product.documentationCharges} />
                <DetailRow label="Disbursal timeline" value={product.disbursalTimeline} />
                <DetailRow label="Collateral" value={product.collateralRequired} />
                <DetailRow label="Min amount" value={product.minAmount} />
                <DetailRow label="Min tenure" value={product.minTenure} />
              </dl>

              <div className="grid md:grid-cols-2 gap-4">
                <ProductSection title="Key features" items={product.features} />
                <ProductSection title="Eligibility" items={product.eligibilityCriteria} />
                <ProductSection title="Documentation" items={product.documentationRequired} />
                <ProductSection title="Policies" items={product.policies} />
              </div>
            </div>
            );
          })}
        </div>

        <div className="p-4 md:p-6 border-t border-border shrink-0 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BankProductsModal;
