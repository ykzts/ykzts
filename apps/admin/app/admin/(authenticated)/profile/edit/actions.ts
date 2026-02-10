'use server'

import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function updateProfile(
  _prevState: { error: string } | null,
  formData: FormData
) {
  const name = formData.get('name') as string
  const tagline = formData.get('tagline') as string
  const email = formData.get('email') as string
  const about = formData.get('about') as string

  // Validation
  if (!name || name.trim() === '') {
    return {
      error: '名前は必須項目です。'
    }
  }

  if (email && email.trim() !== '') {
    // Server-side email validation (HTML5 validation is also applied on the client)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return {
        error: 'メールアドレスの形式が正しくありません。'
      }
    }
  }

  try {
    const supabase = await createClient()

    // Get current profile to check if it exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .maybeSingle()

    const profileData = {
      about: about && about.trim() !== '' ? about : null,
      email: email && email.trim() !== '' ? email : null,
      name: name.trim(),
      tagline: tagline && tagline.trim() !== '' ? tagline : null
    }

    let profileId: string

    if (existingProfile) {
      // Update existing profile
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', existingProfile.id)

      if (error) {
        return {
          error: `プロフィールの保存に失敗しました: ${error.message}`
        }
      }
      profileId = existingProfile.id
    } else {
      // Insert new profile
      const { data: newProfile, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select('id')
        .single()

      if (error) {
        return {
          error: `プロフィールの保存に失敗しました: ${error.message}`
        }
      }
      profileId = newProfile.id
    }

    // Handle social links
    const socialLinksCountStr = formData.get('social_links_count') as string
    const socialLinksCount = Number.parseInt(socialLinksCountStr, 10)

    if (Number.isNaN(socialLinksCount) || socialLinksCount < 0) {
      return {
        error: 'ソーシャルリンクの件数が不正です。'
      }
    }

    const socialLinksToKeep = new Set<string>()

    for (let i = 0; i < socialLinksCount; i++) {
      const id = formData.get(`social_link_id_${i}`) as string
      const service = formData.get(`social_link_service_${i}`) as string
      const url = formData.get(`social_link_url_${i}`) as string

      // Skip empty entries
      if (!url || url.trim() === '') continue

      const linkData = {
        profile_id: profileId,
        service: service && service.trim() !== '' ? service.trim() : null,
        sort_order: i,
        url: url.trim()
      }

      if (id) {
        // Update existing
        socialLinksToKeep.add(id)
        const { error } = await supabase
          .from('social_links')
          .update(linkData)
          .eq('id', id)

        if (error) {
          return {
            error: `ソーシャルリンクの更新に失敗しました: ${error.message}`
          }
        }
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('social_links')
          .insert(linkData)
          .select('id')
          .single()

        if (error) {
          return {
            error: `ソーシャルリンクの追加に失敗しました: ${error.message}`
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
        const { error } = await supabase
          .from('social_links')
          .delete()
          .in('id', idsToDelete)

        if (error) {
          return {
            error: `ソーシャルリンクの削除に失敗しました: ${error.message}`
          }
        }
      }
    }

    // Handle technologies
    const technologiesCountStr = formData.get('technologies_count') as string
    const technologiesCount = Number.parseInt(technologiesCountStr, 10)

    if (Number.isNaN(technologiesCount) || technologiesCount < 0) {
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

      const techData = {
        name: techName.trim(),
        profile_id: profileId,
        sort_order: i
      }

      if (id) {
        // Update existing
        technologiesToKeep.add(id)
        const { error } = await supabase
          .from('technologies')
          .update(techData)
          .eq('id', id)

        if (error) {
          return {
            error: `技術タグの更新に失敗しました: ${error.message}`
          }
        }
      } else {
        // Insert new
        const { data, error } = await supabase
          .from('technologies')
          .insert(techData)
          .select('id')
          .single()

        if (error) {
          return {
            error: `技術タグの追加に失敗しました: ${error.message}`
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
        const { error } = await supabase
          .from('technologies')
          .delete()
          .in('id', idsToDelete)

        if (error) {
          return {
            error: `技術タグの削除に失敗しました: ${error.message}`
          }
        }
      }
    }

    // Invalidate cache
    revalidateTag('profile', 'max')
  } catch (error) {
    return {
      error: `エラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`
    }
  }

  // Redirect to profile page
  redirect('/admin/profile')
}
