import { useState, useEffect } from 'preact/hooks';
import './App.css';
import PlayerPanel from './PlayerPanel';
import EqualizerPanel from './EqualizerPanel';
import PlaylistPanel from './PlaylistPanel';

function App() {
  const [topPanelId, setTopPanelId] = useState('player');

  useEffect(() => {
    const updateTop = () => {
      const panels = document.querySelectorAll('.draggable-panel');
      let topId = '';
      let maxZ = -1;
      panels.forEach(panel => {
        const z = parseInt(getComputedStyle(panel).zIndex || '0');
        if (z > maxZ) {
          maxZ = z;
          topId = panel.getAttribute('data-panel-id') || '';
        }
      });
      if (topId) setTopPanelId(topId);
    };

    document.addEventListener('mousedown', updateTop);
    updateTop();

    return () => document.removeEventListener('mousedown', updateTop);
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
