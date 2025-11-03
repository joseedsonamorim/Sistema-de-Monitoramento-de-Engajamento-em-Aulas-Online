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
    this.stream = null;
    this.isRunning = false;
    this.healthCheckInterval = null;

    // Iniciar verificação periódica do estado da câmera
    this.startHealthCheck();
  }

  startHealthCheck() {
    this.healthCheckInterval = setInterval(async () => {
      if (this.isRunning) {
        const videoElement = document.getElementById('input_video');
        
        if (!videoElement || !videoElement.srcObject || videoElement.readyState !== 4) {
          console.warn('Problema detectado com a câmera, tentando reconectar...');
          try {
            await this.stop();
            await this.start();
          } catch (error) {
            console.error('Falha ao reconectar câmera:', error);
          }
        }
      }
    }, 5000); // Verificar a cada 5 segundos
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('Iniciando carregamento do MediaPipe...');
      
      // Verificar suporte do navegador
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Este navegador não suporta acesso à câmera');
      }

      // Verificar se o MediaPipe já foi carregado
      if (typeof window !== 'undefined' && window.FaceMesh && window.Camera) {
        console.log('MediaPipe já está carregado');
      } else {
        console.log('Carregando MediaPipe...');
        // Carregar scripts com retry
        const maxRetries = 3;
        let loaded = false;
        
        for (let i = 0; i < maxRetries && !loaded; i++) {
          try {
            await Promise.all([
              this.loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/face_mesh.js'),
              this.loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3.1632432234/camera_utils.js')
            ]);

            // Aguardar um curto período para garantir que os scripts foram processados
            await new Promise(resolve => setTimeout(resolve, 500));
            
            if (typeof window !== 'undefined' && window.FaceMesh && window.Camera) {
              loaded = true;
              console.log('MediaPipe carregado com sucesso');
            } else {
              throw new Error('MediaPipe não foi carregado corretamente');
            }
          } catch (error) {
            console.warn(`Tentativa ${i + 1} de ${maxRetries} falhou:`, error);
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          }
        }
      }

      console.log('Configurando FaceMesh...');
      
      this.faceMesh = new window.FaceMesh({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`;
        },
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      await this.faceMesh.initialize();

      this.faceMesh.onResults((results) => {
        this.processResults(results);
      });

      console.log('FaceMesh configurado com sucesso');
      this.isInitialized = true;
    } catch (error) {
      console.error('Erro na inicialização:', error);
      throw error;
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
    try {
      const leftEAR = this.getEyeAspectRatio([
        landmarks[33], landmarks[133], landmarks[157], 
        landmarks[158], landmarks[159], landmarks[160]
      ]);
      
      const rightEAR = this.getEyeAspectRatio([
        landmarks[362], landmarks[385], landmarks[386],
        landmarks[387], landmarks[388], landmarks[466]
      ]);

      return (leftEAR + rightEAR) / 2;
    } catch (error) {
      console.warn('Erro ao calcular EAR:', error);
      return 0.3; // valor padrão seguro
    }
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
      if (this.isRunning) {
        console.log('Sistema já está em execução');
        return;
      }

      console.log('Iniciando sistema de detecção facial...');
      
      // Verificar disponibilidade de câmera
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        throw new Error('NotFoundError');
      }
      
      // Solicitar permissão da câmera
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
            frameRate: { ideal: 30 }
          },
          audio: false
        });
        this.stream = stream;
        console.log('Permissão da câmera concedida');
      } catch (error) {
        console.error('Erro ao solicitar permissão da câmera:', error);
        throw error;
      }

      // Liberar a stream inicial após verificar que está funcionando
      const track = stream.getVideoTracks()[0];
      const settings = track.getSettings();
      console.log('Configurações da câmera:', settings);
      
      if (!settings.width || !settings.height) {
        track.stop();
        throw new Error('NotSupportedError');
      }
      
      track.stop();

      // Inicializar MediaPipe
      await this.initialize();

      if (!this.faceMesh) {
        throw new Error('MediaPipe não inicializou corretamente');
      }

      const videoElement = document.getElementById('input_video');
      if (!videoElement) {
        throw new Error('Elemento de vídeo não encontrado');
      }

      // Configurar elemento de vídeo
      Object.assign(videoElement.style, {
        display: 'block',
        position: 'fixed',
        top: '0',
        left: '0',
        width: '1px',
        height: '1px',
        opacity: '0.01'
      });
      
      videoElement.muted = true;
      videoElement.playsInline = true;
      videoElement.crossOrigin = 'anonymous';

      if (!window.Camera) {
        throw new Error('MediaPipe Camera API não disponível');
      }

      console.log('Iniciando câmera com MediaPipe...');
      
      // Criar e configurar câmera com retry e timeout
      const maxRetries = 3;
      let cameraStarted = false;
      
      for (let i = 0; i < maxRetries && !cameraStarted; i++) {
        try {
          // Primeiro, tentar obter um stream de vídeo diretamente
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
              facingMode: "user",
              frameRate: { ideal: 30 }
            }
          });

          // Atribuir o stream ao elemento de vídeo
          videoElement.srcObject = stream;
          await videoElement.play();

          // Configurar a câmera do MediaPipe
          this.camera = new window.Camera(videoElement, {
            onFrame: async () => {
              if (this.faceMesh && videoElement.readyState === 4) {
                try {
                  await this.faceMesh.send({ image: videoElement });
                } catch (error) {
                  if (!error.message.includes('Canvas has been cleared')) {
                    console.warn('Erro no processamento do frame:', error);
                  }
                }
              }
            },
            width: 640,
            height: 480
          });

          // Iniciar o processamento da câmera com retry em caso de falha
          let startAttempts = 0;
          const maxStartAttempts = 3;
          
          while (startAttempts < maxStartAttempts) {
            try {
              await Promise.race([
                this.camera.start(),
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Timeout ao iniciar câmera')), 5000)
                )
              ]);
              cameraStarted = true;
              console.log('Câmera iniciada com sucesso');
              break;
            } catch (startError) {
              startAttempts++;
              console.warn(`Tentativa ${startAttempts} de iniciar câmera falhou:`, startError);
              if (startAttempts === maxStartAttempts) throw startError;
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        } catch (error) {
          console.warn(`Tentativa ${i + 1} de ${maxRetries} falhou:`, error);
          if (this.camera) {
            try {
              this.camera.stop();
            } catch (e) {
              console.warn('Erro ao parar câmera:', e);
            }
          }
          if (i === maxRetries - 1) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }

      // Verificar se o vídeo está recebendo frames
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout aguardando frames de vídeo'));
        }, 5000);

        const checkVideo = () => {
          if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
            clearTimeout(timeout);
            resolve();
          } else {
            requestAnimationFrame(checkVideo);
          }
        };

        videoElement.addEventListener('playing', checkVideo, { once: true });
        videoElement.addEventListener('error', (e) => {
          clearTimeout(timeout);
          reject(new Error(`Erro no elemento de vídeo: ${videoElement.error.message}`));
        }, { once: true });
      });

      if (this.onReady) {
        this.onReady();
      }
    } catch (error) {
      console.error('Erro ao iniciar câmera:', error);
      
      // Informar o usuário sobre o problema específico
      let userMessage = 'Erro ao iniciar o sistema de monitoramento: ';
      if (error.name === 'NotAllowedError' || error.message.includes('Permission denied')) {
        userMessage += 'Permissão da câmera negada. Por favor, permita o acesso à câmera e recarregue a página.';
      } else if (error.name === 'NotFoundError' || error.message.includes('Requested device not found')) {
        userMessage += 'Nenhuma câmera encontrada. Conecte uma câmera e recarregue a página.';
      } else if (error.name === 'NotReadableError' || error.message.includes('Could not start video source')) {
        userMessage += 'Câmera pode estar em uso por outro aplicativo. Feche outros programas que possam estar usando a câmera.';
      } else if (error.name === 'NotSupportedError') {
        userMessage += 'Sua câmera não é compatível com os requisitos necessários. Tente usar outra câmera.';
      } else if (error.message.includes('Timeout')) {
        userMessage += 'Tempo excedido ao tentar acessar a câmera. Tente recarregar a página.';
      } else {
        userMessage += error.message || 'Erro desconhecido ao acessar a câmera.';
      }
      
      console.warn(userMessage);
      throw error;  // Vamos deixar o StudentView lidar com o erro
    }
  }

  simulateDetection() {
    console.log('Iniciando modo simulado de detecção facial');
    // Modo simulado para desenvolvimento sem câmera
    this.simulationInterval = setInterval(() => {
      const isGazeOnScreen = Math.random() > 0.3; // 70% chance de olhar para tela
      const fatigueScore = Math.random() * 0.8; // Score de fadiga variável
      const blinkIncrement = Math.floor(Math.random() * 3); // 0-2 piscadas por intervalo

      this.blinkCount += blinkIncrement;

      this.onDetectionUpdate({
        faceDetected: true,
        gazeOnScreen: isGazeOnScreen,
        fatigueScore: fatigueScore,
        blinkCount: this.blinkCount,
        yawnCount: this.yawnCount,
        attentionScore: isGazeOnScreen ? (1.0 - fatigueScore * 0.5) : 0.0
      });
    }, 2000);
  }

  async stop() {
    try {
      if (this.camera) {
        await this.camera.stop();
        this.camera = null;
      }
      if (this.faceMesh) {
        await this.faceMesh.close();
        this.faceMesh = null;
      }
      this.isInitialized = false;
      
      // Limpar o elemento de vídeo
      const videoElement = document.getElementById('input_video');
      if (videoElement) {
        videoElement.srcObject = null;
        videoElement.load();
      }
      
      console.log('Sistema de detecção facial parado com sucesso');
    } catch (error) {
      console.error('Erro ao parar o sistema:', error);
    }
  }

  resetCounters() {
    this.blinkCount = 0;
    this.yawnCount = 0;
    this.gazeOffScreen = 0;
  }
}

