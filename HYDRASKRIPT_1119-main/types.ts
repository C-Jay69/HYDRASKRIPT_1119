export interface StyleProfile {
  id: string;
  name: string;
  tone: string;
  voiceStrength: number; // 0-100
  avoid: string[];
  examples?: string[];
}

export interface Entity {
  id: string;
  type: 'Character' | 'Location' | 'Rule' | 'Term' | 'Lore';
  name: string;
  description: string;
}

export interface ImagePrompt {
  prompt: string;
  negative_prompt: string[];
  aspect_ratio: string;
  sdxl_seed?: number;
  generated_image_url?: string; // Store the result
}

export interface Chapter {
  id: string;
  number: number;
  title: string; // Acts as Page Number/Title for visual books
  summary: string; // Acts as Image Description for visual books
  key_points: string[];
  content?: string; // The text on the page
  status: 'draft' | 'generating' | 'generated' | 'approved';
  image_suggestion?: ImagePrompt;
  recap_for_next?: string;
  entities_introduced?: string[];
}

export type ProjectType = 'standard' | 'kids' | 'coloring';

export interface BookProject {
  id: string;
  type: ProjectType;
  title: string;
  topic: string;
  audience: string;
  genre: string;
  goals?: string;
  chapters: Chapter[];
  styleProfileId?: string;
  entities: Entity[];
  progress: number;
  synopsis: string;
}

export interface OutlineResponse {
  title: string;
  synopsis: string;
  chapters: {
    number: number;
    title: string;
    summary: string;
    key_points: string[];
  }[];
  notes_for_consistency?: string[];
}

export interface ChapterDraftResponse {
  chapter_number: number;
  title: string;
  content_markdown: string;
  recap_for_next_chapter: string;
  entities_introduced: string[];
  sensitive_flags: string[];
}

export interface InlineRewriteResponse {
  rewritten_text: string;
  rationale_short: string;
}

export interface ImageSuggestionResponse {
  image_prompt: string;
  negative_prompts: string[];
  suggested_aspect_ratio: string;
  sdxl?: {
    seed: number;
    cfg_scale: number;
    steps: number;
  };
}
