import { PostForm } from './post-form'

export default function NewPostPage() {
  return (
    <div>
      <h1 className="mb-6 font-bold text-3xl">投稿新規作成</h1>
      <div className="card">
        <PostForm />
      </div>
    </div>
  )
}
