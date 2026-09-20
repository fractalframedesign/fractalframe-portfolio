import type { Metadata } from 'next';

import { FinanceDashboard } from '@/components/project-demos/finance-dashboard/FinanceDashboard';

export const metadata: Metadata = {
  title: 'Finance Dashboard',
};

export default function Page() {
  return (
    <div className="overflow-hidden rounded-3xl bg-canvas">
      <FinanceDashboard />
    </div>
  );
}
