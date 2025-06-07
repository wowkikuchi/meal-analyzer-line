// 日本食品標準成分表ベースの栄養データベース
const nutritionDatabase = {
  // === カレー関連（最優先） ===
  'curry': { 
    serving: 300,
    nutrients: { calories: 450, protein: 15.0, fat: 18.0, carbs: 60.0, fiber: 3.0, salt: 3.0 }
  },
  'curry rice': { 
    serving: 450,
    nutrients: { calories: 702, protein: 18.8, fat: 18.5, carbs: 115.7, fiber: 3.5, salt: 3.0 }
  },
  'japanese curry': { 
    serving: 450,
    nutrients: { calories: 702, protein: 18.8, fat: 18.5, carbs: 115.7, fiber: 3.5, salt: 3.0 }
  },
  'rice': { 
    serving: 150,
    nutrients: { calories: 252, protein: 3.8, fat: 0.5, carbs: 55.7, fiber: 0.5, salt: 0 }
  },
  
  // === 主食類 ===
  'ごはん': { 
    serving: 150, // 茶碗1杯
    nutrients: { calories: 252, protein: 3.8, fat: 0.5, carbs: 55.7, fiber: 0.5, salt: 0 }
  },
  '白米': { 
    serving: 150,
    nutrients: { calories: 252, protein: 3.8, fat: 0.5, carbs: 55.7, fiber: 0.5, salt: 0 }
  },
  '玄米': { 
    serving: 150,
    nutrients: { calories: 248, protein: 4.2, fat: 1.5, carbs: 53.4, fiber: 2.1, salt: 0 }
  },
  'おにぎり': { 
    serving: 100,
    nutrients: { calories: 168, protein: 2.5, fat: 0.3, carbs: 37.1, fiber: 0.3, salt: 0.5 }
  },
  'チャーハン': { 
    serving: 200,
    nutrients: { calories: 340, protein: 8.0, fat: 12.0, carbs: 48.0, fiber: 1.0, salt: 2.0 }
  },
  'fried rice': { 
    serving: 200,
    nutrients: { calories: 340, protein: 8.0, fat: 12.0, carbs: 48.0, fiber: 1.0, salt: 2.0 }
  },
  'bread': { 
    serving: 60,
    nutrients: { calories: 158, protein: 5.6, fat: 2.6, carbs: 28.0, fiber: 1.4, salt: 0.8 }
  },
  'パン': { 
    serving: 60, // 6枚切り1枚
    nutrients: { calories: 158, protein: 5.6, fat: 2.6, carbs: 28.0, fiber: 1.4, salt: 0.8 }
  },
  '食パン': { 
    serving: 60,
    nutrients: { calories: 158, protein: 5.6, fat: 2.6, carbs: 28.0, fiber: 1.4, salt: 0.8 }
  },
  
  // === 麺類 ===
  'noodle': { 
    serving: 250,
    nutrients: { calories: 280, protein: 8.0, fat: 1.0, carbs: 55.0, fiber: 2.0, salt: 0.5 }
  },
  'うどん': { 
    serving: 250, // 1玉
    nutrients: { calories: 263, protein: 6.5, fat: 1.0, carbs: 54.0, fiber: 2.0, salt: 0.8 }
  },
  'udon': { 
    serving: 250,
    nutrients: { calories: 263, protein: 6.5, fat: 1.0, carbs: 54.0, fiber: 2.0, salt: 0.8 }
  },
  'そば': { 
    serving: 200,
    nutrients: { calories: 228, protein: 9.6, fat: 1.4, carbs: 44.0, fiber: 4.0, salt: 0 }
  },
  'soba': { 
    serving: 200,
    nutrients: { calories: 228, protein: 9.6, fat: 1.4, carbs: 44.0, fiber: 4.0, salt: 0 }
  },
  'ラーメン': { 
    serving: 300,
    nutrients: { calories: 445, protein: 21.0, fat: 16.0, carbs: 61.0, fiber: 2.0, salt: 5.5 }
  },
  'ramen': { 
    serving: 300,
    nutrients: { calories: 445, protein: 21.0, fat: 16.0, carbs: 61.0, fiber: 2.0, salt: 5.5 }
  },
  'pasta': { 
    serving: 250,
    nutrients: { calories: 373, protein: 13.0, fat: 2.3, carbs: 71.5, fiber: 3.8, salt: 0 }
  },
  'パスタ': { 
    serving: 250,
    nutrients: { calories: 373, protein: 13.0, fat: 2.3, carbs: 71.5, fiber: 3.8, salt: 0 }
  },
  'スパゲッティ': { 
    serving: 250,
    nutrients: { calories: 373, protein: 13.0, fat: 2.3, carbs: 71.5, fiber: 3.8, salt: 0 }
  },
  'spaghetti': { 
    serving: 250,
    nutrients: { calories: 373, protein: 13.0, fat: 2.3, carbs: 71.5, fiber: 3.8, salt: 0 }
  },
  
  // === 肉類 ===
  'meat': { 
    serving: 100,
    nutrients: { calories: 250, protein: 20.0, fat: 18.0, carbs: 0, fiber: 0, salt: 0.1 }
  },
  'chicken': { 
    serving: 100,
    nutrients: { calories: 190, protein: 20.0, fat: 11.0, carbs: 0, fiber: 0, salt: 0.1 }
  },
  '鶏肉': { 
    serving: 100,
    nutrients: { calories: 190, protein: 20.0, fat: 11.0, carbs: 0, fiber: 0, salt: 0.1 }
  },
  '鶏もも肉': { 
    serving: 100,
    nutrients: { calories: 200, protein: 16.2, fat: 14.0, carbs: 0, fiber: 0, salt: 0.1 }
  },
  '鶏むね肉': { 
    serving: 100,
    nutrients: { calories: 108, protein: 22.3, fat: 1.5, carbs: 0, fiber: 0, salt: 0.1 }
  },
  'pork': { 
    serving: 100,
    nutrients: { calories: 242, protein: 18.5, fat: 18.5, carbs: 0.2, fiber: 0, salt: 0.1 }
  },
  '豚肉': { 
    serving: 100,
    nutrients: { calories: 242, protein: 18.5, fat: 18.5, carbs: 0.2, fiber: 0, salt: 0.1 }
  },
  '豚バラ肉': { 
    serving: 100,
    nutrients: { calories: 386, protein: 14.2, fat: 34.6, carbs: 0.1, fiber: 0, salt: 0.1 }
  },
  'beef': { 
    serving: 100,
    nutrients: { calories: 288, protein: 17.1, fat: 23.7, carbs: 0.3, fiber: 0, salt: 0.1 }
  },
  '牛肉': { 
    serving: 100,
    nutrients: { calories: 288, protein: 17.1, fat: 23.7, carbs: 0.3, fiber: 0, salt: 0.1 }
  },
  'hamburger': { 
    serving: 120,
    nutrients: { calories: 268, protein: 15.8, fat: 20.4, carbs: 7.8, fiber: 0.5, salt: 1.2 }
  },
  'ハンバーグ': { 
    serving: 120,
    nutrients: { calories: 268, protein: 15.8, fat: 20.4, carbs: 7.8, fiber: 0.5, salt: 1.2 }
  },
  
  // === 魚介類 ===
  'fish': { 
    serving: 100,
    nutrients: { calories: 140, protein: 20.0, fat: 6.0, carbs: 0, fiber: 0, salt: 0.3 }
  },
  '魚': { 
    serving: 100,
    nutrients: { calories: 140, protein: 20.0, fat: 6.0, carbs: 0, fiber: 0, salt: 0.3 }
  },
  'salmon': { 
    serving: 100,
    nutrients: { calories: 208, protein: 20.5, fat: 13.4, carbs: 0, fiber: 0, salt: 0.1 }
  },
  'サーモン': { 
    serving: 100,
    nutrients: { calories: 208, protein: 20.5, fat: 13.4, carbs: 0, fiber: 0, salt: 0.1 }
  },
  '鮭': { 
    serving: 100,
    nutrients: { calories: 133, protein: 22.3, fat: 4.1, carbs: 0, fiber: 0, salt: 0.1 }
  },
  'tuna': { 
    serving: 100,
    nutrients: { calories: 125, protein: 26.4, fat: 1.4, carbs: 0, fiber: 0, salt: 0.1 }
  },
  'まぐろ': { 
    serving: 100,
    nutrients: { calories: 125, protein: 26.4, fat: 1.4, carbs: 0, fiber: 0, salt: 0.1 }
  },
  'さば': { 
    serving: 100,
    nutrients: { calories: 202, protein: 20.7, fat: 12.1, carbs: 0, fiber: 0, salt: 0.3 }
  },
  'sashimi': { 
    serving: 100,
    nutrients: { calories: 120, protein: 20.0, fat: 4.0, carbs: 0, fiber: 0, salt: 0.2 }
  },
  '刺身': { 
    serving: 100,
    nutrients: { calories: 120, protein: 20.0, fat: 4.0, carbs: 0, fiber: 0, salt: 0.2 }
  },
  'sushi': { 
    serving: 200,
    nutrients: { calories: 300, protein: 16.0, fat: 6.0, carbs: 40.0, fiber: 0.5, salt: 2.0 }
  },
  '寿司': { 
    serving: 200, // 10貫
    nutrients: { calories: 300, protein: 16.0, fat: 6.0, carbs: 40.0, fiber: 0.5, salt: 2.0 }
  },
  
  // === 卵・乳製品 ===
  'egg': { 
    serving: 50,
    nutrients: { calories: 76, protein: 6.2, fat: 5.2, carbs: 0.2, fiber: 0, salt: 0.2 }
  },
  '卵': { 
    serving: 50, // 1個
    nutrients: { calories: 76, protein: 6.2, fat: 5.2, carbs: 0.2, fiber: 0, salt: 0.2 }
  },
  '目玉焼き': { 
    serving: 50,
    nutrients: { calories: 90, protein: 6.2, fat: 7.0, carbs: 0.2, fiber: 0, salt: 0.3 }
  },
  'milk': { 
    serving: 200,
    nutrients: { calories: 134, protein: 6.6, fat: 7.6, carbs: 9.6, fiber: 0, salt: 0.2 }
  },
  '牛乳': { 
    serving: 200,
    nutrients: { calories: 134, protein: 6.6, fat: 7.6, carbs: 9.6, fiber: 0, salt: 0.2 }
  },
  'cheese': { 
    serving: 20,
    nutrients: { calories: 68, protein: 4.5, fat: 5.2, carbs: 0.3, fiber: 0, salt: 0.4 }
  },
  'チーズ': { 
    serving: 20,
    nutrients: { calories: 68, protein: 4.5, fat: 5.2, carbs: 0.3, fiber: 0, salt: 0.4 }
  },
  
  // === 野菜類 ===
  'vegetable': { 
    serving: 100,
    nutrients: { calories: 30, protein: 1.5, fat: 0.2, carbs: 6.0, fiber: 2.0, salt: 0 }
  },
  'salad': { 
    serving: 100,
    nutrients: { calories: 20, protein: 1.0, fat: 0.2, carbs: 4.0, fiber: 2.0, salt: 0 }
  },
  'サラダ': { 
    serving: 100,
    nutrients: { calories: 20, protein: 1.0, fat: 0.2, carbs: 4.0, fiber: 2.0, salt: 0 }
  },
  'cabbage': { 
    serving: 100,
    nutrients: { calories: 23, protein: 1.3, fat: 0.2, carbs: 5.2, fiber: 1.8, salt: 0 }
  },
  'キャベツ': { 
    serving: 100,
    nutrients: { calories: 23, protein: 1.3, fat: 0.2, carbs: 5.2, fiber: 1.8, salt: 0 }
  },
  'tomato': { 
    serving: 150,
    nutrients: { calories: 29, protein: 1.1, fat: 0.2, carbs: 5.9, fiber: 1.5, salt: 0 }
  },
  'トマト': { 
    serving: 150,
    nutrients: { calories: 29, protein: 1.1, fat: 0.2, carbs: 5.9, fiber: 1.5, salt: 0 }
  },
  'cucumber': { 
    serving: 100,
    nutrients: { calories: 14, protein: 1.0, fat: 0.1, carbs: 3.0, fiber: 1.1, salt: 0 }
  },
  'きゅうり': { 
    serving: 100,
    nutrients: { calories: 14, protein: 1.0, fat: 0.1, carbs: 3.0, fiber: 1.1, salt: 0 }
  },
  'carrot': { 
    serving: 100,
    nutrients: { calories: 37, protein: 0.6, fat: 0.1, carbs: 8.7, fiber: 2.5, salt: 0.1 }
  },
  'にんじん': { 
    serving: 100,
    nutrients: { calories: 37, protein: 0.6, fat: 0.1, carbs: 8.7, fiber: 2.5, salt: 0.1 }
  },
  
  // === 料理 ===
  'カレー': { 
    serving: 300,
    nutrients: { calories: 450, protein: 15.0, fat: 18.0, carbs: 60.0, fiber: 3.0, salt: 3.0 }
  },
  'カレーライス': { 
    serving: 450,
    nutrients: { calories: 702, protein: 18.8, fat: 18.5, carbs: 115.7, fiber: 3.5, salt: 3.0 }
  },
  '親子丼': { 
    serving: 400,
    nutrients: { calories: 620, protein: 28.0, fat: 18.0, carbs: 82.0, fiber: 1.0, salt: 3.5 }
  },
  'oyakodon': { 
    serving: 400,
    nutrients: { calories: 620, protein: 28.0, fat: 18.0, carbs: 82.0, fiber: 1.0, salt: 3.5 }
  },
  '牛丼': { 
    serving: 400,
    nutrients: { calories: 680, protein: 25.0, fat: 22.0, carbs: 88.0, fiber: 1.0, salt: 3.0 }
  },
  'gyudon': { 
    serving: 400,
    nutrients: { calories: 680, protein: 25.0, fat: 22.0, carbs: 88.0, fiber: 1.0, salt: 3.0 }
  },
  'tempura': { 
    serving: 150,
    nutrients: { calories: 300, protein: 10.0, fat: 18.0, carbs: 25.0, fiber: 1.0, salt: 1.0 }
  },
  '天ぷら': { 
    serving: 150,
    nutrients: { calories: 300, protein: 10.0, fat: 18.0, carbs: 25.0, fiber: 1.0, salt: 1.0 }
  },
  'miso soup': { 
    serving: 150,
    nutrients: { calories: 40, protein: 3.0, fat: 1.2, carbs: 5.0, fiber: 1.0, salt: 1.5 }
  },
  'みそ汁': { 
    serving: 150,
    nutrients: { calories: 40, protein: 3.0, fat: 1.2, carbs: 5.0, fiber: 1.0, salt: 1.5 }
  },
  '味噌汁': { 
    serving: 150,
    nutrients: { calories: 40, protein: 3.0, fat: 1.2, carbs: 5.0, fiber: 1.0, salt: 1.5 }
  },
  
  // === デザート・フルーツ ===
  'dessert': { 
    serving: 100,
    nutrients: { calories: 300, protein: 4.0, fat: 15.0, carbs: 40.0, fiber: 1.0, salt: 0.2 }
  },
  'cake': { 
    serving: 100,
    nutrients: { calories: 350, protein: 5.0, fat: 18.0, carbs: 45.0, fiber: 1.0, salt: 0.3 }
  },
  'ice cream': { 
    serving: 100,
    nutrients: { calories: 207, protein: 3.5, fat: 11.0, carbs: 24.0, fiber: 0, salt: 0.1 }
  },
  'fruit': { 
    serving: 150,
    nutrients: { calories: 60, protein: 1.0, fat: 0.3, carbs: 15.0, fiber: 2.0, salt: 0 }
  },
  'apple': { 
    serving: 200,
    nutrients: { calories: 104, protein: 0.6, fat: 0.4, carbs: 28.0, fiber: 4.8, salt: 0 }
  },
  
  // === その他の食品 ===
  'soup': { 
    serving: 200,
    nutrients: { calories: 50, protein: 2.0, fat: 1.5, carbs: 7.0, fiber: 1.0, salt: 1.2 }
  },
  'pizza': { 
    serving: 100,
    nutrients: { calories: 266, protein: 11.0, fat: 10.0, carbs: 33.0, fiber: 2.0, salt: 1.5 }
  },
  'sandwich': { 
    serving: 150,
    nutrients: { calories: 250, protein: 10.0, fat: 10.0, carbs: 30.0, fiber: 2.0, salt: 1.5 }
  },
  'steak': { 
    serving: 150,
    nutrients: { calories: 406, protein: 37.5, fat: 28.5, carbs: 0.5, fiber: 0, salt: 0.2 }
  }
};

