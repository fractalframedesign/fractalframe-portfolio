import type { Metadata } from 'next';

import { FinanceDashboard } from '@/components/project-demos/finance-dashboard/FinanceDashboard';

export const metadata: Metadata = {
  title: 'Finance Dashboard Components',
  description:
    'Interactive bento-grid finance dashboard cards built with React, Tailwind and Motion.',
};

export default function FinanceDashboardComponentsPage() {
  return (
    <section className="section-padding container">
      <FinanceDashboard />
    </section>
  );
}
