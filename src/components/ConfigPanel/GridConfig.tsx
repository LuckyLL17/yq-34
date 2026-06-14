import { useShallow } from 'zustand/react/shallow';
import { useCopybookStore } from '@/store/useCopybookStore';
import type { GridType } from '@/types';

const gridTypes: { id: GridType; label: string }[] = [
  { id: 'tian', label: '田字格' },
  { id: 'mi', label: '米字格' },
  { id: 'hui', label: '回宫格' },
  { id: 'none', label: '无格线' },
];

export default function GridConfig() {
  const {
    gridType,
    cellSize,
    colsPerRow,
    rows,
    showDashed,
    showTrace,
    traceOpacity,
    setGridType,
    setCellSize,
    setColsPerRow,
    setRows,
    setShowDashed,
    setShowTrace,
    setTraceOpacity,
  } = useCopybookStore(
    useShallow((s) => ({
      gridType: s.gridType,
      cellSize: s.cellSize,
      colsPerRow: s.colsPerRow,
      rows: s.rows,
      showDashed: s.showDashed,
      showTrace: s.showTrace,
      traceOpacity: s.traceOpacity,
      setGridType: s.setGridType,
      setCellSize: s.setCellSize,
      setColsPerRow: s.setColsPerRow,
      setRows: s.setRows,
      setShowDashed: s.setShowDashed,
      setShowTrace: s.setShowTrace,
      setTraceOpacity: s.setTraceOpacity,
    }))
  );

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-stone-700">格子类型</label>
        <div className="grid grid-cols-4 gap-1.5">
          {gridTypes.map((g) => {
            const active = gridType === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setGridType(g.id)}
                className={`py-2 px-1.5 text-xs font-medium rounded-md border transition-all duration-200 ${
                  active
                    ? 'border-[#8B2E20] bg-[#8B2E20] text-white shadow-sm'
                    : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold text-stone-700">格子大小</label>
          <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
            {cellSize}px
          </span>
        </div>
        <input
          type="range"
          min={32}
          max={120}
          value={cellSize}
          onChange={(e) => setCellSize(Number(e.target.value))}
          className="w-full accent-[#8B2E20] cursor-pointer"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-stone-700">每行字数</label>
            <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
              {colsPerRow}
            </span>
          </div>
          <input
            type="range"
            min={4}
            max={16}
            value={colsPerRow}
            onChange={(e) => setColsPerRow(Number(e.target.value))}
            className="w-full accent-[#8B2E20] cursor-pointer"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-stone-700">行数</label>
            <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
              {rows}
            </span>
          </div>
          <input
            type="range"
            min={4}
            max={20}
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
            className="w-full accent-[#8B2E20] cursor-pointer"
          />
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900 transition-colors">
            显示参考虚线
          </span>
          <div className="relative">
            <input
              type="checkbox"
              checked={showDashed}
              onChange={(e) => setShowDashed(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-stone-200 rounded-full peer-checked:bg-[#8B2E20] transition-colors" />
            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
          </div>
        </label>

        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900 transition-colors">
            描红临摹模式
          </span>
          <div className="relative">
            <input
              type="checkbox"
              checked={showTrace}
              onChange={(e) => setShowTrace(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-stone-200 rounded-full peer-checked:bg-[#8B2E20] transition-colors" />
            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
          </div>
        </label>

        {showTrace && (
          <div className="space-y-2 pl-1">
            <div className="flex justify-between items-center">
              <label className="text-xs text-stone-500">描红透明度</label>
              <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                {Math.round(traceOpacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={60}
              value={traceOpacity * 100}
              onChange={(e) => setTraceOpacity(Number(e.target.value) / 100)}
              className="w-full accent-[#8B2E20] cursor-pointer"
            />
          </div>
        )}
      </div>
    </div>
  );
}
