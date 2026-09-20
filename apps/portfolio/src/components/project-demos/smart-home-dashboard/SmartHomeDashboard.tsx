import { ClimateControl } from './ClimateControl';
import { GreetingHeader } from './GreetingHeader';
import { PowerAnalyticsCard } from './PowerAnalyticsCard';
import { ScenesPanel } from './ScenesPanel';
import { SecurityCamerasCard } from './SecurityCamerasCard';
import { ThemeToggle } from './ThemeToggle';

export function SmartHomeDashboard() {
  return (
    <div className="mx-auto flex w-full max-w-295 flex-col gap-6">
      <div className="flex justify-end">
        <ThemeToggle />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <GreetingHeader />
          <PowerAnalyticsCard className="flex-1" />
        </div>
        <div className="flex flex-col gap-6">
          <ClimateControl />
          <ScenesPanel className="flex-1" />
        </div>
      </div>

      <SecurityCamerasCard />
    </div>
  );
}
