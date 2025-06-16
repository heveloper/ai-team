// src/utils/emotionAnalysis.js
import * as faceapi from 'face-api.js';

export class EmotionAnalyzer {
  constructor() {
    this.isModelLoaded = false;
    this.modelLoadPromise = this.loadModels();
  }

  async loadModels() {
    try {
      // face-api.js 모델 로드
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.faceExpressionNet.loadFromUri('/models');
      
      this.isModelLoaded = true;
      console.log('✅ Face-api.js 모델 로드 완료');
      return true;
    } catch (error) {
      console.warn('⚠️ Face-api.js 모델 로드 실패, 대체 분석 사용:', error);
      return false;
    }
  }

  async analyzeEmotion(imageElement) {
    // 모델 로드 완료까지 대기
    await this.modelLoadPromise;

    if (this.isModelLoaded) {
      return await this.analyzeFaceAPI(imageElement);
    } else {
      return await this.analyzePixelBased(imageElement);
    }
  }

  // Face-api.js를 사용한 실제 얼굴 감정 분석
  async analyzeFaceAPI(imageElement) {
    try {
      const detections = await faceapi
        .detectAllFaces(imageElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      if (detections.length === 0) {
        throw new Error('얼굴을 감지할 수 없습니다');
      }

      const expressions = detections[0].expressions;
      
      // 가장 높은 확률의 감정 찾기
      const emotions = Object.keys(expressions);
      let maxEmotion = emotions[0];
      let maxConfidence = expressions[maxEmotion];

      emotions.forEach(emotion => {
        if (expressions[emotion] > maxConfidence) {
          maxEmotion = emotion;
          maxConfidence = expressions[emotion];
        }
      });

      // face-api.js 감정을 우리 시스템에 매핑
      const emotionMapping = {
        happy: 'happy',
        sad: 'sad',
        angry: 'angry',
        fearful: 'sad',
        disgusted: 'confused',
        surprised: 'surprised',
        neutral: 'neutral'
      };

      const mappedEmotion = emotionMapping[maxEmotion] || 'neutral';

      return {
        emotion: mappedEmotion,
        confidence: maxConfidence,
        description: this.getEmotionDescription(mappedEmotion),
        color: this.getEmotionColor(mappedEmotion),
        icon: this.getEmotionIcon(mappedEmotion),
        rawExpressions: expressions,
        faceDetected: true
      };

    } catch (error) {
      console.warn('Face-api.js 분석 실패, 픽셀 기반 분석으로 전환:', error);
      return await this.analyzePixelBased(imageElement);
    }
  }

  // 픽셀 기반 감정 분석 (대체 방법)
  async analyzePixelBased(imageElement) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // 이미지를 캔버스에 그리기
      canvas.width = imageElement.naturalWidth || imageElement.width;
      canvas.height = imageElement.naturalHeight || imageElement.height;
      ctx.drawImage(imageElement, 0, 0);

      // 얼굴 영역 추정 (중앙 상단 1/3 영역)
      const faceRegion = {
        x: Math.floor(canvas.width * 0.25),
        y: Math.floor(canvas.height * 0.1),
        width: Math.floor(canvas.width * 0.5),
        height: Math.floor(canvas.height * 0.4)
      };

      const imageData = ctx.getImageData(
        faceRegion.x, 
        faceRegion.y, 
        faceRegion.width, 
        faceRegion.height
      );

      const analysis = this.analyzePixelData(imageData.data);
      
      resolve({
        ...analysis,
        faceDetected: false,
        confidence: analysis.confidence * 0.8 // 픽셀 기반은 신뢰도 조금 낮춤
      });
    });
  }

  analyzePixelData(pixelData) {
    let r = 0, g = 0, b = 0;
    let brightness = 0;
    let contrast = 0;
    const pixels = pixelData.length / 4;

    // RGB 평균 및 밝기 계산
    for (let i = 0; i < pixelData.length; i += 4) {
      r += pixelData[i];
      g += pixelData[i + 1];
      b += pixelData[i + 2];
      brightness += (pixelData[i] + pixelData[i + 1] + pixelData[i + 2]) / 3;
    }

    r = r / pixels;
    g = g / pixels;
    b = b / pixels;
    brightness = brightness / pixels;

    // 색온도 계산
    const warmth = (r - b) / 255;
    const saturation = Math.max(r, g, b) - Math.min(r, g, b);

    // 대비 계산
    let brightPixels = 0;
    let darkPixels = 0;
    for (let i = 0; i < pixelData.length; i += 4) {
      const pixelBrightness = (pixelData[i] + pixelData[i + 1] + pixelData[i + 2]) / 3;
      if (pixelBrightness > brightness + 20) brightPixels++;
      if (pixelBrightness < brightness - 20) darkPixels++;
    }
    contrast = (brightPixels + darkPixels) / pixels;

    // 감정 분석 알고리즘
    let emotion, confidence;

    if (brightness > 160 && warmth > 0.15 && saturation > 30) {
      emotion = 'happy';
      confidence = 0.75 + Math.min(0.2, (brightness - 160) / 200);
    } else if (brightness < 80 || (warmth < -0.1 && saturation < 20)) {
      emotion = 'sad';
      confidence = 0.70 + Math.min(0.2, (80 - brightness) / 80);
    } else if (contrast > 0.3 && saturation > 40) {
      emotion = 'surprised';
      confidence = 0.65 + Math.min(0.25, contrast - 0.3);
    } else if (warmth > 0.2 && saturation > 50 && brightness < 120) {
      emotion = 'angry';
      confidence = 0.70 + Math.min(0.2, warmth - 0.2);
    } else if (Math.abs(warmth) < 0.05 && saturation < 15) {
      emotion = 'neutral';
      confidence = 0.80 + Math.min(0.15, (15 - saturation) / 15);
    } else if (brightness > 130 && contrast > 0.25) {
      emotion = 'excited';
      confidence = 0.65 + Math.min(0.2, (brightness - 130) / 100);
    } else if (brightness > 100 && warmth < 0 && saturation < 25) {
      emotion = 'calm';
      confidence = 0.70 + Math.min(0.2, (25 - saturation) / 25);
    } else {
      emotion = 'confused';
      confidence = 0.60 + Math.random() * 0.2;
    }

    return {
      emotion,
      confidence: Math.min(0.95, confidence),
      description: this.getEmotionDescription(emotion),
      color: this.getEmotionColor(emotion),
      icon: this.getEmotionIcon(emotion),
      analysisData: {
        brightness: Math.round(brightness),
        warmth: Math.round(warmth * 100) / 100,
        saturation: Math.round(saturation),
        contrast: Math.round(contrast * 100) / 100
      }
    };
  }

  getEmotionDescription(emotion) {
    const descriptions = {
      happy: '행복함',
      sad: '슬픔',
      surprised: '놀람',
      angry: '화남',
      neutral: '무표정',
      confused: '혼란',
      excited: '신남',
      calm: '차분함'
    };
    return descriptions[emotion] || '알 수 없음';
  }

  getEmotionColor(emotion) {
    const colors = {
      happy: '#FFD700',
      sad: '#4169E1',
      surprised: '#FF6347',
      angry: '#DC143C',
      neutral: '#808080',
      confused: '#9370DB',
      excited: '#FF1493',
      calm: '#20B2AA'
    };
    return colors[emotion] || '#808080';
  }

  getEmotionIcon(emotion) {
    const icons = {
      happy: '😊',
      sad: '😢',
      surprised: '😲',
      angry: '😠',
      neutral: '😐',
      confused: '🤔',
      excited: '🤩',
      calm: '😌'
    };
    return icons[emotion] || '🙂';
  }
}

// 싱글톤 인스턴스 생성
export const emotionAnalyzer = new EmotionAnalyzer();