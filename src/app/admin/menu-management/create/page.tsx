import { redirect } from 'next/navigation';

export default function Page() {
  // Create route removed — redirect to the menus list
  redirect('/admin/menu-management');
}
