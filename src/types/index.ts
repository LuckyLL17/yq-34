export type TextType = 'number' | 'chinese' | 'english';

export type GridType = 'tian' | 'mi' | 'hui' | 'none';

export interface FontOption {
  id: string;
  name: string;
  family: string;
  applicableTypes: TextType[];
}

export interface CopybookConfig {
  textType: TextType;
  text: string;
  fontId: string;
  gridType: GridType;
  cellSize: number;
  colsPerRow: number;
  rows: number;
  fontColor: string;
  gridColor: string;
  showDashed: boolean;
  showTrace: boolean;
  traceOpacity: number;
}

export interface PresetText {
  label: string;
  value: string;
  textType: TextType;
}

export interface DrawingPath {
  points: { x: number; y: number }[];
  color: string;
  lineWidth: number;
}

export interface PageDrawingPaths {
  [pageIndex: number]: DrawingPath[];
}

export interface DrawingConfig {
  penColor: string;
  penWidth: number;
  drawingEnabled: boolean;
}
