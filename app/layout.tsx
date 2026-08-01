import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_SITE_NAME || '博客论坛',
  description: '一个基于 Next.js + Supabase 的博客论坛',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-8">{children}</main>
        <footer className="text-center text-sm text-slate-500 py-8 border-t border-slate-800 mt-12">
          <p>Powered by Next.js + Supabase · {new Date().getFullYear()}</p>
        </footer>
      </body>
    </html>
  );
}
