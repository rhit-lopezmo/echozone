import { useState, useEffect } from 'preact/hooks';
import './App.css';
import PlayerPanel from './PlayerPanel';
import EqualizerPanel from './EqualizerPanel';
import PlaylistPanel from './PlaylistPanel';
import { onTopPanelChange } from './DraggablePanel';

function App() {
  const [topPanelId, setTopPanelId] = useState('player');

  useEffect(() => {
    // Register the callback for whenever layout updates
    onTopPanelChange((topId) => {
      setTopPanelId(topId);
    });
  }, []);

  return (
    <div class="app">
      <div class="panel-container">
        <PlayerPanel isTop={topPanelId === 'player'} />
        <EqualizerPanel isTop={topPanelId === 'eq'} />
        <PlaylistPanel isTop={topPanelId === 'playlist'} />
      </div>
    </div>
  );
}

export default App;

