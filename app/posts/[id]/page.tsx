import { createClient } from '@/lib/supabase-server';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from '@/lib/date';
import Comments from '@/components/Comments';
import { getCurrentUser } from '@/lib/auth';

export const revalidate = 0;

interface PostWithProfile {
  id: number;
  user_id: string;
  title: string;
  content: string | null;
  category: string | null;
  created_at: string;
  profiles: { username: string | null } | null;
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const postId = Number(params.id);
  const user = await getCurrentUser();

  if (isNaN(postId)) notFound();

  const { data: rawPost } = await supabase
    .from('posts')
    .select('*, profiles!posts_user_id_fkey(username)')
    .eq('id', postId)
    .single();

  const post = rawPost as unknown as PostWithProfile | null;

  if (!post) notFound();

  const isOwner = user?.id === post.user_id;
  const isAdmin = user?.isAdmin ?? false;

  async function deletePost() {
    'use server';
    const supabaseServer = createClient();
    const currentUser = await getCurrentUser();
    if (!currentUser?.isAdmin) return;

    await supabaseServer.from('posts').delete().eq('id', postId);
    redirect('/');
  }

  return (
    <article>
      {/* 返回按钮 */}
      <Link href="/" className="text-sm text-slate-400 hover:text-white mb-4 inline-block">
        ← 返回首页
      </Link>

      {/* 文章头部 */}
      <div className="mb-6 pb-6 border-b border-slate-700/50">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {post.category && (
              <span className="inline-block px-2 py-0.5 bg-brand-600/20 text-brand-400 rounded-full text-xs mb-2">
                {post.category}
              </span>
            )}
            <h1 className="text-3xl font-bold text-white mb-3">{post.title}</h1>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>by {post.profiles?.username || '匿名'}</span>
              <span>·</span>
              <span>{formatDistanceToNow(new Date(post.created_at))}</span>
            </div>
          </div>

          {(isOwner || isAdmin) && (
            <form action={deletePost}>
              <button
                type="submit"
                className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm rounded-lg border border-red-900 transition-colors"
              >
                {isAdmin && !isOwner ? '管理员删除' : '删除'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 文章内容 */}
      <div className="prose-content text-slate-200 whitespace-pre-wrap mb-12 leading-relaxed">
        {post.content || '(无内容)'}
      </div>

      {/* 评论区 */}
      <Comments postId={post.id} isAdmin={isAdmin} />
    </article>
  );
}
