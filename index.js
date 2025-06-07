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

// 画像を分析する関数（量の推定も追加）
async function analyzeImage(imageUrl) {
  try {
    // LINEから画像をダウンロード
    const imageResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      headers: {
        'Authorization': `Bearer ${config.channelAccessToken}`
      }
    });
    
    // Base64に変換
    const base64Image = Buffer.from(imageResponse.data).toString('base64');
    
    // Clarifai APIにリクエスト（食品認識）
    const clarifaiResponse = await axios.post(
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
    
    // 一般物体認識も実行（器や量の推定用）
    const generalResponse = await axios.post(
      'https://api.clarifai.com/v2/models/general-image-recognition/outputs',
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
    
    // 結果を解析
    const foodConcepts = clarifaiResponse.data.outputs[0].data.concepts || [];
    const generalConcepts = generalResponse.data.outputs[0].data.concepts || [];
    
    // 食品を検出
    const detectedFoods = foodConcepts
      .filter(concept => concept.value > 0.5)
      .slice(0, 5)
      .map(concept => ({
        name: concept.name,
        confidence: concept.value
      }));
    
    // 器や量の手がかりを検出
    const servingClues = {
      size: detectSize(generalConcepts),
      dish: detectDishType(generalConcepts),
      cookingMethod: detectCookingMethod([...foodConcepts, ...generalConcepts])
    };
    
    return {
      success: true,
      foods: detectedFoods,
      servingData: servingClues,
      topConfidence: detectedFoods[0]?.confidence || 0
    };
    
  } catch (error) {
    console.error('Clarifai API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// サイズを推定
function detectSize(concepts) {
  const sizeKeywords = {
    '小': ['small', 'little', 'mini', 'tiny'],
    '中': ['medium', 'regular', 'normal'],
    '大': ['large', 'big', 'huge'],
    '特大': ['extra large', 'jumbo', 'giant']
  };
  
  for (const concept of concepts) {
    const name = concept.name.toLowerCase();
    for (const [size, keywords] of Object.entries(sizeKeywords)) {
      if (keywords.some(keyword => name.includes(keyword))) {
        return size;
      }
    }
  }
  
  return '中'; // デフォルト
}

// 器のタイプを検出
function detectDishType(concepts) {
  const dishKeywords = {
    '茶碗': ['rice bowl', 'bowl', 'chawan'],
    '丼': ['donburi', 'large bowl'],
    '皿': ['plate', 'dish'],
    'プレート': ['plate', 'platter'],
    'ボウル': ['bowl', 'soup bowl']
  };
  
  for (const concept of concepts) {
    const name = concept.name.toLowerCase();
    for (const [dish, keywords] of Object.entries(dishKeywords)) {
      if (keywords.some(keyword => name.includes(keyword))) {
        return dish;
      }
    }
  }
  
  return '皿'; // デフォルト
}

// 調理方法を検出
function detectCookingMethod(concepts) {
  const cookingKeywords = {
    '生': ['raw', 'fresh', 'sashimi'],
    '茹で': ['boiled', 'boil'],
    '蒸し': ['steamed', 'steam'],
    '焼き': ['grilled', 'roasted', 'baked'],
    '炒め': ['stir-fried', 'fried', 'sauteed'],
    '揚げ': ['deep-fried', 'tempura', 'fried'],
    '煮込み': ['stewed', 'simmered', 'curry']
  };
  
  for (const concept of concepts) {
    const name = concept.name.toLowerCase();
    for (const [method, keywords] of Object.entries(cookingKeywords)) {
      if (keywords.some(keyword => name.includes(keyword))) {
        return method;
      }
    }
  }
  
  return '生'; // デフォルト
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
      replyText = `🍽️ MealAnalyzer 高精度版の使い方

📸 食事の写真を送ると：
1. AIが食品を認識
2. 量を自動推定
3. 調理方法を判定
4. 詳細な栄養計算
5. バランス評価

🎯 対応している食品：
• 主食（ご飯、パン、麺類）
• 主菜（肉、魚、卵、豆腐）
• 副菜（野菜、サラダ）
• 汁物（みそ汁、スープ）
• その他多数！

💡 より正確な結果のコツ：
• 料理全体が写るように撮影
• 明るい場所で撮影
• 箸やスプーンを一緒に撮ると量の推定精度UP！`;
    } else {
      replyText = '食事の写真を送ってください！高精度AIが詳細な栄養情報を分析します 📸🤖';
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
      text: '🔍 高精度AIが画像を分析中...\n📊 栄養データベースと照合中...\n⏳ もう少しお待ちください！'
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
    
    // 栄養情報を計算（高精度版）
    const nutrition = calculateNutrition(
      analysisResult.foods,
      analysisResult.servingData.cookingMethod,
      analysisResult.servingData
    );
    
    // 栄養バランスを評価
    const evaluation = evaluateNutrition(nutrition);
    
    // 詳細な結果を作成
    const detailsText = nutrition.details
      .map(item => `${item.name}(${item.serving}g)`)
      .join('、');
    
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
              text: '🍽️ 高精度栄養分析結果',
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
                  contents: [
                    {
                      type: 'text',
                      text: '調理法',
                      size: 'xs',
                      color: '#555555'
                    },
                    {
                      type: 'text',
                      text: analysisResult.servingData.cookingMethod,
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
              text: `🤖 AI信頼度: ${Math.round(analysisResult.topConfidence * 100)}% | 📊 日本食品標準成分表準拠`,
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
  console.log('MealAnalyzer Bot with Advanced Nutrition Analysis is ready! 🍽️🤖📊');
});
