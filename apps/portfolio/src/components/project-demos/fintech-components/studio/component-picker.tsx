'use client'

import { Check, ChevronDown } from 'lucide-react'
import Link from 'next/link'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type PickerCategory = {
  id: string
  label: string
  components: Array<{ slug: string; name: string }>
}

/**
 * Shows the current component's category; opens a menu of every component,
 * grouped by category, to jump to another one.
 */
export default function ComponentPicker({
  categories,
  current,
  base,
}: {
  categories: PickerCategory[]
  /** Slug of the component on this page */
  current: string
  /** Path the component slugs are appended to */
  base: string
}) {
  const category = categories.find((group) =>
    group.components.some((component) => component.slug === current),
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="bg-primary/10 text-primary hover:bg-primary/15 data-[state=open]:bg-primary/15 focus-visible:ring-ring/50 inline-flex h-8 shrink-0 items-center gap-1 rounded-full pr-2.5 pl-3 text-sm font-medium transition-colors outline-none focus-visible:ring-[3px]">
        {category?.label ?? 'Components'}
        <ChevronDown className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {categories.map((group, index) => (
          <DropdownMenuGroup key={group.id}>
            {index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel className="text-muted-foreground text-xs">{group.label}</DropdownMenuLabel>
            {group.components.map((component) => {
              const active = component.slug === current
              return (
                <DropdownMenuItem key={component.slug} asChild>
                  <Link href={`${base}/${component.slug}`} aria-current={active ? 'page' : undefined}>
                    <span className="flex-1">{component.name}</span>
                    {active && <Check />}
                  </Link>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
