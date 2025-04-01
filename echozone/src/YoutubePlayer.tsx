import { useEffect, useRef, useState } from 'preact/hooks';
import CRTOverlay from './CRTOverlay';

export default function YouTubePlayer({
  videoId, // can be a raw ID like "dQw4w9WgXcQ" or a full URL containing ?v=, ?list=, &index=
  onTitleChange,
}: {
  videoId: string;
  onTitleChange?: (title: string) => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<YT.Player | null>(null);
  const titleSetRef = useRef(false);
  const [started, setStarted] = useState(false);
  const [playerKey, setPlayerKey] = useState(0);

  /**
   * Parse the incoming videoId (which might be a full URL or just an ID).
   * Extracts query parameters for 'v', 'list', and 'index'.
   */
  function parseYouTubeLink(input: string) {
    try {
      const parsed = new URL(input);
      const maybeV = parsed.searchParams.get('v') ?? parsed.pathname.split('/').pop();
      const maybeList = parsed.searchParams.get('list');
      const maybeIndex = parsed.searchParams.get('index'); // optional index
      return {
        videoParam: maybeV,
        playlistId: maybeList,
        index: maybeIndex,
      };
    } catch {
      // Not a full URL – assume input is a raw ID.
      return {
        videoParam: input,
        playlistId: null,
        index: null,
      };
    }
  }

  // When videoId changes, reset started and force a remount of the iframe.
  useEffect(() => {
    titleSetRef.current = false;
    setStarted(false);
    setPlayerKey(prev => prev + 1);
  }, [videoId]);

  useEffect(() => {
    console.log("useEffect triggered => started:", started, "videoId:", videoId, "iframeRef:", iframeRef.current);
    if (!started || !videoId || !iframeRef.current) return;

    // Parse out video, playlist, and index.
    const { videoParam, playlistId, index } = parseYouTubeLink(videoId);
    console.log("DEBUG parse =>", { videoParam, playlistId, index });

    const baseUrl = 'https://www.youtube.com/embed/';
    let finalSrc = '';

    if (playlistId) {
      // For playlists, use the "videoseries" embed path with ?list=PLAYLIST_ID.
      const params = new URLSearchParams({
        enablejsapi: '1',
        autoplay: '1',
        loop: '1',
        list: playlistId,
        modestbranding: '1',
        controls: '0',
        rel: '0',
      });
      // We'll also handle the index via the API, but you can leave it in the URL if desired.
      // (Sometimes YouTube ignores index in the URL.)
      if (index) {
        params.set('index', index);
      }
      finalSrc = `${baseUrl}videoseries?${params.toString()}`;
      console.log(`finalSrc (playlist): ${finalSrc}`);
    } else if (videoParam) {
      // For a single video, embed using its ID and add playlist=VIDEO_ID for looping.
      const params = new URLSearchParams({
        enablejsapi: '1',
        loop: '1',
        playlist: videoParam,
        modestbranding: '1',
        controls: '0',
        rel: '0',
      });
      finalSrc = `${baseUrl}${videoParam}?${params.toString()}`;
      console.log(`finalSrc (video): ${finalSrc}`);
    } else {
      console.error("could not find video id or playlist id");
      return;
    }

    // Update the iframe's src.
    iframeRef.current.src = finalSrc;

    let player: YT.Player | null = null;
    const onPlayerReady = () => {
      playerRef.current = player;
      player!.unMute();
      // If this is a playlist and an index was provided, explicitly jump to that video.
      if (playlistId && index) {
        // API uses 0-based index, so subtract 1.
        const targetIndex = Math.max(Number(index) - 1, 0);
        console.log("Setting playlist start index to:", targetIndex);
        player!.playVideoAt(targetIndex);
      } else {
        player!.playVideo();
      }
    };

    const onPlayerStateChange = (event: YT.OnStateChangeEvent) => {
      if (
        !titleSetRef.current &&
        event.data === YT.PlayerState.PLAYING &&
        playerRef.current
      ) {
        const videoData = (playerRef as any).current.getVideoData();
        if (videoData?.title) {
          titleSetRef.current = true;
          onTitleChange?.(videoData.title);
        }
      }
    };

    const onYouTubeIframeAPIReady = () => {
      player = new window.YT.Player(iframeRef.current!, {
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
    };

    if (window.YT && window.YT.Player) {
      onYouTubeIframeAPIReady();
    } else {
      const scriptTag = document.createElement('script');
      scriptTag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(scriptTag);
      (window as any).onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    }

    return () => {
      player?.destroy();
    };
  }, [started, videoId, playerKey]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!started) return;
      const player = playerRef.current;
      if (!player) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          const state = player.getPlayerState();
          if (state === YT.PlayerState.PLAYING) {
            player.pauseVideo();
          } else {
            player.unMute();
            player.playVideo();
          }
          break;
        case 'ArrowLeft':
          player.seekTo(Math.max(player.getCurrentTime() - 5, 0), true);
          break;
        case 'ArrowRight':
          player.seekTo(player.getCurrentTime() + 5, true);
          break;
        case 'ArrowUp':
          e.preventDefault();
          player.setVolume(Math.min(player.getVolume() + 10, 100));
          break;
        case 'ArrowDown':
          e.preventDefault();
          player.setVolume(Math.max(player.getCurrentTime() - 10, 0));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [started]);

  const handleStart = () => {
    console.log("handleStart triggered");
    setStarted(true);
  };

  return (
    <div class="iframe-wrapper">
      <div
        class="aspect-box"
        onClick={handleStart}
        onKeyDown={handleStart}
        tabIndex={0}
      >
        {started && (
          <iframe
            key={playerKey}
            ref={iframeRef}
            style={{ border: 'none' }}
            allow="autoplay; encrypted-media"
          />
        )}
        {!started && (
          <div class="start-screen">
            <div class="start-prompt">CLICK TO START ECHOZONE</div>
          </div>
        )}
        <CRTOverlay />
      </div>
    </div>
  );
}

