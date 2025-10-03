import type { Metadata } from 'next'
import Title from './(docs)/@title/layout'
import SubLayout from './(docs)/layout'

export const metadata: Metadata = {
  title: '404 Not Found'
}

export default function NotFound() {
  return (
    <SubLayout title={<Title>404 Not Found</Title>}>
      <p className="leading-8">お探しのページを見つけられませんでした。</p>
    </SubLayout>
  )
}
