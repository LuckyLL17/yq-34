import { create } from 'zustand';
import type { CopybookConfig, TextType, GridType, DrawingPath, DrawingConfig, PageDrawingPaths } from '@/types';
import { DEFAULT_TEXTS } from '@/utils/presetTexts';

interface CopybookState extends CopybookConfig, DrawingConfig {
  pagePaths: PageDrawingPaths;
  pageRedoStack: PageDrawingPaths;
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
  setPenColor: (color: string) => void;
  setPenWidth: (width: number) => void;
  setDrawingEnabled: (enabled: boolean) => void;
  addPathToPage: (pageIndex: number, path: DrawingPath) => void;
  undoPath: (pageIndex: number) => void;
  redoPath: (pageIndex: number) => void;
  clearAllPaths: () => void;
  clearPagePaths: (pageIndex: number) => void;
}

const DEFAULT_CONFIG: CopybookConfig & DrawingConfig = {
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
  penColor: '#1a1a1a',
  penWidth: 3,
  drawingEnabled: false,
};

export const useCopybookStore = create<CopybookState>((set, get) => ({
  ...DEFAULT_CONFIG,
  pagePaths: {},
  pageRedoStack: {},

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
  resetConfig: () => set({ ...DEFAULT_CONFIG, pagePaths: {}, pageRedoStack: {} }),

  setPenColor: (penColor) => set({ penColor }),
  setPenWidth: (penWidth) => set({ penWidth: Math.max(1, Math.min(20, penWidth)) }),
  setDrawingEnabled: (drawingEnabled) => set({ drawingEnabled }),

  addPathToPage: (pageIndex, path) =>
    set((state) => {
      const pagePaths = state.pagePaths[pageIndex] || [];
      return {
        pagePaths: {
          ...state.pagePaths,
          [pageIndex]: [...pagePaths, path],
        },
        pageRedoStack: {
          ...state.pageRedoStack,
          [pageIndex]: [],
        },
      };
    }),

  undoPath: (pageIndex) => {
    const { pagePaths, pageRedoStack } = get();
    const paths = pagePaths[pageIndex] || [];
    if (paths.length === 0) return;
    const lastPath = paths[paths.length - 1];
    const redoStack = pageRedoStack[pageIndex] || [];
    set({
      pagePaths: {
        ...pagePaths,
        [pageIndex]: paths.slice(0, -1),
      },
      pageRedoStack: {
        ...pageRedoStack,
        [pageIndex]: [...redoStack, lastPath],
      },
    });
  },

  redoPath: (pageIndex) => {
    const { pagePaths, pageRedoStack } = get();
    const redoStack = pageRedoStack[pageIndex] || [];
    if (redoStack.length === 0) return;
    const nextPath = redoStack[redoStack.length - 1];
    const paths = pagePaths[pageIndex] || [];
    set({
      pagePaths: {
        ...pagePaths,
        [pageIndex]: [...paths, nextPath],
      },
      pageRedoStack: {
        ...pageRedoStack,
        [pageIndex]: redoStack.slice(0, -1),
      },
    });
  },

  clearAllPaths: () => set({ pagePaths: {}, pageRedoStack: {} }),

  clearPagePaths: (pageIndex) =>
    set((state) => {
      const newPagePaths = { ...state.pagePaths };
      const newPageRedoStack = { ...state.pageRedoStack };
      delete newPagePaths[pageIndex];
      delete newPageRedoStack[pageIndex];
      return {
        pagePaths: newPagePaths,
        pageRedoStack: newPageRedoStack,
      };
    }),
}));
