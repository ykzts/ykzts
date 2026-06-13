"use client";

import { createBrowserClient } from "@ykzts/supabase/client";
import {
  MIME_TO_EXT,
  validateImageFile,
} from "@ykzts/supabase/image-validation";

export interface ImageUploadOptions {
  file: File;
  onProgress?: (progress: number) => void;
}

export interface ImageUploadResult {
  error?: string;
  height?: number;
  url?: string;
  width?: number;
}

export async function uploadImage({
  file,
  onProgress,
}: ImageUploadOptions): Promise<ImageUploadResult> {
  try {
    const validationError = validateImageFile(file);
    if (validationError) {
      return validationError;
    }

    const supabase = createBrowserClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        error: "ユーザー情報の取得に失敗しました。ログインしてください。",
      };
    }

    // Derive extension from MIME type for consistency
    const fileExt = MIME_TO_EXT[file.type];

    // Generate unique filename with user ID prefix
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    // Report initial progress
    if (onProgress) {
      onProgress(0);
    }

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return {
        error: `アップロードに失敗しました: ${uploadError.message}`,
      };
    }

    // Report completion
    if (onProgress) {
      onProgress(100);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(filePath);

    const dimensions = await getImageDimensions(file).catch(
      (dimensionError) => {
        console.warn("Failed to read image dimensions:", dimensionError);
        return;
      }
    );

    return {
      height: dimensions?.height,
      url: publicUrl,
      width: dimensions?.width,
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "アップロード中にエラーが発生しました。",
    };
  }
}

export function getImageDimensions(
  file: File
): Promise<{ height: number; width: number }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ height: img.height, width: img.width });
      URL.revokeObjectURL(objectUrl);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image for dimension extraction"));
    };
    img.src = objectUrl;
  });
}
