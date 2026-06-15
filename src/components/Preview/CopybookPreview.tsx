import { forwardRef, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useCopybookStore } from '@/store/useCopybookStore';
import { getFontById } from '@/utils/fonts';
import type { CopybookConfig, HeaderPosition, HeaderFieldConfig, PaperTexture, WatermarkConfig } from '@/types';
import GridCell from './GridCell';
import PageDrawingCanvas from './PageDrawingCanvas';
import { paperTextures } from '@/components/ConfigPanel/PaperTextureSelector';

interface CopybookPreviewProps {
  className?: string;
  overrideConfig?: Partial<CopybookConfig>;
}

const A4_RATIO = 297 / 210;

const getPaperTextureStyle = (texture: PaperTexture): React.CSSProperties => {
  const option = paperTextures.find((p) => p.value === texture);
  if (option) {
    return option.previewStyle;
  }
  return { backgroundColor: '#ffffff' };
};

const selector = (s: {
  textType: CopybookConfig['textType'];
  text: CopybookConfig['text'];
  fontId: CopybookConfig['fontId'];
  gridType: CopybookConfig['gridType'];
  cellSize: CopybookConfig['cellSize'];
  colsPerRow: CopybookConfig['colsPerRow'];
  rows: CopybookConfig['rows'];
  fontColor: CopybookConfig['fontColor'];
  gridColor: CopybookConfig['gridColor'];
  showDashed: CopybookConfig['showDashed'];
  showTrace: CopybookConfig['showTrace'];
  traceOpacity: CopybookConfig['traceOpacity'];
  title: CopybookConfig['title'];
  subtitle: CopybookConfig['subtitle'];
  nameField: CopybookConfig['nameField'];
  dateField: CopybookConfig['dateField'];
  classField: CopybookConfig['classField'];
  headerPosition: CopybookConfig['headerPosition'];
  showLineNumbers: CopybookConfig['showLineNumbers'];
  paperTexture: CopybookConfig['paperTexture'];
  watermark: CopybookConfig['watermark'];
  completedCells: any;
}): CopybookConfig & {
  title: string;
  subtitle: string;
  nameField: HeaderFieldConfig;
  dateField: HeaderFieldConfig;
  classField: HeaderFieldConfig;
  headerPosition: HeaderPosition;
  showLineNumbers: boolean;
  paperTexture: PaperTexture;
  watermark: WatermarkConfig;
  completedCells: any;
} => ({
  textType: s.textType,
  text: s.text,
  fontId: s.fontId,
  gridType: s.gridType,
  cellSize: s.cellSize,
  colsPerRow: s.colsPerRow,
  rows: s.rows,
  fontColor: s.fontColor,
  gridColor: s.gridColor,
  showDashed: s.showDashed,
  showTrace: s.showTrace,
  traceOpacity: s.traceOpacity,
  title: s.title,
  subtitle: s.subtitle,
  nameField: s.nameField,
  dateField: s.dateField,
  classField: s.classField,
  headerPosition: s.headerPosition,
  showLineNumbers: s.showLineNumbers,
  paperTexture: s.paperTexture,
  watermark: s.watermark,
  completedCells: s.completedCells,
});

const LINE_NUMBER_WIDTH = 28;

