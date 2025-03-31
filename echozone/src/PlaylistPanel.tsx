import { useState } from 'preact/hooks';
import DraggablePanel from './DraggablePanel';

export default function PlaylistPanel({ isTop, onLoadVideo }: { isTop: boolean, onLoadVideo: (id: string) => void }) {
  const [url, setUrl] = useState('');

	const extractVideoId = (ytUrl: string): string => {
		try {
			const url = new URL(ytUrl);
			if (url.hostname === 'youtu.be') {
				return url.pathname.slice(1); // short link format
			}

			if (url.hostname.includes('youtube.com')) {
				return url.searchParams.get('v') || '';
			}

			return '';
		} catch {
			return '';
		}
	};

  return (
    <DraggablePanel id="playlist" title="Playlist" defaultOrder={2} isTop={isTop}>
			<div class="playlist-container">
			<div class="placeholder"></div>
      <input
				class="frosty-input"
        type="text"
        value={url}
        placeholder="link goes here"
        onInput={(e: any) => setUrl(e.target.value)}
      />
      <button class="frosty-btn" onClick={() => {
        const id = extractVideoId(url);
        if (id) {
          onLoadVideo(id);
          setUrl('');
        }
      }}>Load Playlist</button>
			</div>
    </DraggablePanel>
  );
}
