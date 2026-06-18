import { Link } from '@inertiajs/react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

/**
 * Accessible breadcrumb navigation with JSON-LD support.
 *
 * Usage:
 *   <Breadcrumbs
 *     items={[
 *       { label: 'Home', href: '/' },
 *       { label: 'Rooms', href: '/rooms' },
 *       { label: 'Deluxe Suite - Room 101' },
 *     ]}
 *   />
 */
export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm mb-4">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-neutral-400">/</span>}
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-[#2D5016] transition-colors text-xs font-medium text-neutral-500"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-[#2D5016] text-xs font-semibold">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
