import type { Metadata } from 'next'
import SubLayout from './(docs)/layout'

export const metadata: Metadata = {
  title: '404 Not Found'
}

export default function NotFound() {
  return (
    <SubLayout modal={null} params={Promise.resolve({})}>
      <h1>404 Not Found</h1>

      <p className="leading-8">お探しのページを見つけられませんでした。</p>
    </SubLayout>
  )
}
