---
categories:
  - technology
lastmod: 2018-04-24T23:30:00+09:00
publishdate: 2018-04-24T23:30:00+09:00
tags:
  - Hugo
title: ブログのシステムをWordPressからHugoに変更しました
---

これまで[WordPress](https://wordpress.org/)を使ってブログを書いていましたが、[Hugo](https://gohugo.io/)に変更しました。

<!--more-->

WordPressは自身で運用をする手間を厭い、フルマネージドのホスティングサービスである[WordPress.com](https://wordpress.com/)を利用していました。WordPress.comはWordPressを運用する上で必要な多くな手間を省くことができるとても便利なサービスなのですがテーマはWordPress.com側が用意されたものの中からしか選べません。

これはWordPressのテーマはPHPで書かれているのでユーザーが自由にテーマを変更できるようにしてしまうとセキュリティー上のリスクが発生してしまいます。プリインストールされたテーマしか使えないようになっているのはやむを得ないことなのでしょう。

ですがどうしても不満は感じてしまいます。

これまで[Middleman](https://middlemanapp.com/)や[Jekyll](https://jekyllrb.com/)といったRubyで書かれている静的サイトジェネレーターを使ってきていたのですが、どうしても速度が気になっていました。HugoはGoで書かれていて実行速度も速いと度々耳にしていました。なので良い機会と思って使ってみました。

ソースファイルは[GitHub](https://github.com/)で管理をして、[Netlify](https://www.netlify.com/)でビルドとデプロイをしています。Hugoは確かに前評判通りに実行速度が速く、とても満足しています。

とはいえRubyを直接書くことができるMiddlemanやJekyllと比べてしまうとHugoはテーマを作る際に使うテンプレートファイルの自由度がありません。ですがドキュメントを見る限りは必要充分のことはできるのではないかと思っています。まだまだHugoに関する知識が足りていないので少しずつ勉強していこうと考えています。
