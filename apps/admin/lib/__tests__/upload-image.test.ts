import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getImageDimensions } from '../upload-image'

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn()
}))

describe('getImageDimensions', () => {
  let createObjectURLSpy: ReturnType<typeof vi.spyOn>
  let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    createObjectURLSpy = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:http://localhost/test-object-url')
    revokeObjectURLSpy = vi
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('resolves with width and height when image loads', async () => {
    vi.stubGlobal(
      'Image',
      class {
        onload: (() => void) | null = null
        onerror: (() => void) | null = null
        width = 1920
        height = 1080
        set src(_: string) {
          this.onload?.()
        }
      }
    )

    const file = new File(['dummy'], 'test.jpg', { type: 'image/jpeg' })
    const result = await getImageDimensions(file)

    expect(result).toEqual({ height: 1080, width: 1920 })
    expect(createObjectURLSpy).toHaveBeenCalledWith(file)
    expect(revokeObjectURLSpy).toHaveBeenCalledWith(
      'blob:http://localhost/test-object-url'
    )
  })

  it('rejects with error when image fails to load', async () => {
    vi.stubGlobal(
      'Image',
      class {
        onload: (() => void) | null = null
        onerror: (() => void) | null = null
        set src(_: string) {
          this.onerror?.()
        }
      }
    )

    const file = new File(['dummy'], 'bad.jpg', { type: 'image/jpeg' })

    await expect(getImageDimensions(file)).rejects.toThrow(
      'Failed to load image for dimension extraction'
    )
    expect(revokeObjectURLSpy).toHaveBeenCalledWith(
      'blob:http://localhost/test-object-url'
    )
  })
})
