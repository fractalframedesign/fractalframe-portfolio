'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useId } from 'react';

import type { ProjectOption } from '@/components/admin/add-guest-dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type GuestsFiltersProps = {
  /** Unlocked projects, plus the filtered one if it is no longer unlocked */
  projects: ProjectOption[];
  project?: string;
  status?: string;
};

// Radix Select can't hold an empty value, so "All" has its own
const ALL = 'all';

const STATUSES = [
  { value: ALL, label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'expired', label: 'Expired' },
];

/** Project and status filters, kept in the URL so the view can be shared */
export default function GuestsFilters({
  projects,
  project,
  status,
}: GuestsFiltersProps) {
  const id = useId();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function update(key: 'project' | 'status', value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === ALL) params.delete(key);
    else params.set(key, value);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <Label htmlFor={`${id}-project`}>Project</Label>
        <Select
          value={project ?? ALL}
          onValueChange={(value) => update('project', value)}
        >
          <SelectTrigger id={`${id}-project`} size="sm" className="min-w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All</SelectItem>
            {projects.map((option) => (
              <SelectItem key={option.slug} value={option.slug}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor={`${id}-status`}>Status</Label>
        <Select
          value={status ?? ALL}
          onValueChange={(value) => update('status', value)}
        >
          <SelectTrigger id={`${id}-status`} size="sm" className="min-w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
