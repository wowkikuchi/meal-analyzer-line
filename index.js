// 必要なものを準備
const express = require('express');
const line = require('@line/bot-sdk');
const axios = require('axios');
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

// 画像を分析する関数
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
    
    // Clarifai APIにリクエスト
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
    
    // 結果を解析
    const outputs = clarifaiResponse.data.outputs[0];
    const concepts = outputs.data.concepts || [];
    
    // 信頼度の高い食べ物を取得（上位5個）
    const detectedFoods = concepts
      .filter(concept => concept.value > 0.5)
      .slice(0, 5)
      .map(concept => ({
        name: concept.name,
        confidence: concept.value
      }));
    
    return {
      success: true,
      foods: detectedFoods,
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

// 栄養情報を推定する関数
function estimateNutrition(foods) {
  // 食べ物ごとの栄養データ（100gあたり）
  const nutritionDB = {
    // ご飯・麺類
    'rice': { name: 'ご飯', calories: 168, protein: 2.5, carbs: 37.1, fat: 0.3 },
    'white rice': { name: '白米', calories: 168, protein: 2.5, carbs: 37.1, fat: 0.3 },
    'fried rice': { name: 'チャーハン', calories: 181, protein: 4.0, carbs: 29.0, fat: 5.0 },
    'noodle': { name: '麺', calories: 140, protein: 5.0, carbs: 28.0, fat: 0.5 },
    'ramen': { name: 'ラーメン', calories: 445, protein: 21.0, carbs: 61.0, fat: 16.0 },
    'pasta': { name: 'パスタ', calories: 165, protein: 5.5, carbs: 32.0, fat: 0.9 },
    'spaghetti': { name: 'スパゲッティ', calories: 165, protein: 5.5, carbs: 32.0, fat: 0.9 },
    'udon': { name: 'うどん', calories: 105, protein: 2.6, carbs: 21.6, fat: 0.4 },
    'soba': { name: 'そば', calories: 114, protein: 4.8, carbs: 22.0, fat: 0.7 },
    
    // パン類
    'bread': { name: 'パン', calories: 264, protein: 8.0, carbs: 46.0, fat: 4.5 },
    'sandwich': { name: 'サンドイッチ', calories: 250, protein: 10.0, carbs: 30.0, fat: 10.0 },
    'pizza': { name: 'ピザ', calories: 266, protein: 11.0, carbs: 33.0, fat: 10.0 },
    'hamburger': { name: 'ハンバーガー', calories: 295, protein: 15.0, carbs: 30.0, fat: 13.0 },
    
    // 肉類
    'meat': { name: '肉', calories: 250, protein: 20.0, carbs: 0, fat: 18.0 },
    'chicken': { name: '鶏肉', calories: 190, protein: 20.0, carbs: 0, fat: 11.0 },
    'beef': { name: '牛肉', calories: 288, protein: 19.0, carbs: 0, fat: 23.0 },
    'pork': { name: '豚肉', calories: 242, protein: 18.0, carbs: 0, fat: 18.0 },
    'steak': { name: 'ステーキ', calories: 271, protein: 25.0, carbs: 0, fat: 19.0 },
    
    // 魚介類
    'fish': { name: '魚', calories: 140, protein: 20.0, carbs: 0, fat: 6.0 },
    'salmon': { name: 'サーモン', calories: 208, protein: 20.0, carbs: 0, fat: 13.0 },
    'sushi': { name: '寿司', calories: 150, protein: 8.0, carbs: 20.0, fat: 3.0 },
    'sashimi': { name: '刺身', calories: 120, protein: 20.0, carbs: 0, fat: 4.0 },
    
    // 野菜・サラダ
    'vegetable': { name: '野菜', calories: 30, protein: 1.5, carbs: 6.0, fat: 0.2 },
    'salad': { name: 'サラダ', calories: 40, protein: 2.0, carbs: 7.0, fat: 0.5 },
    'tomato': { name: 'トマト', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
    'lettuce': { name: 'レタス', calories: 12, protein: 0.6, carbs: 2.2, fat: 0.1 },
    
    // デザート・フルーツ
    'dessert': { name: 'デザート', calories: 300, protein: 4.0, carbs: 40.0, fat: 15.0 },
    'cake': { name: 'ケーキ', calories: 350, protein: 5.0, carbs: 45.0, fat: 18.0 },
    'ice cream': { name: 'アイスクリーム', calories: 207, protein: 3.5, carbs: 24.0, fat: 11.0 },
    'fruit': { name: 'フルーツ', calories: 60, protein: 1.0, carbs: 15.0, fat: 0.3 },
    'apple': { name: 'りんご', calories: 52, protein: 0.3, carbs: 14.0, fat: 0.2 },
    
    // その他
    'egg': { name: '卵', calories: 155, protein: 13.0, carbs: 1.1, fat: 11.0 },
    'cheese': { name: 'チーズ', calories: 402, protein: 25.0, carbs: 1.3, fat: 33.0 },
    'soup': { name: 'スープ', calories: 50, protein: 2.0, carbs: 7.0, fat: 1.5 },
    'curry': { name: 'カレー', calories: 180, protein: 6.0, carbs: 20.0, fat: 8.0 }
  };
  
  let totalNutrition = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    items: []
  };
  
  // 検出された食べ物から栄養を計算
  foods.forEach(food => {
    const foodName = food.name.toLowerCase();
    
    // 完全一致を探す
    if (nutritionDB[foodName]) {
      const nutrition = nutritionDB[foodName];
      totalNutrition.calories += nutrition.calories;
      totalNutrition.protein += nutrition.protein;
      totalNutrition.carbs += nutrition.carbs;
      totalNutrition.fat += nutrition.fat;
      totalNutrition.items.push(nutrition.name);
    } else {
      // 部分一致を探す
      Object.keys(nutritionDB).forEach(key => {
        if (foodName.includes(key) || key.includes(foodName)) {
          const nutrition = nutritionDB[key];
          totalNutrition.calories += nutrition.calories;
          totalNutrition.protein += nutrition.protein;
          totalNutrition.carbs += nutrition.carbs;
          totalNutrition.fat += nutrition.fat;
          totalNutrition.items.push(nutrition.name);
        }
      });
    }
  });
  
  // 何も検出されなかった場合のデフォルト値
  if (totalNutrition.calories === 0) {
    totalNutrition = {
      calories: 300,
      protein: 15,
      carbs: 40,
      fat: 10,
      items: ['食事']
    };
  }
  
  return totalNutrition;
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
      replyText = `🍽️ MealAnalyzerの使い方

1. 食事の写真を送ってね！
2. AIが食べ物を認識するよ！
3. カロリーと栄養を教えるよ！

📸 写真を送ってみてね！

💡 認識できる食べ物の例：
・ご飯、パン、麺類
・肉、魚、野菜
・デザート、フルーツ
・和食、洋食、中華など`;
    } else {
      replyText = '食事の写真を送ってください！AIが栄養情報を分析します 📸🤖';
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
      text: '🔍 AIが画像を分析中... しばらくお待ちください！'
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
    
    // 栄養情報を推定
    const nutrition = estimateNutrition(analysisResult.foods);
    
    // 検出された食べ物のリスト
    const foodsList = analysisResult.foods
      .map((food, index) => `${index + 1}. ${food.name} (${Math.round(food.confidence * 100)}%)`)
      .join('\n');
    
    // 結果を返信
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
              text: '🍽️ AI栄養分析結果',
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
              text: '🤖 検出された食べ物',
              weight: 'bold',
              margin: 'md'
            },
            {
              type: 'text',
              text: nutrition.items.join('、') || '食事',
              wrap: true,
              color: '#666666',
              margin: 'sm'
            },
            {
              type: 'separator',
              margin: 'lg'
            },
            {
              type: 'text',
              text: `推定カロリー: ${Math.round(nutrition.calories)}kcal`,
              margin: 'lg',
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
                      text: `${Math.round(nutrition.protein)}g`,
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
                      text: `${Math.round(nutrition.carbs)}g`,
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
                      text: `${Math.round(nutrition.fat)}g`,
                      size: 'sm',
                      weight: 'bold'
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
              text: '📊 詳細な検出結果',
              margin: 'lg',
              size: 'sm',
              color: '#666666'
            },
            {
              type: 'text',
              text: foodsList || '食べ物を検出中...',
              margin: 'sm',
              size: 'xs',
              color: '#999999',
              wrap: true
            }
          ]
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: `🤖 AI信頼度: ${Math.round(analysisResult.topConfidence * 100)}%`,
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
  console.log('MealAnalyzer Bot with Clarifai AI is ready! 🍽️🤖');
});
