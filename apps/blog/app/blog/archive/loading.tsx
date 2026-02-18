import Header from '@/components/header'

export default function ArchiveLoading() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-8 font-bold text-3xl">アーカイブ</h1>
        <div className="space-y-12">
          <div className="animate-pulse">
            <div className="mb-6 h-8 w-48 rounded bg-muted" />
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div className="rounded-lg border p-6" key={i}>
                  <div className="mb-4 h-6 w-3/4 rounded bg-muted" />
                  <div className="mb-2 h-4 w-1/4 rounded bg-muted" />
                  <div className="h-4 w-full rounded bg-muted" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
