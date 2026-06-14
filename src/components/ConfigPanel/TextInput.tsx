import { useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { useCopybookStore } from '@/store/useCopybookStore';
import { getPresetsByType } from '@/utils/presetTexts';

export default function TextInput() {
  const textType = useCopybookStore((s) => s.textType);
  const text = useCopybookStore((s) => s.text);
  const setText = useCopybookStore((s) => s.setText);
  const [showPresets, setShowPresets] = useState(false);

  const presets = getPresetsByType(textType);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-stone-700">文字内容</label>
        <div className="relative">
          <button
            onClick={() => setShowPresets(!showPresets)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#8B2E20] bg-[#8B2E20]/5 rounded-md hover:bg-[#8B2E20]/10 transition-colors"
          >
            <Sparkles size={12} />
            预设内容
            <ChevronDown
              size={12}
              className={`transition-transform ${showPresets ? 'rotate-180' : ''}`}
            />
          </button>
          {showPresets && (
            <div className="absolute right-0 top-full mt-1 z-20 w-56 max-h-60 overflow-y-auto bg-white border border-stone-200 rounded-lg shadow-xl py-1">
              {presets.length === 0 ? (
                <p className="px-3 py-2 text-xs text-stone-400">暂无预设</p>
              ) : (
                presets.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => {
                      setText(p.value);
                      setShowPresets(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-sm text-stone-600 hover:bg-stone-50 hover:text-[#8B2E20] transition-colors"
                  >
                    {p.label}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="请输入要练习的文字..."
        rows={5}
        className="w-full px-3 py-2.5 text-sm text-stone-700 bg-white border-2 border-stone-200 rounded-lg resize-none focus:outline-none focus:border-[#8B2E20]/50 focus:ring-2 focus:ring-[#8B2E20]/10 transition-all"
        style={{ fontFamily: 'inherit' }}
      />
      <p className="text-xs text-stone-400 text-right">
        共 {text.replace(/\s/g, '').length} 字
      </p>
    </div>
  );
}
