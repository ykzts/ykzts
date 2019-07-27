---
date: 2019-07-27T21:30:00+09:00
title: ブログのシステムをHugoからGatsbyに変更しました
---

一年ほど前にブログのシステムを[Hugoに切り替えた](/2018/04/24/replace-to-hugo/)ばかりなのですが[Gatsby](https://www.gatsbyjs.org/)に変更しました。Hugoに切り替えた際に危惧していた通り、Hugoのテンプレートに慣れることがどうしてもできませんでした。

ここ数年はReactを使う機会が多いのでReactを採用しているGatsbyを選びました。文書はHugo用に整形したものをちょっとした書き換えだけで流用しています。Markdown形式にしておくとこうした変更が容易にできて便利ですね。

[Gatsby's blog starter](https://github.com/gatsbyjs/gatsby-starter-blog)を参考にしつつ、一から実装を行っています。実装に関しては速度を優先して見た目に関して手を抜いてしまっているので追い追い整えていきます。
