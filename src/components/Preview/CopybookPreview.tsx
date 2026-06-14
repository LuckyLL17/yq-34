import { forwardRef } from 'react';
import { useCopybookStore } from '@/store/useCopybookStore';
import { getFontById } from '@/utils/fonts';
import GridCell from './GridCell';

interface CopybookPreviewProps {
  className?: string;
}

const CopybookPreview = forwardRef<HTMLDivElement, CopybookPreviewProps>(
  ({ className }, ref) => {
    const config = useCopybookStore();
    const font = getFontById(config.fontId);

    const chars: string[] = [];
    for (const ch of config.text) {
      if (ch !== '\n' && ch !== '\r' && ch !== '\t') {
        chars.push(ch);
      }
    }

    while (chars.length < config.colsPerRow * config.rows) {
      chars.push(' ');
    }

    const rows: string[][] = [];
    for (let i = 0; i < config.rows; i++) {
      const start = i * config.colsPerRow;
      rows.push(chars.slice(start, start + config.colsPerRow));
    }

    return (
      <div
        ref={ref}
        className={`bg-white rounded-xl shadow-2xl p-8 md:p-12 ${className || ''}`}
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(212, 165, 116, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(139, 46, 32, 0.03) 0%, transparent 50%)
          `,
        }}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2
            className="text-xl font-bold text-stone-700"
            style={{ fontFamily: '"Noto Serif SC", "STSong", serif' }}
          >
            {config.textType === 'chinese' && '硬笔书法字帖'}
            {config.textType === 'number' && '数字练字帖'}
            {config.textType === 'english' && 'English Practice'}
          </h2>
          <div className="flex gap-4 text-sm text-stone-500">
            <span>姓名：__________</span>
            <span>日期：__________</span>
          </div>
        </div>

        <div className="flex flex-col gap-0 items-center justify-center overflow-x-auto py-4">
          {rows.map((row, rowIdx) => (
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

        <div className="mt-8 pt-4 border-t border-stone-200 text-xs text-stone-400 text-center">
          <p>
            字体：{font.name} | 格子：{config.colsPerRow} × {config.rows} |
            共 {config.text.replace(/\s/g, '').length} 字
          </p>
        </div>
      </div>
    );
  }
);

CopybookPreview.displayName = 'CopybookPreview';

export default CopybookPreview;
