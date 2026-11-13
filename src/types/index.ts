export type LecturePhase = 'in_class' | 'qa_time' | 'post_class';

export type ConfusionSource = 'teacher_speech' | 'ppt_slide' | 'reading_text';

export type RootCauseCategory = 
  | 'jargon' 
  | 'logic_leap' 
  | 'fast_pace' 
  | 'missing_prereq' 
  | 'attention_drift';

export interface ConfusionPoint {
  id: string;
  timeStr: string;
  slideNumber: number;
  keyword: string;
  source: ConfusionSource;
  note?: string;
  isAsked?: boolean;
  isResolved?: boolean;
  actualRootCause?: RootCauseCategory;
  postClassReflection?: string;
}

export interface GeneratedQuestion {
  id: string;
  styleName: string;
  styleNameZh: string;
  questionText: string;
  questionTextZh: string;
  rationale: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  category: RootCauseCategory;
}
