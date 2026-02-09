-- Supabase Seed Data: Sample data for development and testing
-- This file provides example data for the portfolio tables

-- Insert profile data for test user
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
  'Test User',
  'This is a test profile tagline for development and testing purposes.',
  '[
    {
      "_type": "block",
      "_key": "about1",
      "style": "normal",
      "children": [
        {
          "_type": "span",
          "_key": "span1",
          "text": "This is a test profile about section. It contains sample Portable Text content for development and testing purposes.",
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
          "text": "You can see "
        },
        {
          "_type": "span",
          "_key": "span3",
          "text": "formatted text with links",
          "marks": ["link"]
        },
        {
          "_type": "span",
          "_key": "span4",
          "text": " in this sample content.",
          "marks": []
        }
      ],
      "markDefs": [
        {
          "_type": "link",
          "_key": "link1",
          "href": "https://example.com/test"
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

-- Insert social links for test user
INSERT INTO social_links (id, profile_id, url, sort_order, created_at, updated_at) VALUES
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'https://www.facebook.com/testuser', 1, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'https://github.com/testuser', 2, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'https://test.example/@testuser', 3, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', 'https://www.threads.net/@testuser', 4, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000001', 'https://x.com/testuser', 5, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  url = EXCLUDED.url,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- Insert technologies for test user
INSERT INTO technologies (id, profile_id, name, sort_order, created_at, updated_at) VALUES
  ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000001', 'Test Tech 1', 1, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000001', 'Test Tech 2', 2, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000001', 'Test Tech 3', 3, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000001', 'Test Tech 4', 4, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000025', '00000000-0000-0000-0000-000000000001', 'Test Tech 5', 5, NOW(), NOW())
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
