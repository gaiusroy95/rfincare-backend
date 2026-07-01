import React from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const QuestionSection = ({ 
  section, 
  responses, 
  onResponseChange, 
  errors 
}) => {
  const renderQuestion = (question) => {
    const value = responses?.[question?.id] || '';
    const error = errors?.[question?.id];

    switch (question?.type) {
      case 'text': case'email': case'tel': case'number':
        return (
          <Input
            key={question?.id}
            type={question?.type}
            label={question?.label}
            description={question?.description}
            placeholder={question?.placeholder}
            value={value}
            onChange={(e) => onResponseChange(question?.id, e?.target?.value)}
            required={question?.required}
            error={error}
            className="mb-4"
          />
        );

      case 'select':
        return (
          <Select
            key={question?.id}
            label={question?.label}
            description={question?.description}
            options={question?.options}
            value={value}
            onChange={(val) => onResponseChange(question?.id, val)}
            required={question?.required}
            error={error}
            placeholder={question?.placeholder}
            className="mb-4"
          />
        );

      case 'checkbox':
        return (
          <Checkbox
            key={question?.id}
            label={question?.label}
            description={question?.description}
            checked={value === true}
            onChange={(e) => onResponseChange(question?.id, e?.target?.checked)}
            required={question?.required}
            error={error}
            className="mb-4"
          />
        );

      case 'textarea':
        return (
          <div key={question?.id} className="mb-4">
            <label className="block text-sm font-semibold mb-2">
              {question?.label}
              {question?.required && <span className="text-destructive ml-1">*</span>}
            </label>
            {question?.description && (
              <p className="text-xs text-muted-foreground mb-2">{question?.description}</p>
            )}
            <textarea
              value={value}
              onChange={(e) => onResponseChange(question?.id, e?.target?.value)}
              placeholder={question?.placeholder}
              required={question?.required}
              rows={4}
              className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6 lg:p-8 mb-4 md:mb-6">
      <div className="flex items-start space-x-3 mb-4 md:mb-6">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: section?.color }}>
          <Icon name={section?.icon} size={20} color="white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg md:text-xl font-bold text-foreground mb-1">
            {section?.title}
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            {section?.description}
          </p>
        </div>
      </div>
      <div className="space-y-4">
        {section?.questions?.map(renderQuestion)}
      </div>
    </div>
  );
};

export default QuestionSection;