import { redirect } from 'next/navigation';
import { checkAdminAccess } from '@/lib/auth';

export default async function Home() {
  const isAdmin = await checkAdminAccess();
  
  if (isAdmin) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}