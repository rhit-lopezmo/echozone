import { useState } from 'preact/hooks';
import DraggablePanel from './DraggablePanel';

export default function PlaylistPanel({ isTop, onLoadVideo }: { isTop: boolean, onLoadVideo: (id: string) => void }) {
  const [url, setUrl] = useState('');

  const extractVideoId = (ytUrl: string): string => {
    try {
      const parsed = new URL(ytUrl);
      if (parsed.hostname === 'youtu.be') {
        return parsed.pathname.slice(1); // short link format
      }
      if (parsed.hostname.includes('youtube.com')) {
        return parsed.searchParams.get('v') || '';
      }
      return '';
    } catch {
      return '';
    }
  };

  // Determine if the URL looks like a playlist link by checking for "list=".
  const isPlaylist = url.includes('list=');

  const handleLoad = () => {
    if (isPlaylist) {
      // For a playlist URL, use the full URL.
      onLoadVideo(url);
      setUrl('');
    } else {
      const id = extractVideoId(url);
      if (id) {
        onLoadVideo(url); // even for single videos, we can pass the full URL
        setUrl('');
      }
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
        <button class="frosty-btn" onClick={handleLoad}>
          Load Playlist
        </button>
      </div>
    </DraggablePanel>
  );
}
