import { defineArrayMember, defineField, defineType } from 'sanity'

export default defineType({
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required().min(1).max(256)
    }),
    defineField({
      name: 'nameJa',
      title: 'Name (Japanese)',
      type: 'string',
      validation: (Rule) => Rule.max(256)
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'text',
      validation: (Rule) => Rule.max(500)
    }),
    defineField({
      name: 'taglineJa',
      title: 'Tagline (Japanese)',
      type: 'text',
      validation: (Rule) => Rule.max(500)
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      validation: (Rule) => Rule.max(2000)
    }),
    defineField({
      name: 'bioJa',
      title: 'Bio (Japanese)',
      type: 'text',
      validation: (Rule) => Rule.max(2000)
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
              type: 'string'
            }),
            defineField({
              name: 'labelJa',
              title: 'Label (Japanese)',
              type: 'string'
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
    prepare({ name, email }) {
      return {
        subtitle: email,
        title: name
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
