import { ConfusionPoint, GeneratedQuestion, ChecklistItem, RootCauseCategory } from '../types';

export const SOURCE_LABELS = {
  teacher_speech: { label: '老师原话', labelEn: 'Teacher Speech', hint: '刚才口述时没听清或没跟上' },
  ppt_slide: { label: 'PPT内容', labelEn: 'PPT Slide', hint: '屏幕公式/图表看不懂' },
  reading_text: { label: '阅读原文', labelEn: 'Reading Text', hint: '课件或讲义文本较深奥' },
};

export const ROOT_CAUSE_OPTIONS: { id: RootCauseCategory; label: string; desc: string }[] = [
  { id: 'jargon', label: '专业术语/未定义名词', desc: '老师随口说了一个学科黑话，没来得及查定义' },
  { id: 'logic_leap', label: '逻辑推导跳步', desc: '中间省略了关键证明或代数转换，直接给出结论' },
  { id: 'fast_pace', label: '讲课语速太快/信息溢出', desc: '单位时间内概念太多，工作记忆来不及消化' },
  { id: 'missing_prereq', label: '默认前置知识已掌握', desc: '老师说“大家高中/上周都学过”，但我当时没学过' },
  { id: 'attention_drift', label: '走神数秒导致丢失上下文', desc: '低头记了5秒笔记，抬头不知道当前在解哪道题' },
];

export const GUIDED_CHECKLIST_QUESTIONS: ChecklistItem[] = [
  {
    id: 'c1',
    label: '是否仅仅是某个符号或名词的命名没反应过来？',
    description: '例如把 α 仅仅看成一个常数，却没意识到它是“步长”的意思。',
    category: 'jargon',
  },
  {
    id: 'c2',
    label: '公式推导中是否省去了“为什么取负号”或“分母为什么开方”的一步？',
    description: '老师觉得显而易见，但对初学者而言是个思维断崖。',
    category: 'logic_leap',
  },
  {
    id: 'c3',
    label: '是不是上一张幻灯片还没看完，老师就已经翻到了下一页？',
    description: '大脑还在处理上一句话，新信息强行插入造成信息堵塞。',
    category: 'fast_pace',
  },
  {
    id: 'c4',
    label: '老师是否预设了某个先验公式（如导数链式法则或概率积分）？',
    description: '实际上这个前置知识点我课后花5分钟复习一下就能补全。',
    category: 'missing_prereq',
  },
  {
    id: 'c5',
    label: '是不是中途看手机或抄板书漏掉了老师讲“我们现在要解决什么”？',
    description: '一旦漏掉了目标定义，后面的推导就会感觉像天书。',
    category: 'attention_drift',
  },
];

export function generateQuestionsForPoint(point: ConfusionPoint): GeneratedQuestion[] {
  const kw = point.keyword || `第 ${point.slideNumber} 页知识点`;
  const slide = point.slideNumber;
  const isSpeech = point.source === 'teacher_speech';

  return [
    {
      id: 'analogy',
      styleName: '通俗直觉类比提问 (低心理压力)',
      styleNameZh: '适合直接开口，老师最喜欢解答这种直觉问题',
      questionText: `“Professor, regarding '${kw}' on slide ${slide}, could you give a quick intuitive real-world analogy to help visualize it?”`,
      questionTextZh: `“老师，关于第 ${slide} 页刚才讲到的 ‘${kw}’，能不能用一个生活中的通俗例子简单类比一下它的直觉含义？”`,
      rationale: '门槛极低，不会显得自己基础差，能迅速帮你建立感性认知。',
    },
    {
      id: 'derivation',
      styleName: '中间过渡衔接提问 (极显专业度)',
      styleNameZh: '针对推导或公式过渡，明确指出哪个环节卡壳',
      questionText: isSpeech
        ? `“Professor, you just mentioned '${kw}' verbally—could you briefly clarify the connection between that and the formula on slide ${slide}?”`
        : `“Professor, on slide ${slide}, could you show the intermediate transition leading up to '${kw}'?”`,
      questionTextZh: isSpeech
        ? `“老师，刚才您口述提到了 ‘${kw}’，能请教一下它和第 ${slide} 页幻灯片上的核心结论是如何衔接的吗？”`
        : `“老师，在第 ${slide} 页关于 ‘${kw}’ 的部分，中间有一步过渡跳得稍微有点快，能稍微带大家多梳理一步吗？”`,
      rationale: '精准定位断点位置，老师只需多讲30秒就能彻底帮你打通思路。',
    },
    {
      id: 'big_picture',
      styleName: '宏观目标重定位提问 (防走神脱节)',
      styleNameZh: '如果感觉整节课脱节，先问大方向',
      questionText: `“Professor, zooming out for a second: what is the primary problem that '${kw}' is solving in today's framework?”`,
      questionTextZh: `“老师，能不能稍微拉远一点视角：在今天整堂课的知识框架里，我们引入 ‘${kw}’ 主要是为了解决哪个具体痛点？”`,
      rationale: '从宏观视角拉回课堂节奏，哪怕中途跟丢也能瞬间重新找回主线。',
    },
  ];
}
