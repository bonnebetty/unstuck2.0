import { useState } from 'react';
import { ConfusionPoint, RootCauseCategory } from '../types';
import { GUIDED_CHECKLIST_QUESTIONS, ROOT_CAUSE_OPTIONS } from '../utils/qaEngine';
import { CheckSquare, Square, CheckCircle, ArrowRight, Lightbulb, RefreshCw, FileText } from 'lucide-react';

interface PostClassReflectionProps {
  points: ConfusionPoint[];
  onUpdatePoint: (id: string, updates: Partial<ConfusionPoint>) => void;
  onOpenCanvasExport: () => void;
}

export function PostClassReflection({
  points,
  onUpdatePoint,
  onOpenCanvasExport,
}: PostClassReflectionProps) {
  // Checklist answers: map checklist item id -> boolean
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    c1: true,
    c2: false,
    c3: true,
  });

  const [selectedPointId, setSelectedPointId] = useState<string>(
    points[0]?.id || 'demo_p1'
  );

  const activePoint = points.find((p) => p.id === selectedPointId) || points[0] || {
    id: 'demo_p1',
    timeStr: '10:15 AM',
    slideNumber: 14,
    keyword: '梯度公式负号与步长 α',
    source: 'ppt_slide',
    resolved: false,
  };

  const handleToggleCheck = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Count which category has the most checks
  const categoryCounts = GUIDED_CHECKLIST_QUESTIONS.reduce((acc, item) => {
    if (checkedItems[item.id]) {
      acc[item.category] = (acc[item.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<RootCauseCategory, number>);

  const dominantCategory = (Object.keys(categoryCounts) as RootCauseCategory[]).sort(
    (a, b) => (categoryCounts[b] || 0) - (categoryCounts[a] || 0)
  )[0] || 'jargon';

  const dominantInfo = ROOT_CAUSE_OPTIONS.find((r) => r.id === dominantCategory);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Editorial context header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold tracking-wider text-indigo-600 uppercase">
            阶段 3 · 课堂后深度复盘 (Post-Class Guided Reflection)
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            下课复盘：为什么当时会跟丢？
          </h1>
          <p className="text-slate-600 text-sm mt-1 max-w-xl">
            在课后放松下来，通过引导式清单做理性拆解：对比“当时以为的大脑崩溃”与“实际上的微小断点”，打消自责，沉淀认知。
          </p>
        </div>

        <button
          onClick={onOpenCanvasExport}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>导出为 Canvas 作业</span>
        </button>
      </div>

      {/* Part 1: Before vs After Cognitive Comparison (核心亮点：前后对比) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900">
            前后认知对比 (Before vs After Contrast)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Before: Class moment illusion */}
          <div className="p-4 rounded-lg bg-rose-50/70 border border-rose-200 space-y-2">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">
              课堂上的主观挫败感 (当时以为的)
            </span>
            <p className="text-xs text-rose-950 leading-relaxed">
              “完蛋了，我怎么一句都听不懂了……周围同学都在点头，好像只有我跟不上。老师问‘有任何问题吗’的时候，我脑子一片空白，根本不知道自己卡在哪里，太尴尬了。”
            </p>
            <div className="pt-2 border-t border-rose-200/60 text-[11px] text-rose-700 font-mono">
              主观定性：全盘理解崩溃 (0% 理解率假象)
            </div>
          </div>

          {/* After: Rational reality */}
          <div className="p-4 rounded-lg bg-emerald-50/70 border border-emerald-200 space-y-2">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
              课后理性拆解后的真相 (实际情况)
            </span>
            <p className="text-xs text-emerald-950 leading-relaxed">
              “其实前面 80% 都听懂了！唯一的故障点就是第 {activePoint.slideNumber} 页老师口述时跳过了‘为什么更新公式里带负号’这一步推导。只要把这一个符号定义搞懂，整个大框架就完全通畅了。”
            </p>
            <div className="pt-2 border-t border-emerald-200/60 text-[11px] text-emerald-700 font-mono">
              理性真相：局部依赖断裂 (85% 已掌握，仅缺1个过渡指针)
            </div>
          </div>
        </div>
      </div>

      {/* Part 2: Guided Checklist (引导式诊断清单) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            引导式排查清单 (Guided Checklist)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            逐条勾选你在回顾这次卡壳时符合的情况，系统将自动分析主导诱因：
          </p>
        </div>

        <div className="space-y-3">
          {GUIDED_CHECKLIST_QUESTIONS.map((item) => {
            const isChecked = !!checkedItems[item.id];
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleToggleCheck(item.id)}
                className={`w-full p-3.5 rounded-lg border text-left transition-colors flex items-start gap-3 ${
                  isChecked
                    ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-indigo-600" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">
                    {item.label}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Diagnosis Outcome Box */}
        {dominantInfo && (
          <div className="p-4 rounded-lg bg-slate-900 text-white space-y-2 mt-4">
            <div className="flex items-center justify-between text-xs text-indigo-300 font-mono">
              <span>清单综合诊断结果</span>
              <span>主导卡壳类型: {dominantInfo.label}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>诊断建议：</strong>{dominantInfo.desc}。这证明你的理解力没有问题，而是遭遇了单向管道的“未定义符号阻碍”。
            </p>
          </div>
        )}
      </div>

      {/* Part 3: Actionable Follow-up for Each Recorded Point */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          各个卡壳点课后解决状态 ({points.length})
        </h3>

        {points.length === 0 ? (
          <p className="text-xs text-slate-400">暂无打点记录。</p>
        ) : (
          <div className="space-y-3">
            {points.map((pt) => (
              <div
                key={pt.id}
                className="p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      Slide {pt.slideNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {pt.keyword}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    记录时间: {pt.timeStr} · 状态: {pt.isResolved ? '已彻底搞懂' : '待复习 / 需找 TA'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() =>
                      onUpdatePoint(pt.id, { isResolved: !pt.isResolved })
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                      pt.isResolved
                        ? 'bg-emerald-600 text-white'
                        : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{pt.isResolved ? '已掌握' : '标记已搞懂'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
