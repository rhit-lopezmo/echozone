import { RenderableProps } from 'preact';
import DraggablePanel from './DraggablePanel';
import YoutubePlayer from './YoutubePlayer'; 

interface Props {
  isTop: boolean;
	videoId: string;
}

export default function PlayerPanel({ isTop, videoId }: RenderableProps<Props>) {
  return (
    <DraggablePanel id="player" title="Player" defaultOrder={0} isTop={isTop}>
			<YoutubePlayer videoId={videoId}/>
    </DraggablePanel>
  );
}

