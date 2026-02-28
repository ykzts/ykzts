'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth'
import { invalidateCaches } from '@/lib/revalidate'
import { createClient } from '@/lib/supabase/server'

const keyVisualSchema = z.object({
  alt_text: z.string().optional(),
  artist_name: z.string().optional(),
  artist_url: z
    .url('アーティストURLの形式が正しくありません。')
    .optional()
    .or(z.literal('')),
  attribution: z.string().optional(),
  height: z.number().int().positive('高さは正の整数である必要があります。'),
  url: z.url('キービジュアルURLの形式が正しくありません。'),
  width: z.number().int().positive('幅は正の整数である必要があります。')
})

export async function saveKeyVisual(
  _prevState: { error: string } | null,
  formData: FormData
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { error: 'ログインが必要です。' }
    }

    const keyVisualUrl = formData.get('key_visual_url') as string | null
    if (!keyVisualUrl || keyVisualUrl.trim() === '') {
      return { error: 'キービジュアル画像をアップロードしてください。' }
    }

    const keyVisualWidthStr = formData.get('key_visual_width') as string
    const keyVisualHeightStr = formData.get('key_visual_height') as string

    const rawData = {
      alt_text: (formData.get('key_visual_alt_text') as string) || undefined,
      artist_name:
        (formData.get('key_visual_artist_name') as string) || undefined,
      artist_url:
        (formData.get('key_visual_artist_url') as string) || undefined,
      attribution:
        (formData.get('key_visual_attribution') as string) || undefined,
      height: Number.parseInt(keyVisualHeightStr, 10),
      url: keyVisualUrl.trim(),
      width: Number.parseInt(keyVisualWidthStr, 10)
    }

    const validation = keyVisualSchema.safeParse(rawData)
    if (!validation.success) {
      return { error: validation.error.issues[0].message }
    }

    const {
      url,
      width,
      height,
      alt_text,
      artist_name,
      artist_url,
      attribution
    } = validation.data

    const keyVisualData = {
      alt_text: alt_text?.trim() || null,
      artist_name: artist_name?.trim() || null,
      artist_url: artist_url?.trim() || null,
      attribution: attribution?.trim() || null,
      height,
      url,
      width
    }

    const supabase = await createClient()

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, key_visual_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profileError) {
      return {
        error: `プロフィールの取得に失敗しました: ${profileError.message}`
      }
    }

    if (!profile) {
      return { error: 'プロフィールが見つかりません。' }
    }

    if (profile.key_visual_id) {
      // Update existing key_visual record
      const { error: updateError } = await supabase
        .from('key_visuals')
        .update(keyVisualData)
        .eq('id', profile.key_visual_id)

      if (updateError) {
        return {
          error: `キービジュアルの更新に失敗しました: ${updateError.message}`
        }
      }
    } else {
      // Insert new key_visual record and link to profile
      const { data: newKeyVisual, error: insertError } = await supabase
        .from('key_visuals')
        .insert(keyVisualData)
        .select('id')
        .single()

      if (insertError) {
        return {
          error: `キービジュアルの保存に失敗しました: ${insertError.message}`
        }
      }

      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({ key_visual_id: newKeyVisual.id })
        .eq('id', profile.id)

      if (profileUpdateError) {
        return {
          error: `プロフィールの更新に失敗しました: ${profileUpdateError.message}`
        }
      }
    }

    await invalidateCaches('profile')
    revalidatePath('/profile')
    revalidatePath('/key-visual')
  } catch (error) {
    return {
      error: `エラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`
    }
  }

  redirect('/key-visual')
}
