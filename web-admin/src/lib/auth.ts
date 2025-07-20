import { supabase } from './supabase/client';
import { isSuperAdmin, config } from './env';

export async function checkAdminAccess() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { isAdmin: false, user: null, adminLevel: null };
  }

  // Check if user is admin via RPC
  const { data: isAdmin } = await supabase.rpc('is_admin');
  
  // Additional check for super admin status
  const superAdmin = isSuperAdmin(user.email || '');
  
  // Get admin level from user metadata
  const adminLevel = user.user_metadata?.admin_level || (superAdmin ? 'super' : 'basic');
  
  return { 
    isAdmin: !!isAdmin, 
    user, 
    adminLevel,
    isSuperAdmin: superAdmin 
  };
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    // Wait a moment for session to be established
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify admin access
    const { isAdmin, adminLevel } = await checkAdminAccess();
    
    if (!isAdmin) {
      await supabase.auth.signOut();
      throw new Error('Access denied. Admin privileges required.');
    }

    // Log successful admin login
    console.log(`✅ Admin login successful: ${email} (${adminLevel})`);

    return { ...data, adminLevel };
  } catch (error) {
    console.error('❌ Admin login failed:', error);
    throw error;
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}