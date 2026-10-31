import Link from 'next/link';

import { logout } from '@/app/(admin)/admin/actions';
import { Button } from '@/components/ui/button';

type AdminHeaderProps = {
  title: string;
  link: { href: string; label: string };
};

export default function AdminHeader({ title, link }: AdminHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <nav aria-label="Admin" className="flex items-center gap-2">
        <Button asChild variant="ghost">
          <Link href={link.href}>{link.label}</Link>
        </Button>
        <form action={logout}>
          <Button type="submit" variant="outline">
            Log out
          </Button>
        </form>
      </nav>
    </header>
  );
}
