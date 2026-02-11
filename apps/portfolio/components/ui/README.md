# UI Components

このディレクトリには、shadcn/ui（Base UI）を使用したUIコンポーネントが含まれています。

## 利用可能なコンポーネント

### Button
Base UIのButtonをベースにした、バリアント付きボタンコンポーネント。

```tsx
import { Button } from '@/components/ui/button'

<Button variant="default">送信</Button>
<Button variant="outline">キャンセル</Button>
<Button variant="destructive">削除</Button>
```

**Props:**
- `variant`: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
- `size`: 'default' | 'sm' | 'lg' | 'icon'

### Card
コンテンツカードコンポーネント一式。

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>タイトル</CardTitle>
    <CardDescription>説明文</CardDescription>
  </CardHeader>
  <CardContent>
    コンテンツ
  </CardContent>
  <CardFooter>
    フッター
  </CardFooter>
</Card>
```

### Input
Base UIのInputをベースにしたテキスト入力フィールド。

```tsx
import { Input } from '@/components/ui/input'

<Input type="text" placeholder="入力してください" />
<Input type="email" placeholder="email@example.com" />
```

### Textarea
複数行のテキスト入力フィールド。

```tsx
import { Textarea } from '@/components/ui/textarea'

<Textarea placeholder="コメントを入力..." rows={4} />
```

### Skeleton
コンテンツのローディング状態を表示するスケルトンコンポーネント。

```tsx
import { Skeleton } from '@/components/ui/skeleton'

<Skeleton className="h-4 w-[250px]" />
<Skeleton className="h-12 w-12 rounded-full" />
```

## スタイリング

全てのコンポーネントは`className`プロップを受け取り、追加のスタイルを適用できます:

```tsx
<Button className="w-full mt-4">全幅ボタン</Button>
```

## ユーティリティ

コンポーネントは`lib/utils.ts`の`cn()`関数を使用してクラス名を結合します:

```tsx
import { cn } from '@/lib/utils'

<div className={cn('base-class', condition && 'conditional-class', className)} />
```

## Base UI

これらのコンポーネントは、アクセシビリティに優れた[@base-ui/react](https://base-ui.netlify.app/)を基盤としています。

## 移行ガイド

既存のカスタムコンポーネントからshadcn/uiコンポーネントへの移行については、
[shadcn/ui移行ガイド](../../docs/shadcn-ui-migration-guide.md)を参照してください。

## 詳細

詳しくは[shadcn/ui公式ドキュメント](https://ui.shadcn.com/)を参照してください。
