import { useState, useRef, useEffect } from 'react';
import { Download, FileText, RotateCcw, Loader2 } from 'lucide-react';
import { useCopybookStore } from '@/store/useCopybookStore';
import { exportCopybookToPdf } from '@/utils/pdfExport';

interface ExportButtonProps {
  previewRef: React.RefObject<HTMLElement>;
}

export default function ExportButton({ previewRef }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const resetConfig = useCopybookStore((s) => s.resetConfig);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleExport = async () => {
    if (!previewRef.current || exporting) return;

    setExporting(true);
    setShowMenu(false);
    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      await exportCopybookToPdf(previewRef.current);
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

      <div className="relative" ref={menuRef}>
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
          <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-stone-200 rounded-lg shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <button
              onClick={handleExport}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-stone-700 hover:bg-[#8B2E20]/5 hover:text-[#8B2E20] transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-[#8B2E20]/10 flex items-center justify-center shrink-0">
                <FileText size={18} className="text-[#8B2E20]" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="font-semibold">A4 分页导出</p>
                <p className="text-xs text-stone-500 mt-0.5">每页撑满A4纸，自动分页</p>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
