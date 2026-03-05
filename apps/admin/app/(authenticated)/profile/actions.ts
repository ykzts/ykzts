'use server'

import { extractFediverseHandleFromURL } from '@ykzts/fediverse'
import type { Json } from '@ykzts/supabase'
import { revalidateTag } from 'next/cache'
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
  occupation: z.string().optional(),
  tagline: z.string().optional(),
  timezone: z
    .string()
    .min(1, 'タイムゾーンは必須項目です。')
    .refine(
      (tz) => {
        try {
          return Intl.supportedValuesOf('timeZone').includes(tz)
        } catch {
          return false
        }
      },
      { message: '無効なタイムゾーン識別子です。' }
    )
})

const socialLinkSchema = z.object({
  id: z.uuid(),
  url: z.url('URLの形式が正しくありません。')
})

const technologySchema = z.object({
  id: z.string().nullable().optional(),
  name: z.string().min(1)
})

export async function updateProfile(
  _prevState: { error: string } | { success: true } | null,
  formData: FormData
): Promise<{ error: string } | { success: true } | null> {
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
      occupation: formData.get('occupation') ?? undefined,
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

    const { name, occupation, tagline, email, about, timezone } =
      profileValidation.data

    const supabase = await createClient()

    // Get or create profile for current user
    const { data: existingProfile, error: profileFetchError } = await supabase
      .from('profiles')
      .select('id, fediverse_creator')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profileFetchError) {
      return {
        error: `プロフィールの取得に失敗しました: ${profileFetchError.message}`
      }
    }

    // Fetch existing social links (id + url) for change detection
    let existingSocialLinks = new Map<string, string>()
    if (existingProfile) {
      const { data: existingLinks, error: existingLinksError } = await supabase
        .from('social_links')
        .select('id, url')
        .eq('profile_id', existingProfile.id)
      if (existingLinksError) {
        return {
          error: `ソーシャルリンクの取得に失敗しました: ${existingLinksError.message}`
        }
      }
      existingSocialLinks = new Map(
        (existingLinks ?? []).map((l) => [l.id, (l.url ?? '').trim()])
      )
    }

    // Parse and validate social_links_count early before any loops
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

    // Determine fediverse_creator from social links
    let normalizedFediverseCreator: string | null = null

    if (socialLinksCount > 0) {
      // Determine whether social links have changed (new, deleted, or URL-updated)
      let hasNewLinks = false
      let hasUpdatedLinks = false
      const submittedLinkIds = new Set<string>()
      for (let i = 0; i < socialLinksCount; i++) {
        const id = formData.get(`social_link_id_${i}`) as string
        const url = formData.get(`social_link_url_${i}`) as string
        if (!url || url.trim() === '') continue
        if (id) {
          submittedLinkIds.add(id)
          const previousUrl = existingSocialLinks.get(id)
          if (previousUrl !== url.trim()) {
            hasUpdatedLinks = true
          }
        } else {
          hasNewLinks = true
        }
      }
      const hasDeletedLinks = [...existingSocialLinks.keys()].some(
        (id) => !submittedLinkIds.has(id)
      )

      if (
        !hasNewLinks &&
        !hasDeletedLinks &&
        !hasUpdatedLinks &&
        existingProfile
      ) {
        // Social links unchanged - reuse existing fediverse_creator without WebFinger
        normalizedFediverseCreator = existingProfile.fediverse_creator
      } else {
        // Links changed - run WebFinger in parallel to re-determine fediverse_creator
        const candidateUrls: string[] = []
        for (let i = 0; i < socialLinksCount; i++) {
          const url = formData.get(`social_link_url_${i}`) as string
          if (!url || url.trim() === '') continue
          candidateUrls.push(url.trim())
        }
        const extractedHandles = await Promise.all(
          candidateUrls.map((candidateUrl) =>
            extractFediverseHandleFromURL(candidateUrl)
          )
        )
        normalizedFediverseCreator =
          extractedHandles.find((value): value is string => value !== null) ??
          null
      }
    }

    // Handle about field (JSONB)
    let aboutValue: Json | null = null
    if (about && about.trim() !== '') {
      try {
        // Try to parse as JSON and store the parsed object
        aboutValue = JSON.parse(about.trim()) as Json
      } catch {
        // If it's not valid JSON, treat it as plain text and wrap in simple Portable Text structure
        aboutValue = [
          {
            _type: 'block',
            children: [{ _type: 'span', text: about.trim() }],
            markDefs: [],
            style: 'normal'
          }
        ] as Json
      }
    }

    const profileData = {
      about: aboutValue,
      email: email && email.trim() !== '' ? email.trim() : null,
      fediverse_creator: normalizedFediverseCreator,
      name: name.trim(),
      occupation:
        occupation && occupation.trim() !== '' ? occupation.trim() : null,
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
    const { data: currentSocialLinks } = await supabase
      .from('social_links')
      .select('id')
      .eq('profile_id', profileId)

    if (currentSocialLinks) {
      const idsToDelete = currentSocialLinks
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
      const id = formData.get(`technology_id_${i}`) as string | null
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

      if (id) {
        // Update existing technology
        technologiesToKeep.add(id)

        const { error: nameUpdateError } = await supabase
          .from('technologies')
          .update({ name: techName.trim() })
          .eq('id', id)

        if (nameUpdateError) {
          return {
            error: `技術タグの更新に失敗しました: ${nameUpdateError.message}`
          }
        }

        const { error: ptUpdateError } = await supabase
          .from('profile_technologies')
          .update({ sort_order: i })
          .eq('profile_id', profileId)
          .eq('technology_id', id)

        if (ptUpdateError) {
          return {
            error: `技術タグの更新に失敗しました: ${ptUpdateError.message}`
          }
        }
      } else {
        // Insert new technology
        const { data: newTech, error: techInsertError } = await supabase
          .from('technologies')
          .insert({ name: techName.trim(), profile_id: profileId })
          .select('id')
          .single()

        if (techInsertError) {
          return {
            error: `技術タグの追加に失敗しました: ${techInsertError.message}`
          }
        }

        const { error: ptInsertError } = await supabase
          .from('profile_technologies')
          .insert({
            profile_id: profileId,
            sort_order: i,
            technology_id: newTech.id
          })

        if (ptInsertError) {
          return {
            error: `技術タグの追加に失敗しました: ${ptInsertError.message}`
          }
        }

        technologiesToKeep.add(newTech.id)
      }
    }

    // Delete removed technologies
    const { data: existingProfileTechs } = await supabase
      .from('profile_technologies')
      .select('technology_id')
      .eq('profile_id', profileId)

    if (existingProfileTechs) {
      const idsToDelete = existingProfileTechs
        .map((pt) => pt.technology_id)
        .filter((id) => !technologiesToKeep.has(id))

      if (idsToDelete.length > 0) {
        const { error: ptDeleteError } = await supabase
          .from('profile_technologies')
          .delete()
          .eq('profile_id', profileId)
          .in('technology_id', idsToDelete)

        if (ptDeleteError) {
          return {
            error: `技術タグの削除に失敗しました: ${ptDeleteError.message}`
          }
        }

        const { data: remainingPTs } = await supabase
          .from('profile_technologies')
          .select('technology_id')
          .in('technology_id', idsToDelete)

        const technologyIdsWithLinks = new Set(
          (remainingPTs ?? []).map((pt) => pt.technology_id)
        )
        const orphanedTechIds = idsToDelete.filter(
          (id) => !technologyIdsWithLinks.has(id)
        )

        if (orphanedTechIds.length > 0) {
          const { error: techDeleteError } = await supabase
            .from('technologies')
            .delete()
            .in('id', orphanedTechIds)

          if (techDeleteError) {
            return {
              error: `技術タグの削除に失敗しました: ${techDeleteError.message}`
            }
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

  return { success: true }
}
