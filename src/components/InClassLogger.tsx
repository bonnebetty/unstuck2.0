import { useState } from 'react';
import { ConfusionPoint, ConfusionSource } from '../types';
import { SOURCE_LABELS } from '../utils/qaEngine';
import { Plus, Trash2, ArrowRight, Zap, CheckCircle2, Clock } from 'lucide-react';

interface InClassLoggerProps {
  points: ConfusionPoint[];
  onAddPoint: (point: Omit<ConfusionPoint, 'id' | 'timeStr'>) => void;
  onDeletePoint: (id: string) => void;
  onGoToQA: (pointId?: string) => void;
}

export function InClassLogger({
  points,
  onAddPoint,
  onDeletePoint,
  onGoToQA,
}: InClassLoggerProps) {
  const [slideNumber, setSlideNumber] = useState<number>(14);
  const [keyword, setKeyword] = useState<string>('');
  const [source, setSource] = useState<ConfusionSource>('teacher_speech');
  const [justRecorded, setJustRecorded] = useState<boolean>(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!keyword.trim()) return;

    onAddPoint({
      slideNumber,
      keyword: keyword.trim(),
      source,
      isResolved: false,
    });

    setKeyword('');
    setJustRecorded(true);
    setTimeout(() => setJustRecorded(false), 1500);
  };

  const handleQuickKeyword = (quickWord: string, defaultSource: ConfusionSource = 'ppt_slide') => {
    setKeyword(quickWord);
    setSource(defaultSource);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Editorial context header */}
      <div className="pb-4 border-b border-slate-200">
        <span className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
          阶段 1 · 课堂中极速记录 (In-Class Fast Logger)
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
          听懂断裂瞬间，2秒快速打点
        </h1>
        <p className="text-slate-600 text-sm mt-1 max-w-2xl">
          上课时节奏极快，不需要停下来思考“为什么没听懂”。只需记一个关键词或页码，绝不打断继续听讲。
        </p>
      </div>

      {/* The 2-Second Fast Record Box */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* PPT Slide Stepper */}
            <div className="md:col-span-4">
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                当前 PPT 页码
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSlideNumber((p) => Math.max(1, p - 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-mono text-sm"
                >
                  -
                </button>
                <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                  <span className="text-xs text-slate-400 mr-1.5 font-mono">Slide</span>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={slideNumber}
                    onChange={(e) => setSlideNumber(Number(e.target.value) || 1)}
                    className="w-full bg-transparent font-mono text-sm font-bold text-slate-900 focus:outline-none text-center"
                    aria-label="Slide Number"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setSlideNumber((p) => p + 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-mono text-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* Keyword Input */}
            <div className="md:col-span-8">
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                卡壳关键词 (1~4个字)
              </label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="例如：梯度负号 / H0零假设 / α参数 / 矩阵转置"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
                autoFocus
              />
            </div>
          </div>

          {/* Source Toggle */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-2">
              卡壳内容来源：
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(['teacher_speech', 'ppt_slide', 'reading_text'] as ConfusionSource[]).map((src) => {
                const info = SOURCE_LABELS[src];
                const isSelected = source === src;
                return (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setSource(src)}
                    className={`py-2 px-3 rounded-lg border text-xs text-left transition-colors ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-semibold shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{info.label}</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{info.hint}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick presets for common confusion types */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs text-slate-500 pt-1">
            <span className="text-[11px] text-slate-400">一键填入样例:</span>
            <button
              type="button"
              onClick={() => handleQuickKeyword('梯度公式负号', 'ppt_slide')}
              className="px-2 py-0.5 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[11px]"
            >
              梯度公式负号
            </button>
            <button
              type="button"
              onClick={() => handleQuickKeyword('口述跳过第二步推导', 'teacher_speech')}
              className="px-2 py-0.5 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[11px]"
            >
              口述跳过第二步推导
            </button>
            <button
              type="button"
              onClick={() => handleQuickKeyword('未解释的黑话概念', 'teacher_speech')}
              className="px-2 py-0.5 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[11px]"
            >
              未解释的黑话概念
            </button>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-400">
              按回车键或点击按钮即可秒存
            </span>

            <button
              type="submit"
              disabled={!keyword.trim()}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 disabled:opacity-40 transition-colors flex items-center gap-2 shadow-sm"
            >
              {justRecorded ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>已记录！继续听课</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>1 秒记录当前盲点</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Stream of Recorded Checkpoints */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">
              本节课已标记卡壳瞬间 ({points.length})
            </h3>
          </div>
          {points.length > 0 && (
            <button
              onClick={() => onGoToQA()}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>老师开始答疑了？去生成问题</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {points.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
            暂无卡壳记录。上课过程中一旦有任何词或公式没跟上，在上方输入即可秒级记录。
          </div>
        ) : (
          <div className="space-y-2.5">
            {points.map((pt, idx) => (
              <div
                key={pt.id}
                className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-4 shadow-2xs hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-slate-400 w-5">
                    #{idx + 1}
                  </span>
                  <div className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-xs font-semibold">
                    Slide {pt.slideNumber}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-900">
                      {pt.keyword}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{pt.timeStr}</span>
                      <span>·</span>
                      <span>来源: {SOURCE_LABELS[pt.source]?.label}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onGoToQA(pt.id)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                  >
                    生成提问
                  </button>
                  <button
                    onClick={() => onDeletePoint(pt.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-slate-50"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Banner if points exist */}
      {points.length > 0 && (
        <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between">
          <div className="text-xs text-slate-300">
            当老师停下来说 <span className="text-amber-300 font-semibold">“Any questions so far?”</span> 时，点击右侧直接获取提问句式。
          </div>
          <button
            onClick={() => onGoToQA()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0"
          >
            <span>进入答疑生成器</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
