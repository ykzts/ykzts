'use client'

import { visionTool } from '@sanity/vision'
import {
  localeString,
  localeText,
  post as postSchema,
  profile as profileSchema,
  work as workSchema
} from '@ykzts/schemas'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

if (
  !process.env.NEXT_PUBLIC_SANITY_DATASET ||
  !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
) {
  throw new TypeError('missing environment variables for sanity.')
}

export default defineConfig({
  basePath: '/',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  plugins: [
    structureTool(),
    visionTool({
      defaultDataset: 'production'
    })
  ],
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  schema: {
    types: [localeString, localeText, postSchema, profileSchema, workSchema]
  }
})
