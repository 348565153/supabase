import { createClient } from './supabase-server';

interface Profile {
  role: string | null;
}

export async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const profile = rawProfile as Profile | null;

  return {
    id: user.id,
    email: user.email,
    role: profile?.role || 'user',
    isAdmin: profile?.role === 'admin',
  };
}
