-- Supabase Seed Data: PURELY SYNTHETIC TEST DATA for local development and testing ONLY.
-- 
-- IMPORTANT:
-- - All data here is fake/test data. It is deliberately NOT real personal information.
-- - Use obvious placeholder names like "田中 太郎" (similar to John Doe / 田中太郎).
-- - Real people's names, real social media handles, and specific real project/organization names
--   MUST NOT appear. Social links intentionally use 'testuser' (this is by design).
-- - Blog POSTS use Japanese technical explanations about real library features (Next.js, React 19,
--   Supabase RLS, pgvector, TypeScript strict, Vercel Microfrontends, Go patterns, Rails migration, etc.).
-- - Do NOT fabricate first-person stories or plausible personal histories about actually existing
--   projects, companies, or the author's real contributions. Stick to general "how to / best practices"
--   style content for the technologies.
-- - Variety added for easier testing:
--   * 見出しあり (headings: some have h2/h3 blocks in Portable Text content → exercises table-of-contents, extract-headings, etc.)
--   * 見出しなし (plain paragraphs only)
--   * 履歴あり (multiple post_versions with version_number >=2, different change_summary → for history page and version diff)
--   * 履歴なし (only initial version 1)
-- - Author identity, socials, works, and memos are obviously synthetic.
-- - Dates are spread across years for easy testing of /blog/YYYY archives etc.

-- This file provides example data for the portfolio, blog, and memo tables.
-- Blog posts are provided in Japanese with realistic technical content and spread across
-- 2023-2025 (multiple posts per year in different months) to facilitate verification of:
-- year archives (/blog/YYYY), year navigation, monthly grouping, tag filtering, pagination,
-- feeds, search, similar posts, and list rendering.

-- Insert test user into auth.users for local development
-- Password: password123 (bcrypt hashed)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  email_change_token_current,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role
) VALUES (
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'test@example.com',
  '$2a$10$ZmNZwTWPm6khfxhHhHhp5OT.SSach5kvkXYxYiA9aLcUaEvk3hLd2', -- password123
  NOW(),
  '',
  '',
  '',
  '',
  '',
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "田中 太郎"}',
  'authenticated',
  'authenticated'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  encrypted_password = EXCLUDED.encrypted_password,
  email_confirmed_at = EXCLUDED.email_confirmed_at,
  confirmation_token = EXCLUDED.confirmation_token,
  recovery_token = EXCLUDED.recovery_token,
  email_change_token_new = EXCLUDED.email_change_token_new,
  email_change = EXCLUDED.email_change,
  email_change_token_current = EXCLUDED.email_change_token_current,
  updated_at = NOW();

