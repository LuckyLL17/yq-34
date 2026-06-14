import { useState, useRef, useEffect, useMemo } from 'react';
import { X, Download, RefreshCw, QrCode, Sparkles, Quote } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import html2canvas from 'html2canvas';
import { useCheckinStore, formatDate } from '@/store/useCheckinStore';
import { getFontById } from '@/utils/fonts';
import type { CheckinRecord } from '@/types';

interface PosterGeneratorProps {
  open: boolean;
  onClose: () => void;
  initialThumbnail?: string;
  initialCharCount?: number;
  initialRecord?: CheckinRecord;
}

const SLOGANS = [
  '笔走龙蛇，墨韵千秋',
  '一日一练，字如其人',
  '静心练字，修身养性',
  '落笔生花，翰墨飘香',
  '持之以恒，铁杵成针',
  '墨海扬帆，笔耕不辍',
  '笔下生风，字里乾坤',
  '练字修心，宁静致远',
  '书道千秋，墨香万里',
  '日练一字，岁有所成',
];

function getRandomSlogan() {
  return SLOGANS[Math.floor(Math.random() * SLOGANS.length)];
}

function formatChineseDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${y}年${m}月${d}日`;
}

export default function PosterGenerator({
  open,
  onClose,
  initialThumbnail,
  initialCharCount,
  initialRecord,
}: PosterGeneratorProps) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [slogan, setSlogan] = useState(getRandomSlogan());
  const [downloading, setDownloading] = useState(false);
  const { getStats } = useCheckinStore(
    useShallow((s) => ({ getStats: s.getStats }))
  );

  const today = formatDate(new Date());
  const stats = getStats();

  const record = useMemo(() => {
    if (initialRecord) return initialRecord;
    return {
      date: today,
      charCount: initialCharCount || 0,
      textType: 'chinese' as const,
      fontId: 'kaiti',
      timestamp: Date.now(),
      posterThumbnail: initialThumbnail,
    };
  }, [initialRecord, initialThumbnail, initialCharCount, today]);

  useEffect(() => {
    if (open) {
      setSlogan(getRandomSlogan());
    }
  }, [open]);

  const handleRefreshSlogan = () => {
    setSlogan(getRandomSlogan());
  };

  const handleDownload = async () => {
    if (!posterRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FAF7F2',
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `练字打卡-${record.date}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('生成海报失败:', err);
      alert('生成海报失败，请重试');
    } finally {
      setDownloading(false);
    }
  };

  const font = getFontById(record.fontId);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-gradient-to-r from-[#FAF7F2] to-[#F5EFE6]">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-[#8B2E20]" />
            <h3 className="text-lg font-bold text-[#3D2C1F]" style={{ fontFamily: '"Noto Serif SC", "STSong", serif' }}>
              生成打卡海报
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-stone-200/60 text-stone-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex justify-center mb-5">
            <div
              ref={posterRef}
              className="relative w-[320px] overflow-hidden rounded-2xl shadow-xl"
              style={{
                background: `
                  linear-gradient(135deg, #FAF7F2 0%, #F0E6D3 50%, #E8DCC8 100%)
                `,
              }}
            >
              <div
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                  backgroundImage: `
                    radial-gradient(circle at 10% 10%, rgba(212, 165, 116, 0.25) 0%, transparent 40%),
                    radial-gradient(circle at 90% 80%, rgba(139, 46, 32, 0.12) 0%, transparent 45%),
                    radial-gradient(circle at 50% 50%, rgba(212, 165, 116, 0.08) 0%, transparent 60%)
                  `,
                }}
              />

              <div className="relative p-6 pb-7">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8B2E20] to-[#5d1e15] flex items-center justify-center shadow-md">
                      <span className="text-white text-xs font-bold" style={{ fontFamily: '"Noto Serif SC", serif' }}>墨</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#8B2E20]" style={{ fontFamily: '"Noto Serif SC", "STSong", serif' }}>
                        墨韵字帖
                      </div>
                      <div className="text-[10px] text-stone-500">每日练字打卡</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-stone-500">第</div>
                    <div className="text-xl font-bold text-[#8B2E20]" style={{ fontFamily: '"Noto Serif SC", "STSong", serif' }}>
                      {stats.totalDays + (initialCharCount ? 1 : 0)}
                    </div>
                    <div className="text-[10px] text-stone-500">天打卡</div>
                  </div>
                </div>

                <div className="relative mb-4 rounded-xl overflow-hidden shadow-lg border-2 border-white/80">
                  {record.posterThumbnail ? (
                    <img
                      src={record.posterThumbnail}
                      alt="字帖预览"
                      className="w-full h-44 object-cover"
                    />
                  ) : (
                    <div className="w-full h-44 bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
                      <div className="text-center text-stone-400">
                        <Quote size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-xs">字帖缩略图</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-md shadow-sm">
                    <span className="text-[10px] font-medium text-[#3D2C1F]">
                      {font.name}
                    </span>
                  </div>
                </div>

                <div className="relative mb-4 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-stone-200/60 shadow-sm">
                  <Quote size={18} className="absolute -top-2 -left-1 text-[#8B2E20]/30" />
                  <p
                    className="text-center text-[#3D2C1F] font-medium leading-relaxed"
                    style={{
                      fontFamily: '"Noto Serif SC", "STSong", "KaiTi", serif',
                      fontSize: '15px',
                      letterSpacing: '0.05em',
                    }}
                  >
                    「{slogan}」
                  </p>
                </div>

                <div className="relative flex items-end justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-baseline gap-1.5 mb-1.5">
                      <span className="text-3xl font-bold text-[#8B2E20]" style={{ fontFamily: '"Noto Serif SC", serif' }}>
                        {record.charCount}
                      </span>
                      <span className="text-sm text-stone-600 font-medium">字</span>
                      <span className="text-xs text-stone-400 ml-1">今日练习</span>
                    </div>
                    <div className="text-xs text-stone-500 mb-3">
                      <span className="font-medium text-[#3D2C1F]">{formatChineseDate(record.date)}</span>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]"></div>
                        <span className="text-[10px] text-stone-500">
                          连续 <span className="font-medium text-[#3D2C1F]">{stats.currentStreak}</span> 天
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#4A7C59]"></div>
                        <span className="text-[10px] text-stone-500">
                          累计 <span className="font-medium text-[#3D2C1F]">{stats.totalChars + record.charCount}</span> 字
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <div className="w-20 h-20 rounded-xl bg-white p-1.5 shadow-md border border-stone-200">
                      <div className="w-full h-full rounded-lg bg-stone-50 flex flex-col items-center justify-center border border-dashed border-stone-300">
                        <QrCode size={28} className="text-stone-400 mb-1" />
                        <span className="text-[8px] text-stone-400">扫码查看</span>
                      </div>
                    </div>
                    <div className="text-center mt-1.5 text-[9px] text-stone-400">
                      识别二维码
                    </div>
                  </div>
                </div>

                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br from-[#8B2E20]/10 to-transparent" />
                <div className="absolute -left-8 -bottom-4 w-20 h-20 rounded-full bg-gradient-to-tr from-[#D4A574]/15 to-transparent" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefreshSlogan}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-stone-700 bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors"
            >
              <RefreshCw size={16} />
              换个标语
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#8B2E20] to-[#a03829] rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {downloading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Download size={16} />
                  保存海报
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
