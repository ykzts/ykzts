import { defineField, defineType } from 'sanity'

export default defineType({
  fields: [
    defineField({
      name: 'title',
      title: 'title',
      type: 'string'
    })
  ],
  name: 'post',
  title: 'Post',
  type: 'document'
})
