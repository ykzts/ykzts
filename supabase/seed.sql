-- Supabase Seed Data: Sample data for development and testing
-- This file provides example data for the portfolio tables

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
  '00000000-0000-0000-0000-000000000001',
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
  '{"name": "Test User"}',
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
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  jsonb_build_object('sub', '00000000-0000-0000-0000-000000000001', 'email', 'test@example.com'),
  'email',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (provider_id, provider) DO UPDATE SET
  identity_data = EXCLUDED.identity_data,
  updated_at = NOW();

-- Insert profile data for test user
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
  '00000000-0000-0000-0000-000000000001',
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
  'Software Developer',
  'testuser@example.com',
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

-- Insert social links for test user
INSERT INTO social_links (id, profile_id, url, service, sort_order, created_at, updated_at) VALUES
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'https://www.facebook.com/testuser', 'facebook', 1, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'https://github.com/testuser', 'github', 2, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'https://mastodon.social/@testuser', 'mastodon', 3, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', 'https://www.threads.net/@testuser', 'threads', 4, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000001', 'https://x.com/testuser', 'x', 5, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  url = EXCLUDED.url,
  service = EXCLUDED.service,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- Insert technologies for test user
INSERT INTO technologies (id, name, created_at, updated_at) VALUES
  ('00000000-0000-0000-0000-000000000021', 'Test Tech 1', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000022', 'Test Tech 2', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000023', 'Test Tech 3', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000024', 'Test Tech 4', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000025', 'Test Tech 5', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

-- Insert profile_technologies for test user (links profile to technologies)
INSERT INTO profile_technologies (id, profile_id, technology_id, sort_order, created_at, updated_at) VALUES
  ('00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000021', 1, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000032', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000022', 2, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000033', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000023', 3, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000034', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000024', 4, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000035', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000025', 5, NOW(), NOW())
ON CONFLICT (profile_id, technology_id) DO UPDATE SET
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- Insert sample works with Portable Text content
INSERT INTO works (id, profile_id, title, slug, content, starts_at, created_at, updated_at) VALUES
  (
    '00000000-0000-0000-0000-000000000002',    '00000000-0000-0000-0000-000000000001',    'Sample Work 1',
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
    '00000000-0000-0000-0000-000000000001',
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

-- Insert sample posts with versions
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
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'Sample Post 1',
    'sample-post-1',
    'Sample post 1 excerpt.',
    'published',
    NOW(),
    ARRAY['sample', 'seed'],
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000001',
    'Sample Post 2',
    'sample-post-2',
    'Sample post 2 excerpt.',
    'published',
    NOW(),
    ARRAY['sample', 'seed'],
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
    '00000000-0000-0000-0000-000000000104',
    '00000000-0000-0000-0000-000000000004',
    1,
    '[{"_type":"block","_key":"post1-block","style":"normal","children":[{"_type":"span","_key":"post1-span","text":"Sample post 1 content.","marks":[]}]}]'::jsonb,
    'Sample Post 1',
    'Sample post 1 excerpt.',
    ARRAY['sample', 'seed'],
    '00000000-0000-0000-0000-000000000001',
    'Initial version',
    NOW(),
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000105',
    '00000000-0000-0000-0000-000000000005',
    1,
    '[{"_type":"block","_key":"post2-block","style":"normal","children":[{"_type":"span","_key":"post2-span","text":"Sample post 2 content.","marks":[]}]}]'::jsonb,
    'Sample Post 2',
    'Sample post 2 excerpt.',
    ARRAY['sample', 'seed'],
    '00000000-0000-0000-0000-000000000001',
    'Initial version',
    NOW(),
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

UPDATE posts
SET current_version_id = CASE id
  WHEN '00000000-0000-0000-0000-000000000004' THEN '00000000-0000-0000-0000-000000000104'
  WHEN '00000000-0000-0000-0000-000000000005' THEN '00000000-0000-0000-0000-000000000105'
  ELSE current_version_id
END
WHERE id IN (
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000005'
);

-- Insert sample memos
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
    '00000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000001',
    'sample-memo',
    'public',
    NOW(),
    NOW(),
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000001',
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
    '00000000-0000-0000-0000-000000000106',
    '00000000-0000-0000-0000-000000000006',
    'Sample Memo',
    '[{"_type":"block","_key":"memo1-block","style":"normal","children":[{"_type":"span","_key":"memo1-span","text":"This is a sample public memo.","marks":[]}]}]'::jsonb,
    NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000107',
    '00000000-0000-0000-0000-000000000007',
    'Work Note',
    '[{"_type":"block","_key":"memo2-block","style":"normal","children":[{"_type":"span","_key":"memo2-span","text":"This is a private work note.","marks":[]}]}]'::jsonb,
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

UPDATE memos
SET current_version_id = CASE id
  WHEN '00000000-0000-0000-0000-000000000006' THEN '00000000-0000-0000-0000-000000000106'
  WHEN '00000000-0000-0000-0000-000000000007' THEN '00000000-0000-0000-0000-000000000107'
  ELSE current_version_id
END
WHERE id IN (
  '00000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000007'
);
