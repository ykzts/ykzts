import { defineField, defineType } from 'sanity'

const supportedLanguages = [
  { id: 'en', title: 'English' },
  { id: 'ja', title: 'Japanese' }
]

export default defineType({
  fields: supportedLanguages.map((lang) =>
    defineField({
      name: lang.id,
      title: lang.title,
      type: 'string'
    })
  ),
  name: 'localeString',
  title: 'Localized string',
  type: 'object'
})
