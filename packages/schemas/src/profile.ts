import { defineArrayMember, defineField, defineType } from 'sanity'

export default defineType({
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'localeString',
      validation: (Rule) =>
        Rule.required().custom(
          (value: { en?: string; ja?: string } | undefined) => {
            if (!value?.en) {
              return 'English name is required'
            }
            if (value.en.length > 256) {
              return 'Name must be 256 characters or less'
            }
            if (value.ja && value.ja.length > 256) {
              return 'Japanese name must be 256 characters or less'
            }
            return true
          }
        )
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'localeText',
      validation: (Rule) =>
        Rule.custom((value: { en?: string; ja?: string } | undefined) => {
          if (value?.en && value.en.length > 500) {
            return 'Tagline must be 500 characters or less'
          }
          if (value?.ja && value.ja.length > 500) {
            return 'Japanese tagline must be 500 characters or less'
          }
          return true
        })
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'localeText',
      validation: (Rule) =>
        Rule.custom((value: { en?: string; ja?: string } | undefined) => {
          if (value?.en && value.en.length > 2000) {
            return 'Bio must be 2000 characters or less'
          }
          if (value?.ja && value.ja.length > 2000) {
            return 'Japanese bio must be 2000 characters or less'
          }
          return true
        })
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'email',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'socialLinks',
      of: [
        defineArrayMember({
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
              validation: (Rule) => Rule.required()
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (Rule) => Rule.required().uri({ scheme: ['https'] })
            }),
            defineField({
              name: 'label',
              title: 'Label',
              type: 'localeString'
            })
          ],
          name: 'socialLink',
          preview: {
            prepare({ platform, url }) {
              return {
                subtitle: url,
                title: platform
              }
            },
            select: {
              platform: 'platform',
              url: 'url'
            }
          },
          title: 'Social Link',
          type: 'object'
        })
      ],
      title: 'Social Links',
      type: 'array'
    })
  ],
  name: 'profile',
  preview: {
    prepare({
      name,
      email
    }: {
      name?: { en?: string; ja?: string }
      email?: string
    }) {
      return {
        subtitle: email,
        title: name?.en || name?.ja || 'Untitled'
      }
    },
    select: {
      email: 'email',
      name: 'name'
    }
  },
  title: 'Profile',
  type: 'document'
})
