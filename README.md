# 📝 博客论坛 — 部署指南

基于 **Next.js 14 + Supabase** 的博客论坛系统，支持用户注册登录、发帖、实时评论。

## 功能一览

- ✅ 邮箱注册 / 登录（Supabase Auth）
- ✅ 发表文章（标题 + 内容 + 分类）
- ✅ 实时评论（Supabase Realtime）
- ✅ 暗色主题，响应式设计
- ✅ 完全免费部署

---

## 第一步：创建 Supabase 项目

1. 打开 https://supabase.com → 注册 / 登录
2. 点击 **New Project**
   - Name: `blog-forum`
   - Database Password: 设一个强密码，记好
   - Region: 选离你最近的（如 Southeast Asia / Northeast Asia）
3. 等待 1-2 分钟项目初始化完成

## 第二步：执行建表 SQL

1. 进入项目 → 左侧菜单 **SQL Editor**
2. 点击 **New Query**
3. 把 `supabase/init.sql` 的全部内容粘贴进去
4. 点 **Run** → 应该显示 `Success`
5. 左侧菜单 → **Table Editor** → 确认有 `posts`、`comments`、`profiles` 三张表

## 第三步：获取 API Key

1. 左侧菜单 → **Project Settings** → **API**
2. 找到并复制以下两个值：
   - **Project URL** → 类似 `https://xxxxxxxx.supabase.co`
   - **anon public key** → 一长串 `eyJhbG...` 开头的字符串

## 第四步：本地运行测试

```bash
cd blog-forum
npm install
```

创建 `.env.local` 文件（参考 `.env.local.example`）：

```
NEXT_PUBLIC_SUPABASE_URL=https://你的项目地址.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon_key
NEXT_PUBLIC_SITE_NAME=我的博客论坛
```

```bash
npm run dev
```

浏览器打开 http://localhost:3000 → 应该能看到首页。
试试注册一个账号 → 写一篇文章 → 评论！

## 第五步：推到 GitHub

1. 在 GitHub 创建一个新仓库（Public），比如叫 `blog-forum`
2. 在本地：

```bash
git init
git add .
git commit -m "init blog-forum"
git branch -M main
git remote add origin https://github.com/你的用户名/blog-forum.git
git push -u origin main
```

## 第六步：部署到 Vercel

1. 打开 https://vercel.com → 用 GitHub 账号登录
2. 点 **Add New** → **Project** → 选 `blog-forum` 仓库
3. **Environment Variables** 处添加：
   - `NEXT_PUBLIC_SUPABASE_URL` = 你的 Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = 你的 anon key
   - `NEXT_PUBLIC_SITE_NAME` = 我的博客论坛
4. 点 **Deploy** → 等 1-2 分钟
5. 部署完成！Vercel 会给你一个链接：`https://blog-forum-xxx.vercel.app`

🎉 搞定！公网可以访问了！

---

## 后续可选优化

| 功能 | 怎么做 |
|------|--------|
| 绑定自己的域名 | Vercel → Settings → Domains |
| Markdown 编辑器 | 安装 `@uiw/react-md-editor` |
| 文章搜索 | Supabase 全文搜索 `to_tsvector` |
| 点赞功能 | 新建 `likes` 表 + RLS |
| 图片上传 | Supabase Storage |
| 后台管理 | 加 `/admin` 页面 + 权限判断 |
| 访问统计 | Vercel Analytics（免费） |

---

## 文件结构

```
blog-forum/
├── app/
│   ├── layout.tsx          # 全局布局
│   ├── page.tsx            # 首页（文章列表）
│   ├── globals.css         # 全局样式
│   ├── login/page.tsx      # 登录/注册
│   ├── new/page.tsx        # 写新文章
│   └── posts/[id]/page.tsx # 文章详情 + 评论
├── components/
│   ├── Navbar.tsx          # 导航栏
│   └── Comments.tsx        # 评论区（实时）
├── lib/
│   ├── supabase-client.ts  # 浏览器端 Supabase 客户端
│   ├── supabase-server.ts  # 服务端 Supabase 客户端
│   ├── database.types.ts   # TypeScript 类型定义
│   └── date.ts             # 时间格式化
├── supabase/
│   └── init.sql            # 数据库初始化 SQL
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
├── postcss.config.js
├── .env.local.example
└── .gitignore
```

## 技术栈

- **前端**: Next.js 14 (App Router) + Tailwind CSS
- **后端**: Supabase (PostgreSQL + Auth + Realtime)
- **部署**: Vercel
- **成本**: 💰 完全免费
