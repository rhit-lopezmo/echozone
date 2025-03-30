import { RenderableProps } from 'preact';
import DraggablePanel from './DraggablePanel';

interface Props {
  isTop: boolean;
}

export default function EqualizerPanel({ isTop }: RenderableProps<Props>) {
  return (
    <DraggablePanel id="eq" title="Equalizer" defaultOrder={1} isTop={isTop}>
      Equalizer content goes here
    </DraggablePanel>
  );
}