// 調理方法による栄養価の変化係数
const cookingMethods = {
  '生': { calories: 1.0, fat: 1.0, protein: 1.0, carbs: 1.0 },
  '茹で': { calories: 0.95, fat: 0.9, protein: 0.95, carbs: 0.95 },
  '蒸し': { calories: 0.98, fat: 0.95, protein: 0.98, carbs: 0.98 },
  '焼き': { calories: 1.05, fat: 0.85, protein: 1.0, carbs: 1.0 },
  '炒め': { calories: 1.2, fat: 1.5, protein: 1.0, carbs: 1.0 },
  '揚げ': { calories: 1.5, fat: 2.5, protein: 0.95, carbs: 1.1 },
  '煮込み': { calories: 1.1, fat: 1.2, protein: 0.9, carbs: 1.0 }
};

// 量の推定（画像サイズと器のタイプから推定）
function estimateServing(foodType, visualData) {
  const defaultServing = nutritionDatabase[foodType]?.serving || 100;
  
  // 視覚的な手がかりから量を推定
  const sizeMultipliers = {
    '小': 0.7,
    '中': 1.0,
    '大': 1.3,
    '特大': 1.6
  };
  
  // 器のタイプによる補正
  const dishMultipliers = {
    '茶碗': 1.0,
    '丼': 1.5,
    '皿': 0.8,
    'プレート': 1.2,
    'ボウル': 1.3
  };
  
  let multiplier = 1.0;
  
  // AIの認識結果から量を推定
  if (visualData.size) {
    multiplier *= sizeMultipliers[visualData.size] || 1.0;
  }
  
  if (visualData.dish) {
    multiplier *= dishMultipliers[visualData.dish] || 1.0;
  }
  
  return Math.round(defaultServing * multiplier);
}

