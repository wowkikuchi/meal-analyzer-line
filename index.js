// 必要なものを準備
const express = require('express');
const line = require('@line/bot-sdk');
const app = express();

// LINEの設定（後で設定します）
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || 'dummy',
  channelSecret: process.env.LINE_CHANNEL_SECRET || 'dummy'
};

// LINEボットを作成
const client = new line.Client(config);

// ウェブサイトのトップページ
app.get('/', (req, res) => {
  res.send('MealAnalyzer Bot is running! 🍽️');
});

// LINEからのメッセージを受け取る場所
app.post('/webhook', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// メッセージが来たときの処理
async function handleEvent(event) {
  // メッセージじゃない場合は無視
  if (event.type !== 'message') {
    return Promise.resolve(null);
  }

  // テキストメッセージの場合
  if (event.message.type === 'text') {
    const userMessage = event.message.text;
    
    // 返信メッセージ
    let replyText = '';
    
    if (userMessage.includes('使い方') || userMessage.includes('help')) {
      replyText = `🍽️ MealAnalyzerの使い方

1. 食事の写真を送ってね！
2. カロリーと栄養を教えるよ！
3. 健康アドバイスもあるよ！

写真を送ってみてね📸`;
    } else {
      replyText = '食事の写真を送ってください！栄養情報を分析します 📸';
    }
    
    // 返信を送る
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: replyText
    });
  }
  
  // 画像メッセージの場合
  if (event.message.type === 'image') {
    // まずは簡単な返信
    const replyMessage = {
      type: 'flex',
      altText: '栄養分析結果',
      contents: {
        type: 'bubble',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '🍽️ 栄養分析結果',
              weight: 'bold',
              size: 'xl',
              color: '#1DB446'
            }
          ]
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '📸 画像を受け取りました！',
              weight: 'bold',
              margin: 'md'
            },
            {
              type: 'separator',
              margin: 'lg'
            },
            {
              type: 'text',
              text: '🔍 分析機能は準備中です',
              margin: 'lg',
              wrap: true
            },
            {
              type: 'text',
              text: '推定カロリー: ???kcal',
              margin: 'md',
              size: 'lg',
              weight: 'bold',
              color: '#FF5551'
            },
            {
              type: 'box',
              layout: 'horizontal',
              margin: 'lg',
              contents: [
                {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'text',
                      text: 'たんぱく質',
                      size: 'sm',
                      color: '#555555'
                    },
                    {
                      type: 'text',
                      text: '??g',
                      size: 'sm',
                      weight: 'bold'
                    }
                  ],
                  flex: 1
                },
                {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'text',
                      text: '炭水化物',
                      size: 'sm',
                      color: '#555555'
                    },
                    {
                      type: 'text',
                      text: '??g',
                      size: 'sm',
                      weight: 'bold'
                    }
                  ],
                  flex: 1
                },
                {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'text',
                      text: '脂質',
                      size: 'sm',
                      color: '#555555'
                    },
                    {
                      type: 'text',
                      text: '??g',
                      size: 'sm',
                      weight: 'bold'
                    }
                  ],
                  flex: 1
                }
              ]
            }
          ]
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '💡 完全版は開発中です！',
              size: 'xs',
              color: '#aaaaaa',
              align: 'center'
            }
          ]
        }
      }
    };
    
    return client.replyMessage(event.replyToken, replyMessage);
  }
  
  return Promise.resolve(null);
}

// サーバーを起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('MealAnalyzer Bot is ready! 🍽️');
});
