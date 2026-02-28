'use client'

export async function getImageDimensions(
  file: File
): Promise<{ height: number; width: number }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      resolve({ height: img.height, width: img.width })
      URL.revokeObjectURL(objectUrl)
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Failed to load image for dimension extraction'))
    }
    img.src = objectUrl
  })
}
