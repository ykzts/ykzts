import { Card, CardContent, CardHeader } from '@ykzts/ui/components/card'

export function LoginSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div
            aria-hidden="true"
            className="h-8 w-48 animate-pulse rounded bg-muted"
          />
        </CardHeader>
        <CardContent>
          {/* biome-ignore lint/a11y/useSemanticElements: role="status" is semantically correct for loading state */}
          <div
            aria-label="読み込み中..."
            aria-live="polite"
            className="space-y-6"
            role="status"
          >
            <div
              aria-hidden="true"
              className="h-10 w-full animate-pulse rounded bg-muted"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
