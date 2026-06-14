import { useState, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Download, RotateCcw, Loader2, FileDown, ChevronDown, Pencil, FileText } from 'lucide-react';
import { useCopybookStore } from '@/store/useCopybookStore';
import { exportCopybookToPdf } from '@/utils/pdfExport';

interface ExportButtonProps {
  previewRef: React.RefObject<HTMLElement>;
}

type ExportMode = 'original' | 'drawing';

export default function ExportButton({ previewRef }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const { resetConfig, pagePaths } = useCopybookStore(
    useShallow((s) => ({
      resetConfig: s.resetConfig,
      pagePaths: s.pagePaths,
    }))
  );

  const hasDrawing = useMemo(() => {
    return Object.values(pagePaths).some((p) => p && p.length > 0);
  }, [pagePaths]);

  const handleExport = async (mode: ExportMode) => {
    if (!previewRef.current || exporting) {
      if (!previewRef.current) {
        setError('未找到字帖内容，请刷新页面重试');
        setTimeout(() => setError(null), 3000);
      }
      return;
    }

    setShowDropdown(false);
    setExporting(true);
    setError(null);

    try {
      const includeDrawing = mode === 'drawing';
      const filename = includeDrawing ? '字帖-临摹版.pdf' : '字帖.pdf';
      await exportCopybookToPdf(previewRef.current, { filename, includeDrawing });
    } catch (err) {
      console.error('导出失败:', err);
      const msg = err instanceof Error ? err.message : '未知错误';
      setError(`导出失败：${msg}`);
      setTimeout(() => setError(null), 4000);
    } finally {
      setExporting(false);
    }
  };

  const handleReset = () => {
    if (confirm('确定要重置所有配置吗？')) {
      resetConfig();
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleReset}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-stone-600 bg-white border-2 border-stone-200 rounded-lg hover:bg-stone-50 hover:border-stone-300 transition-all duration-200 active:scale-[0.98]"
      >
        <RotateCcw size={16} />
        重置配置
      </button>

      <div className="relative">
        {exporting ? (
          <button
            disabled
            className="flex items-center gap-2.5 px-6 py-2.5 text-sm font-semibold text-white bg-[#8B2E20] rounded-lg shadow-md opacity-70 cursor-not-allowed"
          >
            <Loader2 size={18} className="animate-spin" />
            正在导出...
          </button>
        ) : (
          <>
            <div className="flex">
              <button
                onClick={() => handleExport(hasDrawing ? 'drawing' : 'original')}
                className="flex items-center gap-2.5 px-5 py-2.5 text-sm font-semibold text-white bg-[#8B2E20] rounded-l-lg shadow-md hover:bg-[#7a281c] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0 active:shadow-md"
              >
                <FileDown size={18} strokeWidth={2} />
                {hasDrawing ? '导出临摹版' : '导出 PDF'}
              </button>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center justify-center px-3 py-2.5 text-white bg-[#8B2E20] border-l border-[#7a281c] rounded-r-lg hover:bg-[#7a281c] transition-all duration-200"
                aria-label="导出选项"
              >
                <ChevronDown size={16} />
              </button>
            </div>

            {showDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-stone-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <button
                    onClick={() => handleExport('original')}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-stone-50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center">
                      <FileText size={16} className="text-stone-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-stone-800">原版字帖</div>
                      <div className="text-xs text-stone-500">不含临摹笔迹</div>
                    </div>
                  </button>
                  <div className="border-t border-stone-100" />
                  <button
                    onClick={() => handleExport('drawing')}
                    disabled={!hasDrawing}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-stone-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#8B2E20]/10 flex items-center justify-center">
                      <Pencil size={16} className="text-[#8B2E20]" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-stone-800">临摹版字帖</div>
                      <div className="text-xs text-stone-500">
                        {hasDrawing ? '包含临摹笔迹' : '暂无临摹内容'}
                      </div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {error && (
          <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg shadow-lg whitespace-nowrap z-50 animate-in fade-in slide-in-from-top-1 duration-200">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
