import React from 'react';

import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { getProductCategoryLabel } from '../../utils/bankMarketplace';
import { getProductCategoryFields } from '../../utils/bankProductMatching';

const textareaClass =
  'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm';

const BankProductEditor = ({
  bankName,
  bankProducts = [],
  catalogProducts = [],
  productForm,
  onProductFormChange,
  onSelectProduct,
  onAddProduct,
  onSaveProduct,
  onDeleteProduct,
  savingProduct = false,
  disabled = false,
}) => {
  const categoryOptions = catalogProducts.map((p) => ({
    value: p.slug,
    label: p.label,
  }));

  const mappedCategories = new Set(
    bankProducts.map((product) => getProductCategoryFields(product).categorySlug).filter(Boolean),
  );

  const addCategoryOptions = categoryOptions.filter(
    (opt) => !mappedCategories.has(opt.value) || productForm.productCategorySlug === opt.value,
  );

  const updateField = (field, value) => {
    onProductFormChange({ ...productForm, [field]: value });
  };

  return (
    <div className="border-t border-border pt-4 mt-2 space-y-4">
      <div>
        <h3 className="text-base font-semibold text-foreground">Loan products (marketplace comparison)</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Configure rates, fees, features, and policies for each product category. Customers compare
          these fields product-to-product across banks.
        </p>
      </div>

      {bankProducts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {bankProducts.map((product) => {
            const isActive = productForm.id === product.id;
            const categoryLabel = getProductCategoryLabel(product, catalogProducts);
            return (
              <button
                key={product.id}
                type="button"
                disabled={disabled}
                onClick={() => onSelectProduct(product)}
                className={`px-3 py-2 rounded-lg border text-left text-xs md:text-sm transition-colors ${
                  isActive
                    ? 'border-primary bg-primary/10 text-primary font-medium'
                    : 'border-border bg-background hover:bg-muted'
                }`}
              >
                <span className="block font-semibold">{categoryLabel}</span>
                <span className="block text-muted-foreground truncate max-w-[180px]">
                  {product.name || `${bankName} ${categoryLabel}`}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className="rounded-lg border border-border p-4 space-y-4 bg-muted/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Product category"
            options={categoryOptions}
            value={productForm.productCategorySlug}
            onChange={(value) => onAddProduct(value)}
            disabled={disabled}
          />
          <Input
            label="Product name (shown to customers)"
            value={productForm.productName}
            onChange={(e) => updateField('productName', e.target.value)}
            placeholder={`e.g. ${bankName || 'Bank'} Personal Loan`}
            disabled={disabled}
          />
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Rates &amp; fees</h4>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Interest rate min (% p.a.)"
              type="number"
              step="0.01"
              value={productForm.interestRateMin}
              onChange={(e) => updateField('interestRateMin', e.target.value)}
              disabled={disabled}
            />
            <Input
              label="Interest rate max (% p.a.)"
              type="number"
              step="0.01"
              value={productForm.interestRateMax}
              onChange={(e) => updateField('interestRateMax', e.target.value)}
              disabled={disabled}
            />
            <Input
              label="Processing fee (%)"
              type="number"
              step="0.01"
              value={productForm.processingFeePercentage}
              onChange={(e) => updateField('processingFeePercentage', e.target.value)}
              disabled={disabled}
            />
            <Input
              label="Processing fee fixed (₹)"
              type="number"
              value={productForm.processingFeeFixed}
              onChange={(e) => updateField('processingFeeFixed', e.target.value)}
              disabled={disabled}
            />
            <Input
              label="Other charges"
              value={productForm.otherCharges}
              onChange={(e) => updateField('otherCharges', e.target.value)}
              placeholder="Legal fee, stamp duty, GST on fees"
              disabled={disabled}
            />
            <Input
              label="Prepayment / part-prepayment"
              value={productForm.prepaymentCharges}
              onChange={(e) => updateField('prepaymentCharges', e.target.value)}
              placeholder="e.g. Nil after 12 EMIs"
              disabled={disabled}
            />
            <Input
              label="Foreclosure charges"
              value={productForm.foreclosureCharges}
              onChange={(e) => updateField('foreclosureCharges', e.target.value)}
              disabled={disabled}
            />
            <Input
              label="Late payment charges"
              value={productForm.latePaymentCharges}
              onChange={(e) => updateField('latePaymentCharges', e.target.value)}
              disabled={disabled}
            />
            <Input
              label="Documentation charges"
              value={productForm.documentationCharges}
              onChange={(e) => updateField('documentationCharges', e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Loan limits &amp; timeline</h4>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Min loan amount (₹)"
              type="number"
              value={productForm.minLoanAmount}
              onChange={(e) => updateField('minLoanAmount', e.target.value)}
              disabled={disabled}
            />
            <Input
              label="Max loan amount (₹)"
              type="number"
              value={productForm.maxLoanAmount}
              onChange={(e) => updateField('maxLoanAmount', e.target.value)}
              disabled={disabled}
            />
            <Input
              label="Min tenure (years)"
              type="number"
              value={productForm.minTenureYears}
              onChange={(e) => updateField('minTenureYears', e.target.value)}
              disabled={disabled}
            />
            <Input
              label="Max tenure (years)"
              type="number"
              value={productForm.maxTenureYears}
              onChange={(e) => updateField('maxTenureYears', e.target.value)}
              disabled={disabled}
            />
            <Input
              label="Disbursal timeline"
              value={productForm.disbursalTimeline}
              onChange={(e) => updateField('disbursalTimeline', e.target.value)}
              placeholder="e.g. 48–72 hours after approval"
              disabled={disabled}
            />
            <Input
              label="Collateral required"
              value={productForm.collateralRequired}
              onChange={(e) => updateField('collateralRequired', e.target.value)}
              placeholder="e.g. None / Property mortgage"
              disabled={disabled}
            />
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Features, eligibility &amp; policies</h4>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Key features (one per line)
              </label>
              <textarea
                className={`${textareaClass} min-h-[100px]`}
                value={productForm.featuresText}
                onChange={(e) => updateField('featuresText', e.target.value)}
                placeholder="Up to ₹2 Cr&#10;Flexible repayment"
                disabled={disabled}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Eligibility criteria (one per line)
              </label>
              <textarea
                className={textareaClass}
                value={productForm.eligibilityCriteriaText}
                onChange={(e) => updateField('eligibilityCriteriaText', e.target.value)}
                placeholder="Minimum age 21&#10;Minimum annual income ₹5 Lakh"
                disabled={disabled}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Policies &amp; terms (one per line)
              </label>
              <textarea
                className={textareaClass}
                value={productForm.policiesText}
                onChange={(e) => updateField('policiesText', e.target.value)}
                placeholder="No co-applicant required&#10;Balance transfer allowed"
                disabled={disabled}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                Documentation required (one per line)
              </label>
              <textarea
                className={textareaClass}
                value={productForm.documentationRequiredText}
                onChange={(e) => updateField('documentationRequiredText', e.target.value)}
                placeholder="PAN &amp; Aadhaar&#10;Last 3 months salary slips"
                disabled={disabled}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {addCategoryOptions.length > 0 && (
            <Select
              label="Add product for category"
              options={[{ value: '', label: 'Choose category…' }, ...addCategoryOptions]}
              value=""
              onChange={(value) => value && onAddProduct(value)}
              disabled={disabled}
            />
          )}
          {onSaveProduct && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSaveProduct}
              disabled={disabled || savingProduct}
              iconName="Save"
            >
              {savingProduct ? 'Saving product…' : 'Save product'}
            </Button>
          )}
          {productForm.id && onDeleteProduct && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-error hover:bg-error/10"
              onClick={onDeleteProduct}
              disabled={disabled || savingProduct}
              iconName="Trash2"
            >
              Delete product
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankProductEditor;
