import PageBuilder from "@/page-components/admin/PageBuilder";

interface EditPageProps {
  params: {
    id: string;
  };
}

export default function EditPagePage({ params }: EditPageProps) {
  return <PageBuilder pageId={params.id} />;
}
