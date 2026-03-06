import { Panel } from '@/components/panel'
import { getAllTechnologies } from '@/lib/data'
import { WorkForm } from '../_components/work-form'
import { createWork } from './actions'

export default async function NewWorkPage() {
  const allTechnologies = await getAllTechnologies()

  return (
    <div>
      <h1 className="mb-6 font-bold text-3xl">作品新規作成</h1>
      <Panel>
        <WorkForm allTechnologies={allTechnologies} createAction={createWork} />
      </Panel>
    </div>
  )
}
