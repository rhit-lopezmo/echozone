import { useEffect, useState } from 'preact/hooks';
import { getCurrentWindow } from '@tauri-apps/api/window';

interface MenuItem {
  label: string;
  action: () => void;
}

const menuItems: MenuItem[] = [
  { label: 'Reload', action: () => window.location.reload() },
  { label: 'Mute', action: () => console.log('Mute clicked') },
  { label: 'Close', action: () => getCurrentWindow().close() },
];

export default function ContextMenu() {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setPos({ x: e.clientX, y: e.clientY });
      setVisible(true);
    };

    const handleClick = () => setVisible(false);

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  if (!visible) return null;

  return (
    <ul class="context-menu" style={{ top: `${pos.y}px`, left: `${pos.x}px` }}>
      {menuItems.map(item => (
        <li onClick={item.action}>{item.label}</li>
      ))}
    </ul>
  );
}
