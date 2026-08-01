import { createClient } from './supabase-server';

export async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return {
    id: user.id,
    email: user.email,
    role: profile?.role || 'user',
    isAdmin: profile?.role === 'admin',
  };
}
