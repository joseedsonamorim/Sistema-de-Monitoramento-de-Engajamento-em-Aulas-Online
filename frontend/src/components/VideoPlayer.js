import React, { useRef } from 'react';
import './VideoPlayer.css';

function VideoPlayer({ onEvent }) {
  const videoRef = useRef(null);
  const isPlayingRef = useRef(false);

  const handlePlay = () => {
    if (!isPlayingRef.current) {
      isPlayingRef.current = true;
      onEvent('play');
    }
  };

  const handlePause = () => {
    if (isPlayingRef.current) {
      isPlayingRef.current = false;
      onEvent('pause');
    }
  };

  const handleSeek = () => {
    onEvent('seek');
  };

  return (
    <div className="video-player-container glass-card">
      <div className="video-player">
        <video
          ref={videoRef}
          controls
          onPlay={handlePlay}
          onPause={handlePause}
          onSeeked={handleSeek}
          className="video-element"
        >
          <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
          Seu navegador não suporta o elemento de vídeo.
        </video>
      </div>
      <div className="player-info">
        <h2>Introdução à Programação Web</h2>
        <p>
          Nesta aula, você aprenderá os fundamentos da programação web moderna,
          incluindo HTML5, CSS3 e JavaScript. Acompanhe o conteúdo com atenção
          e faça anotações regularmente.
        </p>
      </div>
    </div>
  );
}

export default VideoPlayer;


