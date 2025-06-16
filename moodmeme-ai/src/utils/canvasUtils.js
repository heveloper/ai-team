// src/utils/canvasUtils.js

export class CanvasUtils {
  constructor() {
    this.maxCanvasSize = 1200;
    this.defaultFont = 'bold 24px "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
  }

  // 메인 밈 생성 함수
  async createMeme(imageFile, emotion, memeText, style = 'bubble', options = {}) {
    const {
      canvas,
      maxWidth = this.maxCanvasSize,
      quality = 0.9,
      addWatermark = true,
      fontSize = 24,
      fontFamily = 'Arial, sans-serif'
    } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        try {
          const ctx = canvas.getContext('2d');
          
          // 캔버스 크기 계산 및 설정
          const scale = this.calculateScale(img.width, img.height, maxWidth);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          
          // 고품질 렌더링 설정
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          // 이미지 그리기
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // 텍스트 메트릭스 계산
          ctx.font = `bold ${fontSize}px ${fontFamily}`;
          const textMetrics = this.calculateTextMetrics(ctx, memeText, canvas.width);
          
          // 스타일별 말풍선 그리기
          switch (style) {
            case 'bubble':
              this.drawBubbleStyle(ctx, canvas, textMetrics, emotion, memeText);
              break;
            case 'comic':
              this.drawComicStyle(ctx, canvas, textMetrics, emotion, memeText);
              break;
            case 'modern':
              this.drawModernStyle(ctx, canvas, textMetrics, emotion, memeText);
              break;
            case 'neon':
              this.drawNeonStyle(ctx, canvas, textMetrics, emotion, memeText);
              break;
            case 'retro':
              this.drawRetroStyle(ctx, canvas, textMetrics, emotion, memeText);
              break;
            default:
              this.drawBubbleStyle(ctx, canvas, textMetrics, emotion, memeText);
          }
          
          // 감정 정보 오버레이
          this.drawEmotionOverlay(ctx, emotion, canvas.width, canvas.height);
          
          // 워터마크 추가
          if (addWatermark) {
            this.drawWatermark(ctx, canvas.width, canvas.height);
          }
          
          // 결과 반환
          const dataUrl = canvas.toDataURL('image/png', quality);
          resolve({
            dataUrl,
            dimensions: { width: canvas.width, height: canvas.height },
            emotion,
            text: memeText,
            style
          });
          
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('이미지 로드 실패'));
      img.src = URL.createObjectURL(imageFile);
    });
  }

  // 캔버스 크기 계산
  calculateScale(width, height, maxSize) {
    const maxDimension = Math.max(width, height);
    return maxDimension > maxSize ? maxSize / maxDimension : 1;
  }

  // 텍스트 메트릭스 계산 (여러 줄 지원)
  calculateTextMetrics(ctx, text, canvasWidth) {
    const maxLineWidth = canvasWidth * 0.8; // 캔버스 너비의 80%
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const testWidth = ctx.measureText(testLine).width;
      
      if (testWidth <= maxLineWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          lines.push(word); // 단어가 너무 긴 경우
        }
      }
    });
    
    if (currentLine) {
      lines.push(currentLine);
    }

    const lineHeight = 30;
    const totalHeight = lines.length * lineHeight;
    const maxWidth = Math.max(...lines.map(line => ctx.measureText(line).width));

    return {
      lines,
      lineHeight,
      totalHeight,
      maxWidth,
      padding: 20
    };
  }

  // 버블 스타일 말풍선
  drawBubbleStyle(ctx, canvas, textMetrics, emotion, memeText) {
    const { lines, lineHeight, totalHeight, maxWidth, padding } = textMetrics;
    
    // 말풍선 크기 계산
    const bubbleWidth = maxWidth + padding * 2;
    const bubbleHeight = totalHeight + padding * 1.5;
    const bubbleX = (canvas.width - bubbleWidth) / 2;
    const bubbleY = Math.min(40, canvas.height * 0.1);

    // 그라데이션 배경
    const gradient = ctx.createLinearGradient(bubbleX, bubbleY, bubbleX, bubbleY + bubbleHeight);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    gradient.addColorStop(0.5, 'rgba(248, 248, 248, 0.95)');
    gradient.addColorStop(1, 'rgba(240, 240, 240, 0.95)');

    // 그림자 효과
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 8;

    // 말풍선 본체
    ctx.fillStyle = gradient;
    ctx.strokeStyle = emotion.color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    this.roundRect(ctx, bubbleX, bubbleY, bubbleWidth, bubbleHeight, 20);
    ctx.fill();
    ctx.stroke();

    // 말풍선 꼬리
    ctx.beginPath();
    ctx.moveTo(bubbleX + bubbleWidth / 2 - 20, bubbleY + bubbleHeight);
    ctx.lineTo(bubbleX + bubbleWidth / 2, bubbleY + bubbleHeight + 25);
    ctx.lineTo(bubbleX + bubbleWidth / 2 + 20, bubbleY + bubbleHeight);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 그림자 제거
    ctx.shadowColor = 'transparent';

    // 텍스트 그리기
    this.drawMultilineText(ctx, lines, bubbleX + bubbleWidth / 2, bubbleY + padding, lineHeight, {
      fillStyle: '#333',
      textAlign: 'center',
      strokeStyle: 'rgba(255, 255, 255, 0.8)',
      lineWidth: 3
    });
  }

  // 코믹 스타일 말풍선
  drawComicStyle(ctx, canvas, textMetrics, emotion, memeText) {
    const { lines, lineHeight, totalHeight, maxWidth } = textMetrics;
    
    const centerX = canvas.width / 2;
    const centerY = Math.min(80, canvas.height * 0.15) + totalHeight / 2;
    const radiusX = (maxWidth + 60) / 2;
    const radiusY = (totalHeight + 40) / 2;

    // 폭발 모양 말풍선
    ctx.fillStyle = '#FFFF00';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 6;
    
    ctx.beginPath();
    const spikes = 12;
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? 
        Math.max(radiusX, radiusY) * 1.2 : 
        Math.max(radiusX, radiusY) * 0.8;
      const angle = (i * Math.PI) / spikes;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius * 0.7; // 타원형으로
      
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 텍스트 (대문자, 굵게)
    ctx.font = 'bold 22px Impact, Arial Black, sans-serif';
    this.drawMultilineText(ctx, lines.map(line => line.toUpperCase()), centerX, centerY - totalHeight / 2 + 10, lineHeight, {
      fillStyle: '#000',
      textAlign: 'center',
      strokeStyle: '#FFF',
      lineWidth: 2
    });
  }

  // 모던 스타일 말풍선
  drawModernStyle(ctx, canvas, textMetrics, emotion, memeText) {
    const { lines, lineHeight, totalHeight, maxWidth, padding } = textMetrics;
    
    const bubbleWidth = maxWidth + padding * 2;
    const bubbleHeight = totalHeight + padding * 1.5;
    const bubbleX = (canvas.width - bubbleWidth) / 2;
    const bubbleY = Math.min(40, canvas.height * 0.1);

    // 현대적 그라데이션
    const gradient = ctx.createLinearGradient(bubbleX, bubbleY, bubbleX + bubbleWidth, bubbleY + bubbleHeight);
    gradient.addColorStop(0, emotion.color + '90');
    gradient.addColorStop(0.5, emotion.color + 'B0');
    gradient.addColorStop(1, emotion.color + '70');

    // 백드롭 필터 효과 시뮬레이션
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    this.roundRect(ctx, bubbleX - 2, bubbleY - 2, bubbleWidth + 4, bubbleHeight + 4, 30);
    ctx.fill();

    // 메인 모던 박스
    ctx.fillStyle = gradient;
    ctx.beginPath();
    this.roundRect(ctx, bubbleX, bubbleY, bubbleWidth, bubbleHeight, 25);
    ctx.fill();

    // 미묘한 테두리
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 텍스트 (그림자 효과)
    this.drawMultilineText(ctx, lines, bubbleX + bubbleWidth / 2, bubbleY + padding, lineHeight, {
      fillStyle: '#fff',
      textAlign: 'center',
      shadowColor: 'rgba(0, 0, 0, 0.3)',
      shadowBlur: 3,
      shadowOffsetY: 1
    });
  }

  // 네온 스타일 말풍선
  drawNeonStyle(ctx, canvas, textMetrics, emotion, memeText) {
    const { lines, lineHeight, totalHeight, maxWidth, padding } = textMetrics;
    
    const bubbleWidth = maxWidth + padding * 2;
    const bubbleHeight = totalHeight + padding * 1.5;
    const bubbleX = (canvas.width - bubbleWidth) / 2;
    const bubbleY = Math.min(40, canvas.height * 0.1);

    // 네온 글로우 효과
    ctx.shadowColor = emotion.color;
    ctx.shadowBlur = 20;
    
    // 배경 (어두운 박스)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.beginPath();
    this.roundRect(ctx, bubbleX, bubbleY, bubbleWidth, bubbleHeight, 15);
    ctx.fill();

    // 네온 테두리
    ctx.strokeStyle = emotion.color;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.shadowColor = 'transparent';

    // 네온 텍스트
    ctx.font = 'bold 22px "Courier New", monospace';
    this.drawMultilineText(ctx, lines, bubbleX + bubbleWidth / 2, bubbleY + padding, lineHeight, {
      fillStyle: emotion.color,
      textAlign: 'center',
      shadowColor: emotion.color,
      shadowBlur: 10
    });
  }

  // 레트로 스타일 말풍선
  drawRetroStyle(ctx, canvas, textMetrics, emotion, memeText) {
    const { lines, lineHeight, totalHeight, maxWidth, padding } = textMetrics;
    
    const bubbleWidth = maxWidth + padding * 2;
    const bubbleHeight = totalHeight + padding * 1.5;
    const bubbleX = (canvas.width - bubbleWidth) / 2;
    const bubbleY = Math.min(40, canvas.height * 0.1);

    // 레트로 색상 팔레트
    const retroColors = ['#FF6B9D', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
    const retroColor = retroColors[Math.floor(Math.random() * retroColors.length)];

    // 3D 효과
    for (let i = 8; i >= 0; i--) {
      const offset = i * 2;
      ctx.fillStyle = i === 0 ? retroColor : `rgba(0, 0, 0, ${0.1 * (8 - i)})`;
      ctx.beginPath();
      this.roundRect(ctx, bubbleX + offset, bubbleY + offset, bubbleWidth, bubbleHeight, 10);
      ctx.fill();
    }

    // 레트로 테두리
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    this.roundRect(ctx, bubbleX, bubbleY, bubbleWidth, bubbleHeight, 10);
    ctx.stroke();

    // 레트로 텍스트
    ctx.font = 'bold 20px "Comic Sans MS", cursive';
    this.drawMultilineText(ctx, lines, bubbleX + bubbleWidth / 2, bubbleY + padding, lineHeight, {
      fillStyle: '#000',
      textAlign: 'center'
    });
  }

  // 여러 줄 텍스트 그리기
  drawMultilineText(ctx, lines, x, y, lineHeight, style = {}) {
    // 스타일 적용
    Object.keys(style).forEach(key => {
      if (key.startsWith('shadow')) {
        ctx[key] = style[key];
      } else {
        ctx[key] = style[key];
      }
    });

    // 텍스트 그리기
    lines.forEach((line, index) => {
      const lineY = y + (index * lineHeight);
      
      // 스트로크 효과
      if (style.strokeStyle && style.lineWidth) {
        ctx.strokeText(line, x, lineY);
      }
      
      // 메인 텍스트
      ctx.fillText(line, x, lineY);
    });

    // 그림자 초기화
    ctx.shadowColor = 'transparent';
  }

  // 감정 정보 오버레이
  drawEmotionOverlay(ctx, emotion, canvasWidth, canvasHeight) {
    const overlayWidth = 180;
    const overlayHeight = 50;
    const overlayX = canvasWidth - overlayWidth - 15;
    const overlayY = canvasHeight - overlayHeight - 15;

    // 반투명 배경
    const gradient = ctx.createLinearGradient(overlayX, overlayY, overlayX, overlayY + overlayHeight);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    this.roundRect(ctx, overlayX, overlayY, overlayWidth, overlayHeight, 8);
    ctx.fill();

    // 감정 아이콘
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(emotion.icon, overlayX + 10, overlayY + 30);

    // 감정 정보
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.fillText(emotion.description, overlayX + 40, overlayY + 20);
    
    ctx.font = '10px Arial';
    ctx.fillStyle = '#ccc';
    ctx.fillText(`${Math.round(emotion.confidence * 100)}% 확신`, overlayX + 40, overlayY + 35);
  }

  // 워터마크 그리기
  drawWatermark(ctx, canvasWidth, canvasHeight) {
    const watermarkText = 'MoodMeme.ai';
    const watermarkX = 15;
    const watermarkY = canvasHeight - 15;

    ctx.font = '12px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.textAlign = 'left';
    ctx.fillText(watermarkText, watermarkX, watermarkY);
  }

  // 둥근 사각형 그리기 헬퍼
  roundRect(ctx, x, y, width, height, radius) {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
  }

  // 이미지 품질 최적화
  optimizeImage(canvas, targetSize = 800) {
    if (canvas.width <= targetSize && canvas.height <= targetSize) {
      return canvas.toDataURL('image/png', 0.95);
    }

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    const scale = targetSize / Math.max(canvas.width, canvas.height);
    tempCanvas.width = canvas.width * scale;
    tempCanvas.height = canvas.height * scale;
    
    tempCtx.imageSmoothingEnabled = true;
    tempCtx.imageSmoothingQuality = 'high';
    tempCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
    
    return tempCanvas.toDataURL('image/jpeg', 0.9);
  }
}

// 싱글톤 인스턴스 생성
export const canvasUtils = new CanvasUtils();