// 栄養計算のメイン関数
function calculateNutrition(foods, cookingMethod = '生', servingData = {}) {
  console.log('=== 栄養計算開始 ===');
  console.log('検出された食品:', foods);
  console.log('調理方法:', cookingMethod);
  console.log('サービングデータ:', servingData);
  
  let totalNutrition = {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0,
    salt: 0,
    details: []
  };
  
  foods.forEach(food => {
    const foodName = food.name.toLowerCase();
    console.log(`\n食品を検索中: "${foodName}"`);
    
    let foodData = null;
    let matchedName = '';
    
    // 完全一致を最初に試す
    if (nutritionDatabase[foodName]) {
      foodData = nutritionDatabase[foodName];
      matchedName = foodName;
      console.log(`完全一致: ${matchedName}`);
    } else {
      // 部分一致を探す
      Object.keys(nutritionDatabase).forEach(key => {
        if (!foodData && (foodName.includes(key) || key.includes(foodName))) {
          foodData = nutritionDatabase[key];
          matchedName = key;
          console.log(`部分一致: ${matchedName}`);
        }
      });
    }
    
    if (foodData) {
      // 量を推定
      const estimatedServing = estimateServing(matchedName, servingData);
      const servingRatio = estimatedServing / foodData.serving;
      
      // 調理方法による補正
      const method = cookingMethods[cookingMethod] || cookingMethods['生'];
      
      // 栄養素を計算
      const nutrition = {
        name: matchedName,
        serving: estimatedServing,
        calories: Math.round(foodData.nutrients.calories * servingRatio * method.calories),
        protein: Math.round(foodData.nutrients.protein * servingRatio * method.protein * 10) / 10,
        fat: Math.round(foodData.nutrients.fat * servingRatio * method.fat * 10) / 10,
        carbs: Math.round(foodData.nutrients.carbs * servingRatio * method.carbs * 10) / 10,
        fiber: Math.round(foodData.nutrients.fiber * servingRatio * 10) / 10,
        salt: Math.round(foodData.nutrients.salt * servingRatio * 10) / 10
      };
      
      console.log(`計算結果:`, nutrition);
      
      // 合計に加算
      totalNutrition.calories += nutrition.calories;
      totalNutrition.protein += nutrition.protein;
      totalNutrition.fat += nutrition.fat;
      totalNutrition.carbs += nutrition.carbs;
      totalNutrition.fiber += nutrition.fiber;
      totalNutrition.salt += nutrition.salt;
      
      totalNutrition.details.push(nutrition);
    } else {
      console.log(`"${foodName}" の栄養データが見つかりません`);
    }
  });
  
  // 何も見つからなかった場合のフォールバック
  if (totalNutrition.details.length === 0) {
    console.log('警告: 栄養データが見つかりませんでした。デフォルト値を使用します。');
    
    // 一般的な食事のデフォルト値
    totalNutrition = {
      calories: 500,
      protein: 20,
      fat: 15,
      carbs: 70,
      fiber: 3,
      salt: 2,
      details: [{
        name: '推定値',
        serving: 300,
        calories: 500,
        protein: 20,
        fat: 15,
        carbs: 70,
        fiber: 3,
        salt: 2
      }]
    };
  }
  
  // 合計値を丸める
  totalNutrition.calories = Math.round(totalNutrition.calories);
  totalNutrition.protein = Math.round(totalNutrition.protein * 10) / 10;
  totalNutrition.fat = Math.round(totalNutrition.fat * 10) / 10;
  totalNutrition.carbs = Math.round(totalNutrition.carbs * 10) / 10;
  totalNutrition.fiber = Math.round(totalNutrition.fiber * 10) / 10;
  totalNutrition.salt = Math.round(totalNutrition.salt * 10) / 10;
  
  console.log('\n=== 栄養計算完了 ===');
  console.log('合計栄養:', totalNutrition);
  
  return totalNutrition;
}

