-- Supabase Seed Data: Sample data for development and testing
-- This file provides example data for the portfolio tables

-- Insert profile data for ykzts
INSERT INTO profiles (
  id,
  name,
  name_en,
  name_ja,
  tagline_en,
  tagline_ja,
  email,
  social_links,
  technologies,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '山岸和利',
  'Yamagishi Kazutoshi',
  '山岸和利',
  'Software Developer',
  'JavaScriptやRubyを用いたウェブアプリケーション開発を得意とするソフトウェア開発者です。ReactやRuby on Railsに造詣が深く、バックエンドからフロントエンドまで幅広く担当しています。',
  NULL,
  '[
    {
      "label": "山岸和利のFacebookアカウント",
      "url": "https://www.facebook.com/ykzts",
      "icon": "facebook"
    },
    {
      "label": "山岸和利のGitHubアカウント",
      "url": "https://github.com/ykzts",
      "icon": "github"
    },
    {
      "label": "山岸和利のMastodonアカウント",
      "url": "https://ykzts.technology/@ykzts",
      "icon": "mastodon"
    },
    {
      "label": "山岸和利のThreadsアカウント",
      "url": "https://www.threads.net/@ykzts",
      "icon": "threads"
    },
    {
      "label": "山岸和利のXアカウント",
      "url": "https://x.com/ykzts",
      "icon": "x"
    }
  ]'::jsonb,
  '["TypeScript", "JavaScript", "React", "Next.js", "Ruby", "Ruby on Rails", "Go", "Python", "AWS", "Google Cloud"]'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_en = EXCLUDED.name_en,
  name_ja = EXCLUDED.name_ja,
  tagline_en = EXCLUDED.tagline_en,
  tagline_ja = EXCLUDED.tagline_ja,
  email = EXCLUDED.email,
  social_links = EXCLUDED.social_links,
  technologies = EXCLUDED.technologies,
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
