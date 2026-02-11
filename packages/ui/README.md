# @ykzts/ui

shadcn/ui + Base UI を利用した共有 UI コンポーネントです。

## コンポーネントの追加（monorepo）

shadcn CLI は apps 側から実行してください（packages/ui 直下では実行しない）。

```sh
cd apps/portfolio
pnpm dlx shadcn@latest add <component>
```

CLI はコンポーネントをこのパッケージに追加し、アプリ側の import を更新します。

> 注意: shadcn の monorepo ガイドに従い、`apps/*/components.json` と
> `packages/ui/components.json` の `style` / `iconLibrary` / `tailwind.baseColor`
> は同一にしてください。
