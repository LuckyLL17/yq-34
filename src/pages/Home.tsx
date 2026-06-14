import { useRef, useState } from 'react';
import { Settings, Eye, PenTool, ChevronDown } from 'lucide-react';
import CopybookPreview from '@/components/Preview/CopybookPreview';
import DrawingToolbar from '@/components/Preview/DrawingToolbar';
import TextTypeSelector from '@/components/ConfigPanel/TextTypeSelector';
import TextInput from '@/components/ConfigPanel/TextInput';
import FontSelector from '@/components/ConfigPanel/FontSelector';
import GridConfig from '@/components/ConfigPanel/GridConfig';
import ColorConfig from '@/components/ConfigPanel/ColorConfig';
import ExportButton from '@/components/ExportButton';

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function ConfigSection({ title, icon, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl border border-stone-200/70 overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-stone-50 to-white hover:from-stone-100/50 transition-colors"
      >
        <div className="flex items-center gap-2 text-[#8B2E20]">
          {icon}
          <span className="font-semibold text-sm">{title}</span>
        </div>
        <ChevronDown
          size={18}
          className={`text-stone-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-4 py-4 border-t border-stone-100/70">{children}</div>
      )}
    </div>
  );
}

export default function Home() {
  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className="min-h-screen"
      style={{
        background: `
          linear-gradient(135deg, #FAF7F2 0%, #F5EFE6 50%, #F0E6D3 100%)
        `,
      }}
    >
      <div
        className="pointer-events-none fixed inset-0 opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(circle at 15% 20%, rgba(212, 165, 116, 0.15) 0%, transparent 45%),
            radial-gradient(circle at 85% 10%, rgba(139, 46, 32, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 70% 90%, rgba(180, 120, 70, 0.1) 0%, transparent 50%)
          `,
        }}
      />

      <header className="relative z-10 border-b border-stone-200/50 backdrop-blur-sm bg-[#FAF7F2]/80">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B2E20] to-[#5d1e15] flex items-center justify-center shadow-lg shadow-[#8B2E20]/20">
                <PenTool size={24} className="text-[#FAF7F2]" strokeWidth={1.8} />
              </div>
              <div>
                <h1
                  className="text-2xl md:text-3xl font-bold text-[#3D2C1F] tracking-wide"
                  style={{ fontFamily: '"Noto Serif SC", "STSong", "Ma Shan Zheng", serif' }}
                >
                  墨韵字帖生成器
                </h1>
                <p className="text-xs md:text-sm text-stone-500 mt-0.5">
                  汉字 · 数字 · 英文书法练习字帖在线生成
                </p>
              </div>
            </div>

            <div className="hidden sm:block">
              <ExportButton previewRef={previewRef as React.RefObject<HTMLElement>} />
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <aside className="w-full lg:w-[380px] lg:shrink-0 space-y-4 order-2 lg:order-1">
            <div className="sticky top-6 space-y-4 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1 custom-scrollbar">
              <ConfigSection title="字帖类型" icon={<Settings size={16} strokeWidth={2} />}>
                <TextTypeSelector />
              </ConfigSection>

              <ConfigSection title="文字内容" icon={<Eye size={16} strokeWidth={2} />}>
                <TextInput />
              </ConfigSection>

              <ConfigSection title="书法字体" icon={<PenTool size={16} strokeWidth={2} />}>
                <FontSelector />
              </ConfigSection>

              <ConfigSection title="字帖布局" icon={<Settings size={16} strokeWidth={2} />}>
                <GridConfig />
              </ConfigSection>

              <ConfigSection title="颜色设置" icon={<Eye size={16} strokeWidth={2} />} defaultOpen={false}>
                <ColorConfig />
              </ConfigSection>

              <div className="sm:hidden">
                <div className="sticky bottom-4">
                  <ExportButton previewRef={previewRef as React.RefObject<HTMLElement>} />
                </div>
              </div>
            </div>
          </aside>

          <section className="flex-1 min-w-0 order-1 lg:order-2">
            <div className="sticky top-4 z-20 mb-4">
              <DrawingToolbar />
            </div>
            <div className="overflow-auto custom-scrollbar pb-8">
              <CopybookPreview ref={previewRef} />
            </div>

            <div className="mt-6 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-stone-200/50">
              <h3 className="text-sm font-semibold text-[#3D2C1F] mb-2">💡 使用小贴士</h3>
              <ul className="text-xs text-stone-600 space-y-1.5 leading-relaxed">
                <li>• <strong>临摹练字</strong>：点击上方工具栏的「临摹练字」开关，即可直接在字帖上用鼠标或触屏描红练习</li>
                <li>• <strong>描红模式</strong>：开启后显示半透明的范字，适合初学者临摹练习</li>
                <li>• <strong>无格线</strong>：适合进阶练习，专注于字形结构</li>
                <li>• <strong>A4 导出</strong>：选择 A4 模式导出可直接打印使用</li>
                <li>• <strong>自定义颜色</strong>：点击颜色方块旁边的圆形取色器，支持自定义任意颜色</li>
                <li>• <strong>撤销清除</strong>：临摹时可随时撤销笔画或一键清除，方便反复练习</li>
              </ul>
            </div>
          </section>
        </div>
      </main>

      <footer className="relative z-10 mt-12 border-t border-stone-200/50 bg-[#FAF7F2]/60 backdrop-blur-sm">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className="text-xs text-stone-400">
            墨韵字帖生成器 · 支持数字、汉字、英文多体书法练习 · 在线即时生成
          </p>
        </div>
      </footer>
    </div>
  );
}
