// Renders a JSON-LD structured-data block. Server-safe (no client JS).
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Structured data is static, author-controlled content.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
