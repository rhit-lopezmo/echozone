import { useRef, useEffect } from 'preact/hooks';
import interact from 'interactjs';
import { getCurrentWindow } from '@tauri-apps/api/window';
import type { ComponentChildren } from 'preact';

interface DraggablePanelProps {
  id: string;
  title: string;
  children: ComponentChildren;
  defaultOrder: number;
  isTop?: boolean;
}

const panelRegistry: Record<string, { el: HTMLElement; order: number; z: number }> = {};
let zIndexCounter = 1000;

export default function DraggablePanel({
  id,
  title,
  children,
  defaultOrder,
  isTop = false,
}: DraggablePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    let order = defaultOrder;
    const saved = localStorage.getItem(`panel-order-${id}`);
    if (saved) {
      try {
        order = parseInt(saved);
      } catch {}
    }

    panelRegistry[id] = { el, order, z: 0 };
    updateLayout();

    const focusPanel = () => {
      const z = ++zIndexCounter;
      el.style.zIndex = z.toString();
      panelRegistry[id].z = z;
    };

    el.addEventListener('mousedown', focusPanel);

    interact(el)
      .draggable({
        allowFrom: '.titlebar',
        modifiers: [
          interact.modifiers.restrictRect({
            restriction: '.app',
            endOnly: true,
          }),
        ],
        listeners: {
          start() {
            focusPanel();
          },
          move(event) {
            const target = event.target as HTMLElement;
            const currentY = parseFloat(target.getAttribute('data-y') || '0');
            const newY = currentY + event.dy;
            target.style.transform = `translateY(${newY}px)`;
            target.setAttribute('data-y', newY.toString());
          },
          end(event) {
            const target = event.target as HTMLElement;
            const draggedBounds = target.getBoundingClientRect();

            for (const [otherId, { el: otherEl }] of Object.entries(panelRegistry)) {
              if (otherId === id) continue;
              const otherBounds = otherEl.getBoundingClientRect();
              const isOverlapping =
                draggedBounds.bottom > otherBounds.top &&
                draggedBounds.top < otherBounds.bottom;

              if (isOverlapping) {
                const thisOrder = panelRegistry[id].order;
                const thatOrder = panelRegistry[otherId].order;

                panelRegistry[id].order = thatOrder;
                panelRegistry[otherId].order = thisOrder;

                localStorage.setItem(`panel-order-${id}`, thatOrder.toString());
                localStorage.setItem(`panel-order-${otherId}`, thisOrder.toString());

                break;
              }
            }

            updateLayout();
          },
        },
      })
      .styleCursor(false)
      .ignoreFrom('input, textarea, button');

    return () => {
      el.removeEventListener('mousedown', focusPanel);
    };
  }, [id, defaultOrder]);

  const minimize = () => getCurrentWindow().minimize();
  const close = () => getCurrentWindow().close();

  return (
    <div
      ref={panelRef}
      class="draggable-panel"
      data-panel-id={id}
      style={{ position: 'absolute', width: '100vw', left: '0' }}
    >
      <div class="titlebar">
        <span class="title-text">{title}</span>
        {isTop && (
          <div class="titlebar-icons">
            <div class="move-window-icon" data-tauri-drag-region title="Move Window">⠿&nbsp;</div>
            <button class="window-btn" onClick={minimize}>_</button>
            <button class="window-btn" onClick={close}>✕</button>
          </div>
        )}
      </div>
      <div class="panel-content">{children}</div>
    </div>
  );
}

function updateLayout() {
  const sortedPanels = Object.entries(panelRegistry).sort((a, b) => a[1].order - b[1].order);
  const panelCount = sortedPanels.length;
  const heightPerPanel = 100 / panelCount;

  sortedPanels.forEach(([id, { el, z }], index) => {
    const top = `${index * heightPerPanel}vh`;
    el.style.transform = `translateY(0)`;
    el.style.top = top;
    el.style.height = `${heightPerPanel}vh`;
    el.setAttribute('data-y', '0');
    el.style.zIndex = z.toString();
    panelRegistry[id].order = index;
    localStorage.setItem(`panel-order-${id}`, index.toString());
  });
}
