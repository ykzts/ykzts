# shadcn/ui導入とコンポーネント移行ガイド

## 概要

このドキュメントは、モノレポ環境にshadcn/ui（Base UIベース）を導入し、既存のカスタムUIコンポーネントから段階的に移行するためのガイドです。

## 導入完了項目

### 基本設定

- ✅ **apps/admin**: shadcn/ui導入完了
  - `components.json`: base-novaスタイル設定
  - 依存関係: `@base-ui/react`, `clsx`, `tailwind-merge`, `class-variance-authority`
  - `lib/utils.ts`: cn()ヘルパー関数
  - グローバルCSS: shadcn/ui変数設定

- ✅ **apps/portfolio**: shadcn/ui導入完了
  - `components.json`: base-novaスタイル設定
  - 依存関係: `@base-ui/react`, `clsx`, `tailwind-merge`, `class-variance-authority`
  - `lib/utils.ts`: cn()ヘルパー関数
  - グローバルCSS: shadcn/ui変数設定

### 導入済みコンポーネント

#### apps/admin
- ✅ Button (`components/ui/button.tsx`)
- ✅ Card (`components/ui/card.tsx`)
- ✅ Input (`components/ui/input.tsx`)

#### apps/portfolio
- ✅ Button (`components/ui/button.tsx`)
- ✅ Card (`components/ui/card.tsx`)
- ✅ Input (`components/ui/input.tsx`)
- ✅ Textarea (`components/ui/textarea.tsx`)
- ✅ Skeleton (`components/ui/skeleton.tsx`)

## 既存コンポーネントの移行計画

### apps/portfolio

#### 1. Skeletonコンポーネントの移行

**既存実装**: `components/skeleton.tsx`
- 特徴: `twMerge`を使用、`inline-flex`レイアウト、`before`疑似要素
- 使用箇所: 
  - `app/_components/footer.tsx`
  - `app/_components/about.tsx`
  - `app/_components/works.tsx`
  - `app/_components/social-links.tsx`
  - `app/_components/hero.tsx`

**新実装**: `components/ui/skeleton.tsx`
- 特徴: シンプルな`div`ベース、`animate-pulse`、`bg-muted`

**移行手順**:
1. 各使用箇所でインポートを変更: `from '@/components/skeleton'` → `from '@/components/ui/skeleton'`
2. 既存コンポーネントの特殊な`inline-flex`レイアウトが必要な場合は追加のclassNameで調整
3. テスト実行して表示確認
4. 問題なければ旧コンポーネント削除

**注意点**:
- 既存実装は`inline-flex`と`before`疑似要素を使用しているため、新実装は通常の`block`要素
- レイアウトに影響がある場合は、呼び出し側で`className="inline-flex"`を追加

#### 2. フォームコンポーネントの移行

**既存実装**: `components/form/` ディレクトリ
- Button: `components/form/button.tsx`
- Input: `components/form/input.tsx`
- Textarea: `components/form/textarea.tsx`

**使用箇所**:
- `app/_components/contact-form.tsx`: Button, Input, Textarea

**移行手順**:

##### Phase 1: フォームコンポーネントの段階的移行
1. 新しいshadcn/uiコンポーネントを導入済み
2. 使用箇所で徐々に切り替え

##### Phase 2: contact-formの更新
既存のフォームコンポーネントは以下の追加機能を持っています:
- `label`プロパティ（フィールドラベル）
- `error`プロパティ（エラーメッセージ表示）
- `required`の視覚的表示（赤いアスタリスク）

shadcn/uiの基本コンポーネントはこれらの機能を持たないため、以下の対応が必要:

**オプション A**: 既存の機能を維持
- フォームコンポーネントに機能を追加（Label、エラーメッセージ表示）
- 必要に応じてshadcn/uiの`Label`コンポーネントを追加導入

**オプション B**: シンプル化
- label、error機能を外部で管理
- コンポーネントは純粋なInput/Textarea/Buttonとして使用

**推奨**: オプションAを採用し、段階的に機能を追加

##### Phase 3: テストと検証
1. 視覚的な確認（スタイルの一貫性）
2. アクセシビリティテスト（フォーカス、キーボード操作）
3. エラー表示の動作確認

##### Phase 4: 旧コンポーネントの削除
1. すべての移行が完了したら`components/form/`ディレクトリを削除
2. `components/skeleton.tsx`を削除

