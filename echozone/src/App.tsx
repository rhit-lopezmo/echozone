import { useState, useEffect } from 'preact/hooks';
import './App.css';
import PlayerPanel from './PlayerPanel';
import EqualizerPanel from './EqualizerPanel';
import PlaylistPanel from './PlaylistPanel';
import ContextMenu from './ContextMenu';
import { onTopPanelChange } from './DraggablePanel';

function App() {
  const [topPanelId, setTopPanelId] = useState('player');
	const [videoId, setVideoId] = useState('');

  useEffect(() => {
    // Register the callback for whenever layout updates
    onTopPanelChange((topId) => {
      setTopPanelId(topId);
    });
  }, []);

  return (
    <div class="app">
			<ContextMenu />
      <div class="panel-container">
        <PlayerPanel isTop={topPanelId === 'player'} videoId={videoId}/>
        <EqualizerPanel isTop={topPanelId === 'eq'} />
        <PlaylistPanel isTop={topPanelId === 'playlist'} onLoadVideo={setVideoId}/>
      </div>
    </div>
  );
}

export default App;

