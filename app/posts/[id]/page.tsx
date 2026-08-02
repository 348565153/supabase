import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from '@/lib/date';
import Comments from '@/components/Comments';

// 强制动态渲染，避免构建时静态生成导致 404
export const dynamic = 'force-dynamic';
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

interface PageProps {
  params: { id: string };
}

export default async function PostPage({ params }: PageProps) {
  const supabase = createClient();
  const postId = Number(params.id);

  if (isNaN(postId)) notFound();

  const { data: rawPost } = await supabase
    .from('posts')
    .select('*, profiles!posts_user_id_fkey(username)')
    .eq('id', postId)
    .single();

  const post = rawPost as unknown as PostWithProfile | null;

  if (!post) notFound();

  return (
    <article>
      <Link href="/" className="text-sm text-slate-400 hover:text-white mb-4 inline-block">
        ← 返回首页
      </Link>

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

      <div className="prose-content text-slate-200 whitespace-pre-wrap mb-12 leading-relaxed">
        {post.content || '(无内容)'}
      </div>

      <Comments postId={post.id} />
    </article>
  );
}
