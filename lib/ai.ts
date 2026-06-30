import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface TaskForAI {
  id: string;
  title: string;
  description?: string;
  deadline: string;
  estimated_hours: number;
  energy_level: string;
  status: string;
  priority: number;
  category: string;
}

export interface AnalysisResult {
  priority_order: string[];
  risk_analysis: string;
  productivity_score: number;
  schedule_plan: { start: string; end: string; task: string; tip: string }[];
  recommendations: string[];
  focus_suggestion: string;
}

export interface ScheduleResult {
  blocks: { time: string; duration: string; task: string; energy: string; tip: string }[];
  breaks: { time: string; activity: string }[];
  summary: string;
}

export interface RecommendationResult {
  insights: string[];
  improvements: string[];
  patterns: string[];
  motivational_tip: string;
}

async function callOpenAI(systemPrompt: string, userContent: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  return completion.choices[0].message.content || "{}";
}

function safeParseJSON<T>(text: string): T {
  // Try to extract JSON from the response (handles markdown code blocks)
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, text];
  const cleaned = (jsonMatch[1] || text).trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error("AI returned invalid JSON. Please try again.");
  }
}

export async function analyzeTaskPriority(tasks: TaskForAI[]): Promise<AnalysisResult> {
  const systemPrompt = `You are ProTrack AI — an elite productivity strategist specializing in deadline management and task optimization.

Analyze the user's tasks and return ONLY valid JSON with this exact structure:
{
  "priority_order": ["task title 1", "task title 2", ...],
  "risk_analysis": "A 2-3 sentence overview of deadline risks",
  "productivity_score": 0-100,
  "schedule_plan": [
    {"start": "HH:MM", "end": "HH:MM", "task": "task title", "tip": "efficiency tip"}
  ],
  "recommendations": ["actionable recommendation 1", "recommendation 2", ...],
  "focus_suggestion": "What to work on RIGHT NOW and why"
}

Rules:
- Score 0-100 based on how well-positioned the user is to meet all deadlines
- Prioritize overdue and near-deadline tasks first
- Consider energy levels: match high-energy tasks to peak hours
- Schedule breaks between intense focus blocks
- Be specific and actionable in recommendations
- The focus_suggestion should be compelling and urgent`;

  const text = await callOpenAI(systemPrompt, JSON.stringify(tasks));
  return safeParseJSON<AnalysisResult>(text);
}

export async function generateSchedule(
  tasks: TaskForAI[],
  currentHour: number
): Promise<ScheduleResult> {
  const systemPrompt = `You are ProTrack AI — a smart scheduler that creates optimized daily plans.

The current hour is ${currentHour}:00. Create a schedule for the remaining hours today.

Return ONLY valid JSON with this exact structure:
{
  "blocks": [
    {"time": "HH:MM", "duration": "Xh Xm", "task": "task title", "energy": "low|medium|high", "tip": "quick tip"}
  ],
  "breaks": [
    {"time": "HH:MM", "activity": "suggested break activity"}
  ],
  "summary": "A motivating 1-sentence summary of the plan"
}

Rules:
- Don't schedule past 23:00
- Include breaks every 90 minutes
- Match task energy requirements to time of day (high energy = morning/early afternoon)
- Keep sessions between 25-90 minutes (Pomodoro-inspired)
- Only schedule tasks that aren't completed`;

  const text = await callOpenAI(systemPrompt, JSON.stringify(tasks));
  return safeParseJSON<ScheduleResult>(text);
}

export async function getRecommendations(
  tasks: TaskForAI[],
  completedCount: number,
  overdueCount: number,
  streakDays: number
): Promise<RecommendationResult> {
  const systemPrompt = `You are ProTrack AI — a personalized productivity coach.

User stats: ${completedCount} tasks completed, ${overdueCount} currently overdue, ${streakDays}-day productivity streak.

Analyze their task patterns and return ONLY valid JSON:
{
  "insights": ["data-driven insight about their work patterns"],
  "improvements": ["specific, actionable improvement suggestion"],
  "patterns": ["observed behavior pattern"],
  "motivational_tip": "A personalized, encouraging message based on their data"
}

Rules:
- Be empathetic but honest
- Reference specific tasks when possible
- If they have a streak, celebrate it
- If overdue tasks exist, address them without being harsh
- Give practical tips, not generic advice`;

  const text = await callOpenAI(
    systemPrompt,
    JSON.stringify({ tasks, completedCount, overdueCount, streakDays })
  );
  return safeParseJSON<RecommendationResult>(text);
}
