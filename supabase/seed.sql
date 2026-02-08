-- Supabase Seed Data: Sample data for development and testing
-- This file provides example data for the portfolio tables

-- Insert profile data for ykzts
INSERT INTO profiles (
  id,
  name,
  tagline,
  about,
  email,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '山岸和利',
  'JavaScriptやRubyを用いたウェブアプリケーション開発を得意とするソフトウェア開発者です。ReactやRuby on Railsに造詣が深く、バックエンドからフロントエンドまで幅広く担当しています。',
  '[
    {
      "_type": "block",
      "_key": "about1",
      "style": "normal",
      "children": [
        {
          "_type": "span",
          "_key": "span1",
          "text": "山岸和利はJavaScript (TypeScript) やRubyを用いたウェブアプリケーションの開発を得意とするソフトウェア開発者です。ReactやRuby on Railsに造詣が深く、バックエンドからフロントエンドまで幅広く担当しながら多くのウェブアプリケーションの開発を行っています。ウェブ関連の技術を中心とした学習を意欲的にしています。",
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
          "text": "またJavaScriptやRubyのほかにもGoやPerl、Pythonなどほかのプログラミング言語も扱えてプログラミング言語を問わず様々なソフトウェア開発を行っています。",
          "marks": []
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
          "_key": "span3",
          "text": "さらにAmazon Web Services (AWS) やGoogle Cloudといったクラウドサービスを利用したインフラストラクチャーの構築に関しても一定の知見を有していて、ウェブアプリケーションやウェブサービスの開発に関わる多くの領域の作業ができるという自負があります。",
          "marks": []
        }
      ]
    },
    {
      "_type": "block",
      "_key": "about4",
      "style": "normal",
      "children": [
        {
          "_type": "span",
          "_key": "span4",
          "text": "詳しくは",
          "marks": []
        },
        {
          "_type": "span",
          "_key": "span5",
          "text": "山岸和利のGitHubアカウント",
          "marks": ["link"]
        },
        {
          "_type": "span",
          "_key": "span6",
          "text": "も併せてご参照ください。",
          "marks": []
        }
      ],
      "markDefs": [
        {
          "_type": "link",
          "_key": "link1",
          "href": "https://github.com/ykzts"
        }
      ]
    }
  ]'::jsonb,
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  about = EXCLUDED.about,
  email = EXCLUDED.email,
  updated_at = NOW();

-- Insert social links for ykzts
INSERT INTO social_links (id, profile_id, url, sort_order, created_at, updated_at) VALUES
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'https://www.facebook.com/ykzts', 1, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'https://github.com/ykzts', 2, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'https://ykzts.technology/@ykzts', 3, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', 'https://www.threads.net/@ykzts', 4, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000001', 'https://x.com/ykzts', 5, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  url = EXCLUDED.url,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- Insert technologies for ykzts
INSERT INTO technologies (id, profile_id, name, sort_order, created_at, updated_at) VALUES
  ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000001', 'TypeScript', 1, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000001', 'JavaScript', 2, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000001', 'React', 3, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000001', 'Next.js', 4, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000025', '00000000-0000-0000-0000-000000000001', 'Ruby', 5, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000026', '00000000-0000-0000-0000-000000000001', 'Ruby on Rails', 6, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000027', '00000000-0000-0000-0000-000000000001', 'Go', 7, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000028', '00000000-0000-0000-0000-000000000001', 'Python', 8, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000029', '00000000-0000-0000-0000-000000000001', 'AWS', 9, NOW(), NOW()),
  ('00000000-0000-0000-0000-00000000002a', '00000000-0000-0000-0000-000000000001', 'Google Cloud', 10, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- Insert sample works with Portable Text content
INSERT INTO works (id, title, slug, content, starts_at, created_at, updated_at) VALUES
  (
    '00000000-0000-0000-0000-000000000002',
    'Sample Work 1',
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
            "text": "This is a sample work entry demonstrating Portable Text format compatibility.",
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
            "text": "The content is stored as JSONB and can be rendered with @portabletext/react.",
            "marks": []
          }
        ]
      }
    ]'::jsonb,
    '2024-01-01',
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'Sample Work 2',
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
            "text": "Another example work entry with rich text content.",
            "marks": ["strong"]
          }
        ]
      }
    ]'::jsonb,
    '2024-02-01',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample posts
INSERT INTO posts (id, title, created_at, updated_at) VALUES
  ('00000000-0000-0000-0000-000000000004', 'Sample Post 1', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000005', 'Sample Post 2', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
