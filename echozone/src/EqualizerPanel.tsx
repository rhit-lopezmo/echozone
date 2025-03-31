import { RenderableProps } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import DraggablePanel from './DraggablePanel';
import { readDir, readTextFile, writeTextFile, mkdir, BaseDirectory } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';

const eqBands = [
  { freq: 60, label: "60Hz" },
  { freq: 170, label: "170Hz" },
  { freq: 350, label: "350Hz" },
  { freq: 1000, label: "1kHz" },
  { freq: 3500, label: "3.5kHz" },
  { freq: 10000, label: "10kHz" }
];

interface Props {
  isTop: boolean;
}

export default function EqualizerPanel({ isTop }: RenderableProps<Props>) {
  const [gains, setGains] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [presets, setPresets] = useState<Record<string, number[]>>({});
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const audioCtxRef = useRef<AudioContext | null>(null);
  const filtersRef = useRef<BiquadFilterNode[]>([]);

  useEffect(() => {
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    const filters = eqBands.map(({ freq }) => {
      const filter = ctx.createBiquadFilter();
      filter.type = "peaking";
      filter.frequency.value = freq;
      filter.Q.value = 1;
      filter.gain.value = 0;
      return filter;
    });

    filtersRef.current = filters;

    filters.reduce((prev, curr) => {
      prev.connect(curr);
      return curr;
    });
    filters[filters.length - 1].connect(ctx.destination);

    return () => ctx.close();
  }, []);

  useEffect(() => {
    loadPresets().then((loaded) => {
      setPresets(loaded);
      if (Object.keys(loaded).length > 0) {
        const defaultName = Object.keys(loaded)[0];
        applyPreset(defaultName, loaded[defaultName]);
        setSelectedPreset(defaultName);
      }
    });
  }, []);

  async function loadPresets(): Promise<Record<string, number[]>> {
    const presetDir = 'presets';
    await mkdir(presetDir, { baseDir: BaseDirectory.AppConfig, recursive: true });
    const entries = await readDir(presetDir, { baseDir: BaseDirectory.AppConfig });
    const loaded: Record<string, number[]> = {};

    for (const entry of entries) {
      if (entry.name?.endsWith('.json')) {
        const name = entry.name.replace('.json', '');
        const fullPath = await join(presetDir, entry.name);
        const content = await readTextFile(fullPath, { baseDir: BaseDirectory.AppConfig });
        try {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            loaded[name] = parsed;
          }
        } catch {
          console.warn(`Invalid preset: ${entry.name}`);
        }
      }
    }
    return loaded;
  }

  function updateGain(index: number, value: number) {
    const updated = [...gains];
    updated[index] = value;
    setGains(updated);
    filtersRef.current[index].gain.value = value;
  }

  function applyPreset(name: string, preset: number[]) {
    setGains(preset);
    preset.forEach((value, i) => {
      filtersRef.current[i].gain.value = value;
    });
    setSelectedPreset(name);
  }

  return (
    <DraggablePanel id="eq" title="Equalizer" defaultOrder={1} isTop={isTop}>
      <div class="equalizer-panel">
        <div class="preset-selector">
          <select
            value={selectedPreset}
            onChange={(e) => {
              const name = (e.currentTarget as HTMLSelectElement).value;
              if (presets[name]) applyPreset(name, presets[name]);
            }}
          >
            {Object.keys(presets).map((name) => (
              <option value={name}>{name}</option>
            ))}
          </select>
        </div>

        <div class="sliders vertical">
          {eqBands.map((band, i) => (
            <div class="slider" key={band.freq}>
              <input
                type="range"
                min="-12"
                max="12"
                step="0.1"
                value={gains[i]}
                onInput={(e) => updateGain(i, parseFloat((e.target as HTMLInputElement).value))}
                class="vertical-slider"
              />
            </div>
          ))}
        </div>
      </div>
    </DraggablePanel>
  );
}
