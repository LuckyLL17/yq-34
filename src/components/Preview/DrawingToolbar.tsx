import { useState, useMemo } from 'react';
import { Undo2, Redo2, Eraser, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { useCopybookStore } from '@/store/useCopybookStore';

const penColorPresets = [
  { name: '墨黑', value: '#1a1a1a' },
  { name: '深蓝', value: '#1e3a5f' },
  { name: '墨红', value: '#8B2E20' },
  { name: '墨绿', value: '#1b4332' },
  { name: '深紫', value: '#4a1942' },
  { name: '棕色', value: '#5d4037' },
];

const penWidthPresets = [
  { label: '细', value: 2 },
  { label: '中', value: 4 },
  { label: '粗', value: 6 },
  { label: '特粗', value: 10 },
];

export default function DrawingToolbar() {
  const [expanded, setExpanded] = useState(true);
  const drawingEnabled = useCopybookStore((s) => s.drawingEnabled);
  const penColor = useCopybookStore((s) => s.penColor);
  const penWidth = useCopybookStore((s) => s.penWidth);
  const pagePaths = useCopybookStore((s) => s.pagePaths);
  const pageRedoStack = useCopybookStore((s) => s.pageRedoStack);

  const setDrawingEnabled = useCopybookStore((s) => s.setDrawingEnabled);
  const setPenColor = useCopybookStore((s) => s.setPenColor);
  const setPenWidth = useCopybookStore((s) => s.setPenWidth);
  const undoPath = useCopybookStore((s) => s.undoPath);
  const redoPath = useCopybookStore((s) => s.redoPath);
  const clearAllPaths = useCopybookStore((s) => s.clearAllPaths);

  const { hasUndo, hasRedo, hasPaths } = useMemo(() => {
    let undo = false;
    let redo = false;
    let paths = false;
    for (const key in pagePaths) {
      if (pagePaths[key] && pagePaths[key].length > 0) {
        undo = true;
        paths = true;
      }
    }
    for (const key in pageRedoStack) {
      if (pageRedoStack[key] && pageRedoStack[key].length > 0) {
        redo = true;
      }
    }
    return { hasUndo: undo, hasRedo: redo, hasPaths: paths };
  }, [pagePaths, pageRedoStack]);

  const handleUndo = () => {
    for (const key in pagePaths) {
      if (pagePaths[key] && pagePaths[key].length > 0) {
        undoPath(Number(key));
        return;
      }
    }
  };

  const handleRedo = () => {
    const redoKeys = Object.keys(pageRedoStack).filter(
      (k) => pageRedoStack[Number(k)] && pageRedoStack[Number(k)].length > 0
    );
    if (redoKeys.length > 0) {
      redoPath(Number(redoKeys[redoKeys.length - 1]));
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-xl border border-stone-200 shadow-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-stone-50 to-white">
        <div className="flex items-center gap-2">
          <Pencil size={18} className="text-[#8B2E20]" />
          <h3 className="font-semibold text-sm text-stone-700">临摹练字</h3>
          {drawingEnabled && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-[#8B2E20]/10 text-[#8B2E20] rounded">
              已开启
            </span>
          )}
          {hasPaths && !drawingEnabled && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-700 rounded">
              已临摹
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDrawingEnabled(!drawingEnabled)}
            className="relative w-10 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#8B2E20]/30"
            style={{ backgroundColor: drawingEnabled ? '#8B2E20' : '#e7e5e4' }}
            aria-pressed={drawingEnabled}
            aria-label={drawingEnabled ? '关闭临摹模式' : '开启临摹模式'}
          >
            <div
              className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
              style={{ transform: drawingEnabled ? 'translateX(20px)' : 'translateX(0)' }}
            />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-stone-100 rounded transition-colors"
            title={expanded ? '收起' : '展开'}
          >
            {expanded ? <ChevronUp size={18} className="text-stone-500" /> : <ChevronDown size={18} className="text-stone-500" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className={`px-4 pb-4 pt-2 space-y-4 transition-opacity duration-200 ${drawingEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-stone-600">笔色</label>
              <input
                type="color"
                value={penColor}
                onChange={(e) => setPenColor(e.target.value)}
                className="w-6 h-6 rounded border border-stone-200 cursor-pointer bg-transparent"
              />
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {penColorPresets.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setPenColor(c.value)}
                  title={c.name}
                  className={`aspect-square rounded-md border-2 transition-all hover:scale-105 ${
                    penColor === c.value
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
              <label className="text-xs font-medium text-stone-600">笔触粗细</label>
              <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                {penWidth}px
              </span>
            </div>
            <div className="flex gap-2">
              {penWidthPresets.map((w) => (
                <button
                  key={w.value}
                  onClick={() => setPenWidth(w.value)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md border transition-all ${
                    penWidth === w.value
                      ? 'border-[#8B2E20] bg-[#8B2E20] text-white'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
            <input
              type="range"
              min={1}
              max={20}
              value={penWidth}
              onChange={(e) => setPenWidth(Number(e.target.value))}
              className="w-full accent-[#8B2E20] cursor-pointer"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleUndo}
              disabled={!hasUndo}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
            >
              <Undo2 size={14} />
              <span>撤销</span>
            </button>
            <button
              onClick={handleRedo}
              disabled={!hasRedo}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
            >
              <Redo2 size={14} />
              <span>重做</span>
            </button>
            <button
              onClick={clearAllPaths}
              disabled={!hasPaths}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium rounded-lg border transition-all disabled:opacity-40 disabled:cursor-not-allowed border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
            >
              <Trash2 size={14} />
              <span>清除</span>
            </button>
          </div>

          {drawingEnabled && (
            <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200/50">
              <Eraser size={14} className="text-amber-600 shrink-0" />
              <p className="text-[11px] text-amber-700 leading-relaxed">
                已开启临摹模式，可直接在字帖上描红练习。关闭后可正常滚动预览。
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
