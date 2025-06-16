// src/hooks/useCamera.js
import { useState, useRef, useCallback } from 'react';

export const useCamera = () => {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' 또는 'environment'
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // 카메라 시작
  const startCamera = useCallback(async (constraints = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const defaultConstraints = {
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: false
      };

      const finalConstraints = { ...defaultConstraints, ...constraints };
      
      // 기존 스트림이 있다면 중지
      if (streamRef.current) {
        stopCamera();
      }

      const stream = await navigator.mediaDevices.getUserMedia(finalConstraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsActive(true);
        
        // 비디오 로드 완료 대기
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = resolve;
        });
      }
    } catch (err) {
      console.error('카메라 접근 오류:', err);
      
      let errorMessage = '카메라에 접근할 수 없습니다.';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = '카메라 권한이 거부되었습니다. 브라우저 설정에서 카메라 권한을 허용해주세요.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = '카메라를 찾을 수 없습니다. 카메라가 연결되어 있는지 확인해주세요.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = '카메라가 다른 애플리케이션에서 사용 중입니다.';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = '요청한 카메라 설정을 지원하지 않습니다.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [facingMode]);

  // 카메라 중지
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsActive(false);
    setError(null);
  }, []);

  // 사진 촬영
  const capturePhoto = useCallback((options = {}) => {
    if (!videoRef.current || !isActive) {
      throw new Error('카메라가 활성화되지 않았습니다.');
    }

    const {
      format = 'image/jpeg',
      quality = 0.9,
      maxWidth = 1200,
      maxHeight = 1200
    } = options;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // 비디오 크기 가져오기
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    // 크기 조정 계산
    const scale = Math.min(
      maxWidth / videoWidth,
      maxHeight / videoHeight,
      1
    );

    canvas.width = videoWidth * scale;
    canvas.height = videoHeight * scale;

    // 전면 카메라의 경우 좌우 반전
    if (facingMode === 'user') {
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    } else {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    // Blob 생성
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const file = new File([blob], `camera-${Date.now()}.jpg`, {
          type: format,
          lastModified: Date.now()
        });
        
        const dataUrl = canvas.toDataURL(format, quality);
        
        resolve({
          file,
          dataUrl,
          canvas,
          dimensions: {
            width: canvas.width,
            height: canvas.height
          }
        });
      }, format, quality);
    });
  }, [isActive, facingMode]);

  // 카메라 전환 (전면/후면)
  const switchCamera = useCallback(async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    
    if (isActive) {
      await startCamera();
    }
  }, [facingMode, isActive, startCamera]);

  // 사용 가능한 카메라 목록 가져오기
  const getAvailableCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      return videoDevices.map(device => ({
        deviceId: device.deviceId,
        label: device.label || `카메라 ${videoDevices.indexOf(device) + 1}`,
        facingMode: device.label.toLowerCase().includes('front') || 
                   device.label.toLowerCase().includes('user') ? 'user' : 'environment'
      }));
    } catch (err) {
      console.error('카메라 목록 가져오기 실패:', err);
      return [];
    }
  }, []);

  // 특정 카메라 선택
  const selectCamera = useCallback(async (deviceId) => {
    if (isActive) {
      stopCamera();
    }
    
    await startCamera({
      video: {
        deviceId: { exact: deviceId },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    });
  }, [isActive, stopCamera, startCamera]);

  // 카메라 권한 확인
  const checkPermission = useCallback(async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' });
      return result.state; // 'granted', 'denied', 'prompt'
    } catch (err) {
      console.error('권한 확인 실패:', err);
      return 'unknown';
    }
  }, []);

  // 비디오 스트림 정보 가져오기
  const getStreamInfo = useCallback(() => {
    if (!streamRef.current || !videoRef.current) return null;
    
    const video = videoRef.current;
    const tracks = streamRef.current.getVideoTracks();
    const track = tracks[0];
    
    if (!track) return null;
    
    const settings = track.getSettings();
    const capabilities = track.getCapabilities();
    
    return {
      isActive,
      dimensions: {
        width: video.videoWidth,
        height: video.videoHeight
      },
      settings: {
        frameRate: settings.frameRate,
        facingMode: settings.facingMode,
        deviceId: settings.deviceId,
        width: settings.width,
        height: settings.height
      },
      capabilities: {
        frameRate: capabilities.frameRate,
        width: capabilities.width,
        height: capabilities.height,
        facingMode: capabilities.facingMode
      }
    };
  }, [isActive]);

  // 연속 촬영 (버스트 모드)
  const captureBurst = useCallback(async (count = 3, interval = 500) => {
    if (!isActive) {
      throw new Error('카메라가 활성화되지 않았습니다.');
    }
    
    const photos = [];
    
    for (let i = 0; i < count; i++) {
      const photo = await capturePhoto({
        format: 'image/jpeg',
        quality: 0.85
      });
      
      photos.push({
        ...photo,
        index: i,
        timestamp: Date.now()
      });
      
      // 마지막 사진이 아니면 대기
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
    
    return photos;
  }, [isActive, capturePhoto]);

  // 자동 촬영 (타이머)
  const captureWithTimer = useCallback((seconds = 3) => {
    return new Promise((resolve, reject) => {
      if (!isActive) {
        reject(new Error('카메라가 활성화되지 않았습니다.'));
        return;
      }
      
      let countdown = seconds;
      const timer = setInterval(() => {
        if (countdown <= 0) {
          clearInterval(timer);
          capturePhoto()
            .then(resolve)
            .catch(reject);
        } else {
          // 카운트다운 이벤트 발생 (UI에서 사용 가능)
          if (window.CustomEvent) {
            window.dispatchEvent(new CustomEvent('cameraCountdown', {
              detail: { countdown }
            }));
          }
          countdown--;
        }
      }, 1000);
    });
  }, [isActive, capturePhoto]);

  // 실시간 프레임 캡처 (감정 분석용)
  const startFrameCapture = useCallback((onFrame, interval = 1000) => {
    if (!isActive) return null;
    
    const captureFrame = async () => {
      try {
        const frame = await capturePhoto({
          format: 'image/jpeg',
          quality: 0.7,
          maxWidth: 640,
          maxHeight: 480
        });
        onFrame(frame);
      } catch (err) {
        console.error('프레임 캡처 실패:', err);
      }
    };
    
    const intervalId = setInterval(captureFrame, interval);
    
    return () => clearInterval(intervalId);
  }, [isActive, capturePhoto]);

  // 카메라 효과 적용 (필터)
  const applyFilter = useCallback((filterType) => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    
    switch (filterType) {
      case 'none':
        video.style.filter = 'none';
        break;
      case 'grayscale':
        video.style.filter = 'grayscale(100%)';
        break;
      case 'sepia':
        video.style.filter = 'sepia(100%)';
        break;
      case 'blur':
        video.style.filter = 'blur(3px)';
        break;
      case 'brightness':
        video.style.filter = 'brightness(1.2)';
        break;
      case 'contrast':
        video.style.filter = 'contrast(1.3)';
        break;
      case 'vintage':
        video.style.filter = 'sepia(0.5) contrast(1.2) brightness(1.1)';
        break;
      default:
        video.style.filter = 'none';
    }
  }, []);

  // 클린업 (컴포넌트 언마운트 시)
  const cleanup = useCallback(() => {
    stopCamera();
  }, [stopCamera]);

  return {
    // 상태
    isActive,
    isLoading,
    error,
    facingMode,
    
    // 레퍼런스
    videoRef,
    
    // 기본 기능
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    
    // 고급 기능
    getAvailableCameras,
    selectCamera,
    checkPermission,
    getStreamInfo,
    captureBurst,
    captureWithTimer,
    startFrameCapture,
    applyFilter,
    
    // 유틸리티
    cleanup
  };
};

export default useCamera;