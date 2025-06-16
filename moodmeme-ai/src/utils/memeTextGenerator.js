// src/utils/memeTextGenerator.js

export class MemeTextGenerator {
  constructor() {
    this.memeDatabase = {
      happy: {
        simple: [
          "오늘 기분이 최고야! ✨",
          "행복해서 하늘을 날 것 같아! 🚀",
          "웃음이 멈추지 않네 😄",
          "세상이 다 내 것 같아! 🌍",
          "행복 바이러스 전파 중~ 🦠💕",
          "기분 좋은 날이야! ☀️",
          "미소가 저절로 나와! 😆",
          "오늘은 럭키데이! 🍀"
        ],
        contextual: [
          "AI가 내 기분을 완벽하게 읽었네! 😊",
          "이 표정, 완전 행복 그 자체! ✨",
          "감정 분석 결과: 100% 행복! 📊",
          "웃는 얼굴이 이렇게 예쁠 줄이야! 💫"
        ],
        trendy: [
          "행복 레벨: MAX! 🔥",
          "기분 좋음 인증샷! 📸",
          "오늘 텐션 미쳤다! ⚡",
          "행복한 바이브 체크! ✅"
        ]
      },
      sad: {
        simple: [
          "월요일이 또 왔구나... 😢",
          "커피가 절실히 필요해... ☕",
          "힘내자, 나야... 화이팅! 💪",
          "괜찮아, 다 지나갈 거야 🌈",
          "슬픔도 나의 일부야 💙",
          "비 오는 날의 기분... 🌧️",
          "오늘은 그런 날이야 😔",
          "잠시 슬플 뿐이야 💭"
        ],
        contextual: [
          "AI도 내 마음을 아는구나... 😢",
          "이 표정에 모든 게 담겨있어 💔",
          "감정이 얼굴에 다 나타나네 😞",
          "슬픈 감정도 소중해 🥺"
        ],
        trendy: [
          "감정 상태: 다운로드 중... 📥",
          "슬픔 모드 ON 😭",
          "멘탈 충전이 필요해! 🔋",
          "힐링 타임 필요 🛀"
        ]
      },
      surprised: {
        simple: [
          "어? 이게 뭐야?! 😲",
          "예상치 못한 일이 일어났다! 🎯",
          "깜짝이야! 심장이 떨려! 💓",
          "세상에, 믿을 수 없어! 🤯",
          "이런 반전이...! 🎭",
          "서프라이즈! 🎉",
          "완전 놀랐어! ⚡",
          "이럴 수가! 😱"
        ],
        contextual: [
          "AI가 내 놀란 표정까지 읽어! 😲",
          "깜짝 놀란 순간을 포착했네! 📸",
          "이 표정이 모든 걸 말해줘! 😯",
          "놀람 지수 측정 완료! 📊"
        ],
        trendy: [
          "놀람 레벨: 오버 9000! 💥",
          "예상 밖 상황 발생! 🚨",
          "서프라이즈 어택! ⚔️",
          "충격과 공포! 🌪️"
        ]
      },
      angry: {
        simple: [
          "화가 나지만 참아보자... 😤",
          "심호흡... 후~ 하~ 🧘‍♂️",
          "진정하자, 진정해 ✋",
          "평정심을 되찾는 중... 🧘‍♀️",
          "화내면 주름생겨... 참자 😮‍💨",
          "분노 조절 모드 ON 🔥➡️❄️",
          "잠깐, 마음을 다스리자 🙏",
          "화는 독이야, 내려놓자 ☮️"
        ],
        contextual: [
          "AI가 내 화난 마음까지 읽었네... 😠",
          "이 표정이 모든 걸 설명해줘 💢",
          "감정 조절이 필요한 순간! 🎯",
          "화난 얼굴도 데이터가 되는구나 📊"
        ],
        trendy: [
          "분노 게이지: 위험 수준! ⚠️",
          "화남 모드 감지됨! 🔴",
          "멘탈 브레이크 필요! 🛑",
          "진정 포션이 필요해! 🧪"
        ]
      },
      neutral: {
        simple: [
          "그냥 그런 하루야 📅",
          "평범한 일상의 한 컷 📸",
          "무덤덤한 표정 😐",
          "오늘은 무감정 모드 💤",
          "평온한 마음, 고요한 바다 🌊",
          "감정? 그게 뭐죠? 🤖",
          "그저 그런 순간 ⏰",
          "평상시 모드 😑"
        ],
        contextual: [
          "AI도 내 무표정을 읽는구나 😐",
          "감정 없는 표정도 하나의 감정! 🤖",
          "중립적인 얼굴의 힘! ⚖️",
          "무감정도 완벽하게 분석! 📊"
        ],
        trendy: [
          "감정 상태: 중립 🟨",
          "무표정 마스터! 👤",
          "감정 절약 모드 ON 🔋",
          "쿨한 바이브 체크! 😎"
        ]
      },
      confused: {
        simple: [
          "뭔가 이상한데...? 🤔",
          "이해할 수 없어... 🧩",
          "혼란스럽다... 도와줘 🆘",
          "질문만 늘어가네... ❓❓❓",
          "머리가 복잡해... 🌪️",
          "이 상황을 정리해보자 📝",
          "뭐가 뭔지 모르겠어 🤷‍♂️",
          "혼돈의 카오스... 🌀"
        ],
        contextual: [
          "AI도 내 혼란을 감지했네! 🤔",
          "혼란스러운 표정이 완벽해! 😵‍💫",
          "복잡한 마음이 얼굴에 그대로! 🧠",
          "혼란 지수 측정 완료! 📊"
        ],
        trendy: [
          "혼란 상태: 로딩 중... ⏳",
          "뇌정지 모드 ON 🧠❌",
          "이해 불가 상황 발생! 🚫",
          "멘탈 디버깅 필요! 🔧"
        ]
      },
      excited: {
        simple: [
          "와! 너무 신나! 🎉",
          "텐션 MAX! 🚀",
          "흥분해서 잠이 안 와! ⚡",
          "이 에너지를 어디에 쓸까? 💥",
          "신남 폭발! 🎆",
          "아드레날린이 솟구쳐! ⚡",
          "완전 하이텐션! 🔥",
          "신난다 신나! 🎊"
        ],
        contextual: [
          "AI가 내 신남을 완벽 포착! 🤩",
          "흥분한 표정이 스크린을 뚫고 나와! 💥",
          "에너지 레벨 측정 완료! ⚡",
          "신남 바이러스 전파 중! 🦠"
        ],
        trendy: [
          "흥분 게이지: 오버플로우! 📊",
          "하이퍼 모드 활성화! 🚀",
          "에너지 드링크 1000개 효과! ⚡",
          "신남 치트키 발동! 🎮"
        ]
      },
      calm: {
        simple: [
          "마음이 평온해... 🧘‍♂️",
          "고요한 호수 같은 기분 🏞️",
          "평화로운 순간이야 ☮️",
          "차분차분... 🍃",
          "내면의 평화를 느껴 💆‍♂️",
          "명상 모드 ON 🕯️",
          "고요함 속의 나 🌸",
          "평정심 유지 중 ⚖️"
        ],
        contextual: [
          "AI도 내 평온함을 느끼네 🧘‍♂️",
          "차분한 표정에서 평화가 느껴져 ☮️",
          "안정된 감정 상태 감지! 📊",
          "평온한 바이브 측정 완료! 🌊"
        ],
        trendy: [
          "힐링 모드 ON 🌿",
          "마음챙김 상태 도달! 🎯",
          "평온 지수: 만렙! 📊",
          "젠(Zen) 모드 활성화! 🧘‍♂️"
        ]
      }
    };

    this.timeBasedTexts = {
      morning: ["굿모닝! ☀️", "아침 기분은?", "새로운 하루 시작! 🌅"],
      afternoon: ["점심 먹었어? 🍽️", "오후의 여유", "한낮의 기분은?"],
      evening: ["저녁 시간이야 🌆", "하루 수고했어!", "오늘 어땠어?"],
      night: ["굿나잇! 🌙", "밤늦게 뭐해?", "잠들기 전 마지막!"]
    };
  }

