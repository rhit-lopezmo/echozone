import { RenderableProps } from 'preact';
import DraggablePanel from './DraggablePanel';

interface Props {
  isTop: boolean;
}

export default function PlayerPanel({ isTop }: RenderableProps<Props>) {
  return (
    <DraggablePanel id="player" title="Player" defaultOrder={0} isTop={isTop}>
      Player content goes here
    </DraggablePanel>
  );
}

