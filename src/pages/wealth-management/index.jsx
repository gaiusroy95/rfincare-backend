import React from 'react';
import PlanningHubLayout from '../../components/planning/PlanningHubLayout';
import { PLANNING_HUBS } from '../../constants/planningHubs';

const WealthManagementPage = () => {
  const hub = PLANNING_HUBS.find((h) => h.id === 'wealth');
  const relatedCalculators = [
    { slug: 'goal-sip', title: 'Goal SIP' },
    { slug: 'child-education', title: 'Child Education' },
    { slug: 'marriage-planning', title: 'Marriage Planning' },
    { slug: 'net-worth', title: 'Net Worth' },
    { slug: 'fire', title: 'FIRE' },
  ];
  return <PlanningHubLayout hub={hub} relatedCalculators={relatedCalculators} />;
};

export default WealthManagementPage;
