import { useEffect, useRef } from 'preact/hooks';
import CRTOverlay from './CRTOverlay';

export default function YouTubePlayer({ videoId }: { videoId: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current && videoId) {
			iframeRef.current.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&modestbranding=1&controls=1&rel=0&showinfo=0`;
    }
  }, [videoId]);

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

