'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import type { User } from '@supabase/supabase-js';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <nav className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-white hover:no-underline">
          📝 {process.env.NEXT_PUBLIC_SITE_NAME || '博客论坛'}
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-slate-300 hover:text-white">
            首页
          </Link>

          {!loading && user ? (
            <>
              <Link href="/new" className="text-brand-500 hover:text-brand-400 font-medium">
                写文章
              </Link>
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-400 transition-colors"
              >
                退出
              </button>
            </>
          ) : !loading ? (
            <Link href="/login" className="text-brand-500 hover:text-brand-400 font-medium">
              登录
            </Link>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
