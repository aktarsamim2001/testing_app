import MenuDetailPage from '@/page-components/admin/MenuDetail';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const menuId = parseInt(id, 10);

  return <MenuDetailPage menuId={menuId} />;
}
