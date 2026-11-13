import { useState } from 'react';
import { Header } from './components/Header';
import { InClassLogger } from './components/InClassLogger';
import { QAQuestionGenerator } from './components/QAQuestionGenerator';
import { PostClassReflection } from './components/PostClassReflection';
import { CanvasExportModal } from './components/CanvasExportModal';
import { LecturePhase, ConfusionPoint } from './types';

export default function App() {
  const [currentPhase, setCurrentPhase] = useState<LecturePhase>('in_class');
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  // Initial realistic sample points so the user can test the workflow right away
  const [points, setPoints] = useState<ConfusionPoint[]>([
    {
      id: 'pt_1',
      timeStr: '10:12 AM',
      slideNumber: 12,
      keyword: '损失函数均方误差平方和',
      source: 'teacher_speech',
      isResolved: true,
      isAsked: true,
    },
    {
      id: 'pt_2',
      timeStr: '10:24 AM',
      slideNumber: 14,
      keyword: '梯度更新公式里的负号与 α 步长',
      source: 'ppt_slide',
      isResolved: false,
      isAsked: false,
    },
  ]);

  const [selectedPointId, setSelectedPointId] = useState<string>('pt_2');

  const handleAddPoint = (newPoint: Omit<ConfusionPoint, 'id' | 'timeStr'>) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const created: ConfusionPoint = {
      ...newPoint,
      id: `pt_${Date.now()}`,
      timeStr,
    };
    setPoints((prev) => [created, ...prev]);
    setSelectedPointId(created.id);
  };

  const handleDeletePoint = (id: string) => {
    setPoints((prev) => prev.filter((p) => p.id !== id));
    if (selectedPointId === id) {
      const remaining = points.filter((p) => p.id !== id);
      if (remaining.length > 0) {
        setSelectedPointId(remaining[0].id);
      }
    }
  };

  const handleUpdatePoint = (id: string, updates: Partial<ConfusionPoint>) => {
    setPoints((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const handleMarkAsked = (id: string) => {
    handleUpdatePoint(id, { isAsked: true });
  };

  const handleGoToQA = (pointId?: string) => {
    if (pointId) {
      setSelectedPointId(pointId);
    }
    setCurrentPhase('qa_time');
  };

  const handleGoToPostClass = () => {
    setCurrentPhase('post_class');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top 3-Zone Header Contract */}
      <Header
        currentPhase={currentPhase}
        onPhaseChange={setCurrentPhase}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        pointsCount={points.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {currentPhase === 'in_class' && (
          <InClassLogger
            points={points}
            onAddPoint={handleAddPoint}
            onDeletePoint={handleDeletePoint}
            onGoToQA={handleGoToQA}
          />
        )}

        {currentPhase === 'qa_time' && (
          <QAQuestionGenerator
            points={points}
            selectedPointId={selectedPointId}
            onSelectPointId={setSelectedPointId}
            onMarkAsked={handleMarkAsked}
            onGoToPostClass={handleGoToPostClass}
            onBackToLogger={() => setCurrentPhase('in_class')}
          />
        )}

        {currentPhase === 'post_class' && (
          <PostClassReflection
            points={points}
            onUpdatePoint={handleUpdatePoint}
            onOpenCanvasExport={() => setIsExportModalOpen(true)}
          />
        )}
      </main>

      {/* Clean Uncluttered Academic Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">Classroom Sync</span>
            <span>·</span>
            <span>秒级卡壳打点 · 现成提问生成 · 课后复盘对比</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>阶段 1: 课堂中</span>
            <span>·</span>
            <span>阶段 2: 答疑时</span>
            <span>·</span>
            <span>阶段 3: 课堂后</span>
          </div>
        </div>
      </footer>

      {/* Canvas Assignment Export Modal */}
      <CanvasExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        points={points}
      />
    </div>
  );
}
