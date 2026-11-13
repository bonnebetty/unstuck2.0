export interface HomeworkReportData {
  studentName?: string;
  courseName?: string;
  scenarioTitle: string;
  selectedBreakpointNodeTitle: string;
  selectedCategoryName: string;
}

export function generateFullHomeworkMarkdown(data: HomeworkReportData): string {
  return `# Computational Thinking Assignment: Observing & Modeling a Phenomenon

**Student Name:** [Your Name]  
**Course:** Computational Thinking / Digital Prototyping  
**Date:** October 2026  
**Artifact Link:** Cognitive Cascade Lab Prototype  

---

## Step 1: Observed Phenomenon
### Phenomenon Title: "The Classroom Comprehension Cascade & The 'Any Questions?' Silence Paradox"

### Description of the Observed Phenomenon:
During university and high-school lecture classes, there is a recurring human and social phenomenon:
When an instructor introduces a sequence of interconnected conceptual points, a student frequently experiences a momentary comprehension failure (e.g., encountering undefined technical jargon, an unexplained mathematical leap, or a brief lapse in working memory). Because subsequent concepts strictly depend on preceding ones, this single-point failure rapidly cascades into a state of total cognitive fog. 

By the time the instructor pauses, writes on the board, and asks: *"Does anyone have any questions?"*, the student experiences a complete communication paralysis. The student does not speak up not because they understand, but because they are trapped in a state of **meta-ignorance**: they are so disoriented that they cannot identify *what* they don't know, nor can they formulate a clear, socially low-risk sentence to articulate their question. Consequently, the classroom falls dead silent. The instructor misinterprets this silence as 100% comprehension, moves on, and compounds the comprehension deficit for the rest of the lecture.

---

## Step 2: Computational Thinking (CT) Practice

### 1. Decomposition (Breaking down into smaller parts)
We decomposed the classroom interaction into five discrete sub-systems:
- **The Input Stream (Lecture Nodes):** Chronological discrete units of information $N_1, N_2, \dots, N_k$, each with prerequisites, core claims, and syntactic notations.
- **The Disconnect Trigger (Single-Point Failure):** The exact micro-event causing comprehension disconnection:
  1. *Jargon / Unfamiliar Symbol* (vocabulary lookup error)
  2. *Logical Leap* (missing intermediate step in derivation)
  3. *Cognitive Overload / Pacing* (buffer overflow exceeding working memory)
  4. *Assumed Prerequisite* (external reference missing from long-term memory)
  5. *Attentional Drift* (temporary packet drop losing conversational thread)
- **The Cascade Failure Propagation:** A Directed Acyclic Graph (DAG) dependency failure: when node $K$ fails, downstream nodes $K+1 \dots N$ fail sequentially.
- **The Query Checkpoint Gate:** The instructor's trigger event: \`onTeacherQuery("Any questions?")\`.
- **The Formulation Impasse:** Evaluation function where the cognitive cost of pinpointing the bug and phrasing a question exceeds the perceived social safety threshold, resulting in a \`NULL\` output (silence).

### 2. Pattern Recognition (Identifying repeated behaviors and dependencies)
- **Strict Linear Dependency Pattern:** In hierarchical subjects (math, computer science, economics), comprehension is a pipeline. Missing a 2-minute step in minute 15 renders the remaining 45 minutes incomprehensible.
- **The "Silence Illusion" Feedback Inversion:** 
  $$\\text{Silence} = 0 \\text{ questions raised} \\implies \\text{Instructor infers } \\text{Comprehension} \\approx 100\\%$$
  $$\\text{Actual Reality: } \\text{Comprehension} < 25\\%, \\quad \\text{Formulation Capacity} = 0$$
- **The Question Formulation Formula:** Formulating a question requires 3 syntactic parameters:
  $$\\text{Question} = f(\\text{Last Valid Anchor}, \\text{Gap Category}, \\text{Desired Clarification})$$
  When a student experiences total cascade, all three variables collapse into ambiguity, leading to the helpless feeling of *"I don't even know what I don't know"*.

### 3. Abstraction (Focusing on essential elements)
- **Student Cognitive State Model:** A finite state machine:
  $$\\text{State} \\in \\{ \\text{TRACKING (Green)}, \\text{UNCERTAIN (Yellow)}, \\text{CASCADING (Orange)}, \\text{FROZEN (Red)} \\}$$
- **Disconnect Vector:** Abstracted as a 3-tuple:
  $$\\mathbf{D} = (\\text{Index}_{\\text{last\\_valid}}, \\text{Category}_{\\text{disconnect}}, \\text{AnxietyLevel})$$
- **Filtering Noise:** We ignore specific blackboard handwriting, classroom seating arrangements, or vocal tonality, distilling the problem purely down to information flow, dependency links, and diagnostic checkpoints.

### 4. Algorithm Design (The Repeatable Diagnostic & Recovery Process)
To resolve the freeze, we created the **"Backtrace & Question Synthesizer Algorithm"**:
1. **Trigger:** Detect frozen state when asked *"Any questions?"*.
2. **Backtrace:** Prompt the student with checkpoints: *"Where was the last node that made complete sense?"* (isolates $\\text{Node}_{\\text{last}}$).
3. **Classify:** Select the disconnect taxonomy (e.g., Jargon vs Logic Jump).
4. **Synthesize:** Automatically bind the extracted concept tokens to pre-tested conversational templates.
5. **Output:** Deliver 3 actionable, ready-to-speak questions (Low-risk analogy request, Step-by-step derivation bridge, or High-level re-anchoring), breaking the paralysis.

---

## Step 3: Using AI to Support My Thinking

### AI Collaboration Prompts & Feedback Log:

#### Prompt 1 (Decomposition & Conceptual Breakdown):
> *"I noticed in college lectures that when I miss one small sentence, I quickly get lost for the rest of the class. When the teacher asks 'Any questions?', I freeze because I don't know what I don't know. How can I decompose this phenomenon using Computational Thinking?"*
**AI Feedback Received:**
The AI suggested decomposing the phenomenon into a knowledge dependency graph (DAG) and identifying the difference between *knowing nothing* vs. *losing the transition pointer*. It pointed out that "not knowing what to ask" is an algorithmic formulation problem, not a lack of intelligence.

#### Prompt 2 (Pseudocode Modeling):
> *"Can you write pseudocode to model how a student's cognitive state degrades from CLEAR to CASCADING_FAILURE to FROZEN when a prerequisite concept fails?"*
**AI Output Model:**
\`\`\`text
FUNCTION on_lecture_step(concept_node):
    IF concept_node.has_missing_dependency():
        state = "CASCADING_FAILURE"
        cognitive_load = 1.0
    ELSE:
        last_solid_concept = concept_node
        
FUNCTION on_teacher_asks_any_questions():
    IF state == "CASCADING_FAILURE":
        state = "FROZEN"
        RETURN NULL  // The classroom silence
\`\`\`

#### Prompt 3 (Prototyping & Representation):
> *"Could we represent this as an interactive diagnostic poll where a student clicks what they're confused about, and it automatically generates the exact question to ask?"*
**AI Feedback & Exploration:**
The AI confirmed that this directly addresses Step 4 of the assignment by modeling *state* (student confusion level), *interaction* (diagnostic clicker/poll), and *representation* (visual graph of knowledge nodes turning red/foggy, and generating syntactic question strings).

---

## Step 4: Representation in Code (The Prototype)

### Architecture & Design:
I constructed an interactive web application that represents this phenomenon in three interconnected views:
1. **Interactive Lecture & Cascade Simulator:** 
   - Visualizes a chronological 5-step lecture (e.g., Gradient Descent in Machine Learning or Hypothesis Testing in Statistics).
   - Allows users to simulate inject a "Disconnect Trigger" at any step (e.g., unexplained jargon at Step 2).
   - Renders the cascading failure: nodes following the breakpoint turn from verified green to foggy yellow and error red; the cognitive overload meter spikes to 100%.
2. **The "Why Am I Lost?" Diagnostic Poll & Question Synthesizer:**
   - Implements the exact solution: an interactive diagnostic selector where students identify their last solid checkpoint and select their confusion trigger.
   - Algorithmic synthesizer generates 3 ready-to-use verbal questions (Intuitive Analogy, Step-by-Step Bridge, or Context Reset), converting amorphous frustration into precise language.
3. **Classroom Aggregator Heatmap:**
   - Simulates what an entire classroom of 30 students experiences, demonstrating to instructors how an anonymous clicker poll reveals hidden breakdown hotspots that normal silence hides.

---

## Step 5: Reflection on Computational Thinking

Applying computational thinking fundamentally shifted how I view my own learning struggles:
1. **From Self-Blame to Systemic Debugging:** Before applying CT, I used to feel that getting lost in class and freezing was a personal inadequacy or lack of intelligence. Decomposing it revealed that it is a mechanical dependency graph failure. Just like a software program crashes when a null pointer exception is thrown in an early function call, human working memory crashes when a prerequisite term is undefined.
2. **The Power of Abstraction:** By abstracting confusion into discrete categories (Jargon, Logic Leap, Pacing, Prerequisite, Drift), I realized that every vague feeling of "I don't get it" can be mapped to a specific transition error.
3. **Algorithms as Empowerment:** Creating an algorithm that works backwards to find the last known checkpoint and automatically synthesizes a question showed me that computational thinking isn't just for writing code—it is a cognitive toolkit for turning paralyzing emotional overwhelm into actionable, solvable steps.
`;
}
