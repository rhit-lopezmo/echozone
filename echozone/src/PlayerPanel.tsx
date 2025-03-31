import { RenderableProps } from 'preact';
import { useState, useRef, useEffect } from 'preact/hooks';
import DraggablePanel from './DraggablePanel';
import YoutubePlayer from './YoutubePlayer';

interface Props {
  isTop: boolean;
  videoId: string;
}

export default function PlayerPanel({ isTop, videoId }: RenderableProps<Props>) {
  const [title, setTitle] = useState("Loading...");
  const [duration, setDuration] = useState(10);
  const measureRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (measureRef.current) {
      const width = measureRef.current.offsetWidth;
      const speed = 80; // pixels per second
      const newDuration = (width * 2) / speed;
      setDuration(newDuration);
    }
  }, [title]);

  return (
    <DraggablePanel
      id="player"
      isTop={isTop}
      defaultOrder={0}
      title={
        <div class="scrolling-title-container">
          <div
            class="scrolling-title infinite-scroll"
            style={{
              animationDuration: `${duration}s`,
            }}
          >
            <span class="scroll-segment" ref={measureRef}>
              Now Playing: {title}&nbsp;&nbsp;&nbsp;
            </span>
            <span class="scroll-segment">
              Now Playing: {title}&nbsp;&nbsp;&nbsp;
            </span>
          </div>
        </div>
      }
    >
      <YoutubePlayer videoId={videoId} onTitleChange={setTitle} />
    </DraggablePanel>
  );
}