### apps/admin

現時点では独自のカスタムUIコンポーネントの使用は限定的です。
必要に応じて、Lexicalエディタ周りでshadcn/uiコンポーネントを活用できます。

## 追加推奨コンポーネント

今後の開発で有用と思われるshadcn/uiコンポーネント:

### apps/admin向け
- `Label`: フォームラベル
- `Dialog`: モーダルダイアログ
- `Dropdown Menu`: アクションメニュー
- `Table`: データテーブル
- `Toast`: 通知メッセージ
- `Alert`: 警告・情報表示

### apps/portfolio向け
- `Label`: フォームラベル（contact-form用）
- `Badge`: タグ表示（現在の`tech-tag`の代替候補）
- `Tooltip`: ツールチップ
- `Sheet`: サイドパネル

## CSS変数の統一

### 既存のカスタム変数からshadcn/ui変数へのマッピング

#### 変更済み

| 既存変数 | shadcn/ui変数 | 用途 |
|---------|--------------|------|
| `--color-accent` | `--color-primary` | プライマリカラー |
| `--color-accent-foreground` | `--color-primary-foreground` | プライマリテキスト |
| `--color-error` | `--color-destructive` | エラー/削除アクション |
| N/A | `--color-secondary` | セカンダリ要素 |
| N/A | `--color-input` | 入力フィールド境界線 |
| N/A | `--color-ring` | フォーカスリング |

#### 影響のあるユーティリティクラス

##### apps/admin
- `@utility btn`: `bg-accent` → `bg-primary`に更新済み
- `@utility input`: `focus:ring-accent` → `focus:ring-ring`に更新済み

##### apps/portfolio
- `@utility tech-tag`: `bg-accent/20` → `bg-primary/20`に更新済み

## ベストプラクティス

### 1. コンポーネントの使用
```tsx
// Good: shadcn/uiコンポーネントを使用
import { Button } from '@/components/ui/button'

<Button variant="default">送信</Button>

// 必要に応じてカスタマイズ
<Button variant="outline" size="sm" className="w-full">
  カスタムボタン
</Button>
```

### 2. cn()ヘルパーの活用
```tsx
import { cn } from '@/lib/utils'

// 条件付きクラス名の結合
<div className={cn(
  'base-classes',
  isActive && 'active-classes',
  className
)} />
```

### 3. Base UIの型安全性
```tsx
// Base UIは完全な型サポートを提供
import { Button } from '@base-ui/react/button'

// TypeScriptが適切に型チェック
<Button disabled={isLoading}>
  {isLoading ? 'Loading...' : 'Submit'}
</Button>
```

## トラブルシューティング

### ビルドエラー

#### "Cannot find module '@/components/ui/...'"
→ `tsconfig.json`のpathsが正しく設定されているか確認

#### "Property 'Root' does not exist"
→ Base UIは`Root`ではなく直接コンポーネントをエクスポート（例: `Button`, `Input`）

### スタイルの不一致

#### クラス名の順序
→ Biomeが自動的にクラスをソート。`pnpm check --write --unsafe`を実行

#### CSS変数が認識されない
→ `globals.css`で`@theme`ブロック内に変数が定義されているか確認

## 参考リンク

- [shadcn/ui公式ドキュメント](https://ui.shadcn.com/)
- [shadcn/ui Monorepo対応](https://ui.shadcn.com/docs/monorepo)
- [Base UI公式ドキュメント](https://base-ui.netlify.app/)
- [Base UI Changelog](https://ui.shadcn.com/docs/changelog/2026-01-base-ui)
- [Tailwind CSS v4ドキュメント](https://tailwindcss.com/docs/v4-beta)

## まとめ

- ✅ shadcn/ui（base-nova）をadminとportfolioに導入完了
- ✅ 基本コンポーネント（Button, Input, Card, Textarea, Skeleton）を実装
- ⏳ 既存コンポーネントの段階的な移行を推奨
- 📝 追加コンポーネントは必要に応じて導入

この導入により、以下のメリットが得られます:
1. デザインシステムの統一
2. アクセシビリティの向上（Base UIベース）
3. 開発効率の向上（再利用可能なコンポーネント）
4. メンテナンス性の向上（コミュニティサポート）
