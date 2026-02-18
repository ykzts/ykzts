import { NewResourcePage } from '@/components/resource-pages'
import { PostForm } from './post-form'

export default function NewPostPage() {
  return <NewResourcePage FormComponent={PostForm} title="投稿新規作成" />
}
