import { draftMode } from 'next/headers'
import DraftModeBannerClient from './draft-mode-banner-client'

export default async function DraftModeBanner() {
  const { isEnabled } = await draftMode()
  return <DraftModeBannerClient isDraftMode={isEnabled} />
}
