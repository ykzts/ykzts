import { defineArrayMember, defineField, defineType } from 'sanity'

export default defineType({
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().min(1).max(256)
    }),
    defineField({
      name: 'content',
      of: [
        defineArrayMember({
          type: 'block'
        })
      ],
      title: 'Content',
      type: 'array',
      validation: (Rule) => Rule.required().min(1)
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'startsAt',
      title: 'Starts at',
      type: 'date',
      validation: (Rule) => Rule.required()
    })
  ],
  name: 'work',
  orderings: [
    {
      by: [
        {
          direction: 'desc',
          field: 'startsAt'
        }
      ],
      name: 'startsAt',
      title: 'Starts at, New'
    }
  ],
  preview: {
    select: {
      title: 'title'
    }
  },
  title: 'Work',
  type: 'document'
})
