import { useState } from 'react';
import { generateFullHomeworkMarkdown } from '../utils/homeworkReportGenerator';
import { ConfusionPoint } from '../types';
import { X, Copy, Check, Download, ExternalLink, Sparkles } from 'lucide-react';

interface CanvasExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  points: ConfusionPoint[];
}

export function CanvasExportModal({ isOpen, onClose, points }: CanvasExportModalProps) {
  if (!isOpen) return null;

  const [studentName, setStudentName] = useState<string>('Betty Wang');
  const [courseName, setCourseName] = useState<string>('Computational Thinking in Practice');
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'formatted' | 'raw_markdown'>('formatted');

  const topPoint = points[0] || {
    id: 'sample',
    timeStr: '10:15 AM',
    slideNumber: 14,
    keyword: '梯度公式负号与步长 α',
    source: 'ppt_slide',
    isResolved: false,
  };

  const markdownContent = generateFullHomeworkMarkdown({
    studentName,
    courseName,
    scenarioTitle: 'Lecture Comprehension Breakdown & Q&A Freeze',
    selectedBreakpointNodeTitle: `Slide ${topPoint.slideNumber}: ${topPoint.keyword}`,
    selectedCategoryName: 'Jargon & Logic Leap',
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Computational_Thinking_Canvas_Submission.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                Canvas 作业提交包 (Step 1 ~ Step 5 Full Report)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              已将你的观察现象、计算思维拆解（Decomposition, Pattern, Abstraction, Algorithm）、AI对话与反思格式化为完整报告。
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Toolbar */}
        <div className="px-6 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">姓名:</span>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="px-2 py-1 rounded border border-slate-200 font-medium text-slate-800 w-28 text-xs"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">课程:</span>
              <input
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="px-2 py-1 rounded border border-slate-200 font-medium text-slate-800 w-48 text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('formatted')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeTab === 'formatted' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600'
              }`}
            >
              排版预览
            </button>
            <button
              onClick={() => setActiveTab('raw_markdown')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeTab === 'raw_markdown' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600'
              }`}
            >
              纯文本 Markdown
            </button>
            <span className="text-slate-200">|</span>
            <button
              onClick={handleDownload}
              className="px-3 py-1 rounded border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1 font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下载 .md</span>
            </button>
            <button
              onClick={handleCopy}
              className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1 font-semibold shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>已复制全文!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>一键复制到 Google Doc</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 text-xs text-slate-700 leading-relaxed font-sans">
          {activeTab === 'raw_markdown' ? (
            <pre className="font-mono text-[11px] p-4 bg-slate-900 text-slate-200 rounded-lg overflow-x-auto whitespace-pre-wrap">
              {markdownContent}
            </pre>
          ) : (
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Step 1 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-indigo-600 uppercase text-[11px] tracking-wider block">
                  Step 1: Choose a Phenomenon to Observe
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  课堂认知级联雪崩与“Any Questions?”提问失语现象 (Cognitive Cascade)
                </h3>
                <p>
                  在大学和高中的课堂讲授中，经常发生这样的社会认知现象：当老师连续讲解一串递进式知识点时，学生偶尔因为一句话没听清、一个术语未定义或一次短暂走神，导致对当前步骤产生理解断层。因为后续内容强依赖前面的步骤，这个单一断点迅速演变为全盘迷雾。当老师停下询问“大家有任何问题吗”时，学生因为处于“不知道自己哪里不会”的元无知状态，无法组织出专业问题，全班保持死寂。
                </p>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="font-bold text-indigo-600 uppercase text-[11px] tracking-wider block">
                  Step 2: Practice Computational Thinking (CT)
                </span>
                <div className="space-y-2">
                  <p><strong>1. 分解 (Decomposition):</strong> 将现象拆解为输入流（课程节点链）、断点触发器（术语、跳步、语速、前置假设）、记忆缓冲雪崩、提问检测门、表达死锁。</p>
                  <p><strong>2. 模式识别 (Pattern Recognition):</strong> 强依赖管道模式（DAG有向无环图，第k步失效导致后续全盘失效）；倒置反馈假象（沉默被误判为100%听懂）。</p>
                  <p><strong>3. 抽象 (Abstraction):</strong> 抽象出认知状态机及断点三元向量：<code>(LastValidAnchor, DisconnectType, FormulationCost)</code>。</p>
                  <p><strong>4. 算法 (Algorithm):</strong> 回溯与提问重构算法——上课秒级打点，答疑时一键插值生成3句低压力提问，下课用清单复盘真实原因。</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-indigo-600 uppercase text-[11px] tracking-wider block">
                  Step 3: Use AI to Support Your Thinking
                </span>
                <p>
                  使用 AI 辅助拆解了“脑中一团乱麻”到“有向依赖图”的映射，并利用 AI 提炼出 5 种标准失误分类法，将主观恐慌转化为确定性的提问生成函数。
                </p>
              </div>

              {/* Step 4 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-indigo-600 uppercase text-[11px] tracking-wider block">
                  Step 4: Represent in Code (The Interactive Prototype)
                </span>
                <p>
                  构建了 3 阶段工作流代码原型（课堂中秒级打点 $\to$ 答疑时自动生成提问 $\to$ 课堂后引导式清单复盘），用交互和状态完整表达了认知恢复闭环。
                </p>
              </div>

              {/* Step 5 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-indigo-600 uppercase text-[11px] tracking-wider block">
                  Step 5: Reflection
                </span>
                <p>
                  计算思维让我意识到：在课堂上听不懂并陷入沉默并不是因为自己“不够聪明”，而是一个经典的依赖传递系统故障。通过分解和算法，混乱的情绪可以被完全结构化为可执行的恢复动作。
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>可直接全选复制粘贴至 Google Doc，然后提交 Canvas 链接。</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors font-medium"
          >
            关闭弹窗
          </button>
        </div>
      </div>
    </div>
  );
}