  async generateMemeText(emotion, options = {}) {
    const {
      style = 'mixed', // simple, contextual, trendy, mixed
      includeTimeContext = true,
      includeEmoji = true,
      customContext = null
    } = options;

    // 감정별 텍스트 풀 가져오기
    const emotionTexts = this.memeDatabase[emotion.emotion] || this.memeDatabase.neutral;
    
    let textPool = [];

    // 스타일에 따른 텍스트 선택
    if (style === 'mixed') {
      textPool = [
        ...emotionTexts.simple,
        ...emotionTexts.contextual,
        ...emotionTexts.trendy
      ];
    } else {
      textPool = emotionTexts[style] || emotionTexts.simple;
    }

    // 시간대별 컨텍스트 추가
    if (includeTimeContext) {
      const timeTexts = this.getTimeBasedTexts();
      textPool = [...textPool, ...timeTexts];
    }

    // 신뢰도 기반 특별 텍스트
    if (emotion.confidence > 0.9) {
      textPool.push(
        `AI가 ${Math.round(emotion.confidence * 100)}% 확신하는 내 기분! ${emotion.icon}`,
        `완벽한 ${emotion.description} 표정! 🎯`,
        `감정 분석 정확도 MAX! 📊`
      );
    }

    // 커스텀 컨텍스트 처리
    if (customContext) {
      const contextualText = this.generateContextualText(emotion, customContext);
      textPool.push(...contextualText);
    }

    // 가중치 기반 선택 (최근 생성한 것과 다르게)
    const selectedText = this.selectWithWeight(textPool);
    
    // 최종 텍스트 후처리
    return this.postProcessText(selectedText, emotion, includeEmoji);
  }

