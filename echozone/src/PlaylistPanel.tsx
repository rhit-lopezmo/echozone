import { RenderableProps } from 'preact';
import DraggablePanel from './DraggablePanel';

interface Props {
  isTop: boolean;
}

export default function PlaylistPanel({ isTop }: RenderableProps<Props>) {
  return (
    <DraggablePanel id="playlist" title="Playlist" defaultOrder={2} isTop={isTop}>
      Playlist content goes here
    </DraggablePanel>
  );
}
