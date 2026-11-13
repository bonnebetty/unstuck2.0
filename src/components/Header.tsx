import { LecturePhase } from '../types';
import { FileText } from 'lucide-react';

interface HeaderProps {
  currentPhase: LecturePhase;
  onPhaseChange: (phase: LecturePhase) => void;
  onOpenExportModal: () => void;
  pointsCount: number;
}

export function Header({
  currentPhase,
  onPhaseChange,
  onOpenExportModal,
  pointsCount,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onPhaseChange('in_class')}
              className="text-base sm:text-lg font-bold tracking-tight text-slate-900 hover:text-indigo-600 transition-colors text-left"
            >
              Classroom Sync
            </button>
            <span className="hidden sm:inline text-xs text-slate-400">·</span>
            <span className="hidden sm:inline text-xs text-slate-500 font-medium">
              课堂盲点记录与提问助手
            </span>
          </div>

          {/* Zone 2: 3-Stage Navigation */}
          <nav className="flex items-center gap-1 sm:gap-4 text-xs sm:text-sm font-medium">
            <button
              onClick={() => onPhaseChange('in_class')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                currentPhase === 'in_class'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>1. 课堂中</span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">(秒级记录)</span>
              {pointsCount > 0 && (
                <span className="text-[11px] bg-indigo-600 text-white rounded-full px-1.5 py-0.2 font-mono">
                  {pointsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onPhaseChange('qa_time')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                currentPhase === 'qa_time'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>2. 答疑时</span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">(提问生成)</span>
            </button>

            <button
              onClick={() => onPhaseChange('post_class')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                currentPhase === 'post_class'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>3. 课堂后</span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">(复盘清单)</span>
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenExportModal}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Canvas 作业报告</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
