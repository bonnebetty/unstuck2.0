import { useState } from 'react';
import { ConfusionPoint, GeneratedQuestion } from '../types';
import { generateQuestionsForPoint, SOURCE_LABELS } from '../utils/qaEngine';
import { Copy, Check, MessageSquare, ArrowRight, CheckCircle2, ChevronRight, HelpCircle, Volume2 } from 'lucide-react';

interface QAQuestionGeneratorProps {
  points: ConfusionPoint[];
  selectedPointId?: string;
  onSelectPointId: (id: string) => void;
  onMarkAsked: (id: string) => void;
  onGoToPostClass: () => void;
  onBackToLogger: () => void;
}

export function QAQuestionGenerator({
  points,
  selectedPointId,
  onSelectPointId,
  onMarkAsked,
  onGoToPostClass,
  onBackToLogger,
}: QAQuestionGeneratorProps) {
  // If no points exist, show fallback mock point
  const fallbackPoint: ConfusionPoint = {
    id: 'demo_point',
    timeStr: '10:15 AM',
    slideNumber: 14,
    keyword: '梯度公式负号与步长 α',
    source: 'ppt_slide',
    isResolved: false,
  };

  const activePoint = points.find((p) => p.id === selectedPointId) || points[0] || fallbackPoint;
  const questions: GeneratedQuestion[] = generateQuestionsForPoint(activePoint);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [teleprompterIndex, setTeleprompterIndex] = useState<number | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Editorial context header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
            阶段 2 · 答疑时智能提问生成 (Q&A Question Generator)
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            老师问“Any questions?”时的现成提问脚本
          </h1>
          <p className="text-slate-600 text-sm mt-1 max-w-xl">
            不用害怕“不知道怎么开口”。系统已将你刚才打点的卡壳瞬间，自动重构为 3 句专业、清晰、低心理压力的提问话术。
          </p>
        </div>

        <button
          onClick={onBackToLogger}
          className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium whitespace-nowrap"
        >
          <span>← 返回课堂记录</span>
        </button>
      </div>

      {/* Target Point Selector */}
      {points.length > 1 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <label className="text-xs font-semibold text-slate-700 block mb-2">
            选择你现在想要提问的卡壳点：
          </label>
          <div className="flex flex-wrap gap-2">
            {points.map((pt) => {
              const isSelected = pt.id === activePoint.id;
              return (
                <button
                  key={pt.id}
                  onClick={() => onSelectPointId(pt.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-2 ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="font-mono">Slide {pt.slideNumber}</span>
                  <span>{pt.keyword}</span>
                  {pt.isAsked && <Check className="w-3 h-3 text-emerald-300" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Checkpoint Spotlight */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-300 font-mono mb-1">
            <span>当前选定盲点</span>
            <span>·</span>
            <span>Slide {activePoint.slideNumber}</span>
            <span>·</span>
            <span>{SOURCE_LABELS[activePoint.source]?.label}</span>
          </div>
          <div className="text-lg font-bold text-white">
            “{activePoint.keyword}”
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onMarkAsked(activePoint.id)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activePoint.isAsked
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{activePoint.isAsked ? '已标记为提问完成' : '标记已提问'}</span>
          </button>
        </div>
      </div>

      {/* 3 Synthesized Questions Cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          推荐提问话术（选一条最适合当前语境的直接念）：
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-indigo-300 transition-colors space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-mono text-xs font-bold flex items-center justify-center">
                    0{idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {q.styleName}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setTeleprompterIndex(teleprompterIndex === idx ? null : idx)
                    }
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded hover:bg-indigo-50"
                  >
                    {teleprompterIndex === idx ? '收起提词卡' : '大字提词卡'}
                  </button>
                  <button
                    onClick={() => handleCopy(q.questionText, q.id)}
                    className="px-3 py-1 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
                  >
                    {copiedId === q.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">已复制!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>复制英文</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Large teleprompter mode if toggled */}
              {teleprompterIndex === idx ? (
                <div className="p-4 bg-indigo-950 text-white rounded-lg space-y-2">
                  <div className="text-base sm:text-lg font-serif font-medium leading-relaxed text-indigo-100">
                    {q.questionText}
                  </div>
                  <div className="text-xs text-indigo-300 leading-relaxed font-sans pt-2 border-t border-indigo-900">
                    {q.questionTextZh}
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-slate-900 leading-relaxed italic">
                    {q.questionText}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {q.questionTextZh}
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>{q.rationale}</span>
                <span className="text-slate-500">{q.styleNameZh}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Step Transition to Post-Class */}
      <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900">
            答疑结束或已经下课了？
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            进入阶段 3，用引导式清单复盘自己真正跟丢的原因，对比前后认知差异。
          </p>
        </div>

        <button
          onClick={onGoToPostClass}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 shrink-0 shadow-sm"
        >
          <span>进入阶段 3: 课后复盘清单</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
