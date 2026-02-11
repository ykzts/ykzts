# Portable Text Editor

このディレクトリには、Lexicalをベースとしたポータブルテキストエディターの実装が含まれています。

## 概要

プロフィール編集ページの「about」フィールドで使用される、リッチテキスト編集機能を提供します。Lexicalエディターを使用して、Portable Text形式へのシリアライズ/デシリアライズを行います。

## ファイル構成

- **portable-text-editor.tsx** - メインのエディターコンポーネント
- **toolbar-plugin.tsx** - 書式設定ツールバー（太字、斜体、リンク）
- **link-plugin.tsx** - リンク機能のプラグイン
- **portable-text-serializer.ts** - Lexical ⇔ Portable Text の変換ロジック

## 機能

- ✅ 太字（Bold）
- ✅ 斜体（Italic）
- ✅ リンク（Links）
- ✅ プレビュー機能（JSONフォーマット）
- ✅ Portable Text形式への自動変換
- ✅ 既存のPortable Textコンテンツの読み込み

## 使用方法

```tsx
import PortableTextEditor from './portable-text-editor'

<PortableTextEditor
  name="about"
  initialValue={portableTextJson}
  onChange={(value) => console.log(value)}
/>
```

### Props

- `name`: フォームフィールド名（必須）
- `initialValue`: 初期値（Portable Text JSON文字列、オプション）
- `onChange`: 値が変更されたときのコールバック（オプション）

## Portable Text形式

エディターは以下のPortable Text構造をサポートしています：

```json
[
  {
    "_type": "block",
    "children": [
      {
        "_type": "span",
        "text": "通常のテキスト"
      },
      {
        "_type": "span",
        "marks": ["strong"],
        "text": "太字のテキスト"
      },
      {
        "_type": "span",
        "marks": ["em"],
        "text": "斜体のテキスト"
      },
      {
        "_type": "span",
        "marks": ["link-abc123"],
        "text": "リンクテキスト"
      }
    ],
    "markDefs": [
      {
        "_key": "link-abc123",
        "_type": "link",
        "href": "https://example.com"
      }
    ],
    "style": "normal"
  }
]
```

## 技術仕様

- **Lexical**: Meta社が開発したモダンなテキストエディターフレームワーク
- **@lexical/react**: Lexical用Reactバインディング
- **@lexical/rich-text**: リッチテキスト機能
- **@lexical/link**: リンク機能
- **Portable Text**: 構造化コンテンツのための仕様

## 今後の拡張予定

- [ ] **リンク挿入モーダル**: ブラウザのprompt()をアクセシブルなカスタムモーダルに置き換え
- [ ] 見出し（H1-H6）
- [ ] 箇条書きリスト
- [ ] 番号付きリスト
- [ ] コードブロック
- [ ] 画像の埋め込み
- [ ] より詳細なプレビュー（レンダリング済みHTML）
