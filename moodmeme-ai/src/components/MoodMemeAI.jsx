// src/components/MoodMemeAI.jsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Camera, Download, Share2, Sparkles, ImageIcon, 
  Zap, Heart, Settings, RefreshCw, Timer, Grid3X3,
  Play, Square, RotateCcw 
} from 'lucide-react';

// 유틸리티 및 훅 임포트
import { emotionAnalyzer } from '../utils/emotionAnalysis';
import { memeTextGenerator } from '../utils/memeTextGenerator';
import { canvasUtils } from '../utils/canvasUtils';
import useCamera from '../hooks/useCamera';

const MoodMemeAI = () => {
  // 상태 관리
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzedEmotion, setAnalyzedEmotion] = useState(null);
  const [generatedMeme, setGeneratedMeme] = useState(null);
  const [memeHistory, setMemeHistory] = useState([]);
  
  // 프로세스 상태
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState('upload'); // upload, analyze, generate, complete
  
  // 설정
  const [selectedStyle, setSelectedStyle] = useState('bubble');
  const [textStyle, setTextStyle] = useState('mixed');
  const [showSettings, setShowSettings] = useState(false);
  const [autoGenerate, setAutoGenerate] = useState(true);
  
  // 레퍼런스
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  
  // 카메라 훅
  const {
    isActive: isCameraActive,
    isLoading: isCameraLoading,
    error: cameraError,
    videoRef,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    facingMode,
    checkPermission
  } = useCamera();

  // 말풍선 스타일 옵션
  const bubbleStyles = [
    { id: 'bubble', name: '클래식 버블', icon: '💭', description: '전통적인 말풍선' },
    { id: 'comic', name: '코믹북', icon: '💥', description: '만화책 스타일' },
    { id: 'modern', name: '모던', icon: '✨', description: '깔끔한 현대적 스타일' },
    { id: 'neon', name: '네온', icon: '🌃', description: '사이버펑크 네온 효과' },
    { id: 'retro', name: '레트로', icon: '📼', description: '80년대 복고풍' }
  ];

  // 텍스트 스타일 옵션
  const textStyles = [
    { id: 'simple', name: '심플', description: '간단하고 직관적' },
    { id: 'contextual', name: '상황맞춤', description: 'AI 분석 결과 반영' },
    { id: 'trendy', name: '트렌디', description: '최신 유행어 사용' },
    { id: 'mixed', name: '믹스', description: '모든 스타일 랜덤' }
  ];

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    // 로컬 스토리지에서 설정 로드
    const savedSettings = localStorage.getItem('moodmeme-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setSelectedStyle(settings.bubbleStyle || 'bubble');
      setTextStyle(settings.textStyle || 'mixed');
      setAutoGenerate(settings.autoGenerate !== false);
    }

    // 히스토리 로드
    const savedHistory = localStorage.getItem('moodmeme-history');
    if (savedHistory) {
      const history = JSON.parse(savedHistory);
      setMemeHistory(history.slice(0, 5)); // 최근 5개만
    }

    // 카메라 권한 미리 확인
    checkPermission();

    return () => {
      // 클린업
      if (isCameraActive) {
        stopCamera();
      }
    };
  }, []);

  // 설정 저장
  useEffect(() => {
    const settings = {
      bubbleStyle: selectedStyle,
      textStyle: textStyle,
      autoGenerate: autoGenerate
    };
    localStorage.setItem('moodmeme-settings', JSON.stringify(settings));
  }, [selectedStyle, textStyle, autoGenerate]);

  // 파일 업로드 처리
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      processImageFile(file);
    }
  };

  // 이미지 파일 처리
  const processImageFile = (file) => {
    setUploadedImage(file);
    setAnalyzedEmotion(null);
    setGeneratedMeme(null);
    setCurrentStep('analyze');

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      
      // 자동 분석 설정이 켜져있으면 자동으로 분석 시작
      if (autoGenerate) {
        setTimeout(() => handleAnalyze(file), 500);
      }
    };
    reader.readAsDataURL(file);
  };

  // 카메라 촬영 처리
  const handleCameraCapture = async () => {
    try {
      const result = await capturePhoto({
        format: 'image/jpeg',
        quality: 0.9,
        maxWidth: 1200
      });
      
      processImageFile(result.file);
      setImagePreview(result.dataUrl);
      stopCamera();
    } catch (error) {
      console.error('촬영 실패:', error);
      alert('사진 촬영에 실패했습니다: ' + error.message);
    }
  };

  // 감정 분석 및 밈 생성
  const handleAnalyze = async (imageFile = uploadedImage) => {
    if (!imageFile) return;

    setIsAnalyzing(true);
    setCurrentStep('analyze');

    try {
      // 이미지 로드
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imagePreview || URL.createObjectURL(imageFile);
      });

      // 감정 분석
      const emotion = await emotionAnalyzer.analyzeEmotion(img);
      setAnalyzedEmotion(emotion);
      setIsAnalyzing(false);
      
      // 자동 생성이 켜져있으면 밈 생성까지 진행
      if (autoGenerate) {
        await generateMeme(emotion, imageFile);
      } else {
        setCurrentStep('generate');
      }

    } catch (error) {
      console.error('감정 분석 실패:', error);
      setIsAnalyzing(false);
      alert('감정 분석에 실패했습니다: ' + error.message);
    }
  };

  // 밈 생성
  const generateMeme = async (emotion = analyzedEmotion, imageFile = uploadedImage) => {
    if (!emotion || !imageFile) return;

    setIsGenerating(true);
    setCurrentStep('generate');

    try {
      // 밈 텍스트 생성
      const memeText = await memeTextGenerator.generateMemeText(emotion, {
        style: textStyle,
        includeTimeContext: true,
        customContext: emotion
      });

      // 캔버스에 밈 생성
      const result = await canvasUtils.createMeme(
        imageFile,
        emotion,
        memeText,
        selectedStyle,
        {
          canvas: canvasRef.current,
          maxWidth: 1200,
          quality: 0.95,
          fontSize: 24
        }
      );

      setGeneratedMeme(result.dataUrl);
      
      // 히스토리에 추가
      const newMeme = {
        id: Date.now(),
        image: result.dataUrl,
        emotion: emotion,
        text: memeText,
        style: selectedStyle,
        timestamp: new Date().toLocaleString(),
        dimensions: result.dimensions
      };
      
      const updatedHistory = [newMeme, ...memeHistory.slice(0, 4)];
      setMemeHistory(updatedHistory);
      
      // 로컬 스토리지에 저장
      localStorage.setItem('moodmeme-history', JSON.stringify(updatedHistory));
      
      setCurrentStep('complete');

    } catch (error) {
      console.error('밈 생성 실패:', error);
      alert('밈 생성에 실패했습니다: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // 새로운 밈 생성 (같은 이미지, 다른 텍스트)
  const regenerateMeme = async () => {
    if (analyzedEmotion && uploadedImage) {
      await generateMeme();
    }
  };

  // 다운로드 처리
  const handleDownload = () => {
    if (generatedMeme) {
      const link = document.createElement('a');
      link.download = `moodmeme-${Date.now()}.png`;
      link.href = generatedMeme;
      link.click();
    }
  };

  // 공유 처리
  const handleShare = async () => {
    if (!generatedMeme) return;

    try {
      if (navigator.share && navigator.canShare) {
        const response = await fetch(generatedMeme);
        const blob = await response.blob();
        const file = new File([blob], 'moodmeme.png', { type: 'image/png' });
        
        const shareData = {
          title: 'MoodMeme.ai로 만든 밈',
          text: `AI가 분석한 내 감정: ${analyzedEmotion?.description} 😊`,
          files: [file]
        };

        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
        } else {
          throw new Error('파일 공유 불가');
        }
      } else {
        // Fallback: 링크 복사
        await navigator.clipboard.writeText(window.location.href);
        alert('링크가 클립보드에 복사되었습니다!');
      }
    } catch (error) {
      console.error('공유 실패:', error);
      // Fallback: 다운로드
      handleDownload();
      alert('공유 대신 이미지를 다운로드했습니다.');
    }
  };

  // 초기화
  const handleReset = () => {
    setUploadedImage(null);
    setImagePreview(null);
    setAnalyzedEmotion(null);
    setGeneratedMeme(null);
    setCurrentStep('upload');
    
    if (isCameraActive) {
      stopCamera();
    }
  };

  // 히스토리에서 밈 선택
  const selectFromHistory = (meme) => {
    setGeneratedMeme(meme.image);
    setAnalyzedEmotion(meme.emotion);
    setCurrentStep('complete');
  };

  // 드래그 앤 드롭 처리
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* 헤더 */}
      <div className="container mx-auto px-4 pt-8">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white mb-4 flex items-center justify-center gap-4">
            <Sparkles className="text-yellow-400 w-16 h-16 animate-pulse" />
            MoodMeme.ai
            <Sparkles className="text-yellow-400 w-16 h-16 animate-pulse" />
          </h1>
          <p className="text-white/80 text-xl max-w-3xl mx-auto leading-relaxed">
             <strong>AI 감정 분석</strong> +  <strong>GPT 밈 생성</strong> =  <strong>완료!</strong>
            <br />
            당신의 표정을 분석해서 맞춤형 밈을 자동으로 만들어드립니다
          </p>
        </div>

        {/* 진행 상태 표시 */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-center space-x-4 bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
            {[
              { step: 'upload', icon: Upload, label: '업로드' },
              { step: 'analyze', icon: Zap, label: '분석' },
              { step: 'generate', icon: Sparkles, label: '생성' },
              { step: 'complete', icon: Heart, label: '완성' }
            ].map(({ step, icon: Icon, label }, index) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center transition-all
                  ${currentStep === step 
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' 
                    : (index < ['upload', 'analyze', 'generate', 'complete'].indexOf(currentStep)
                      ? 'bg-green-500 text-white'
                      : 'bg-white/20 text-white/60')}
                `}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="ml-2 text-white font-medium">{label}</span>
                {index < 3 && (
                  <div className={`
                    ml-4 w-8 h-1 rounded transition-all
                    ${index < ['upload', 'analyze', 'generate', 'complete'].indexOf(currentStep)
                      ? 'bg-green-500'
                      : 'bg-white/20'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* 왼쪽: 업로드 및 설정 */}
          <div className="xl:col-span-2 space-y-6">
            {/* 업로드 섹션 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                  <Upload className="w-7 h-7" />
                  사진 업로드 또는 촬영
                </h2>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <Settings className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* 설정 패널 */}
              {showSettings && (
                <div className="mb-6 p-4 bg-white/5 rounded-2xl border border-white/10">
                  <h3 className="text-white font-semibold mb-3">🎨 스타일 설정</h3>
                  
                  {/* 말풍선 스타일 */}
                  <div className="mb-4">
                    <label className="text-white/80 text-sm block mb-2">말풍선 스타일</label>
                    <div className="grid grid-cols-3 gap-2">
                      {bubbleStyles.map(style => (
                        <button
                          key={style.id}
                          onClick={() => setSelectedStyle(style.id)}
                          className={`p-3 rounded-xl text-sm font-medium transition-all ${
                            selectedStyle === style.id
                              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                              : 'bg-white/10 text-white/70 hover:bg-white/20'
                          }`}
                          title={style.description}
                        >
                          {style.icon} {style.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 텍스트 스타일 */}
                  <div className="mb-4">
                    <label className="text-white/80 text-sm block mb-2">텍스트 스타일</label>
                    <select
                      value={textStyle}
                      onChange={(e) => setTextStyle(e.target.value)}
                      className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white"
                    >
                      {textStyles.map(style => (
                        <option key={style.id} value={style.id} className="bg-gray-800">
                          {style.name} - {style.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 자동 생성 옵션 */}
                  <div className="flex items-center justify-between">
                    <label className="text-white/80 text-sm">자동 밈 생성</label>
                    <button
                      onClick={() => setAutoGenerate(!autoGenerate)}
                      className={`
                        w-12 h-6 rounded-full transition-all
                        ${autoGenerate ? 'bg-green-500' : 'bg-white/20'}
                      `}
                    >
                      <div className={`
                        w-5 h-5 bg-white rounded-full transition-transform
                        ${autoGenerate ? 'translate-x-6' : 'translate-x-0.5'}
                      `} />
                    </button>
                  </div>
                </div>
              )}

              {/* 업로드 영역 */}
              {!isCameraActive ? (
                <div className="space-y-4">
                  <div 
                    className="border-2 border-dashed border-white/30 rounded-2xl p-8 text-center hover:border-white/50 transition-all cursor-pointer relative overflow-hidden"
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="max-w-full max-h-64 mx-auto rounded-xl shadow-lg"
                        />
                        <p className="text-white text-lg font-medium">
                          {uploadedImage?.name || '촬영된 사진'}
                        </p>
                        <p className="text-white/60 text-sm">
                          다른 사진을 선택하려면 클릭하거나 드래그하세요
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <ImageIcon className="w-20 h-20 text-white/70 mx-auto" />
                        <div>
                          <p className="text-white text-xl font-semibold">
                            사진을 업로드하세요
                          </p>
                          <p className="text-white/60 mt-2">
                            JPG, PNG 파일을 지원합니다
                            <br />
                            드래그 앤 드롭도 가능해요!
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <button
                      onClick={startCamera}
                      disabled={isCameraLoading}
                      className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center gap-2 mx-auto"
                    >
                      <Camera className="w-5 h-5" />
                      {isCameraLoading ? '카메라 준비 중...' : '📸 카메라로 촬영하기'}
                    </button>
                    {cameraError && (
                      <p className="text-red-400 text-sm mt-2">{cameraError}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-64 object-cover rounded-xl"
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={switchCamera}
                        className="p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                        title="카메라 전환"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleCameraCapture}
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center gap-2"
                    >
                      <Camera className="w-5 h-5" />
                      📸 촬영
                    </button>
                    <button
                      onClick={stopCamera}
                      className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center gap-2"
                    >
                      <Square className="w-4 h-4" />
                      취소
                    </button>
                  </div>
                </div>
              )}

              {/* 분석/생성 버튼 */}
              {uploadedImage && !isCameraActive && (
                <div className="mt-6 space-y-3">
                  {!autoGenerate && (
                    <button
                      onClick={() => handleAnalyze()}
                      disabled={isAnalyzing || isGenerating}
                      className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-2xl transition-all text-lg flex items-center justify-center gap-3"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                          AI가 감정을 분석하는 중...
                        </>
                      ) : isGenerating ? (
                        <>
                          <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                          GPT가 밈을 생성하는 중...
                        </>
                      ) : (
                        <>
                          <Zap className="w-6 h-6" />
                          🚀 AI 감정 분석 & 밈 생성하기
                        </>
                      )}
                    </button>
                  )}
                  
                  {currentStep === 'generate' && analyzedEmotion && (
                    <button
                      onClick={() => generateMeme()}
                      disabled={isGenerating}
                      className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          밈 생성 중...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          🎨 밈 생성하기
                        </>
                      )}
                    </button>
                  )}
                  
                  <button
                    onClick={handleReset}
                    className="w-full bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    다시 시작
                  </button>
                </div>
              )}
            </div>

            {/* 밈 히스토리 */}
            {memeHistory.length > 0 && (
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Grid3X3 className="w-5 h-5" />
                  최근 생성한 밈들
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {memeHistory.map((meme) => (
                    <div 
                      key={meme.id} 
                      className="bg-white/10 rounded-xl p-2 border border-white/20 hover:bg-white/20 transition-all cursor-pointer group"
                      onClick={() => selectFromHistory(meme)}
                    >
                      <img 
                        src={meme.image} 
                        alt="Historical Meme" 
                        className="w-full h-auto rounded-lg mb-2 group-hover:scale-105 transition-transform"
                      />
                      <div className="text-center">
                        <p className="text-white/80 text-xs">{meme.emotion.icon} {meme.emotion.description}</p>
                        <p className="text-white/60 text-xs">{meme.timestamp.split(' ')[1]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 오른쪽: 결과 및 감정 분석 */}
          <div className="xl:col-span-2 space-y-6">
            {/* 감정 분석 결과 */}
            {analyzedEmotion && (
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
                <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="text-3xl">{analyzedEmotion.icon}</span>
                  AI 감정 분석 결과
                </h2>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/10 rounded-xl p-4">
                    <h4 className="text-white/80 text-sm mb-1">감정</h4>
                    <p className="text-white text-xl font-bold">{analyzedEmotion.description}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <h4 className="text-white/80 text-sm mb-1">신뢰도</h4>
                    <p className="text-white text-xl font-bold">{Math.round(analyzedEmotion.confidence * 100)}%</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/70">분석 정확도</span>
                    <span className="text-white font-medium">{Math.round(analyzedEmotion.confidence * 100)}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-green-400 to-blue-500"
                      style={{ width: `${analyzedEmotion.confidence * 100}%` }}
                    />
                  </div>
                </div>

                {analyzedEmotion.faceDetected && (
                  <div className="mt-4 p-3 bg-green-500/20 rounded-xl border border-green-400/30">
                    <p className="text-green-300 text-sm flex items-center gap-2">
                      ✅ 얼굴 감지 성공! 고정밀 감정 분석이 완료되었습니다.
                    </p>
                  </div>
                )}

                {analyzedEmotion.analysisData && (
                  <div className="mt-4 text-xs text-white/60">
                    <details className="cursor-pointer">
                      <summary className="hover:text-white/80 transition-colors">상세 분석 데이터 보기</summary>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <div>밝기: {analyzedEmotion.analysisData.brightness}</div>
                        <div>색온도: {analyzedEmotion.analysisData.warmth}</div>
                        <div>채도: {analyzedEmotion.analysisData.saturation}</div>
                        <div>대비: {analyzedEmotion.analysisData.contrast}</div>
                      </div>
                    </details>
                  </div>
                )}
              </div>
            )}

            {/* 생성된 밈 결과 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20">
              <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                <Sparkles className="w-7 h-7" />
                완성된 밈
              </h2>

              {generatedMeme ? (
                <div className="space-y-6">
                  <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
                    <img 
                      src={generatedMeme} 
                      alt="Generated Meme" 
                      className="w-full h-auto rounded-xl shadow-2xl"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={handleDownload}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 group"
                    >
                      <Download className="w-5 h-5 group-hover:animate-bounce" />
                      다운로드
                    </button>
                    <button
                      onClick={handleShare}
                      className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 group"
                    >
                      <Share2 className="w-5 h-5 group-hover:animate-pulse" />
                      공유하기
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={regenerateMeme}
                      disabled={isGenerating}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                      {isGenerating ? '생성 중...' : '🎲 다른 버전'}
                    </button>
                    <button
                      onClick={handleReset}
                      className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      새 사진
                    </button>
                  </div>

                  {/* 밈 정보 */}
                  <div className="bg-white/5 rounded-xl p-3 text-sm text-white/70">
                    <div className="flex items-center justify-between">
                      <span>스타일: {bubbleStyles.find(s => s.id === selectedStyle)?.name}</span>
                      <span>품질: 고화질</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ImageIcon className="w-12 h-12 text-white/50" />
                  </div>
                  <h3 className="text-xl text-white font-semibold mb-2">
                    밈이 곧 완성됩니다!
                  </h3>
                  <p className="text-white/60 text-lg">
                    {currentStep === 'upload' && '사진을 업로드하고 분석을 시작하세요'}
                    {currentStep === 'analyze' && '감정 분석이 진행 중입니다...'}
                    {currentStep === 'generate' && '맞춤형 밈을 생성하고 있어요...'}
                  </p>
                  
                  {(isAnalyzing || isGenerating) && (
                    <div className="mt-6">
                      <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-white/80">
                        {isAnalyzing && 'AI가 표정을 분석하고 있어요... 🤖'}
                        {isGenerating && 'GPT가 완벽한 밈을 만들고 있어요... 🎨'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 하단 기능 소개 */}
        <div className="mt-12 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
            <h3 className="text-3xl font-bold text-white mb-8 text-center">✨ MoodMeme.ai 특별 기능</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: '🧠',
                  title: 'AI 감정 분석',
                  description: 'Face-api.js + 고급 픽셀 분석으로 8가지 감정을 정확히 인식',
                  gradient: 'from-blue-500 to-purple-600'
                },
                {
                  icon: '🎨',
                  title: '스마트 밈 생성',
                  description: 'GPT 수준의 유머 알고리즘으로 상황에 맞는 재미있는 대사 생성',
                  gradient: 'from-green-500 to-teal-600'
                },
                {
                  icon: '📱',
                  title: '실시간 카메라',
                  description: '웹캠으로 즉석 촬영하여 바로 밈 생성, 전면/후면 카메라 지원',
                  gradient: 'from-pink-500 to-red-600'
                },
                {
                  icon: '🎭',
                  title: '5가지 스타일',
                  description: '버블, 코믹, 모던, 네온, 레트로 스타일로 개성있는 밈 제작',
                  gradient: 'from-orange-500 to-yellow-600'
                }
              ].map((feature, index) => (
                <div key={index} className="text-center p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  <h4 className="text-white font-semibold text-lg mb-2">{feature.title}</h4>
                  <p className="text-white/70 text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="text-center text-white/60 pb-8">
          <p className="text-lg mb-2">Made with by MoodMeme.ai</p>
          <p className="text-sm">AI 기반 감정 분석 & 밈 생성</p>
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <span className="flex items-center gap-1">🤖 Advanced AI</span>
            <span className="flex items-center gap-1">🎨 Creative Memes</span>
            <span className="flex items-center gap-1">📱 Mobile Friendly</span>
            <span className="flex items-center gap-1">🚀 Real-time</span>
            <span className="flex items-center gap-1">🆓 Free Forever</span>
          </div>
        </div>

        {/* 숨겨진 캔버스 */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default MoodMemeAI;