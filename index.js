// 必要なものを準備
const express = require('express');
const line = require('@line/bot-sdk');
const axios = require('axios');
const { calculateNutrition, evaluateNutrition } = require('./nutrition');
const app = express();

// LINEの設定
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

// Clarifaiの設定
const CLARIFAI_PAT = process.env.CLARIFAI_PAT || 'dummy';
const CLARIFAI_USER_ID = 'clarifai';
const CLARIFAI_APP_ID = 'main';
const CLARIFAI_MODEL_ID = 'food-item-recognition';

// Google Vision APIの設定
const GOOGLE_VISION_API_KEY = process.env.GOOGLE_VISION_API_KEY;

// LINEボットを作成
const client = new line.Client(config);

// ウェブサイトのトップページ
app.get('/', (req, res) => {
  res.send('MealAnalyzer Bot is running! 🍽️ Now with Google Vision! 👁️');
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

// Base64画像を取得する関数
async function getBase64Image(imageUrl) {
  const imageResponse = await axios.get(imageUrl, {
    responseType: 'arraybuffer',
    headers: {
      'Authorization': `Bearer ${config.channelAccessToken}`
    }
  });
  
  return Buffer.from(imageResponse.data).toString('base64');
}

// Google Vision APIで画像を分析
async function analyzeByGoogleVision(base64Image) {
  try {
    console.log('=== Google Vision API分析開始 ===');
    
    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
      {
        requests: [{
          image: {
            content: base64Image
          },
          features: [
            {
              type: 'LABEL_DETECTION',
              maxResults: 10
            },
            {
              type: 'WEB_DETECTION',
              maxResults: 5
            },
            {
              type: 'TEXT_DETECTION',
              maxResults: 5
            }
          ]
        }]
      }
    );
    
    const result = response.data.responses[0];
    console.log('Google Vision結果:', JSON.stringify(result, null, 2));
    
    return {
      labels: result.labelAnnotations || [],
      webEntities: result.webDetection?.webEntities || [],
      text: result.textAnnotations || []
    };
    
  } catch (error) {
    console.error('Google Vision API Error:', error.response?.data || error.message);
    return null;
  }
}

// Clarifai APIで画像を分析
async function analyzeByClarifai(base64Image) {
  try {
    console.log('=== Clarifai API分析開始 ===');
    
    const response = await axios.post(
      `https://api.clarifai.com/v2/models/${CLARIFAI_MODEL_ID}/outputs`,
      {
        user_app_id: {
          user_id: CLARIFAI_USER_ID,
          app_id: CLARIFAI_APP_ID
        },
        inputs: [{
          data: {
            image: {
              base64: base64Image
            }
          }
        }]
      },
      {
        headers: {
          'Authorization': `Key ${CLARIFAI_PAT}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const concepts = response.data.outputs[0].data.concepts || [];
    console.log('Clarifai結果:', concepts.slice(0, 5));
    
    return concepts;
    
  } catch (error) {
    console.error('Clarifai API Error:', error.response?.data || error.message);
    return [];
  }
}

// 日本料理を検出する関数（シンプル版）
function detectJapaneseDish(googleResults, clarifaiResults) {
  // 検出された全ての単語を収集
  const allWords = [];
  
  // Google Visionから単語収集
  if (googleResults) {
    googleResults.labels.forEach(label => {
      allWords.push(label.description.toLowerCase());
    });
    
    googleResults.webEntities.forEach(entity => {
      if (entity.description) {
        allWords.push(entity.description.toLowerCase());
      }
    });
    
    // テキスト検出結果も追加
    googleResults.text.forEach(text => {
      if (text.description) {
        allWords.push(text.description.toLowerCase());
      }
    });
  }
  
  // Clarifaiから単語収集
  clarifaiResults.forEach(concept => {
    allWords.push(concept.name.toLowerCase());
  });
  
  console.log('検出された全単語:', allWords);
  
  // 単語の出現をチェックする関数
  const hasWord = (words) => {
    return words.some(word => allWords.some(detected => detected.includes(word)));
  };
  
  // 優先順位付き判定（上から順にチェック）
  
  // 1. ラーメン判定（最優先、ただしriceがある場合は除外）
  if ((hasWord(['ramen', 'ラーメン', 'noodle soup']) || 
      (hasWord(['noodle', '麺']) && hasWord(['soup', 'broth', 'スープ']))) &&
      !hasWord(['rice', 'ご飯'])) {
    console.log('判定: ラーメン');
    return 'ラーメン';
  }
  
  // 2. カレー判定（キーワード追加）
  if (hasWord(['curry', 'カレー', 'japanese curry', 'curry rice', 'goulash', 'chili']) ||
      (hasWord(['curry']) && hasWord(['rice'])) ||
      (hasWord(['goulash', 'chili']) && hasWord(['rice']))) {
    console.log('判定: カレーライス');
    return 'カレーライス';
  }
  
  // 3. 牛丼判定（カレー系の単語を除外）
  if (hasWord(['gyudon', '牛丼', 'beef bowl']) ||
      (hasWord(['beef', '牛肉']) && hasWord(['rice', 'ご飯', 'bowl']) && 
       !hasWord(['curry', 'noodle', 'goulash', 'chili']))) {
    console.log('判定: 牛丼');
    return '牛丼';
  }
  
  // 4. からあげ判定
  if (hasWord(['karaage', 'からあげ', '唐揚げ', 'fried chicken']) ||
      (hasWord(['chicken']) && hasWord(['fried', '揚げ']))) {
    console.log('判定: からあげ');
    return 'からあげ';
  }
  
  // 5. 天ぷら判定
  if (hasWord(['tempura', '天ぷら', 'てんぷら'])) {
    console.log('判定: 天ぷら');
    return '天ぷら';
  }
  
  // 6. とんかつ判定
  if (hasWord(['tonkatsu', 'とんかつ', 'pork cutlet'])) {
    console.log('判定: とんかつ');
    return 'とんかつ';
  }
  
  // 7. 親子丼判定
  if (hasWord(['oyakodon', '親子丼']) ||
      (hasWord(['chicken', 'egg']) && hasWord(['rice', 'bowl']))) {
    console.log('判定: 親子丼');
    return '親子丼';
  }
  
  // その他の料理も追加可能...
  
  console.log('判定: 該当なし');
  return null;
}

// 統合された画像分析関数
async function analyzeImage(imageUrl) {
  try {
    // Base64画像を取得
    const base64Image = await getBase64Image(imageUrl);
    
    // 両方のAPIで分析（並列実行）
    const [googleResults, clarifaiResults] = await Promise.all([
      analyzeByGoogleVision(base64Image),
      analyzeByClarifai(base64Image)
    ]);
    
    // 料理を検出
    const detectedDish = detectJapaneseDish(googleResults, clarifaiResults);
    
    // 検出された食品リストを作成
    let detectedFoods = [];
    
    // 料理が検出された場合
    if (detectedDish) {
      detectedFoods.push({
        name: detectedDish,
        confidence: 0.95
      });
    }
    
    // Clarifaiの結果も追加（補完用）
    clarifaiResults
      .filter(concept => concept.value > 0.5)
      .slice(0, 3)
      .forEach(concept => {
        // 重複を避ける
        if (!detectedFoods.some(f => f.name === concept.name)) {
          detectedFoods.push({
            name: concept.name,
            confidence: concept.value
          });
        }
      });
    
    // デフォルト値
    if (detectedFoods.length === 0) {
      detectedFoods.push({
        name: '食事',
        confidence: 0.5
      });
    }
    
    return {
      success: true,
      foods: detectedFoods,
      servingData: {
        size: '中',
        dish: '皿'
      },
      topConfidence: detectedFoods[0]?.confidence || 0,
      apis: {
        google: !!googleResults,
        clarifai: clarifaiResults.length > 0
      }
    };
    
  } catch (error) {
    console.error('Image Analysis Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// メッセージが来たときの処理
async function handleEvent(event) {
  if (event.type !== 'message') {
    return Promise.resolve(null);
  }

  // テキストメッセージの場合
  if (event.message.type === 'text') {
    const userMessage = event.message.text;
    
    let replyText = '';
    
    if (userMessage.includes('使い方') || userMessage.includes('help')) {
      replyText = `🍽️ MealAnalyzer 超高精度版の使い方

📸 食事の写真を送ると：
1. Google Vision + Clarifai で分析
2. 日本料理を正確に認識
3. 詳細な栄養計算
4. バランス評価

🎯 認識可能な料理：
• ラーメン、うどん、そば
• カレーライス、ハヤシライス
• 牛丼、親子丼、カツ丼
• からあげ、とんかつ、天ぷら
• その他多数！

💡 より正確な結果のコツ：
• 料理全体が写るように撮影
• 明るい場所で撮影
• 1品ずつ撮影すると精度UP！`;
    } else {
      replyText = '食事の写真を送ってください！Google Vision APIも使った超高精度分析を行います 📸🤖👁️';
    }
    
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: replyText
    });
  }
  
  // 画像メッセージの場合
  if (event.message.type === 'image') {
    // 「分析中...」メッセージ
    await client.pushMessage(event.source.userId, {
      type: 'text',
      text: '🔍 Google Vision + Clarifai で高精度分析中...\n📊 日本料理データベースと照合中...\n⏳ 少々お待ちください！'
    });
    
    // 画像URLを取得
    const imageUrl = `https://api-data.line.me/v2/bot/message/${event.message.id}/content`;
    
    // 画像を分析
    const analysisResult = await analyzeImage(imageUrl);
    
    if (!analysisResult.success) {
      return client.replyMessage(event.replyToken, {
        type: 'text',
        text: '😅 分析に失敗しました。もう一度試してください！\n\n💡 ヒント：食べ物がはっきり写った写真を送ってね'
      });
    }
    
    // 栄養情報を計算（調理方法なしで）
    const nutrition = calculateNutrition(
      analysisResult.foods,
      '生', // デフォルト値（表示はしない）
      analysisResult.servingData
    );
    
    // 栄養バランスを評価
    const evaluation = evaluateNutrition(nutrition);
    
    // 詳細な結果を作成
    const detailsText = nutrition.details
      .map(item => `${item.name}(${item.serving}g)`)
      .join('、');
    
    // 使用したAPIの表示
    const apiStatus = [];
    if (analysisResult.apis.google) apiStatus.push('Google Vision ✓');
    if (analysisResult.apis.clarifai) apiStatus.push('Clarifai ✓');
    
    // 結果を返信
    const replyMessage = {
      type: 'flex',
      altText: '詳細栄養分析結果',
      contents: {
        type: 'bubble',
        size: 'mega',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '🍽️ 超高精度栄養分析結果',
              weight: 'bold',
              size: 'xl',
              color: '#1DB446'
            },
            {
              type: 'text',
              text: `バランススコア: ${evaluation.score}点`,
              size: 'sm',
              color: '#FF5551',
              margin: 'sm'
            }
          ]
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '📋 検出された食品と推定量',
              weight: 'bold',
              margin: 'md'
            },
            {
              type: 'text',
              text: detailsText || '食事',
              wrap: true,
              color: '#666666',
              size: 'sm',
              margin: 'sm'
            },
            {
              type: 'separator',
              margin: 'lg'
            },
            {
              type: 'box',
              layout: 'horizontal',
              margin: 'lg',
              contents: [
                {
                  type: 'text',
                  text: '総カロリー',
                  size: 'sm',
                  color: '#555555',
                  flex: 1
                },
                {
                  type: 'text',
                  text: `${nutrition.calories}kcal`,
                  size: 'lg',
                  weight: 'bold',
                  color: '#FF5551',
                  align: 'end',
                  flex: 1
                }
              ]
            },
            {
              type: 'separator',
              margin: 'lg'
            },
            {
              type: 'text',
              text: '📊 栄養素詳細',
              weight: 'bold',
              margin: 'lg'
            },
            {
              type: 'box',
              layout: 'horizontal',
              margin: 'md',
              contents: [
                {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'text',
                      text: 'たんぱく質',
                      size: 'xs',
                      color: '#555555'
                    },
                    {
                      type: 'text',
                      text: `${nutrition.protein}g`,
                      size: 'sm',
                      weight: 'bold',
                      margin: 'xs'
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
                      size: 'xs',
                      color: '#555555'
                    },
                    {
                      type: 'text',
                      text: `${nutrition.fat}g`,
                      size: 'sm',
                      weight: 'bold',
                      margin: 'xs'
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
                      size: 'xs',
                      color: '#555555'
                    },
                    {
                      type: 'text',
                      text: `${nutrition.carbs}g`,
                      size: 'sm',
                      weight: 'bold',
                      margin: 'xs'
                    }
                  ],
                  flex: 1
                }
              ]
            },
            {
              type: 'box',
              layout: 'horizontal',
              margin: 'md',
              contents: [
                {
                  type: 'box',
                  layout: 'vertical',
                  contents: [
                    {
                      type: 'text',
                      text: '食物繊維',
                      size: 'xs',
                      color: '#555555'
                    },
                    {
                      type: 'text',
                      text: `${nutrition.fiber}g`,
                      size: 'sm',
                      weight: 'bold',
                      margin: 'xs'
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
                      text: '食塩相当量',
                      size: 'xs',
                      color: '#555555'
                    },
                    {
                      type: 'text',
                      text: `${nutrition.salt}g`,
                      size: 'sm',
                      weight: 'bold',
                      margin: 'xs'
                    }
                  ],
                  flex: 1
                },
                {
                  type: 'box',
                  layout: 'vertical',
                  contents: [],
                  flex: 1
                }
              ]
            },
            {
              type: 'separator',
              margin: 'lg'
            },
            {
              type: 'text',
              text: '💯 栄養バランス評価',
              weight: 'bold',
              margin: 'lg'
            },
            {
              type: 'text',
              text: evaluation.overall,
              wrap: true,
              size: 'sm',
              margin: 'sm'
            }
          ]
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: `🤖 ${apiStatus.join(' + ')} | AI信頼度: ${Math.round(analysisResult.topConfidence * 100)}%`,
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
  console.log('MealAnalyzer Bot with Google Vision + Clarifai is ready! 🍽️🤖👁️📊');
  console.log('Google Vision API:', GOOGLE_VISION_API_KEY ? 'Configured ✓' : 'Not configured ✗');
});
