// FaceDetection using MediaPipe via CDN

export class FaceDetectionSystem {
  constructor(onDetectionUpdate, onReady) {
    this.onDetectionUpdate = onDetectionUpdate;
    this.onReady = onReady;

    this.lastBlinkTime = 0;
    this.earHistory = [];
    this.blinkCount = 0;
    this.yawnCount = 0;
    this.lastYawnTime = 0;
    this.eyeOpenTime = 0;
    this.stressScore = 0;
    this.gazeOffScreen = 0;

    this.faceMesh = null;
    this.camera = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    // Dynamically load MediaPipe scripts
    await this.loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh');
    await this.loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils');

    if (typeof window !== 'undefined' && window.FaceMesh) {
      this.faceMesh = new window.FaceMesh({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        },
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.faceMesh.onResults((results) => {
        this.processResults(results);
      });

      this.isInitialized = true;
    }
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  processResults(results) {
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      this.onDetectionUpdate({
        faceDetected: false,
        gazeOnScreen: false,
        fatigueScore: 0,
        blinkCount: this.blinkCount,
        yawnCount: this.yawnCount
      });
      return;
    }

    const landmarks = results.multiFaceLandmarks[0];
    const eyeAspectRatio = this.calculateEAR(landmarks);
    const yawnRatio = this.calculateYawnRatio(landmarks);
    const gazeDirection = this.estimateGaze(landmarks);

    // Detectar piscadas
    if (eyeAspectRatio < 0.2) {
      const currentTime = Date.now();
      if (currentTime - this.lastBlinkTime > 300) {
        this.blinkCount++;
        this.lastBlinkTime = currentTime;
      }
    }

    // Detectar bocejos
    if (yawnRatio > 0.6) {
      const currentTime = Date.now();
      if (currentTime - this.lastYawnTime > 2000) {
        this.yawnCount++;
        this.lastYawnTime = currentTime;
      }
    }

    // Calcular score de fadiga
    const fatigueScore = this.calculateFatigue(eyeAspectRatio, yawnRatio, this.blinkCount);

    // Detectar desvio de olhar
    const isGazeOnScreen = gazeDirection.x > -0.3 && gazeDirection.x < 0.3 && 
                           gazeDirection.y > -0.2 && gazeDirection.y < 0.2;
    
    if (!isGazeOnScreen) {
      this.gazeOffScreen++;
    }

    this.onDetectionUpdate({
      faceDetected: true,
      gazeOnScreen: isGazeOnScreen,
      fatigueScore: Math.min(fatigueScore, 1.0),
      blinkCount: this.blinkCount,
      yawnCount: this.yawnCount,
      attentionScore: isGazeOnScreen ? 1.0 : 0.0
    });
  }

  calculateEAR(landmarks) {
    // Índices dos pontos do olho esquerdo
    const leftEye = [
      landmarks[33], landmarks[7], landmarks[163], landmarks[144],
      landmarks[145], landmarks[153], landmarks[154], landmarks[155]
    ];
    
    // Índices dos pontos do olho direito
    const rightEye = [
      landmarks[362], landmarks[382], landmarks[381], landmarks[380],
      landmarks[374], landmarks[373], landmarks[390], landmarks[249]
    ];

    const leftEAR = this.getEyeAspectRatio([
      landmarks[33], landmarks[133], landmarks[157], 
      landmarks[158], landmarks[159], landmarks[160]
    ]);
    
    const rightEAR = this.getEyeAspectRatio([
      landmarks[362], landmarks[385], landmarks[386],
      landmarks[387], landmarks[388], landmarks[466]
    ]);

    return (leftEAR + rightEAR) / 2;
  }

  getEyeAspectRatio(eyePoints) {
    const verticalDist1 = this.distance(eyePoints[1], eyePoints[5]);
    const verticalDist2 = this.distance(eyePoints[2], eyePoints[4]);
    const horizontalDist = this.distance(eyePoints[0], eyePoints[3]);

    return (verticalDist1 + verticalDist2) / (2 * horizontalDist);
  }

  calculateYawnRatio(landmarks) {
    // Pontos da boca
    const mouthTop = landmarks[13];
    const mouthBottom = landmarks[14];

    const mouthOpening = Math.abs(mouthTop.y - mouthBottom.y);
    
    return mouthOpening;
  }

  estimateGaze(landmarks) {
    // Estimativa simples do gaze baseada na posição da íris
    const noseTip = landmarks[4];
    const leftEyeCenter = landmarks[33];
    const rightEyeCenter = landmarks[263];

    const gazeX = (leftEyeCenter.x + rightEyeCenter.x) / 2 - noseTip.x;
    const gazeY = noseTip.y - (leftEyeCenter.y + rightEyeCenter.y) / 2;

    return { x: gazeX, y: gazeY };
  }

  calculateFatigue(EAR, yawnRatio, blinkCount) {
    let fatigue = 0;

    // Fadiga por olhos fechados
    if (EAR < 0.2) fatigue += 0.4;
    else if (EAR < 0.25) fatigue += 0.2;

    // Fadiga por bocejo
    if (yawnRatio > 0.6) fatigue += 0.3;
    else if (yawnRatio > 0.4) fatigue += 0.1;

    // Fadiga por piscadas excessivas
    if (blinkCount > 20) fatigue += 0.3;

    return Math.min(fatigue, 1.0);
  }

  distance(point1, point2) {
    return Math.sqrt(
      Math.pow(point1.x - point2.x, 2) + 
      Math.pow(point1.y - point2.y, 2)
    );
  }

  async start() {
    try {
      await this.initialize();
      
      if (!this.faceMesh) {
        console.error('MediaPipe não carregado');
        return;
      }

      const videoElement = document.getElementById('input_video');
      
      if (window.Camera) {
        this.camera = new window.Camera(videoElement, {
          onFrame: async () => {
            if (this.faceMesh) {
              await this.faceMesh.send({ image: videoElement });
            }
          },
          width: 640,
          height: 480
        });
        
        await this.camera.start();
        
        if (this.onReady) {
          this.onReady();
        }
      } else {
        // Fallback: simular detecção para desenvolvimento
        console.log('MediaPipe não disponível, usando modo simulado');
        this.simulateDetection();
        if (this.onReady) {
          this.onReady();
        }
      }
    } catch (error) {
      console.error('Erro ao iniciar câmera:', error);
      this.simulateDetection();
      if (this.onReady) {
        this.onReady();
      }
    }
  }

  simulateDetection() {
    // Modo simulado para desenvolvimento sem câmera
    setInterval(() => {
      this.onDetectionUpdate({
        faceDetected: true,
        gazeOnScreen: Math.random() > 0.2,
        fatigueScore: Math.random() * 0.5,
        blinkCount: this.blinkCount + Math.floor(Math.random() * 2),
        yawnCount: this.yawnCount,
        attentionScore: Math.random() > 0.3 ? 1.0 : 0.0
      });
      this.blinkCount++;
    }, 2000);
  }

  stop() {
    if (this.camera) {
      this.camera.stop();
    }
  }

  resetCounters() {
    this.blinkCount = 0;
    this.yawnCount = 0;
    this.gazeOffScreen = 0;
  }
}

