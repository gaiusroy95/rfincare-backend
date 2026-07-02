import React from 'react';
import PlanningHubLayout from '../../components/planning/PlanningHubLayout';
import { PLANNING_HUBS } from '../../constants/planningHubs';

const RetirementPlanningPage = () => {
  const hub = PLANNING_HUBS.find((h) => h.id === 'retirement');
  const relatedCalculators = [
    { slug: 'pension', title: 'Pension' },
    { slug: 'retirement-corpus', title: 'Retirement Corpus' },
    { slug: 'nps', title: 'NPS' },
    { slug: 'swp', title: 'SWP' },
    { slug: 'epf', title: 'EPF' },
  ];
  return <PlanningHubLayout hub={hub} relatedCalculators={relatedCalculators} />;
};

export default RetirementPlanningPage;
