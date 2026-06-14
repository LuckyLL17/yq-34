import { forwardRef, useMemo } from 'react';
import { useCopybookStore } from '@/store/useCopybookStore';
import { getFontById } from '@/utils/fonts';
import GridCell from './GridCell';

interface CopybookPreviewProps {
  className?: string;
}

const A4_RATIO = 297 / 210;

const CopybookPreview = forwardRef<HTMLDivElement, CopybookPreviewProps>(
  ({ className }, ref) => {
    const config = useCopybookStore();
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

    const headerHeight = 56;
    const footerHeight = 40;
    const paddingX = 40;
    const paddingY = 36;

    const contentWidth = gridWidth + paddingX * 2;
    const contentHeight = gridHeight + headerHeight + footerHeight + paddingY * 2;

    let pageWidth = contentWidth;
    let pageHeight = contentWidth * A4_RATIO;

    if (pageHeight < contentHeight) {
      pageHeight = contentHeight;
      pageWidth = pageHeight / A4_RATIO;
    }

    const pageTitle =
      config.textType === 'chinese'
        ? '硬笔书法字帖'
        : config.textType === 'number'
        ? '数字练字帖'
        : 'English Practice';

    return (
      <div
        ref={ref}
        className={`flex flex-col items-center gap-8 ${className || ''}`}
      >
        {pageGroups.map((pageRows, pageIdx) => (
          <div
            key={pageIdx}
            className="bg-white rounded-lg shadow-2xl relative overflow-hidden"
            style={{
              width: pageWidth,
              height: pageHeight,
              backgroundImage: `
                radial-gradient(circle at 20% 20%, rgba(212, 165, 116, 0.04) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(139, 46, 32, 0.03) 0%, transparent 50%)
              `,
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
              <div
                className="flex items-center justify-between shrink-0"
                style={{ height: headerHeight }}
              >
                <h2
                  className="text-lg md:text-xl font-bold text-stone-700"
                  style={{
                    fontFamily:
                      '"Noto Serif SC", "STSong", "SimSun", serif',
                  }}
                >
                  {pageTitle}
                </h2>
                <div className="flex gap-5 text-xs md:text-sm text-stone-500">
                  <span>
                    第 <span className="font-medium text-stone-700">{pageIdx + 1}</span> /{' '}
                    {totalPages} 页
                  </span>
                  <span>姓名：__________</span>
                  <span>日期：__________</span>
                </div>
              </div>

              <div className="flex-1 flex items-center justify-center py-2 overflow-hidden">
                <div
                  className="flex flex-col items-center justify-center"
                  style={{
                    width: gridWidth,
                    height: gridHeight,
                  }}
                >
                  {pageRows.map((row, rowIdx) => (
                    <div key={rowIdx} className="flex">
                      {row.map((char, colIdx) => (
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
                        />
                      ))}
                    </div>
                  ))}
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
        ))}
      </div>
    );
  }
);

CopybookPreview.displayName = 'CopybookPreview';

export default CopybookPreview;