const CopybookPreview = forwardRef<HTMLDivElement, CopybookPreviewProps>(
  ({ className, overrideConfig }, ref) => {
    const storeConfig = useCopybookStore(useShallow(selector));
    const config = useMemo(() => {
      return { ...storeConfig, ...overrideConfig };
    }, [storeConfig, overrideConfig]);
    const font = getFontById(config.fontId);

    const allChars = useMemo(() => {
      const chars: string[] = [];
      for (const ch of config.text) {
        if (ch !== '\n' && ch !== '\r' && ch !== '\t' && ch !== ' ') {
          chars.push(ch);
        }
      }
      return chars;
    }, [config.text]);

    const charsPerPage = config.colsPerRow * config.rows;
    const totalPages = Math.max(1, Math.ceil(allChars.length / charsPerPage));

    const pageGroups = useMemo(() => {
      const groups: string[][][] = [];
      for (let p = 0; p < totalPages; p++) {
        const pageStart = p * charsPerPage;
        const pageChars = allChars.slice(pageStart, pageStart + charsPerPage);
        while (pageChars.length < charsPerPage) pageChars.push(' ');

        const rows: string[][] = [];
        for (let r = 0; r < config.rows; r++) {
          const rStart = r * config.colsPerRow;
          rows.push(pageChars.slice(rStart, rStart + config.colsPerRow));
        }
        groups.push(rows);
      }
      return groups;
    }, [allChars, charsPerPage, config.colsPerRow, config.rows, totalPages]);

    const gridWidth = config.colsPerRow * config.cellSize;
    const gridHeight = config.rows * config.cellSize;

    const lineNumberWidth = config.showLineNumbers ? LINE_NUMBER_WIDTH : 0;

    const headerHeight = 72;
    const footerHeight = 40;
    const paddingX = 40;
    const paddingY = 36;

    const contentWidth = gridWidth + lineNumberWidth + paddingX * 2;
    const contentHeight = gridHeight + headerHeight + footerHeight + paddingY * 2;

    let pageWidth = contentWidth;
    let pageHeight = contentWidth * A4_RATIO;

    if (pageHeight < contentHeight) {
      pageHeight = contentHeight;
      pageWidth = pageHeight / A4_RATIO;
    }

    const pageTitle =
      config.title ||
      (config.textType === 'chinese'
        ? '硬笔书法字帖'
        : config.textType === 'number'
        ? '数字练字帖'
        : 'English Practice');

    const hasSubtitle = config.subtitle.trim().length > 0;

    const headerAlignClass =
      config.headerPosition === 'left'
        ? 'items-start text-left'
        : config.headerPosition === 'right'
        ? 'items-end text-right'
        : 'items-center text-center';

    const infoAlignClass =
      config.headerPosition === 'left'
        ? 'justify-start'
        : config.headerPosition === 'right'
        ? 'justify-end'
        : 'justify-center';

    const paperStyle = getPaperTextureStyle(config.paperTexture);

    return (
      <div
        ref={ref}
        className={`flex flex-col items-center gap-8 ${className || ''}`}
      >
        {pageGroups.map((pageRows, pageIdx) => {
          const pageCompletedCells = config.completedCells[pageIdx] || {};
          return (
            <div
              key={pageIdx}
              className="bg-white rounded-lg shadow-2xl relative overflow-hidden"
              style={{
                width: pageWidth,
                height: pageHeight,
                ...paperStyle,
              }}
              data-page-index={pageIdx}
            >
              <div
                className="absolute flex flex-col"
                style={{
                  top: paddingY,
                  left: paddingX,
                  right: paddingX,
                  bottom: paddingY,
                }}
              >
                {config.watermark.enabled && config.watermark.position === 'page-center' && config.watermark.text && (
                  <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
                    style={{ zIndex: 1 }}
                  >
                    <span
                      style={{
                        fontSize: config.watermark.fontSize,
                        color: config.watermark.color,
                        opacity: config.watermark.opacity,
                        fontFamily: '"Noto Serif SC", "STSong", serif',
                        transform: 'rotate(-30deg)',
                        letterSpacing: '0.1em',
                        fontWeight: 500,
                      }}
                    >
                      {config.watermark.text}
                    </span>
                  </div>
                )}

                <div
                  className={`flex flex-col shrink-0 ${headerAlignClass}`}
                  style={{ height: headerHeight }}
                >
                  <h2
                    className="text-lg md:text-xl font-bold text-stone-700 leading-tight"
                    style={{
                      fontFamily:
                        '"Noto Serif SC", "STSong", "SimSun", serif',
                    }}
                  >
                    {pageTitle}
                  </h2>
                  {hasSubtitle && (
                    <p
                      className="text-xs md:text-sm text-stone-500 mt-0.5 leading-snug"
                      style={{
                        fontFamily:
                          '"Noto Serif SC", "STSong", "SimSun", serif',
                      }}
                    >
                      {config.subtitle}
                    </p>
                  )}
                  <div className={`flex gap-5 text-xs md:text-sm text-stone-500 mt-1.5 ${infoAlignClass}`}>
                    {config.nameField.visible && (
                      <span>{config.nameField.label}：__________</span>
                    )}
                    {config.dateField.visible && (
                      <span>{config.dateField.label}：__________</span>
                    )}
                    {config.classField.visible && (
                      <span>{config.classField.label}：__________</span>
                    )}
                    <span>
                      第 <span className="font-medium text-stone-700">{pageIdx + 1}</span> /{' '}
                      {totalPages} 页
                    </span>
                  </div>
                </div>

                <div className="flex-1 flex items-center justify-center py-2 overflow-hidden">
                  <div
                    className="flex flex-col relative"
                    style={{
                      width: gridWidth + lineNumberWidth,
                      height: gridHeight,
                    }}
                  >
                    {pageRows.map((row, rowIdx) => (
                      <div key={rowIdx} className="flex">
                        {config.showLineNumbers && (
                          <div
                            className="shrink-0 flex items-center justify-center text-stone-400 select-none"
                            style={{
                              width: lineNumberWidth,
                              height: config.cellSize,
                              fontSize: Math.max(9, config.cellSize * 0.18),
                              fontFamily: '"Noto Serif SC", "STSong", serif',
                            }}
                          >
                            {rowIdx + 1}
                          </div>
                        )}
                        {row.map((char, colIdx) => {
                          const cellKey = `${rowIdx}-${colIdx}`;
                          const completion = pageCompletedCells[cellKey] || 0;
                          return (
                            <GridCell
                              key={`${rowIdx}-${colIdx}`}
                              char={char}
                              cellSize={config.cellSize}
                              gridType={config.gridType}
                              gridColor={config.gridColor}
                              fontColor={config.fontColor}
                              fontFamily={font.family}
                              showDashed={config.showDashed}
                              showTrace={config.showTrace}
                              traceOpacity={config.traceOpacity}
                              completion={completion}
                              watermark={config.watermark}
                            />
                          );
                        })}
                      </div>
                    ))}
                    <PageDrawingCanvas
                      pageIndex={pageIdx}
                      pageWidth={gridWidth + lineNumberWidth}
                      pageHeight={gridHeight}
                    />
                  </div>
                </div>

                <div
                  className="shrink-0 flex items-center justify-between pt-3 border-t border-stone-200 text-xs text-stone-400"
                  style={{ height: footerHeight }}
                >
                  <span>
                    字体：{font.name} · 格子：{config.colsPerRow} × {config.rows}
                  </span>
                  <span>
                    墨韵字帖生成器 · 本页 {pageRows.flat().filter((c) => c !== ' ').length} /{' '}
                    {allChars.length} 字
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
);

CopybookPreview.displayName = 'CopybookPreview';

export default CopybookPreview;
