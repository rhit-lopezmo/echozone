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
      <input
        type="text"
        value={url}
        placeholder="Paste YouTube link..."
        onInput={(e: any) => setUrl(e.target.value)}
      />
      <button onClick={() => {
        const id = extractVideoId(url);
        if (id) {
          onLoadVideo(id);
          setUrl('');
        }
      }}>Load Video</button>
    </DraggablePanel>
  );
}
