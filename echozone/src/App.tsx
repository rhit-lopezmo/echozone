import { useState, useEffect } from 'preact/hooks'
import './App.css'
import DraggablePanel from './DraggablePanel'
import { getCurrentWindow } from '@tauri-apps/api/window'

function App() {
  const [topPanelId, setTopPanelId] = useState('player') // ✅ MOVED OUTSIDE useEffect
  const appWindow = getCurrentWindow()

  useEffect(() => {
    const titlebar = document.querySelector(".titlebar")
    if (titlebar) {
      titlebar.addEventListener("dblclick", (e) => {
        e.preventDefault()
        e.stopPropagation()
      })
    }

    const updateTop = () => {
      const panels = document.querySelectorAll('.draggable-panel')
      let topId = ''
      let maxZ = -1
      panels.forEach(panel => {
        const z = parseInt(getComputedStyle(panel).zIndex || '0')
        if (z > maxZ) {
          maxZ = z
          topId = panel.getAttribute('data-panel-id') || ''
        }
      })
      if (topId) setTopPanelId(topId)
    }

    document.addEventListener('mousedown', updateTop)

    return () => {
      if (titlebar) {
        titlebar.removeEventListener("dblclick", () => {})
        document.removeEventListener('mousedown', updateTop)
      }
    }
  }, [])

  function minimize() {
    appWindow.minimize().catch(err =>
      console.error(`error when minimizing: ${err}`)
    )
  }

  function close() {
    appWindow.close().catch(err =>
      console.error(`error when closing: ${err}`)
    )
  }

  return (
    <div class="app">
      <div class="panel-container">
        <DraggablePanel id="player" title="Player" defaultOrder={0} isTop={topPanelId === 'player'}>
          Player content
        </DraggablePanel>

        <DraggablePanel id="eq" title="Equalizer" defaultOrder={1} isTop={topPanelId === 'eq'}>
          Equalizer content
        </DraggablePanel>

        <DraggablePanel id="playlist" title="Playlist" defaultOrder={2} isTop={topPanelId === 'playlist'}>
          Playlist content
        </DraggablePanel>
      </div>
    </div>
  )
}

export default App
