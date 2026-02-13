'use server'

import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth'
import { invalidateCaches } from '@/lib/revalidate'
import { detectServiceFromURL } from '@/lib/social-service-detector'
import { createClient } from '@/lib/supabase/server'
import { DEFAULT_TIMEZONE } from '@/lib/timezones'

// Validation schemas
const profileSchema = z.object({
  about: z.string().optional(),
  email: z
    .email('メールアドレスの形式が正しくありません。')
    .optional()
    .or(z.literal('')),
  name: z.string().min(1, '名前は必須項目です。'),
  tagline: z.string().optional(),
  timezone: z.string().min(1, 'タイムゾーンは必須項目です。')
})

const socialLinkSchema = z.object({
  id: z.uuid(),
  url: z.url('URLの形式が正しくありません。')
})

const technologySchema = z.object({
  id: z.uuid(),
  name: z.string().min(1)
})

export async function updateProfile(
  _prevState: { error: string } | null,
  formData: FormData
) {
  try {
    // Get current user
    const user = await getCurrentUser()
    if (!user) {
      return {
        error: 'ログインが必要です。'
      }
    }

    // Extract and validate profile data
    const rawProfileData = {
      about: formData.get('about') ?? undefined,
      email: formData.get('email') ?? '',
      name: formData.get('name') ?? '',
      tagline: formData.get('tagline') ?? undefined,
      timezone: formData.get('timezone') ?? DEFAULT_TIMEZONE
    }

    const profileValidation = profileSchema.safeParse(rawProfileData)
    if (!profileValidation.success) {
      const firstError = profileValidation.error.issues[0]
      return {
        error: firstError.message
      }
    }

    const { name, tagline, email, about, timezone } = profileValidation.data

    // Handle about field (JSONB)
    let aboutValue: string | null = null
    if (about && about.trim() !== '') {
      try {
        // Try to parse as JSON
        JSON.parse(about.trim())
        aboutValue = about.trim()
      } catch {
        // If it's not valid JSON, treat it as plain text and wrap in simple Portable Text structure
        aboutValue = JSON.stringify([
          {
            _type: 'block',
            children: [{ _type: 'span', text: about.trim() }],
            markDefs: [],
            style: 'normal'
          }
        ])
      }
    }

    const supabase = await createClient()

    // Get or create profile for current user
    const { data: existingProfile, error: profileFetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profileFetchError) {
      return {
        error: `プロフィールの取得に失敗しました: ${profileFetchError.message}`
      }
    }

    const profileData = {
      about: aboutValue,
      email: email && email.trim() !== '' ? email.trim() : null,
      name: name.trim(),
      tagline: tagline && tagline.trim() !== '' ? tagline.trim() : null,
      timezone,
      user_id: user.id
    }

    let profileId: string

    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', existingProfile.id)

      if (updateError) {
        return {
          error: `プロフィールの保存に失敗しました: ${updateError.message}`
        }
      }
      profileId = existingProfile.id
    } else {
      // Insert new profile
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert(profileData)
        .select('id')
        .single()

      if (insertError) {
        return {
          error: `プロフィールの保存に失敗しました: ${insertError.message}`
        }
      }
      profileId = newProfile.id
    }

    // Handle social links
    const socialLinksCountStr = formData.get('social_links_count') as string
    const socialLinksCount = Number.parseInt(socialLinksCountStr, 10)

    if (
      Number.isNaN(socialLinksCount) ||
      socialLinksCount < 0 ||
      socialLinksCount > 50
    ) {
      return {
        error: 'ソーシャルリンクの件数が不正です。'
      }
    }

    const socialLinksToKeep = new Set<string>()

    for (let i = 0; i < socialLinksCount; i++) {
      const id = formData.get(`social_link_id_${i}`) as string
      const url = formData.get(`social_link_url_${i}`) as string

      // Skip empty entries
      if (!url || url.trim() === '') continue

      // Validate social link
      const linkValidation = socialLinkSchema.safeParse({ id, url: url.trim() })
      if (!linkValidation.success) {
        return {
          error: `ソーシャルリンク #${i + 1}: ${linkValidation.error.issues[0].message}`
        }
      }

      // Detect service from URL
      const service = await detectServiceFromURL(url.trim())

      const linkData = {
        profile_id: profileId,
        service,
        sort_order: i,
        url: url.trim()
      }

      if (id) {
        // Update existing
        socialLinksToKeep.add(id)
        const { error: updateError } = await supabase
          .from('social_links')
          .update(linkData)
          .eq('id', id)
          .eq('profile_id', profileId)

        if (updateError) {
          return {
            error: `ソーシャルリンクの更新に失敗しました: ${updateError.message}`
          }
        }
      } else {
        // Insert new
        const { data, error: insertError } = await supabase
          .from('social_links')
          .insert(linkData)
          .select('id')
          .single()

        if (insertError) {
          return {
            error: `ソーシャルリンクの追加に失敗しました: ${insertError.message}`
          }
        }
        if (data) socialLinksToKeep.add(data.id)
      }
    }

    // Delete removed social links
    const { data: existingSocialLinks } = await supabase
      .from('social_links')
      .select('id')
      .eq('profile_id', profileId)

    if (existingSocialLinks) {
      const idsToDelete = existingSocialLinks
        .map((link) => link.id)
        .filter((id) => !socialLinksToKeep.has(id))

      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('social_links')
          .delete()
          .in('id', idsToDelete)

        if (deleteError) {
          return {
            error: `ソーシャルリンクの削除に失敗しました: ${deleteError.message}`
          }
        }
      }
    }

    // Handle technologies
    const technologiesCountStr = formData.get('technologies_count') as string
    const technologiesCount = Number.parseInt(technologiesCountStr, 10)

    if (
      Number.isNaN(technologiesCount) ||
      technologiesCount < 0 ||
      technologiesCount > 50
    ) {
      return {
        error: '技術タグの件数が不正です。'
      }
    }

    const technologiesToKeep = new Set<string>()

    for (let i = 0; i < technologiesCount; i++) {
      const id = formData.get(`technology_id_${i}`) as string
      const techName = formData.get(`technology_name_${i}`) as string

      // Skip empty entries
      if (!techName || techName.trim() === '') continue

      // Validate technology
      const techValidation = technologySchema.safeParse({
        id,
        name: techName.trim()
      })
      if (!techValidation.success) {
        return {
          error: `技術タグ #${i + 1}: ${techValidation.error.issues[0].message}`
        }
      }

      const techData = {
        name: techName.trim(),
        profile_id: profileId,
        sort_order: i
      }

      if (id) {
        // Update existing
        technologiesToKeep.add(id)
        const { error: updateError } = await supabase
          .from('technologies')
          .update(techData)
          .eq('id', id)
          .eq('profile_id', profileId)

        if (updateError) {
          return {
            error: `技術タグの更新に失敗しました: ${updateError.message}`
          }
        }
      } else {
        // Insert new
        const { data, error: insertError } = await supabase
          .from('technologies')
          .insert(techData)
          .select('id')
          .single()

        if (insertError) {
          return {
            error: `技術タグの追加に失敗しました: ${insertError.message}`
          }
        }
        if (data) technologiesToKeep.add(data.id)
      }
    }

    // Delete removed technologies
    const { data: existingTechnologies } = await supabase
      .from('technologies')
      .select('id')
      .eq('profile_id', profileId)

    if (existingTechnologies) {
      const idsToDelete = existingTechnologies
        .map((tech) => tech.id)
        .filter((id) => !technologiesToKeep.has(id))

      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('technologies')
          .delete()
          .in('id', idsToDelete)

        if (deleteError) {
          return {
            error: `技術タグの削除に失敗しました: ${deleteError.message}`
          }
        }
      }
    }

    // Invalidate cache
    revalidateTag('profile', 'max')
    await invalidateCaches('profile')
  } catch (error) {
    return {
      error: `エラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`
    }
  }

  // Redirect to profile page
  redirect('/profile')
}
