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
let notifyTopPanelChange: ((id: string) => void) | null = null;

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

    panelRegistry[id] = { el, order, z: ++zIndexCounter };
    updateLayout();

    const focusPanel = () => {
      const z = ++zIndexCounter;
      panelRegistry[id].z = z;
      updateLayout();
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
              const overlapHeight = Math.min(draggedBounds.bottom, otherBounds.bottom) - Math.max(draggedBounds.top, otherBounds.top);
              const minRequiredOverlap = otherBounds.height * 0.25;

              if (overlapHeight > minRequiredOverlap) {
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
						target.classList.add('just-swapped');
						setTimeout(() => target.classList.remove('just-swapped'), 300);

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
        <div class="titlebar-icons">
          {isTop ? (
            <>
              <div class="move-window-icon" data-tauri-drag-region title="Move Window">⠿</div>
              <div class="toolbar-separator"></div>
              <button class="window-btn" onClick={minimize}>⎯</button>
              <div class="toolbar-separator"></div>
              <button class="window-btn" onClick={close}>✕</button>
            </>
          ) : (
            <div style="width: 96px;" />
          )}
        </div>
      </div>
      <div class="panel-content">{children}</div>
    </div>
  );
}

function updateLayout() {
  const sortedPanels = Object.entries(panelRegistry).sort((a, b) => a[1].order - b[1].order);
  const panelCount = sortedPanels.length;
  const heightPerPanel = 100 / panelCount;

  let topId = '';
  let topZ = -1;

  sortedPanels.forEach(([id, { el, z }], index) => {
    const top = `${index * heightPerPanel}vh`;
    el.style.transform = `translateY(0)`;
    el.style.top = top;
    el.style.height = `${heightPerPanel}vh`;
    el.setAttribute('data-y', '0');
    el.style.zIndex = z.toString();
    panelRegistry[id].order = index;
    localStorage.setItem(`panel-order-${id}`, index.toString());

    if (z > topZ) {
      topZ = z;
      topId = id;
    }
  });

  if (notifyTopPanelChange && topId) {
    notifyTopPanelChange(topId);
  }
}

export function onTopPanelChange(callback: (id: string) => void) {
  notifyTopPanelChange = callback;
}
