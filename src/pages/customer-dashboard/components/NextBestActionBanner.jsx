import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const NextBestActionBanner = ({ action, loading }) => {
  const navigate = useNavigate();

  if (loading || !action) return null;

  return (
    <div className="rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-5 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <Icon name="Zap" size={22} color="white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Your next step</p>
            <h3 className="text-lg font-bold text-foreground mt-0.5">{action.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
          </div>
        </div>
        <Button
          size="lg"
          className="shrink-0 w-full md:w-auto"
          onClick={() => navigate(action.path)}
        >
          {action.cta || 'Continue'}
          <Icon name="ArrowRight" size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default NextBestActionBanner;
