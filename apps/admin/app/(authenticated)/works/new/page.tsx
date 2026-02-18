import { NewResourcePage } from '@/components/resource-pages'
import { WorkForm } from './_components/work-form'

export default function NewWorkPage() {
  return <NewResourcePage FormComponent={WorkForm} title="作品新規作成" />
}
