import { visionTool } from '@sanity/vision'
import * as schemaTypes from '@ykzts/schemas'
import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'

if (
  !process.env.NEXT_PUBLIC_SANITY_DATASET ||
  !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
) {
  throw new TypeError('missing environment variables for sanity.')
}

export default defineConfig({
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  plugins: [deskTool(), visionTool()],
  schema: {
    types: Object.values(schemaTypes)
  }
})
