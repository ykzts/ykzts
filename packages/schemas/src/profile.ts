import { defineField, defineType } from 'sanity'

export default defineType({
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string'
    })
  ],
  name: 'profile',
  title: 'Profile',
  type: 'document'
})
