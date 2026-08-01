import { createClient } from '@/lib/supabase-server';
import Link from 'next/link';
import { formatDistanceToNow } from '@/lib/date';

export const revalidate = 0;

export default async function HomePage() {
  const supabase = createClient();

  const { data: posts } = await supabase
    .from('posts')
    .select('*, profiles!posts_user_id_fkey(username)')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">最新文章</h1>
        <span className="text-sm text-slate-400">{posts?.length || 0} 篇</span>
      </div>

      {posts && posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="block bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-brand-500/50 hover:bg-slate-800 transition-all group"
            >
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                {post.category && (
                  <span className="px-2 py-0.5 bg-brand-600/20 text-brand-400 rounded-full">
                    {post.category}
                  </span>
                )}
                <span>by {post.profiles?.username || '匿名'}</span>
                <span>·</span>
                <span>{formatDistanceToNow(new Date(post.created_at))}</span>
              </div>
              <h2 className="text-lg font-semibold text-white group-hover:text-brand-400 transition-colors mb-1">
                {post.title}
              </h2>
              {post.content && (
                <p className="text-sm text-slate-400 line-clamp-2 prose-content">
                  {post.content.slice(0, 120)}
                  {post.content.length > 120 ? '...' : ''}
                </p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🕊️</p>
          <p className="text-slate-400 mb-2">还没有文章</p>
          <Link
            href="/new"
            className="inline-block mt-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            写第一篇文章
          </Link>
        </div>
      )}
    </div>
  );
}
