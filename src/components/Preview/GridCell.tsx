import type { GridType } from '@/types';
import { useCopybookStore } from '@/store/useCopybookStore';

interface GridCellProps {
  char: string;
  cellSize: number;
  gridType: GridType;
  gridColor: string;
  fontColor: string;
  fontFamily: string;
  showDashed: boolean;
  showTrace: boolean;
  traceOpacity: number;
}

export default function GridCell({
  char,
  cellSize,
  gridType,
  gridColor,
  fontColor,
  fontFamily,
  showDashed,
  showTrace,
  traceOpacity,
}: GridCellProps) {
  const openStrokeAnimation = useCopybookStore((s) => s.openStrokeAnimation);
  const textType = useCopybookStore((s) => s.textType);

  const s = cellSize;
  const fontSize = Math.floor(s * 0.78);
  const borderStyle = `1px solid ${gridColor}`;
  const dashedStyle = showDashed
    ? `1px dashed ${gridColor}80`
    : 'none';

  const isEmpty = char === ' ' || char === '' || char === '\u00A0';
  const isChinese = textType === 'chinese';
  const isClickable = !isEmpty && isChinese && /[\u4e00-\u9fa5]/.test(char);

  const handleClick = () => {
    if (isClickable) {
      openStrokeAnimation(char);
    }
  };

  const renderGrid = () => {
    if (gridType === 'none') {
      return null;
    }

    if (gridType === 'tian') {
      return (
        <>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ border: borderStyle }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              left: '50%',
              top: 0,
              bottom: 0,
              width: 0,
              borderLeft: dashedStyle,
            }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              top: '50%',
              left: 0,
              right: 0,
              height: 0,
              borderTop: dashedStyle,
            }}
          />
        </>
      );
    }

    if (gridType === 'mi') {
      return (
        <>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ border: borderStyle }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              left: '50%',
              top: 0,
              bottom: 0,
              width: 0,
              borderLeft: dashedStyle,
            }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              top: '50%',
              left: 0,
              right: 0,
              height: 0,
              borderTop: dashedStyle,
            }}
          />
          <svg
            className="absolute inset-0 pointer-events-none"
            width={s}
            height={s}
            viewBox={`0 0 ${s} ${s}`}
            preserveAspectRatio="none"
          >
            {showDashed && (
              <>
                <line
                  x1="0"
                  y1="0"
                  x2={s}
                  y2={s}
                  stroke={`${gridColor}80`}
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
                <line
                  x1={s}
                  y1="0"
                  x2="0"
                  y2={s}
                  stroke={`${gridColor}80`}
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
              </>
            )}
          </svg>
        </>
      );
    }

    if (gridType === 'hui') {
      const inner = s * 0.5;
      const offset = (s - inner) / 2;
      return (
        <>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ border: borderStyle }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              top: offset,
              left: offset,
              width: inner,
              height: inner,
              border: dashedStyle,
            }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              left: '50%',
              top: 0,
              bottom: 0,
              width: 0,
              borderLeft: dashedStyle,
            }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              top: '50%',
              left: 0,
              right: 0,
              height: 0,
              borderTop: dashedStyle,
            }}
          />
        </>
      );
    }

    return null;
  };

  const opacity = showTrace && !isEmpty ? traceOpacity : 0;

  return (
    <div
      className={`relative inline-block shrink-0 transition-all duration-150 ${
        isClickable ? 'cursor-pointer group' : ''
      }`}
      style={{
        width: s,
        height: s,
        lineHeight: `${s}px`,
        textAlign: 'center',
      }}
      onClick={handleClick}
    >
      {renderGrid()}

      {isClickable && (
        <div
          className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(139, 46, 32, 0.1) 0%, transparent 70%)',
            boxShadow: 'inset 0 0 0 2px rgba(139, 46, 32, 0.3)',
          }}
        />
      )}
      {isClickable && (
        <div
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br from-[#8B2E20] to-[#5d1e15] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none shadow-md"
          style={{ fontSize: 9 }}
        >
          ✎
        </div>
      )}

      <span
        className={`absolute left-0 top-0 block select-none ${
          isClickable ? 'pointer-events-none group-hover:scale-105 group-hover:drop-shadow-sm' : 'pointer-events-none'
        } transition-all duration-150`}
        style={{
          width: s,
          height: s,
          lineHeight: `${s}px`,
          fontFamily,
          fontSize,
          color: fontColor,
          opacity,
          textAlign: 'center',
          textRendering: 'geometricPrecision',
          fontFeatureSettings: '"kern" 0',
          letterSpacing: '0',
          whiteSpace: 'nowrap',
        }}
      >
        {isEmpty ? '' : char}
      </span>
    </div>
  );
}
