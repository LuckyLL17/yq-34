import type { GridType } from '@/types';

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
  const fontSize = Math.floor(cellSize * 0.78);
  const s = cellSize;
  const borderStyle = `1px solid ${gridColor}`;
  const dashedStyle = showDashed
    ? `1px dashed ${gridColor}80`
    : 'none';

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
          <div
            className="absolute pointer-events-none"
            style={{
              top: 0,
              left: 0,
              width: `${s}px`,
              height: `${s}px`,
              background: showDashed
                ? `linear-gradient(to top right, transparent calc(50% - 0.5px), ${gridColor}80 calc(50% - 0.5px), ${gridColor}80 calc(50% + 0.5px), transparent calc(50% + 0.5px))`
                : 'transparent',
            }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              top: 0,
              left: 0,
              width: `${s}px`,
              height: `${s}px`,
              background: showDashed
                ? `linear-gradient(to bottom right, transparent calc(50% - 0.5px), ${gridColor}80 calc(50% - 0.5px), ${gridColor}80 calc(50% + 0.5px), transparent calc(50% + 0.5px))`
                : 'transparent',
            }}
          />
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

  const displayChar = char === ' ' ? '\u00A0' : char;

  return (
    <div
      className="relative inline-block shrink-0"
      style={{ width: s, height: s }}
    >
      {renderGrid()}

      {showTrace && char !== ' ' && char !== '' && (
        <span
          className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
          style={{
            fontFamily,
            fontSize,
            color: fontColor,
            opacity: traceOpacity,
            lineHeight: 1,
          }}
        >
          {displayChar}
        </span>
      )}

      <span
        className="absolute inset-0 flex items-center justify-center select-none"
        style={{
          fontFamily,
          fontSize,
          color: fontColor,
          lineHeight: 1,
          visibility: showTrace ? 'hidden' : 'visible',
        }}
      >
        {displayChar}
      </span>
    </div>
  );
}