  getTimeBasedTexts() {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      return this.timeBasedTexts.morning;
    } else if (hour >= 12 && hour < 17) {
      return this.timeBasedTexts.afternoon;
    } else if (hour >= 17 && hour < 22) {
      return this.timeBasedTexts.evening;
    } else {
      return this.timeBasedTexts.night;
    }
  }

  generateContextualText(emotion, context) {
    const contextualTexts = [];
    
    // 얼굴 감지 여부에 따른 텍스트
    if (context.faceDetected) {
      contextualTexts.push(
        `AI가 내 얼굴을 완벽 분석! ${emotion.icon}`,
        `얼굴 인식 성공! 감정: ${emotion.description}`,
        `페이스 스캔 완료! 기분 체크 ✅`
      );
    } else {
      contextualTexts.push(
        `사진으로도 감정이 느껴져! ${emotion.icon}`,
        `픽셀 하나하나에서 감정을 읽어냈어!`,
        `이미지 분석으로 마음을 읽었네! 🔍`
      );
    }

    // 분석 데이터 기반 텍스트
    if (context.analysisData) {
      const { brightness, warmth, saturation } = context.analysisData;
      
      if (brightness > 150) {
        contextualTexts.push("밝은 표정이 빛나고 있어! ✨");
      } else if (brightness < 100) {
        contextualTexts.push("차분한 톤의 표정이네 🌙");
      }
      
      if (warmth > 0.1) {
        contextualTexts.push("따뜻한 느낌이 물씬! 🔥");
      } else if (warmth < -0.1) {
        contextualTexts.push("쿨한 바이브가 느껴져! ❄️");
      }
    }

    return contextualTexts;
  }

  selectWithWeight(textPool) {
    // 간단한 가중치 선택 (실제로는 사용자 히스토리 고려)
    const weights = textPool.map((text, index) => {
      let weight = 1;
      
      // 이모지가 있는 텍스트에 가중치 추가
      if (/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(text)) weight += 0.5;
      
      // 짧은 텍스트에 가중치 추가
      if (text.length < 20) weight += 0.3;
      
      // AI, 감정 관련 키워드에 가중치 추가
      if (/AI|감정|분석|기분/.test(text)) weight += 0.4;
      
      return weight;
    });

    // 가중치 기반 랜덤 선택
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < textPool.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return textPool[i];
      }
    }
    
    return textPool[Math.floor(Math.random() * textPool.length)];
  }

  postProcessText(text, emotion, includeEmoji) {
    let processedText = text;
    
    // 이모지 제거 옵션
    if (!includeEmoji) {
      processedText = processedText.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
    }
    
    // 감정 아이콘 자동 추가 (텍스트에 이모지가 없는 경우)
    if (includeEmoji && !/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(processedText)) {
      processedText += ` ${emotion.icon}`;
    }
    
    // 텍스트 길이 제한 (말풍선에 맞게)
    if (processedText.length > 50) {
      processedText = processedText.substring(0, 47) + '...';
    }
    
    return processedText;
  }

  // 특정 감정의 모든 텍스트 가져오기 (미리보기용)
  getAllTextsForEmotion(emotion) {
    const emotionTexts = this.memeDatabase[emotion] || this.memeDatabase.neutral;
    return {
      simple: emotionTexts.simple,
      contextual: emotionTexts.contextual,
      trendy: emotionTexts.trendy
    };
  }

  // 새로운 밈 텍스트 추가 (사용자 커스텀)
  addCustomText(emotion, text, category = 'simple') {
    if (!this.memeDatabase[emotion]) {
      this.memeDatabase[emotion] = { simple: [], contextual: [], trendy: [] };
    }
    
    if (!this.memeDatabase[emotion][category]) {
      this.memeDatabase[emotion][category] = [];
    }
    
    this.memeDatabase[emotion][category].push(text);
  }

  // 통계 정보 반환
  getStats() {
    const stats = {};
    
    Object.keys(this.memeDatabase).forEach(emotion => {
      const emotionTexts = this.memeDatabase[emotion];
      stats[emotion] = {
        simple: emotionTexts.simple.length,
        contextual: emotionTexts.contextual.length,
        trendy: emotionTexts.trendy.length,
        total: emotionTexts.simple.length + emotionTexts.contextual.length + emotionTexts.trendy.length
      };
    });
    
    return stats;
  }
}

// 싱글톤 인스턴스 생성
export const memeTextGenerator = new MemeTextGenerator();