-- Insert auth identity for email provider
INSERT INTO auth.identities (
  id,
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000001',
  jsonb_build_object('sub', '00000000-0000-4000-8000-000000000001', 'email', 'test@example.com'),
  'email',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (provider_id, provider) DO UPDATE SET
  identity_data = EXCLUDED.identity_data,
  updated_at = NOW();

-- Insert profile data for test user.
-- Name "田中 太郎" is a standard obvious placeholder (like John Doe / 田中太郎).
-- Bio is deliberately generic test data. This allows Japanese rendering verification without any real person's name or history.
INSERT INTO profiles (
  id,
  user_id,
  name,
  tagline,
  about,
  email,
  occupation,
  fediverse_creator,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000001',
  '田中 太郎',
  'これは開発・テスト用のサンプルプロフィールです。',
  '[
    {
      "_type": "block",
      "_key": "about1",
      "style": "normal",
      "children": [
        {
          "_type": "span",
          "_key": "span1",
          "text": "これはテスト用のプロフィールです。日本語のブログ記事やポートフォリオの表示確認に使用されます。",
          "marks": []
        }
      ]
    },
    {
      "_type": "block",
      "_key": "about2",
      "style": "normal",
      "children": [
        {
          "_type": "span",
          "_key": "span2",
          "text": "サンプルとして、React や Next.js、データベース関連の技術について書いた日本語記事が含まれています。"
        }
      ]
    },
    {
      "_type": "block",
      "_key": "about3",
      "style": "normal",
      "children": [
        {
          "_type": "span",
          "_key": "span5",
          "text": "すべてのデータはローカル開発・テスト専用の架空のものです。",
          "marks": []
        }
      ]
    }
  ]'::jsonb,
  'test@example.com',
  'ソフトウェア開発者（テスト）',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  about = EXCLUDED.about,
  email = EXCLUDED.email,
  occupation = EXCLUDED.occupation,
  fediverse_creator = EXCLUDED.fediverse_creator,
  updated_at = NOW();

-- Insert social links for test user.
-- Deliberately using 'testuser' and *only* reserved example domains (example.com, example.org, example.social).
-- This is intentional: seed data must never contain real production domain names.
-- Real domains would conflict with the "obviously synthetic test data" policy.
INSERT INTO social_links (id, profile_id, url, service, sort_order, created_at, updated_at) VALUES
  ('00000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000001', 'https://example.com/testuser', 'facebook', 1, NOW(), NOW()),
  ('00000000-0000-4000-8000-000000000012', '00000000-0000-4000-8000-000000000001', 'https://example.com/testuser', 'github', 2, NOW(), NOW()),
  ('00000000-0000-4000-8000-000000000013', '00000000-0000-4000-8000-000000000001', 'https://example.social/@testuser', 'mastodon', 3, NOW(), NOW()),
  ('00000000-0000-4000-8000-000000000014', '00000000-0000-4000-8000-000000000001', 'https://example.com/testuser', 'threads', 4, NOW(), NOW()),
  ('00000000-0000-4000-8000-000000000015', '00000000-0000-4000-8000-000000000001', 'https://example.com/testuser', 'x', 5, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  url = EXCLUDED.url,
  service = EXCLUDED.service,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- Insert technologies for test user (realistic stack matching the developer's actual work)
INSERT INTO technologies (id, name, created_at, updated_at) VALUES
  ('00000000-0000-4000-8000-000000000021', 'React', NOW(), NOW()),
  ('00000000-0000-4000-8000-000000000022', 'Next.js', NOW(), NOW()),
  ('00000000-0000-4000-8000-000000000023', 'TypeScript', NOW(), NOW()),
  ('00000000-0000-4000-8000-000000000024', 'Supabase', NOW(), NOW()),
  ('00000000-0000-4000-8000-000000000025', 'Go', NOW(), NOW()),
  ('00000000-0000-4000-8000-000000000026', 'Ruby on Rails', NOW(), NOW()),
  ('00000000-0000-4000-8000-000000000027', 'PostgreSQL', NOW(), NOW()),
  ('00000000-0000-4000-8000-000000000028', 'Vercel', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

-- Insert profile_technologies for test user (links profile to technologies, realistic order)
INSERT INTO profile_technologies (id, profile_id, technology_id, sort_order, created_at, updated_at) VALUES
  ('00000000-0000-4000-8000-000000000031', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000021', 1, NOW(), NOW()),
  ('00000000-0000-4000-8000-000000000032', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000022', 2, NOW(), NOW()),
  ('00000000-0000-4000-8000-000000000033', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000023', 3, NOW(), NOW()),
  ('00000000-0000-4000-8000-000000000034', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000024', 4, NOW(), NOW()),
  ('00000000-0000-4000-8000-000000000035', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000025', 5, NOW(), NOW()),
  ('00000000-0000-4000-8000-000000000036', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000026', 6, NOW(), NOW()),
  ('00000000-0000-4000-8000-000000000037', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000027', 7, NOW(), NOW()),
  ('00000000-0000-4000-8000-000000000038', '00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000028', 8, NOW(), NOW())
ON CONFLICT (profile_id, technology_id) DO UPDATE SET
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- Insert sample works with Portable Text content (Japanese for consistency with blog/portfolio)
-- Titles and project references are deliberately generic "サンプル" to make it obvious this is test data.
INSERT INTO works (id, profile_id, title, slug, content, starts_at, created_at, updated_at) VALUES
  (
    '00000000-0000-4000-8000-000000000002',
    '00000000-0000-4000-8000-000000000001',
    'サンプルワーク 1',
    'sample-work-1',
    '[
      {
        "_type": "block",
        "_key": "block1",
        "style": "normal",
        "children": [
          {
            "_type": "span",
            "_key": "span1",
            "text": "Go 言語で実装したサンプル画像変換プロキシです。WebP や AVIF への変換をオンデマンドで行い、画像配信を高速化する例です。",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "block2",
        "style": "normal",
        "children": [
          {
            "_type": "span",
            "_key": "span2",
            "text": "コンテンツは JSONB として保存され、@portabletext/react でレンダリング可能です。",
            "marks": []
          }
        ]
      }
    ]'::jsonb,
    '2018-01-01',
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-4000-8000-000000000003',
    '00000000-0000-4000-8000-000000000001',
    'サンプルワーク 2',
    'sample-work-2',
    '[
      {
        "_type": "block",
        "_key": "block3",
        "style": "normal",
        "children": [
          {
            "_type": "span",
            "_key": "span3",
            "text": "Next.js と Supabase を用いたサンプル個人サイトおよびブログの構成例です。",
            "marks": ["strong"]
          }
        ]
      },
      {
        "_type": "block",
        "_key": "block4",
        "style": "normal",
        "children": [
          {
            "_type": "span",
            "_key": "span4",
            "text": "複数アプリの統合や、類似記事検索機能の実装例を示しています。",
            "marks": []
          }
        ]
      }
    ]'::jsonb,
    '2025-01-01',
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-4000-8000-000000000008',
    '00000000-0000-4000-8000-000000000001',
    'サンプルワーク 3',
    'sample-work-3',
    '[
      {
        "_type": "block",
        "_key": "block5",
        "style": "normal",
        "children": [
          {
            "_type": "span",
            "_key": "span5",
            "text": "サンプルの非営利開発グループで運営する Web サービスの開発・運用例です。",
            "marks": []
          }
        ]
      },
      {
        "_type": "block",
        "_key": "block6",
        "style": "normal",
        "children": [
          {
            "_type": "span",
            "_key": "span6",
            "text": "モダンなアーキテクチャを採用した移行例を示しています。",
            "marks": []
          }
        ]
      }
    ]'::jsonb,
    '2019-06-01',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample posts with versions (expanded Japanese content for realistic development/testing)
-- Spread across multiple years (2023-2025) and months to easily verify year archives (/blog/YYYY),
-- adjacent year navigation, monthly grouping, tag pages, pagination, feeds, and list rendering.
-- Old sample posts are cleaned up first so that previous seed data does not interfere.
DELETE FROM posts WHERE id IN (
  '00000000-0000-4000-8000-000000000004',
  '00000000-0000-4000-8000-000000000005'
) OR slug LIKE 'sample-post-%';

INSERT INTO posts (
  id,
  profile_id,
  title,
  slug,
  excerpt,
  status,
  published_at,
  tags,
  created_at,
  updated_at
) VALUES
  (
    '00000000-0000-4000-8000-000000000040',
    '00000000-0000-4000-8000-000000000001',
    'Supabase RLS を活用した安全なブログ CMS 構築',
    'supabase-rls-best-practices',
    '公開コンテンツと下書き・管理機能のアクセスを RLS で厳密に分離した方法と、実際に運用して得た教訓をまとめます。',
    'published',
    '2023-04-05T10:00:00Z',
    ARRAY['supabase', 'security', 'rls', 'database'],
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-4000-8000-000000000041',
    '00000000-0000-4000-8000-000000000001',
    'Mastodon の国際化とオープンソース貢献',
    'mastodon-japanese-i18n',
    'Mastodon のような分散型 SNS における日本語対応（i18n）と、オープンソースプロジェクトへの貢献のポイントを解説します。',
    'published',
    '2023-09-18T14:30:00Z',
    ARRAY['mastodon', 'i18n', 'open-source'],
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-4000-8000-000000000042',
    '00000000-0000-4000-8000-000000000001',
    'Next.js App Router 移行で得た知見',
    'nextjs-app-router-migration-lessons',
    'Pages Router から App Router へ移行した際に直面した問題と、その解決策・設計判断を解説します。',
    'published',
    '2024-01-22T09:15:00Z',
    ARRAY['nextjs', 'react', 'vercel', 'migration'],
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-4000-8000-000000000043',
    '00000000-0000-4000-8000-000000000001',
    'React 19 と Server Components の実践',
    'react-19-server-components',
    'React 19 の新機能と RSC を実際のブログ・管理画面でどう活かしているか、具体例を交えて紹介します。',
    'published',
    '2024-03-10T16:45:00Z',
    ARRAY['react', 'nextjs', 'performance'],
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-4000-8000-000000000044',
    '00000000-0000-4000-8000-000000000001',
    'pgvector と embeddings で実現する類似記事検索',
    'supabase-pgvector-embeddings-similar-posts',
    'OpenAI の埋め込みと Supabase の pgvector を組み合わせ、ブログ記事の「似ている記事」機能をどのように実装したかを解説します。',
    'published',
    '2024-07-15T11:20:00Z',
    ARRAY['supabase', 'ai', 'embeddings', 'postgres', 'nextjs'],
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-4000-8000-000000000045',
    '00000000-0000-4000-8000-000000000001',
    'TypeScript 型システムの厳密な活用術',
    'typescript-strict-types',
    'strict モードや branded types、テンプレートリテラル型などを駆使した、堅牢なコードベースの作り方を共有します。',
    'published',
    '2024-11-02T08:00:00Z',
    ARRAY['typescript', 'web', 'best-practices'],
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-4000-8000-000000000046',
    '00000000-0000-4000-8000-000000000001',
    'Vercel Microfrontends による複数アプリ統合',
    'vercel-microfrontends-composition',
    'portfolio と blog を同一ドメインでホストするための Microfrontends 構成と、ローカル開発時のプロキシ戦略について。',
    'published',
    '2025-02-14T13:10:00Z',
    ARRAY['vercel', 'nextjs', 'microfrontends', 'deployment'],
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-4000-8000-000000000047',
    '00000000-0000-4000-8000-000000000001',
    'Go で画像変換プロキシを作る',
    'go-image-proxy-sample',
    'パフォーマンスとシンプルさを重視して Go で実装する画像リサイズ・変換プロキシの設計と運用パターンを解説します。',
    'published',
    '2025-04-28T19:55:00Z',
    ARRAY['go', 'performance', 'images', 'open-source'],
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-4000-8000-000000000048',
    '00000000-0000-4000-8000-000000000001',
    'Next.js + Supabase で作る管理画面',
    'building-admin-with-nextjs-supabase',
    'Next.js と Supabase を用いた管理画面での認証、画像アップロード、バージョン管理の実装パターンを解説します。',
    'published',
    '2025-05-20T10:30:00Z',
    ARRAY['nextjs', 'supabase', 'admin', 'cms'],
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-4000-8000-000000000049',
    '00000000-0000-4000-8000-000000000001',
    'Ruby on Rails からモダンフロントエンドへの移行',
    'migrating-from-rails-to-nextjs',
    'Rails アプリを段階的に Next.js 中心の構成へ移行するパターンと、既存資産の扱い方について解説します。',
    'published',
    '2025-06-01T15:00:00Z',
    ARRAY['rails', 'ruby', 'nextjs', 'migration'],
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  profile_id = EXCLUDED.profile_id,
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  excerpt = EXCLUDED.excerpt,
  status = EXCLUDED.status,
  published_at = EXCLUDED.published_at,
  tags = EXCLUDED.tags,
  updated_at = NOW();

INSERT INTO post_versions (
  id,
  post_id,
  version_number,
  content,
  title,
  excerpt,
  tags,
  created_by,
  change_summary,
  version_date,
  created_at,
  updated_at
) VALUES
  (
    '00000000-0000-4000-8000-000000000140',
    '00000000-0000-4000-8000-000000000040',
    1,
    '[{"_type":"block","_key":"p40-1","style":"normal","children":[{"_type":"span","_key":"s40-1","text":"Supabase の RLS は、公開コンテンツの読み取りと、認証済みユーザーによる書き込みを明確に分離できます。","marks":[]}]},{"_type":"block","_key":"p40-2","style":"normal","children":[{"_type":"span","_key":"s40-2","text":"本記事では、公開記事に対するポリシー例と、service role を用いたバックグラウンド処理の境界について解説します。","marks":[]}]},{"_type":"block","_key":"p40-3","style":"normal","children":[{"_type":"span","_key":"s40-3","text":"また、RLS をバイパスしすぎないための運用上の工夫も紹介します。","marks":["strong"]}]},{"_type":"block","_key":"p40-4","style":"normal","children":[{"_type":"span","_key":"s40-4","text":"これにより、管理機能と公開部分の間で意図しないデータ漏洩を防げます。","marks":[]}]}]'::jsonb,
    'Supabase RLS を活用した安全なブログ CMS 構築',
    '公開コンテンツと下書き・管理機能のアクセスを RLS で厳密に分離した方法と、実際に運用して得た教訓をまとめます。',
    ARRAY['supabase', 'security', 'rls', 'database'],
    '00000000-0000-4000-8000-000000000001',
    'Initial version',
    '2023-04-05T10:00:00Z',
    '2023-04-05T10:00:00Z',
    '2023-04-05T10:00:00Z'
  ),
  (
    '00000000-0000-4000-8000-000000000141',
    '00000000-0000-4000-8000-000000000041',
    1,
    '[{"_type":"block","_key":"p41-1","style":"normal","children":[{"_type":"span","_key":"s41-1","text":"Mastodon の日本語対応では、UI 文字列の翻訳だけでなく、フィルタや通知などの挙動をローカライズする工夫が必要です。","marks":[]}]},{"_type":"block","_key":"h2-1","style":"h2","children":[{"_type":"span","_key":"hs41-1","text":"国際化の基本的なアプローチ","marks":[]}]},{"_type":"block","_key":"p41-2","style":"normal","children":[{"_type":"span","_key":"s41-2","text":"オープンソースプロジェクトにおける i18n のレビュー文化や、メンテナンスを継続するためのプラクティスについて解説します。","marks":[]}]},{"_type":"block","_key":"h3-1","style":"h3","children":[{"_type":"span","_key":"hs41-2","text":"継続的なメンテナンスの難しさ","marks":[]}]},{"_type":"block","_key":"p41-3","style":"normal","children":[{"_type":"span","_key":"s41-3","text":"こうしたプロジェクトへの貢献は、国際化対応のスキル向上に繋がります。","marks":[]}]}]'::jsonb,
    'Mastodon の国際化とオープンソース貢献',
    'Mastodon のような分散型 SNS における日本語対応（i18n）と、オープンソースプロジェクトへの貢献のポイントを解説します。',
    ARRAY['mastodon', 'i18n', 'open-source'],
    '00000000-0000-4000-8000-000000000001',
    'Initial version',
    '2023-09-18T14:30:00Z',
    '2023-09-18T14:30:00Z',
    '2023-09-18T14:30:00Z'
  ),
  (
    '00000000-0000-4000-8000-000000000142',
    '00000000-0000-4000-8000-000000000042',
    1,
    '[{"_type":"block","_key":"p42-1","style":"normal","children":[{"_type":"span","_key":"s42-1","text":"App Router への移行では、データフェッチングのモデルが大きく変わり、layout の設計が重要になります。","marks":[]}]},{"_type":"block","_key":"p42-2","style":"normal","children":[{"_type":"span","_key":"s42-2","text":"Streaming と Suspense を組み合わせることで、初期ロードのパフォーマンスを改善するパターンを紹介します。","marks":["strong"]}]},{"_type":"block","_key":"p42-3","style":"normal","children":[{"_type":"span","_key":"s42-3","text":"Parallel Routes や Intercepting Routes の使いどころについても解説します。","marks":[]}]},{"_type":"block","_key":"p42-4","style":"normal","children":[{"_type":"span","_key":"s42-4","text":"これらの機能により、開発体験と SEO の両面でメリットが得られます。","marks":[]}]}]'::jsonb,
    'Next.js App Router 移行のポイント',
    'Pages Router から App Router へ移行する際のデータフェッチングや layout 設計の変化と、よくある解決策について解説します。',
    ARRAY['nextjs', 'react', 'vercel', 'migration'],
    '00000000-0000-4000-8000-000000000001',
    'Initial version',
    '2024-01-22T09:15:00Z',
    '2024-01-22T09:15:00Z',
    '2024-01-22T09:15:00Z'
  ),
  (
    '00000000-0000-4000-8000-000000000143',
    '00000000-0000-4000-8000-000000000043',
    1,
    '[{"_type":"block","_key":"p43-1","style":"normal","children":[{"_type":"span","_key":"s43-1","text":"React 19 では use フックやフォームアクションが追加され、データ取得と更新の記述がシンプルになりました。","marks":[]}]},{"_type":"block","_key":"p43-2","style":"normal","children":[{"_type":"span","_key":"s43-2","text":"Server Components を活用することで、クライアントバンドルサイズを削減し、初期表示を高速化できます。","marks":[]}]},{"_type":"block","_key":"p43-3","style":"normal","children":[{"_type":"span","_key":"s43-3","text":"実際のコンポーネント構成例や、キャッシュ戦略との組み合わせ方を解説します。","marks":[]}]}]'::jsonb,
    'React 19 と Server Components の活用',
    'React 19 の新機能と Server Components を活用したパフォーマンス改善と、具体的な実装例を解説します。',
    ARRAY['react', 'nextjs', 'performance'],
    '00000000-0000-4000-8000-000000000001',
    'Initial version',
    '2024-03-10T16:45:00Z',
    '2024-03-10T16:45:00Z',
    '2024-03-10T16:45:00Z'
  ),
  (
    '00000000-0000-4000-8000-000000000144',
    '00000000-0000-4000-8000-000000000044',
    1,
    '[{"_type":"block","_key":"p44-1","style":"normal","children":[{"_type":"span","_key":"s44-1","text":"pgvector 拡張と OpenAI text-embedding-3-small を利用し、テキストからベクトルを生成して保存します。","marks":[]}]},{"_type":"block","_key":"p44-2","style":"normal","children":[{"_type":"span","_key":"s44-2","text":"類似度検索は RPC 関数経由で呼び出し、上位 N 件を取得して表示するパターンを紹介します。","marks":[]}]},{"_type":"block","_key":"p44-3","style":"normal","children":[{"_type":"span","_key":"s44-3","text":"埋め込みの再生成タイミングや、staleness 検知の仕組みが実装のポイントになります。","marks":["strong"]}]},{"_type":"block","_key":"p44-4","style":"normal","children":[{"_type":"span","_key":"s44-4","text":"これにより、タグに頼らないコンテンツ発見機能を実現できます。","marks":[]}]}]'::jsonb,
    'pgvector と embeddings を用いた類似記事検索',
    'OpenAI の埋め込みと Supabase の pgvector を組み合わせ、記事の類似度検索機能を実装する方法を解説します。',
    ARRAY['supabase', 'ai', 'embeddings', 'postgres', 'nextjs'],
    '00000000-0000-4000-8000-000000000001',
    'Initial version',
    '2024-07-15T11:20:00Z',
    '2024-07-15T11:20:00Z',
    '2024-07-15T11:20:00Z'
  ),
  (
    '00000000-0000-4000-8000-000000000145',
    '00000000-0000-4000-8000-000000000045',
    1,
    '[{"_type":"block","_key":"p45-1","style":"normal","children":[{"_type":"span","_key":"s45-1","text":"TypeScript の strict 設定を徹底すると、実行時エラーの多くをコンパイル時に捕捉できます。","marks":[]}]},{"_type":"block","_key":"h2-1","style":"h2","children":[{"_type":"span","_key":"hs45-1","text":"branded types と satisfies の活用","marks":[]}]},{"_type":"block","_key":"p45-2","style":"normal","children":[{"_type":"span","_key":"s45-2","text":"本記事では branded type や satisfies、テンプレートリテラル型を活用した実例を紹介します。","marks":[]}]},{"_type":"block","_key":"h3-1","style":"h3","children":[{"_type":"span","_key":"hs45-2","text":"Zod との組み合わせ","marks":[]}]},{"_type":"block","_key":"p45-3","style":"normal","children":[{"_type":"span","_key":"s45-3","text":"また、Zod との組み合わせでスキーマ駆動開発を進める方法についても触れます。","marks":[]}]}]'::jsonb,
    'TypeScript 型システムの厳密な活用術',
    'strict モードや branded types、テンプレートリテラル型などを駆使した、堅牢なコードベースの作り方を共有します。',
    ARRAY['typescript', 'web', 'best-practices'],
    '00000000-0000-4000-8000-000000000001',
    'Initial version',
    '2024-11-02T08:00:00Z',
    '2024-11-02T08:00:00Z',
    '2024-11-02T08:00:00Z'
  ),
  (
    '00000000-0000-4000-8000-000000000146',
    '00000000-0000-4000-8000-000000000046',
    1,
    '[{"_type":"block","_key":"p46-1","style":"normal","children":[{"_type":"span","_key":"s46-1","text":"Vercel Microfrontends により、ルートアプリと /blog を別リポジトリ・別デプロイで運用しつつ同一オリジンで提供する例です。","marks":[]}]},{"_type":"block","_key":"p46-2","style":"normal","children":[{"_type":"span","_key":"s46-2","text":"ローカルでは microfrontends プロキシを使い、開発体験を損なわずに統合環境を再現します。","marks":[]}]},{"_type":"block","_key":"p46-3","style":"normal","children":[{"_type":"span","_key":"s46-3","text":"本記事では構成ファイルや next.config のポイント、revalidate 連携の流れを解説します。","marks":[]}]}]'::jsonb,
    'Vercel Microfrontends による複数アプリ統合',
    '複数の Next.js アプリを同一ドメインでホストするための Microfrontends 構成例と、ローカル開発時のプロキシ戦略について解説します。',
    ARRAY['vercel', 'nextjs', 'microfrontends', 'deployment'],
    '00000000-0000-4000-8000-000000000001',
    'Initial version',
    '2025-02-14T13:10:00Z',
    '2025-02-14T13:10:00Z',
    '2025-02-14T13:10:00Z'
  ),
  (
    '00000000-0000-4000-8000-000000000147',
    '00000000-0000-4000-8000-000000000047',
    1,
    '[{"_type":"block","_key":"p47-1","style":"normal","children":[{"_type":"span","_key":"s47-1","text":"Go で画像変換プロキシを実装する場合、Ruby 実装からの移行ではストリーミングとキャッシュの扱いが鍵になります。","marks":[]}]},{"_type":"block","_key":"p47-2","style":"normal","children":[{"_type":"span","_key":"s47-2","text":"リクエストごとに変換せず、キャッシュとストリーミングを組み合わせることで低レイテンシを実現できます。","marks":[]}]},{"_type":"block","_key":"p47-3","style":"normal","children":[{"_type":"span","_key":"s47-3","text":"OSS として公開する際の複数プロジェクトでの再利用性と、開発時の Dockerfile やリリースフローの工夫について解説します。","marks":["strong"]}]},{"_type":"block","_key":"p47-4","style":"normal","children":[{"_type":"span","_key":"s47-4","text":"こうしたプロキシの実装パターンは画像配信の最適化に広く応用できます。","marks":[]}]}]'::jsonb,
    'Go で画像変換プロキシを作る',
    'パフォーマンスとシンプルさを重視して Go で実装する画像リサイズ・変換プロキシの設計と運用パターンを解説します。',
    ARRAY['go', 'performance', 'images', 'open-source'],
    '00000000-0000-4000-8000-000000000001',
    'Initial version',
    '2025-04-28T19:55:00Z',
    '2025-04-28T19:55:00Z',
    '2025-04-28T19:55:00Z'
  ),
  (
    '00000000-0000-4000-8000-000000000148',
    '00000000-0000-4000-8000-000000000048',
    1,
    '[{"_type":"block","_key":"p48-1","style":"normal","children":[{"_type":"span","_key":"s48-1","text":"Next.js App Router + shadcn/ui + Lexical エディタを用いた管理画面の構成例です。","marks":[]}]},{"_type":"block","_key":"h2-1","style":"h2","children":[{"_type":"span","_key":"hs48-1","text":"認証と画像アップロードの実装","marks":[]}]},{"_type":"block","_key":"p48-2","style":"normal","children":[{"_type":"span","_key":"s48-2","text":"Supabase の Storage を使った画像アップロードや、バージョン管理機能はすべて関数経由で実行し、RLS を尊重するパターンを紹介します。","marks":[]}]},{"_type":"block","_key":"h3-1","style":"h3","children":[{"_type":"span","_key":"hs48-2","text":"AI 機能との連携","marks":[]}]},{"_type":"block","_key":"p48-3","style":"normal","children":[{"_type":"span","_key":"s48-3","text":"AI によるスラッグ・タグ生成や、cron による embeddings 更新の連携についても解説します。","marks":[]}]}]'::jsonb,
    'Next.js + Supabase で作る管理画面',
    'Next.js と Supabase を用いた管理画面での認証、画像アップロード、バージョン管理の実装パターンを解説します。',
    ARRAY['nextjs', 'supabase', 'admin', 'cms'],
    '00000000-0000-4000-8000-000000000001',
    'Initial version',
    '2025-05-20T10:30:00Z',
    '2025-05-20T10:30:00Z',
    '2025-05-20T10:30:00Z'
  ),
  (
    '00000000-0000-4000-8000-000000000149',
    '00000000-0000-4000-8000-000000000049',
    1,
    '[{"_type":"block","_key":"p49-1","style":"normal","children":[{"_type":"span","_key":"s49-1","text":"Rails で運用していたサービスを、フロントエンドを Next.js に寄せつつ段階的に移行するケースを想定します。","marks":[]}]},{"_type":"block","_key":"p49-2","style":"normal","children":[{"_type":"span","_key":"s49-2","text":"API 互換を保ちつつ、認証や一部ドメインロジックは Rails に残し、徐々に境界を整理するアプローチがあります。","marks":[]}]},{"_type":"block","_key":"p49-3","style":"normal","children":[{"_type":"span","_key":"s49-3","text":"モノレポ構成を活用した段階的移行の例を紹介します。","marks":["strong"]}]},{"_type":"block","_key":"p49-4","style":"normal","children":[{"_type":"span","_key":"s49-4","text":"移行の判断基準や、技術選定の背景についても解説します。","marks":[]}]}]'::jsonb,
    'Ruby on Rails からモダンフロントエンドへの移行',
    'Rails アプリを段階的に Next.js 中心の構成へ移行するパターンと、既存資産の扱い方について解説します。',
    ARRAY['rails', 'ruby', 'nextjs', 'migration'],
    '00000000-0000-4000-8000-000000000001',
    'Initial version',
    '2025-06-01T15:00:00Z',
    '2025-06-01T15:00:00Z',
    '2025-06-01T15:00:00Z'
  )
ON CONFLICT (id) DO NOTHING;

-- Additional post_versions for posts that have history (履歴あり).
-- These simulate updates after initial publish (different version_date, change_summary, and in some cases added headings).
INSERT INTO post_versions (
  id,
  post_id,
  version_number,
  content,
  title,
  excerpt,
  tags,
  created_by,
  change_summary,
  version_date,
  created_at,
  updated_at
) VALUES
  -- 040: Supabase RLS (見出しあり + 履歴あり) - v2 adds headings
  (
    '00000000-0000-4000-8000-000000000150',
    '00000000-0000-4000-8000-000000000040',
    2,
    '[{"_type":"block","_key":"p40-1","style":"normal","children":[{"_type":"span","_key":"s40-1","text":"Supabase の RLS は、公開コンテンツの読み取りと、認証済みユーザーによる書き込みを明確に分離できます。","marks":[]}]},{"_type":"block","_key":"h2-1","style":"h2","children":[{"_type":"span","_key":"hs40-1","text":"公開記事に対する RLS ポリシー例","marks":[]}]},{"_type":"block","_key":"p40-2","style":"normal","children":[{"_type":"span","_key":"s40-2","text":"本記事では、公開記事に対するポリシー例と、service role を用いたバックグラウンド処理の境界について解説します。","marks":[]}]},{"_type":"block","_key":"h3-1","style":"h3","children":[{"_type":"span","_key":"hs40-2","text":"service role の境界と工夫","marks":[]}]},{"_type":"block","_key":"p40-3","style":"normal","children":[{"_type":"span","_key":"s40-3","text":"また、RLS をバイパスしすぎないための運用上の工夫も紹介します。","marks":["strong"]}]},{"_type":"block","_key":"p40-4","style":"normal","children":[{"_type":"span","_key":"s40-4","text":"これにより、管理機能と公開部分の間で意図しないデータ漏洩を防げます。","marks":[]}]}]'::jsonb,
    'Supabase RLS を活用した安全なブログ CMS 構築',
    '公開コンテンツと下書き・管理機能のアクセスを RLS で厳密に分離した方法と、実際に運用して得た教訓をまとめます。',
    ARRAY['supabase', 'security', 'rls', 'database'],
    '00000000-0000-4000-8000-000000000001',
    'Added headings for better structure',
    '2023-04-07T10:00:00Z',
    '2023-04-07T10:00:00Z',
    '2023-04-07T10:00:00Z'
  ),
  -- 042: Next.js App Router (見出しなし + 履歴あり) - v2 is minor update
  (
    '00000000-0000-4000-8000-000000000152',
    '00000000-0000-4000-8000-000000000042',
    2,
    '[{"_type":"block","_key":"p42-1","style":"normal","children":[{"_type":"span","_key":"s42-1","text":"App Router への移行では、データフェッチングのモデルが大きく変わり、layout の設計が重要になります。","marks":[]}]},{"_type":"block","_key":"p42-2","style":"normal","children":[{"_type":"span","_key":"s42-2","text":"Streaming と Suspense を組み合わせることで、初期ロードのパフォーマンスを改善するパターンを紹介します。","marks":[]}]},{"_type":"block","_key":"p42-3","style":"normal","children":[{"_type":"span","_key":"s42-3","text":"Parallel Routes や Intercepting Routes の使いどころについても解説します。","marks":[]}]},{"_type":"block","_key":"p42-4","style":"normal","children":[{"_type":"span","_key":"s42-4","text":"これらの機能により、開発体験と SEO の両面でメリットが得られます。","marks":[]}]}]'::jsonb,
    'Next.js App Router 移行のポイント',
    'Pages Router から App Router へ移行する際のデータフェッチングや layout 設計の変化と、よくある解決策について解説します。',
    ARRAY['nextjs', 'react', 'vercel', 'migration'],
    '00000000-0000-4000-8000-000000000001',
    'Minor wording update for clarity',
    '2024-01-25T09:00:00Z',
    '2024-01-25T09:00:00Z',
    '2024-01-25T09:00:00Z'
  ),
  -- 044: pgvector (見出しあり + 履歴あり) - v2 adds headings
  (
    '00000000-0000-4000-8000-000000000154',
    '00000000-0000-4000-8000-000000000044',
    2,
    '[{"_type":"block","_key":"p44-1","style":"normal","children":[{"_type":"span","_key":"s44-1","text":"pgvector 拡張と OpenAI text-embedding-3-small を利用し、テキストからベクトルを生成して保存します。","marks":[]}]},{"_type":"block","_key":"h2-1","style":"h2","children":[{"_type":"span","_key":"hs44-1","text":"ベクトル生成と保存の流れ","marks":[]}]},{"_type":"block","_key":"p44-2","style":"normal","children":[{"_type":"span","_key":"s44-2","text":"類似度検索は RPC 関数経由で呼び出し、上位 N 件を取得して表示するパターンを紹介します。","marks":[]}]},{"_type":"block","_key":"h3-1","style":"h3","children":[{"_type":"span","_key":"hs44-2","text":"staleness 検知と運用ポイント","marks":[]}]},{"_type":"block","_key":"p44-3","style":"normal","children":[{"_type":"span","_key":"s44-3","text":"埋め込みの再生成タイミングや、staleness 検知の仕組みが実装のポイントになります。","marks":["strong"]}]},{"_type":"block","_key":"p44-4","style":"normal","children":[{"_type":"span","_key":"s44-4","text":"これにより、タグに頼らないコンテンツ発見機能を実現できます。","marks":[]}]}]'::jsonb,
    'pgvector と embeddings を用いた類似記事検索',
    'OpenAI の埋め込みと Supabase の pgvector を組み合わせ、記事の類似度検索機能を実装する方法を解説します。',
    ARRAY['supabase', 'ai', 'embeddings', 'postgres', 'nextjs'],
    '00000000-0000-4000-8000-000000000001',
    'Added headings for better structure',
    '2024-07-18T11:00:00Z',
    '2024-07-18T11:00:00Z',
    '2024-07-18T11:00:00Z'
  ),
  -- 046: Vercel Microfrontends (見出しなし + 履歴あり) - v2 minor update
  (
    '00000000-0000-4000-8000-000000000156',
    '00000000-0000-4000-8000-000000000046',
    2,
    '[{"_type":"block","_key":"p46-1","style":"normal","children":[{"_type":"span","_key":"s46-1","text":"Vercel Microfrontends により、ルートアプリと /blog を別リポジトリ・別デプロイで運用しつつ同一オリジンで提供する例です。","marks":[]}]},{"_type":"block","_key":"p46-2","style":"normal","children":[{"_type":"span","_key":"s46-2","text":"ローカルでは microfrontends プロキシを使い、開発体験を損なわずに統合環境を再現します。","marks":[]}]},{"_type":"block","_key":"p46-3","style":"normal","children":[{"_type":"span","_key":"s46-3","text":"本記事では構成ファイルや next.config のポイント、revalidate 連携の流れを解説します。","marks":[]}]}]'::jsonb,
    'Vercel Microfrontends による複数アプリ統合',
    '複数の Next.js アプリを同一ドメインでホストするための Microfrontends 構成例と、ローカル開発時のプロキシ戦略について解説します。',
    ARRAY['vercel', 'nextjs', 'microfrontends', 'deployment'],
    '00000000-0000-4000-8000-000000000001',
    'Minor wording update for clarity',
    '2025-02-17T13:00:00Z',
    '2025-02-17T13:00:00Z',
    '2025-02-17T13:00:00Z'
  )
ON CONFLICT (id) DO NOTHING;

UPDATE posts
SET current_version_id = CASE id
  WHEN '00000000-0000-4000-8000-000000000040' THEN '00000000-0000-4000-8000-000000000150'
  WHEN '00000000-0000-4000-8000-000000000041' THEN '00000000-0000-4000-8000-000000000141'
  WHEN '00000000-0000-4000-8000-000000000042' THEN '00000000-0000-4000-8000-000000000152'
  WHEN '00000000-0000-4000-8000-000000000043' THEN '00000000-0000-4000-8000-000000000143'
  WHEN '00000000-0000-4000-8000-000000000044' THEN '00000000-0000-4000-8000-000000000154'
  WHEN '00000000-0000-4000-8000-000000000045' THEN '00000000-0000-4000-8000-000000000145'
  WHEN '00000000-0000-4000-8000-000000000046' THEN '00000000-0000-4000-8000-000000000156'
  WHEN '00000000-0000-4000-8000-000000000047' THEN '00000000-0000-4000-8000-000000000147'
  WHEN '00000000-0000-4000-8000-000000000048' THEN '00000000-0000-4000-8000-000000000148'
  WHEN '00000000-0000-4000-8000-000000000049' THEN '00000000-0000-4000-8000-000000000149'
  ELSE current_version_id
END
WHERE id IN (
  '00000000-0000-4000-8000-000000000040',
  '00000000-0000-4000-8000-000000000041',
  '00000000-0000-4000-8000-000000000042',
  '00000000-0000-4000-8000-000000000043',
  '00000000-0000-4000-8000-000000000044',
  '00000000-0000-4000-8000-000000000045',
  '00000000-0000-4000-8000-000000000046',
  '00000000-0000-4000-8000-000000000047',
  '00000000-0000-4000-8000-000000000048',
  '00000000-0000-4000-8000-000000000049'
);

-- Insert sample memos (Japanese for consistency, but clearly test data)
-- Using the original sample paths for backward compatibility in test flows.
-- Content and titles are obviously synthetic test memos.
DELETE FROM memos WHERE path IN ('sample-memo', 'work/sample-note');

INSERT INTO memos (
  id,
  profile_id,
  path,
  visibility,
  published_at,
  created_at,
  updated_at
) VALUES
  (
    '00000000-0000-4000-8000-000000000006',
    '00000000-0000-4000-8000-000000000001',
    'sample-memo',
    'public',
    NOW(),
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-4000-8000-000000000007',
    '00000000-0000-4000-8000-000000000001',
    'work/sample-note',
    'private',
    NULL,
    NOW(),
    NOW()
  )
ON CONFLICT (path) DO UPDATE SET
  visibility = EXCLUDED.visibility,
  published_at = EXCLUDED.published_at,
  updated_at = NOW();

INSERT INTO memo_versions (
  id,
  memo_id,
  title,
  content,
  created_at
) VALUES
  (
    '00000000-0000-4000-8000-000000000106',
    (SELECT id FROM memos WHERE path = 'sample-memo'),
    'サンプル公開メモ',
    '[{"_type":"block","_key":"memo1-block","style":"normal","children":[{"_type":"span","_key":"memo1-span","text":"これはテスト用の公開メモです。日本語のサンプルコンテンツで、メモアプリの表示・公開 visibility の確認に使います。","marks":[]}]}]'::jsonb,
    NOW()
  ),
  (
    '00000000-0000-4000-8000-000000000107',
    (SELECT id FROM memos WHERE path = 'work/sample-note'),
    'サンプル作業メモ',
    '[{"_type":"block","_key":"memo2-block","style":"normal","children":[{"_type":"span","_key":"memo2-span","text":"これはテスト用の非公開メモです。プライベートな作業ノートとして、ログイン時のみ表示されることを確認するためのサンプルです。","marks":[]}]}]'::jsonb,
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

UPDATE memos
SET current_version_id = CASE path
  WHEN 'sample-memo' THEN '00000000-0000-4000-8000-000000000106'
  WHEN 'work/sample-note' THEN '00000000-0000-4000-8000-000000000107'
  ELSE current_version_id
END
WHERE path IN ('sample-memo', 'work/sample-note');
