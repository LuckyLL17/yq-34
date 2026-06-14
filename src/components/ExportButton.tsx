import { useState } from 'react';
import { Download, RotateCcw, Loader2, FileDown } from 'lucide-react';
import { useCopybookStore } from '@/store/useCopybookStore';
import { exportCopybookToPdf } from '@/utils/pdfExport';

interface ExportButtonProps {
  previewRef: React.RefObject<HTMLElement>;
}

export default function ExportButton({ previewRef }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resetConfig = useCopybookStore((s) => s.resetConfig);

  const handleExport = async () => {
    if (!previewRef.current || exporting) {
      if (!previewRef.current) {
        setError('未找到字帖内容，请刷新页面重试');
        setTimeout(() => setError(null), 3000);
      }
      return;
    }

    setExporting(true);
    setError(null);

    try {
      await exportCopybookToPdf(previewRef.current);
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
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2.5 px-6 py-2.5 text-sm font-semibold text-white bg-[#8B2E20] rounded-lg shadow-md hover:bg-[#7a281c] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0 active:shadow-md disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {exporting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              正在导出...
            </>
          ) : (
            <>
              <FileDown size={18} strokeWidth={2} />
              导出 PDF
            </>
          )}
        </button>

        {error && (
          <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg shadow-lg whitespace-nowrap z-50 animate-in fade-in slide-in-from-top-1 duration-200">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
