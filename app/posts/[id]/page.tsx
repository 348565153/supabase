import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from '@/lib/date';
import Comments from '@/components/Comments';

export const revalidate = 0;

export default async function PostPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const postId = Number(params.id);

  if (isNaN(postId)) notFound();

  const { data: post } = await supabase
    .from('posts')
    .select('*, profiles!posts_user_id_fkey(username)')
    .eq('id', postId)
    .single();

  if (!post) notFound();

  return (
    <article>
      {/* 返回按钮 */}
      <Link href="/" className="text-sm text-slate-400 hover:text-white mb-4 inline-block">
        ← 返回首页
      </Link>

      {/* 文章头部 */}
      <div className="mb-6 pb-6 border-b border-slate-700/50">
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

      {/* 文章内容 */}
      <div className="prose-content text-slate-200 whitespace-pre-wrap mb-12 leading-relaxed">
        {post.content || '(无内容)'}
      </div>

      {/* 评论区 */}
      <Comments postId={post.id} />
    </article>
  );
}