// 栄養バランスの評価
function evaluateNutrition(nutrition) {
  const evaluation = {
    overall: '',
    details: [],
    score: 0
  };
  
  // 1食あたりの推奨値（成人）
  const recommendations = {
    calories: { min: 500, max: 800 },
    protein: { min: 15, max: 35 },
    fat: { min: 15, max: 30 },
    carbs: { min: 65, max: 130 },
    fiber: { min: 6, max: 10 },
    salt: { min: 0, max: 2.5 }
  };
  
  // 各栄養素の評価
  let totalScore = 0;
  let scoreCount = 0;
  
  Object.keys(recommendations).forEach(nutrient => {
    const value = nutrition[nutrient];
    const range = recommendations[nutrient];
    
    if (value >= range.min && value <= range.max) {
      totalScore += 100;
      evaluation.details.push(`${nutrient}: 適正 ✅`);
    } else if (value < range.min) {
      const score = (value / range.min) * 100;
      totalScore += score;
      evaluation.details.push(`${nutrient}: 不足 ⚠️`);
    } else {
      const score = Math.max(0, 100 - ((value - range.max) / range.max) * 100);
      totalScore += score;
      evaluation.details.push(`${nutrient}: 過多 ⚠️`);
    }
    scoreCount++;
  });
  
  evaluation.score = Math.round(totalScore / scoreCount);
  
  // 総合評価
  if (evaluation.score >= 80) {
    evaluation.overall = '非常にバランスが良い食事です！🌟';
  } else if (evaluation.score >= 60) {
    evaluation.overall = 'まずまずバランスの取れた食事です 👍';
  } else if (evaluation.score >= 40) {
    evaluation.overall = 'もう少しバランスを意識しましょう 💪';
  } else {
    evaluation.overall = 'バランスの改善が必要です 📝';
  }
  
  return evaluation;
}

module.exports = {
  calculateNutrition,
  evaluateNutrition,
  estimateServing,
  nutritionDatabase,
  cookingMethods
};
