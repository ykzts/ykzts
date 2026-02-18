import { Panel } from '@/components/panel'
import { PostForm } from '../_components/post-form'
import { createPostAction } from './actions'

export default function NewPostPage() {
  return (
    <div>
      <h1 className="mb-6 font-bold text-3xl">投稿新規作成</h1>
      <Panel>
        <PostForm createAction={createPostAction} />
      </Panel>
    </div>
  )
}
