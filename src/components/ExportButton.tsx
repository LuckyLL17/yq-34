import { useState } from 'react';
import { Download, FileText, RotateCcw, Loader2 } from 'lucide-react';
import { useCopybookStore } from '@/store/useCopybookStore';
import { exportToPdf, exportToPdfA4 } from '@/utils/pdfExport';

interface ExportButtonProps {
  previewRef: React.RefObject<HTMLElement>;
}

export default function ExportButton({ previewRef }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const resetConfig = useCopybookStore((s) => s.resetConfig);

  const handleExport = async (a4 = false) => {
    if (!previewRef.current || exporting) return;

    setExporting(true);
    setShowMenu(false);
    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (a4) {
        await exportToPdfA4(previewRef.current);
      } else {
        await exportToPdf(previewRef.current);
      }
    } catch (err) {
      console.error('导出失败:', err);
      alert('导出失败，请重试');
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
        <button
          onClick={() => setShowMenu(!showMenu)}
          disabled={exporting}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#8B2E20] rounded-lg shadow-md hover:bg-[#7a281c] hover:shadow-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {exporting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              导出中...
            </>
          ) : (
            <>
              <Download size={16} />
              导出 PDF
              <svg
                className={`w-3.5 h-3.5 transition-transform ${showMenu ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </>
          )}
        </button>

        {showMenu && !exporting && (
          <div className="absolute right-0 bottom-full mb-2 w-52 bg-white border border-stone-200 rounded-lg shadow-xl py-1.5 z-30 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <button
              onClick={() => handleExport(false)}
              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-stone-700 hover:bg-[#8B2E20]/5 hover:text-[#8B2E20] transition-colors"
            >
              <FileText size={16} />
              <div className="text-left">
                <p className="font-medium">原始尺寸导出</p>
                <p className="text-xs text-stone-400">按字帖实际大小</p>
              </div>
            </button>
            <button
              onClick={() => handleExport(true)}
              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-stone-700 hover:bg-[#8B2E20]/5 hover:text-[#8B2E20] transition-colors border-t border-stone-100"
            >
              <FileText size={16} />
              <div className="text-left">
                <p className="font-medium">A4 纸张导出</p>
                <p className="text-xs text-stone-400">自动适配 A4 打印</p>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
