'use server'

import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'
import type { Json } from '@ykzts/supabase'
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
  fediverse_creator: z.string().optional().or(z.literal('')),
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
  id: z.uuid(),
  name: z.string().min(1)
})

function parseFediverseCreator(value: string): {
  normalized: string
  acct: string
  domain: string
} | null {
  const trimmed = value.trim()
  const match = trimmed.match(/^@?([^@\s]+)@([^@\s]+)$/)

  if (!match) {
    return null
  }

  const username = match[1]
  const domain = match[2].toLowerCase()

  if (!isValidPublicHostname(domain)) {
    return null
  }

  const acct = `${username}@${domain}`

  return {
    acct,
    domain,
    normalized: `@${acct}`
  }
}

function isValidPublicHostname(domain: string): boolean {
  if (domain.length > 253 || domain === 'localhost') {
    return false
  }

  if (!domain.includes('.')) {
    return false
  }

  return /^[a-z0-9.-]+$/i.test(domain)
}

function isPrivateIPv4(address: string): boolean {
  const octets = address.split('.').map((segment) => Number(segment))

  if (octets.length !== 4 || octets.some((octet) => Number.isNaN(octet))) {
    return true
  }

  if (octets[0] === 10) {
    return true
  }

  if (octets[0] === 127) {
    return true
  }

  if (octets[0] === 169 && octets[1] === 254) {
    return true
  }

  if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) {
    return true
  }

  if (octets[0] === 192 && octets[1] === 168) {
    return true
  }

  if (address === '169.254.169.254') {
    return true
  }

  return false
}

function isPrivateIPv6(address: string): boolean {
  const normalized = address.toLowerCase()

  if (normalized === '::1') {
    return true
  }

  if (normalized.startsWith('fc') || normalized.startsWith('fd')) {
    return true
  }

  if (
    normalized.startsWith('fe8') ||
    normalized.startsWith('fe9') ||
    normalized.startsWith('fea') ||
    normalized.startsWith('feb')
  ) {
    return true
  }

  if (normalized.startsWith('::ffff:')) {
    const mappedAddress = normalized.replace('::ffff:', '')
    return isPrivateIPv4(mappedAddress)
  }

  return false
}

function isPublicIpAddress(address: string): boolean {
  const ipVersion = isIP(address)

  if (ipVersion === 4) {
    return !isPrivateIPv4(address)
  }

  if (ipVersion === 6) {
    return !isPrivateIPv6(address)
  }

  return false
}

async function isSafeWebFingerDomain(domain: string): Promise<boolean> {
  try {
    const resolvedAddresses = await lookup(domain, {
      all: true,
      verbatim: true
    })

    if (resolvedAddresses.length === 0) {
      return false
    }

    return resolvedAddresses.every((entry) => isPublicIpAddress(entry.address))
  } catch {
    return false
  }
}

async function verifyFediverseCreatorWithWebFinger(
  acct: string,
  domain: string
): Promise<boolean> {
  try {
    const isSafeDomain = await isSafeWebFingerDomain(domain)

    if (!isSafeDomain) {
      return false
    }

    const webfingerUrl = new URL(`https://${domain}/.well-known/webfinger`)
    webfingerUrl.searchParams.set('resource', `acct:${acct}`)

    const response = await fetch(webfingerUrl.toString(), {
      headers: {
        Accept: 'application/jrd+json, application/json'
      },
      signal: AbortSignal.timeout(5000)
    })

    if (!response.ok) {
      return false
    }

    const data = (await response.json()) as unknown

    if (!data || typeof data !== 'object') {
      return false
    }

    const subjectValue =
      'subject' in data && typeof data.subject === 'string'
        ? data.subject
        : undefined

    const aliasesValue =
      'aliases' in data && Array.isArray(data.aliases)
        ? data.aliases.filter(
            (alias): alias is string => typeof alias === 'string'
          )
        : []

    const expectedSubject = `acct:${acct}`.toLowerCase()
    const subject = subjectValue?.toLowerCase()
    if (subject === expectedSubject) {
      return true
    }

    return aliasesValue.some((alias) => alias.toLowerCase() === expectedSubject)
  } catch {
    return false
  }
}

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
      fediverse_creator: formData.get('fediverse_creator') ?? '',
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

    const {
      name,
      occupation,
      tagline,
      email,
      fediverse_creator,
      about,
      timezone
    } = profileValidation.data

    let normalizedFediverseCreator: string | null = null
    if (fediverse_creator && fediverse_creator.trim() !== '') {
      const parsedFediverseCreator = parseFediverseCreator(fediverse_creator)

      if (!parsedFediverseCreator) {
        return {
          error:
            'fediverse:creator は @user@example.com または user@example.com 形式で入力してください。'
        }
      }

      const isValidFediverseCreator = await verifyFediverseCreatorWithWebFinger(
        parsedFediverseCreator.acct,
        parsedFediverseCreator.domain
      )

      if (!isValidFediverseCreator) {
        return {
          error:
            'fediverse:creator の検証に失敗しました。.well-known/webfinger で確認できるアカウントを指定してください。'
        }
      }

      normalizedFediverseCreator = parsedFediverseCreator.normalized
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
