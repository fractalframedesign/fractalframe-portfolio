import type { Metadata } from 'next';

import { SmartHomeDashboard } from '@/components/project-demos/smart-home-dashboard/SmartHomeDashboard';

export const metadata: Metadata = {
  title: 'Smart Home Dashboard Components',
  description:
    'Interactive smart home dashboard components: climate dial, scenes, power analytics and security cameras.',
};

export default function SmartHomeDashboardComponentsPage() {
  return (
    <section className="section-padding px-4 md:px-8">
      <SmartHomeDashboard />
    </section>
  );
}
