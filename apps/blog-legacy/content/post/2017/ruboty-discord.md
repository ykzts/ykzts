---
categories:
  - technology
cover: /images/2017/discord-logo.png
publishdate: 2017-11-10T22:00:00Z
tags:
  - Discord
  - Ruboty
  - Ruboty::Discord
  - Ruby
title: RubotyのDiscordアダプターを作りました
---

最近は仲間内のチャットなどでは[Discord](https://discordapp.com/)をよく使っています。またOSSプロダクトのサポートチャットとしてDiscordを採用している事例もよく目にするようになってきています。

Discordにこの記事で詳しく説明しません。Discordについて気になった方は[櫛井さんの書かれたブログ記事](http://blog.kushii.net/archives/2065824.html)がとても良くまとめられているのでご参照ください。

Discordでボットを作るためのライブラリーとして[discordrb](https://github.com/meew0/discordrb)があります。discordrbは多機能でさまざまなことができるとても便利なライブラリーなのですが、多機能すぎて少し使い難い側面もありました。そのためRubyでチャットボットを簡単に作ることができるフレームワークである[Ruboty](https://github.com/r7kamura/ruboty)のDiscordアダプターを作りました。

<!--more-->

- [ruboty-discord | RubyGems.org | your community gem host](https://rubygems.org/gems/ruboty-discord)

[Discordの開発者向けページ](https://discordapp.com/developers/applications/me)から新規アプリを作り、そこからボットユーザーのトークンを取得するだけで簡単に使えるようになっています。

ボットをサーバーに招待するときは[Discord Permissions Calculator](https://discordapi.com/permissions.html#0)からできるようになっています。このページはDiscordが公式に提供しているもので、権限の設定からとても自由にできるようになっています。個人にはほかのチャットサービスよりも簡単にボットを作ることができるようになっていると感じました。

Ruboty自体がとても簡単に使えるようになっているためGemfileを

```ruby
source 'https://rubygems.org'

gem 'ruboty'
gem 'ruboty-discord'
```

のようにするだけで使えるようになっています。あとは[Bundler](https://bundler.io/)を使ってインストールした後に`bundle exec ruboty`でRubotyを動かすだけでDiscordでボットとのメッセージのやりとりができるようになります。

{{< figure src="/images/2017/discord-screenshot-ping-pong.png" >}}

v1.0.0である現時点では必要最低限のメッセージのやりとりしかできませんが、リアクションも行えるようにしたりと機能の拡充をしたいと考えています。なにか要望やフィードバックがある場合はぜひ[GitHubのIssues](https://github.com/ykzts/ruboty-discord/issues)でご報告ください。なんらかの反応をいただけますととても助かります。
