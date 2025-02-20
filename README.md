# リアルタイムの為替を Discord に送信するプログラム

## 必要なもの

- Alpha Vantage APIのAPIキー
- DiscordのwebhookURL

## 手順

1. [ここ](https://www.alphavantage.co/support/#api-key)からAPIキーを取得(フリープランでは1分あたり最大5つのAPIリクエストと1日あたり500のリクエストが送信できます)
2. Discordのwebhookを作成し、URLをコピー
3. クローンを作成し、同じフォルダ内に`config.json`を作成
4. `config.json`内を以下のように設定

    ```
    {
      "webHookUrl": "webhookのURL",
      "apiKey": "1.で取得したAPIキー"
    }
    ```

5. 実行

    ```
    node src
    ```

### その他

送信時間は適宜変更
