# Profile Setup Guide

This guide explains how to set up the profile information in Sanity Studio for the ykzts.com portfolio website.

## Prerequisites

- Access to the Sanity Studio (running at http://localhost:10000 in development)
- Environment variables configured for Sanity project

## Profile Schema Fields

The profile schema includes the following fields:

### Required Fields

- **Name**: Full name in English (e.g., "Yamagishi Kazutoshi")
- **Email**: Contact email address (e.g., "ykzts@desire.sh")

### Optional Fields (Recommended)

- **Name (Japanese)**: Full name in Japanese (e.g., "山岸和利")
- **Tagline**: Professional tagline or subtitle in English
- **Tagline (Japanese)**: Professional tagline in Japanese (e.g., "ソフトウェア開発者")
- **Bio**: Full biography or introduction text in English
- **Bio (Japanese)**: Full biography in Japanese (e.g., professional introduction and contact policies)
- **Social Links**: Array of social media accounts and links

### Social Links Structure

Each social link includes:
- **Platform** (required): Platform name (e.g., "GitHub", "X", "Mastodon", "Facebook", "Threads")
- **URL** (required): Full HTTPS URL to the profile
- **Label**: Accessibility label in English
- **Label (Japanese)**: Accessibility label in Japanese (e.g., "山岸和利のGitHubアカウント")

## Setting Up Your Profile

1. **Start Sanity Studio**:
   ```bash
   cd apps/studio
   pnpm dev
   ```

2. **Navigate to the Studio**: Open http://localhost:10000 in your browser

3. **Create a Profile Document**:
   - Click on "Profile" in the sidebar
   - Click "Create new document"
   - Fill in the required fields (Name and Email)
   - Add optional fields as needed

4. **Add Social Links**:
   - Scroll to the "Social Links" section
   - Click "Add item" for each social media account
   - Fill in Platform, URL, and labels
   - Supported platforms: GitHub, X, Mastodon, Threads, Facebook

5. **Publish**: Click the "Publish" button to make your profile live

## Example Profile Data

Here's an example of a complete profile document:

```json
{
  "name": "Yamagishi Kazutoshi",
  "nameJa": "山岸和利",
  "email": "ykzts@desire.sh",
  "tagline": "Software Developer",
  "taglineJa": "ソフトウェア開発者",
  "bio": "Full-stack developer specializing in web applications...",
  "bioJa": "山岸和利に対するお問い合わせやご依頼はメールからお願いします...",
  "socialLinks": [
    {
      "platform": "GitHub",
      "url": "https://github.com/ykzts",
      "label": "GitHub Account",
      "labelJa": "山岸和利のGitHubアカウント"
    },
    {
      "platform": "X",
      "url": "https://x.com/ykzts",
      "label": "X Account",
      "labelJa": "山岸和利のXアカウント"
    }
  ]
}
```

## Important Notes

- **Only the first profile document is used**: If multiple profile documents exist, the system will automatically use the one created first (ordered by `_createdAt`)
- **Fallback behavior**: If no profile document exists or Sanity is unavailable, the website will use hardcoded fallback values
- **Japanese content**: The portfolio website primarily uses Japanese fields (nameJa, taglineJa, bioJa) for display
- **Bio formatting**: The Japanese bio field supports paragraph breaks using double newlines (`\n\n`)

## Where Profile Data Appears

The profile data is used in the following locations:

1. **Homepage** (`/`):
   - Hero section: Name (Japanese) and tagline
   - Footer: Copyright name
   - Page metadata: Description and title

2. **Contact Section**:
   - Biography paragraphs
   - Email address
   - Social media links with icons

3. **OpenGraph Image** (`opengraph-image.tsx`):
   - Name and email displayed in social share previews

## Deployment

After setting up your profile in Sanity Studio:

1. The changes are saved to the Sanity cloud immediately
2. The Next.js application will fetch the new data on the next page load
3. No code changes or redeployment are needed to update profile information

## Troubleshooting

- **Profile not appearing**: Check that the profile document is published (not in draft state)
- **Old data still showing**: The website uses CDN caching; changes may take a few minutes to appear
- **Missing fields**: Only Name and Email are required; all other fields will gracefully fall back to default values if not provided
