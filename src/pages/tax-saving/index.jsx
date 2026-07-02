import React from 'react';
import PlanningHubLayout from '../../components/planning/PlanningHubLayout';
import { PLANNING_HUBS } from '../../constants/planningHubs';

const TaxSavingPage = () => {
  const hub = PLANNING_HUBS.find((h) => h.id === 'tax-saving');
  const relatedCalculators = [
    { slug: 'income-tax', title: 'Income Tax' },
    { slug: 'hra', title: 'HRA' },
    { slug: 'capital-gain', title: 'Capital Gain' },
    { slug: 'section-80c', title: 'Section 80C' },
    { slug: 'section-80d', title: 'Section 80D' },
  ];
  return <PlanningHubLayout hub={hub} relatedCalculators={relatedCalculators} />;
};

export default TaxSavingPage;
