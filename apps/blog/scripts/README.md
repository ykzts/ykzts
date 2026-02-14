# Blog Migration Scripts

このディレクトリには、ブログリニューアル（Phase 4）の移行スクリプトが含まれています。

## Phase 4.2: Git履歴ベースの移行

### 概要

Git履歴を分析して、各記事の複数バージョンを`post_versions`テーブルに移行します。

### ファイル構成

```
scripts/
├── lib/
│   ├── parse-mdx.ts              # MDXファイルのパース
│   └── analyze-git-history.ts    # Git履歴分析
├── __tests__/
│   ├── parse-mdx.test.ts         # パースのテスト
│   └── analyze-git-history.test.ts # Git履歴分析のテスト
├── migrate-post-versions.ts      # メイン移行スクリプト
└── README.md                     # このファイル
```

### 使用方法

#### 1. Dry-runモード（テスト実行）

データベースに書き込まずに実行：

```bash
cd apps/blog
pnpm tsx scripts/migrate-post-versions.ts --dry-run
```

#### 2. 本番実行

環境変数を設定して実行：

```bash
export NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
export SUPABASE_SERVICE_KEY="your-service-key"
cd apps/blog
pnpm tsx scripts/migrate-post-versions.ts
```

### 機能説明

#### parse-mdx.ts

MDXファイルのfrontmatterとcontentを抽出します。

**抽出フィールド:**
- `date`: 記事の公開日
- `last_update.date`: 最終更新日
- `authors`: 著者リスト
- `tags`: タグリスト
- `title`: タイトル

**関数:**
- `parseMDX(filePath)`: ファイルパスからMDXを読み込んでパース
- `parseMDXContent(content)`: 文字列からMDXをパース

#### analyze-git-history.ts

Git履歴を分析して、記事のバージョン履歴を生成します。

**関数:**
- `getFileHistory(filePath)`: ファイルのGit履歴を取得
- `detectLastUpdateChanges(commits)`: `last_update.date`の変更を検出
- `generateVersionsFromHistory(filePath)`: バージョンデータを生成

**バージョン生成ロジック:**
1. Version 1: 初回コミット時の`date`フィールドを`version_date`として使用
2. Version 2+: `last_update.date`が変更された時点で新バージョンを作成

#### migrate-post-versions.ts

メイン移行スクリプト。以下の処理を実行：

1. `apps/blog-legacy/blog/`内の全MDXファイルを検索
2. 各ファイルのGit履歴を分析
3. バージョンデータを生成
4. `post_versions`テーブルに挿入

**オプション:**
- `--dry-run`: データベースへの書き込みをスキップ

### テスト

テストを実行：

```bash
cd apps/blog
pnpm test scripts/__tests__/
```

### 開発メモ

- 現在のリポジトリでは、全ファイルが1つのコミットでまとめて追加されているため、各ファイルは1つのバージョンのみ生成されます
- 実際の運用では、`last_update.date`が変更されるたびに新しいバージョンが生成されます
- Git履歴は`/home/runner/work/ykzts/ykzts`をリポジトリルートとして分析されます

### 注意事項

- Git履歴が存在しないファイルは警告が表示され、スキップされます
- Supabaseの認証情報は環境変数で設定する必要があります（dry-runモードを除く）
- データベース挿入ロジックは今後実装予定です

### 関連Issue

- Epic: ykzts/ykzts#2964
- 親Issue: ykzts/ykzts#3305
- このPhase: Phase 4.2
