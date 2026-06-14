import { create } from 'zustand';
import type { CopybookConfig, TextType, GridType } from '@/types';
import { DEFAULT_TEXTS } from '@/utils/presetTexts';

interface CopybookState extends CopybookConfig {
  setTextType: (type: TextType) => void;
  setText: (text: string) => void;
  setFontId: (fontId: string) => void;
  setGridType: (gridType: GridType) => void;
  setCellSize: (size: number) => void;
  setColsPerRow: (cols: number) => void;
  setRows: (rows: number) => void;
  setFontColor: (color: string) => void;
  setGridColor: (color: string) => void;
  setShowDashed: (show: boolean) => void;
  setShowTrace: (show: boolean) => void;
  setTraceOpacity: (opacity: number) => void;
  updateConfig: (partial: Partial<CopybookConfig>) => void;
  resetConfig: () => void;
}

const DEFAULT_CONFIG: CopybookConfig = {
  textType: 'chinese',
  text: DEFAULT_TEXTS.chinese,
  fontId: 'kaiti',
  gridType: 'tian',
  cellSize: 64,
  colsPerRow: 10,
  rows: 14,
  fontColor: '#3D2C1F',
  gridColor: '#D4A574',
  showDashed: true,
  showTrace: true,
  traceOpacity: 0.25,
};

export const useCopybookStore = create<CopybookState>((set) => ({
  ...DEFAULT_CONFIG,

  setTextType: (type) =>
    set(() => {
      let fontId = 'kaiti';
      if (type === 'english') fontId = 'serif';
      else if (type === 'number') fontId = 'kaiti';
      else fontId = 'kaiti';

      return {
        textType: type,
        text: DEFAULT_TEXTS[type],
        fontId,
        colsPerRow: type === 'english' ? 14 : type === 'number' ? 12 : 10,
        rows: 14,
      };
    }),

  setText: (text) => set({ text }),
  setFontId: (fontId) => set({ fontId }),
  setGridType: (gridType) => set({ gridType }),
  setCellSize: (cellSize) => set({ cellSize: Math.max(32, Math.min(120, cellSize)) }),
  setColsPerRow: (colsPerRow) => set({ colsPerRow: Math.max(4, Math.min(20, colsPerRow)) }),
  setRows: (rows) => set({ rows: Math.max(4, Math.min(30, rows)) }),
  setFontColor: (fontColor) => set({ fontColor }),
  setGridColor: (gridColor) => set({ gridColor }),
  setShowDashed: (showDashed) => set({ showDashed }),
  setShowTrace: (showTrace) => set({ showTrace }),
  setTraceOpacity: (traceOpacity) => set({ traceOpacity }),
  updateConfig: (partial) => set(partial),
  resetConfig: () => set(DEFAULT_CONFIG),
}));
