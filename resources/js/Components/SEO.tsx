import { Head } from '@inertiajs/react';

interface JsonLdEntry {
  '@context'?: string;
  '@type': string;
  [key: string]: unknown;
}

interface SEOProps {
  /** Page title (without site suffix — the Inertia title callback appends it) */
  title?: string;
  /** Meta description (also used for og:description) */
  description?: string;
  /** Canonical URL override (defaults to Blade-rendered canonical) */
  canonical?: string;
  /** Open Graph image URL */
  ogImage?: string;
  /** Set true for pages that should not be indexed (checkout, etc.) */
  noIndex?: boolean;
  /** Single or array of JSON-LD objects */
  jsonLd?: JsonLdEntry | JsonLdEntry[];
}

/**
 * Central SEO component for all public pages.
 *
 * Renders <title>, <meta>, Open Graph, Twitter Card, canonical,
 * robots directives, and JSON-LD structured data via Inertia's <Head>.
 *
 * Usage:
 *   <SEO
 *     title="Rooms | Beach House Botaland"
 *     description="Browse our luxury suites..."
 *     canonical="https://..."
 *     ogImage="https://..."
 *     jsonLd={{ '@context': 'https://schema.org', '@type': 'Hotel', ... }}
 *   />
 */
export default function SEO({
  title,
  description,
  canonical,
  ogImage,
  noIndex = false,
  jsonLd,
}: SEOProps) {
  const jsonLdArray: JsonLdEntry[] = jsonLd
    ? Array.isArray(jsonLd)
      ? jsonLd
      : [jsonLd]
    : [];

  return (
    <Head title={title}>
      {description && (
        <>
          <meta name="description" content={description} />
          <meta property="og:description" content={description} />
        </>
      )}
      {title && <meta property="og:title" content={`${title} - Beach House Botaland`} />}
      {canonical && <link rel="canonical" href={canonical} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {jsonLdArray.map((entry, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }}
        />
      ))}
    </Head>
  );
}
