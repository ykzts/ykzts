import { defineType } from 'sanity'

export default defineType({
  fields: [
    {
      name: 'title',
      title: 'title',
      type: 'string'
    }
  ],
  name: 'post',
  title: 'Post',
  type: 'document'
})
