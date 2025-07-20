import { supabase } from './supabase/client';

export async function checkAdminAccess() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { isAdmin: false, user: null };
  }

  // Check if user is admin
  const { data: isAdmin } = await supabase.rpc('is_admin');
  
  return { isAdmin: !!isAdmin, user };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  // Verify admin access
  const { isAdmin } = await checkAdminAccess();
  
  if (!isAdmin) {
    await supabase.auth.signOut();
    throw new Error('Access denied. Admin privileges required.');
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}