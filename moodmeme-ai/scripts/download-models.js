// scripts/download-models.js
const fs = require('fs');
const path = require('path');
const https = require('https');

const MODELS_DIR = path.join(__dirname, '..', 'public', 'models');
const MODELS_BASE_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

const MODELS = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_expression_model-weights_manifest.json',
  'face_expression_model-shard1'
];

// 모델 디렉토리 생성
if (!fs.existsSync(MODELS_DIR)) {
  fs.mkdirSync(MODELS_DIR, { recursive: true });
  console.log('✅ Created models directory');
}

// 모델 다운로드 함수
function downloadModel(modelName) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(MODELS_DIR, modelName);
    
    // 이미 존재하면 스킵
    if (fs.existsSync(filePath)) {
      console.log(`⏭️  ${modelName} already exists, skipping...`);
      resolve();
      return;
    }
    
    const file = fs.createWriteStream(filePath);
    const url = `${MODELS_BASE_URL}/${modelName}`;
    
    console.log(`📥 Downloading ${modelName}...`);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${modelName}: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded ${modelName}`);
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(filePath, () => {}); // 실패 시 파일 삭제
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// 모든 모델 다운로드
async function downloadAllModels() {
  console.log('🚀 Starting face-api.js models download...');
  console.log(`📁 Models will be saved to: ${MODELS_DIR}`);
  
  try {
    for (const model of MODELS) {
      await downloadModel(model);
    }
    
    console.log('\n🎉 All models downloaded successfully!');
    console.log('🔧 Face-api.js is now ready for emotion analysis');
    
    // 모델 정보 파일 생성
    const modelInfo = {
      downloadedAt: new Date().toISOString(),
      models: MODELS,
      version: 'face-api.js v0.22.2',
      description: 'Pre-trained models for face detection and emotion recognition'
    };
    
    fs.writeFileSync(
      path.join(MODELS_DIR, 'model-info.json'),
      JSON.stringify(modelInfo, null, 2)
    );
    
    console.log('📋 Created model-info.json');
    
  } catch (error) {
    console.error('❌ Error downloading models:', error.message);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  downloadAllModels();
}

module.exports = { downloadAllModels };