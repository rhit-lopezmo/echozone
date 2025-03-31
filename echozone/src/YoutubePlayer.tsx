import { useEffect, useRef } from 'preact/hooks';
import CRTOverlay from './CRTOverlay';

export default function YouTubePlayer({
  videoId,
  onTitleChange,
}: {
  videoId: string;
  onTitleChange?: (title: string) => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!videoId || !iframeRef.current) return;

    const baseUrl = "https://www.youtube.com/embed/";
    const params = new URLSearchParams({
      enablejsapi: "1",
      loop: "1",
      playlist: videoId,
      modestbranding: "1",
      controls: "0",
      rel: "0",
    });

    iframeRef.current.src = `${baseUrl}${videoId}?${params.toString()}`;

    let player: YT.Player;

    const onPlayerReady = () => {
      playerRef.current = player;
      player.playVideo();

			const videoData = (player as any).getVideoData();
      onTitleChange?.(videoData.title);
    };

    const onYouTubeIframeAPIReady = () => {
      player = new window.YT.Player(iframeRef.current!, {
        events: {
          onReady: onPlayerReady,
        },
      });
    };

    if (window.YT && window.YT.Player) {
      onYouTubeIframeAPIReady();
    } else {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      (window as any).onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    }

    return () => {
      player?.destroy();
    };
  }, [videoId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const player = playerRef.current;
      if (!player) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          const state = player.getPlayerState();
          if (state === YT.PlayerState.PLAYING) {
            player.pauseVideo();
          } else if (state === YT.PlayerState.PAUSED) {
            player.playVideo();
          }
          break;
        case "ArrowLeft":
          player.seekTo(player.getCurrentTime() - 5, true);
          break;
        case "ArrowRight":
          player.seekTo(player.getCurrentTime() + 5, true);
          break;
        case "ArrowUp":
          e.preventDefault();
          player.setVolume(Math.min(player.getVolume() + 10, 100));
          break;
        case "ArrowDown":
          e.preventDefault();
          player.setVolume(Math.max(player.getVolume() - 10, 0));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div class="iframe-wrapper">
      <div class="aspect-box">
        <iframe
          ref={iframeRef}
          style={{ border: 'none' }}
          allow="autoplay; encrypted-media"
        />
        <div class="iframe-blocker" />
        <CRTOverlay />
      </div>
    </div>
  );
}
