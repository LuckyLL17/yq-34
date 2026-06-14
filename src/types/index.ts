export type TextType = 'number' | 'chinese' | 'english';

export type GridType = 'tian' | 'mi' | 'hui' | 'none';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

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

export interface CheckinRecord {
  date: string;
  charCount: number;
  textType: TextType;
  fontId: string;
  timestamp: number;
  posterThumbnail?: string;
}

export interface CheckinStats {
  totalDays: number;
  totalChars: number;
  currentStreak: number;
  longestStreak: number;
}

export interface CheckinStore {
  records: Record<string, CheckinRecord>;
  checkin: (record: Omit<CheckinRecord, 'timestamp'>) => void;
  getRecordByDate: (date: string) => CheckinRecord | undefined;
  getMonthRecords: (year: number, month: number) => Record<string, CheckinRecord>;
  getStats: () => CheckinStats;
  getMaxCharCount: () => number;
}

export interface DifficultyPreset {
  label: string;
  description: string;
  config: Partial<CopybookConfig>;
}

export interface StrokeAnimationState {
  isOpen: boolean;
  char: string;
}

