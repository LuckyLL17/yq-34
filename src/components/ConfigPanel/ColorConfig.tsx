import { useShallow } from 'zustand/react/shallow';
import { useCopybookStore } from '@/store/useCopybookStore';

const fontColorPresets = [
  { name: '墨黑', value: '#3D2C1F' },
  { name: '纯黑', value: '#1a1a1a' },
  { name: '深蓝', value: '#1e3a5f' },
  { name: '墨蓝', value: '#2c3e50' },
  { name: '墨红', value: '#8B2E20' },
  { name: '深棕', value: '#5d4037' },
];

const gridColorPresets = [
  { name: '浅棕', value: '#D4A574' },
  { name: '浅灰', value: '#9ca3af' },
  { name: '浅红', value: '#e57373' },
  { name: '浅蓝', value: '#64b5f6' },
  { name: '浅绿', value: '#81c784' },
  { name: '浅紫', value: '#ba68c8' },
];

export default function ColorConfig() {
  const { fontColor, gridColor, setFontColor, setGridColor } = useCopybookStore(
    useShallow((s) => ({
      fontColor: s.fontColor,
      gridColor: s.gridColor,
      setFontColor: s.setFontColor,
      setGridColor: s.setGridColor,
    }))
  );

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold text-stone-700">字体颜色</label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500">{fontColor}</span>
            <input
              type="color"
              value={fontColor}
              onChange={(e) => setFontColor(e.target.value)}
              className="w-6 h-6 rounded border border-stone-200 cursor-pointer bg-transparent"
            />
          </div>
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          {fontColorPresets.map((c) => (
            <button
              key={c.value}
              onClick={() => setFontColor(c.value)}
              title={c.name}
              className={`aspect-square rounded-md border-2 transition-all hover:scale-105 ${
                fontColor === c.value
                  ? 'border-stone-900 ring-2 ring-stone-900/20'
                  : 'border-transparent'
              }`}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold text-stone-700">格线颜色</label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500">{gridColor}</span>
            <input
              type="color"
              value={gridColor}
              onChange={(e) => setGridColor(e.target.value)}
              className="w-6 h-6 rounded border border-stone-200 cursor-pointer bg-transparent"
            />
          </div>
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          {gridColorPresets.map((c) => (
            <button
              key={c.value}
              onClick={() => setGridColor(c.value)}
              title={c.name}
              className={`aspect-square rounded-md border-2 transition-all hover:scale-105 ${
                gridColor === c.value
                  ? 'border-stone-900 ring-2 ring-stone-900/20'
                  : 'border-transparent'
              }`}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
