'use client';

import { createClient } from '@/lib/supabase-client';
import { useEffect, useState, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { formatDistanceToNow } from '@/lib/date';

interface Comment {
  id: number;
  post_id: number;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: { username: string | null } | null;
}

export default function Comments({
  postId,
  isAdmin = false,
}: {
  postId: number;
  isAdmin?: boolean;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>('user');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const supabase = createClient();

  const fetchComments = useCallback(async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles!comments_user_id_fkey(username)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (data) setComments((data as unknown as Comment[]) ?? []);
    setLoading(false);
  }, [postId, supabase]);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setUser(data.user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
        setRole(profile?.role || 'user');
      }
    });
    fetchComments();

    const channel = supabase
      .channel(`comments:${postId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` },
        () => fetchComments()
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` },
        () => fetchComments()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, supabase, fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;

    setSubmitting(true);

    const { error } = await supabase.from('comments').insert({
      post_id: postId,
      user_id: user.id,
      content: content.trim(),
    });

    if (!error) {
      setContent('');
      fetchComments();
    }

    setSubmitting(false);
  };

  const handleDelete = async (commentId: number, commentUserId: string) => {
    if (!user) return;
    if (commentUserId !== user.id && role !== 'admin') return;

    await supabase.from('comments').delete().eq('id', commentId);
    fetchComments();
  };

  return (
    <div className="border-t border-slate-700/50 pt-6">
      <h2 className="text-lg font-bold mb-4">💬 评论 ({comments.length})</h2>

      {loading ? (
        <p className="text-slate-400 text-sm">加载中...</p>
      ) : comments.length > 0 ? (
        <div className="space-y-3 mb-6">
          {comments.map((c) => {
            const canDelete = user && (c.user_id === user.id || role === 'admin' || isAdmin);
            return (
              <div key={c.id} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                    <span className="font-medium text-brand-400">
                      {c.profiles?.username || '匿名用户'}
                    </span>
                    {role === 'admin' && (
                      <span className="px-1.5 py-0.5 bg-red-600/20 text-red-400 rounded">管理员</span>
                    )}
                    <span>·</span>
                    <span>{formatDistanceToNow(new Date(c.created_at))}</span>
                  </div>
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(c.id, c.user_id)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      删除
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-200 whitespace-pre-wrap">{c.content}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-slate-500 text-sm mb-6">还没有评论，来说点什么吧～</p>
      )}

      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你的评论..."
            className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {submitting ? '...' : '发送'}
          </button>
        </form>
      ) : (
        <p className="text-sm text-slate-400">
          <a href="/login" className="text-brand-500 hover:underline">登录</a> 后参与评论
        </p>
      )}
    </div>
  );
}
