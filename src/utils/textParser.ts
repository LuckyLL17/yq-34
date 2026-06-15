export const PAGE_BREAK = '---';
export const LINE_BREAK = '|';

export interface ParsedText {
  pages: string[][][];
  totalChars: number;
}

export function isPageBreakToken(token: string): boolean {
  return token === PAGE_BREAK;
}

export function isLineBreakToken(token: string): boolean {
  return token === LINE_BREAK;
}

export function tokenizeText(text: string): string[] {
  const tokens: string[] = [];
  const chars = Array.from(text);

  for (let i = 0; i < chars.length; i++) {
    if (chars[i] === '-' && i + 2 < chars.length && chars[i + 1] === '-' && chars[i + 2] === '-') {
      tokens.push(PAGE_BREAK);
      i += 2;
      continue;
    }
    if (chars[i] === LINE_BREAK) {
      tokens.push(LINE_BREAK);
      continue;
    }
    if (chars[i] === '\n' || chars[i] === '\r' || chars[i] === '\t' || chars[i] === ' ') {
      continue;
    }
    tokens.push(chars[i]);
  }

  return tokens;
}

export function parseTextToPages(
  text: string,
  colsPerRow: number,
  rows: number
): ParsedText {
  const tokens = tokenizeText(text);
  const pages: string[][][] = [];
  let currentPage: string[][] = [];
  let currentRow: string[] = [];
  let totalChars = 0;

  const flushRow = () => {
    while (currentRow.length < colsPerRow) {
      currentRow.push(' ');
    }
    currentPage.push(currentRow);
    currentRow = [];
  };

  const flushPage = () => {
    if (currentRow.length > 0) {
      flushRow();
    }
    while (currentPage.length < rows) {
      const emptyRow: string[] = [];
      for (let c = 0; c < colsPerRow; c++) {
        emptyRow.push(' ');
      }
      currentPage.push(emptyRow);
    }
    pages.push(currentPage);
    currentPage = [];
  };

  for (const token of tokens) {
    if (isPageBreakToken(token)) {
      flushPage();
      continue;
    }

    if (isLineBreakToken(token)) {
      flushRow();
      if (currentPage.length >= rows) {
        flushPage();
      }
      continue;
    }

    if (currentRow.length >= colsPerRow) {
      flushRow();
      if (currentPage.length >= rows) {
        flushPage();
      }
    }

    currentRow.push(token);
    totalChars++;
  }

  if (currentRow.length > 0 || currentPage.length > 0) {
    flushPage();
  }

  if (pages.length === 0) {
    const emptyPage: string[][] = [];
    for (let r = 0; r < rows; r++) {
      const emptyRow: string[] = [];
      for (let c = 0; c < colsPerRow; c++) {
        emptyRow.push(' ');
      }
      emptyPage.push(emptyRow);
    }
    pages.push(emptyPage);
  }

  return { pages, totalChars };
}

export function countValidChars(text: string): number {
  const tokens = tokenizeText(text);
  let count = 0;
  for (const token of tokens) {
    if (!isPageBreakToken(token) && !isLineBreakToken(token)) {
      count++;
    }
  }
  return count;
}

export function extractContentChars(text: string): string[] {
  const tokens = tokenizeText(text);
  const chars: string[] = [];
  for (const token of tokens) {
    if (!isPageBreakToken(token) && !isLineBreakToken(token)) {
      chars.push(token);
    }
  }
  return chars;
}
