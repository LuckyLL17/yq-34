import { useShallow } from 'zustand/react/shallow';
import { Layers } from 'lucide-react';
import { useCopybookStore } from '@/store/useCopybookStore';
import { getFontById, getFontsByType } from '@/utils/fonts';

interface FontSelectorProps {
  onOpenCompare?: () => void;
}

export default function FontSelector({ onOpenCompare }: FontSelectorProps) {
  const { textType, fontId, setFontId } = useCopybookStore(
    useShallow((s) => ({
      textType: s.textType,
      fontId: s.fontId,
      setFontId: s.setFontId,
    }))
  );

  const fonts = getFontsByType(textType);
  const currentFont = getFontById(fontId);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-stone-700">书法字体</label>
      <div className="relative">
        <select
          value={fontId}
          onChange={(e) => setFontId(e.target.value)}
          className="w-full appearance-none px-3 py-2.5 pr-10 text-sm bg-white border-2 border-stone-200 rounded-lg focus:outline-none focus:border-[#8B2E20]/50 focus:ring-2 focus:ring-[#8B2E20]/10 transition-all cursor-pointer"
          style={{ fontFamily: currentFont.family }}
        >
          {fonts.map((f) => (
            <option key={f.id} value={f.id} style={{ fontFamily: f.family }}>
              {f.name}
            </option>
          ))}
        </select>
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      <div
        className="mt-2 px-3 py-2.5 bg-stone-50 rounded-lg text-center text-lg text-stone-600 border border-stone-100"
        style={{ fontFamily: currentFont.family }}
      >
        {textType === 'chinese' && '永字八法'}
        {textType === 'number' && '1234567890'}
        {textType === 'english' && 'Hello World'}
      </div>

      {onOpenCompare && (
        <button
          onClick={onOpenCompare}
          className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2.5 bg-[#8B2E20]/5 hover:bg-[#8B2E20]/10 border border-[#8B2E20]/20 hover:border-[#8B2E20]/40 rounded-lg transition-all group"
        >
          <Layers size={14} className="text-[#8B2E20]" />
          <span className="text-sm font-medium text-[#8B2E20]">字体对比选择</span>
          <span className="text-xs text-[#8B2E20]/60 group-hover:translate-x-0.5 transition-transform">→</span>
        </button>
      )}
    </div>
  );
}
