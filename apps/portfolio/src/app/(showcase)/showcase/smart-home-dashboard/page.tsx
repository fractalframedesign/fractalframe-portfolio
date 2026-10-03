import type { Metadata } from 'next';

import { LaptopPreview } from '@/components/project-demos/smart-home-dashboard/LaptopPreview';
import { SmartHomeDashboard } from '@/components/project-demos/smart-home-dashboard/SmartHomeDashboard';

export const metadata: Metadata = {
  title: 'Smart Home Dashboard',
};

export default function Page() {
  return (
    <>
      <LaptopPreview />
      <div className="rounded-3xl bg-canvas p-4 md:p-8">
        <SmartHomeDashboard />
      </div>
    </>
  );
}
