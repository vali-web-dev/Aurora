import { PlaceholderPage } from '@/components/aurora/PlaceholderPage';

type PageProps = { params: { slug: string[] } };

export default function Page({ params }: PageProps) {
  return <PlaceholderPage baseTitle="Admin" baseHref="/admin" slug={params.slug} />;
}
