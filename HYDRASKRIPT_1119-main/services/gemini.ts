import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { Entity, StyleProfile, Chapter, OutlineResponse, ChapterDraftResponse, InlineRewriteResponse, ImageSuggestionResponse, ProjectType } from '../types';

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found. AI features will mock responses or fail.");
  }
  return new GoogleGenAI({ apiKey: apiKey || 'dummy_key' });
};

// --- A) Outline Generation ---

export const generateOutline = async (
  topic: string, 
  genre: string, 
  audience: string, 
  length: string,
  goals: string,
  style: StyleProfile,
  entities: Entity[],
  projectType: ProjectType = 'standard'
): Promise<OutlineResponse> => {
  const ai = getAI();
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      synopsis: { type: Type.STRING },
      chapters: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            number: { type: Type.INTEGER },
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            key_points: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["number", "title", "summary", "key_points"]
        }
      },
      notes_for_consistency: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["title", "synopsis", "chapters"]
  };

  const userVars = JSON.stringify({
    topic, audience, genre, goals, length_target: length,
    style_profile: style,
    project_type: projectType,
    story_bible: entities.map(e => ({ name: e.name, type: e.type, description: e.description }))
  });

  let systemInstruction = "You are HydraSkript’s eBook architect. Follow the Story Bible and Style Profile. Output strict JSON.";
  
  if (projectType === 'kids') {
    systemInstruction = "You are a Children's Book Architect. Create a storyboard. Each 'chapter' is a PAGE. 'summary' should be a detailed visual description for the illustrator (Pixar/Dreamworks style). 'key_points' should be the plot beat.";
  } else if (projectType === 'coloring') {
    systemInstruction = "You are a Coloring Book Creator. Each 'chapter' is a PAGE. 'summary' must describe a black and white line art scene suitable for coloring based on the theme. 'title' is the caption.";
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `User vars (JSON): ${userVars}`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: schema,
      temperature: 0.7,
    }
  });
  
  return JSON.parse(response.text || "{}");
};

// --- B) Chapter Draft Generation ---

export const generateChapterContent = async (
  chapter: Chapter,
  projectContext: { title: string, synopsis: string },
  entities: Entity[],
  style: StyleProfile,
  mode: 'speed' | 'balanced' | 'premium' = 'balanced',
  projectType: ProjectType = 'standard'
): Promise<ChapterDraftResponse> => {
  const ai = getAI();
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      chapter_number: { type: Type.INTEGER },
      title: { type: Type.STRING },
      content_markdown: { type: Type.STRING },
      recap_for_next_chapter: { type: Type.STRING },
      entities_introduced: { type: Type.ARRAY, items: { type: Type.STRING } },
      sensitive_flags: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["content_markdown", "recap_for_next_chapter"]
  };

  const userVars = JSON.stringify({
    chapter_outline: { number: chapter.number, title: chapter.title, summary: chapter.summary, key_points: chapter.key_points },
    locked_outline_context: projectContext,
    story_bible: entities.map(e => ({ name: e.name, description: e.description })),
    style_profile: style,
    mode: mode,
    project_type: projectType
  });

  let systemInstruction = "You are HydraSkript’s long-form writer. Enforce continuity. Output polished prose.";
  
  if (projectType === 'kids') {
    systemInstruction = "You are a Children's Book Author. Write the text for this SINGLE PAGE. Keep it short, engaging, and age-appropriate. No complex markdown, just the text.";
  } else if (projectType === 'coloring') {
    systemInstruction = "You are a Coloring Book Creator. Write a short, single-sentence caption or inspirational quote for this coloring page.";
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `User vars (JSON): ${userVars}`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: schema,
      temperature: 0.8,
    }
  });
  
  return JSON.parse(response.text || "{}");
};

// --- C) Inline Rewrite Action ---

export const rewriteTextSelection = async (
  selectedText: string,
  command: string,
  style: StyleProfile,
  entities: Entity[]
): Promise<InlineRewriteResponse> => {
  const ai = getAI();
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      rewritten_text: { type: Type.STRING },
      rationale_short: { type: Type.STRING }
    },
    required: ["rewritten_text", "rationale_short"]
  };

  const userVars = JSON.stringify({
    selected_text: selectedText,
    command: command,
    style_profile: style,
    story_bible: entities,
    max_delta: "±20%"
  });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `User vars (JSON): ${userVars}`,
    config: {
      systemInstruction: "You are a precision editor. Rewrite the selected passage according to the command. Output strict JSON.",
      responseMimeType: "application/json",
      responseSchema: schema,
      temperature: 0.6,
    }
  });

  return JSON.parse(response.text || "{}");
};

// --- D) Image Suggestion Prompt ---

export const generateImageSuggestion = async (
  chapterSummary: string,
  styleKeywords: string[],
  projectType: ProjectType = 'standard'
): Promise<ImageSuggestionResponse> => {
  const ai = getAI();
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      image_prompt: { type: Type.STRING },
      negative_prompts: { type: Type.ARRAY, items: { type: Type.STRING } },
      suggested_aspect_ratio: { type: Type.STRING },
      sdxl: {
        type: Type.OBJECT,
        properties: {
          seed: { type: Type.INTEGER },
          cfg_scale: { type: Type.NUMBER },
          steps: { type: Type.INTEGER }
        }
      }
    },
    required: ["image_prompt", "suggested_aspect_ratio"]
  };

  const userVars = JSON.stringify({
    chapter_summary: chapterSummary,
    style_keywords: styleKeywords,
    sdxl_enabled: true,
    project_type: projectType
  });

  let systemInstruction = "You are an art director. Propose a prompt for an illustration.";
  if (projectType === 'kids') {
    systemInstruction = "You are a Pixar/Dreamworks Art Director. Create a prompt for a 3D render style cute character/scene. High fidelity, soft lighting, expressive.";
  } else if (projectType === 'coloring') {
    systemInstruction = "You are a Line Art Specialist. Create a prompt for a black and white coloring page. Clean lines, no shading, high contrast, white background. Theme: " + styleKeywords.join(',');
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `User vars (JSON): ${userVars}`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: schema,
      temperature: 0.9,
    }
  });

  return JSON.parse(response.text || "{}");
};

// --- E) Image Generation (Imagen) ---

export const generateActualImage = async (prompt: string, aspectRatio: string = '1:1'): Promise<string> => {
  const ai = getAI();
  
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: aspectRatio as any || '1:1',
        outputMimeType: 'image/jpeg'
      },
    });

    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  } catch (e) {
    console.error("Imagen Error:", e);
    throw e;
  }
};

// --- F) TTS Generation ---

export const generateSpeech = async (text: string, voiceName: string): Promise<ArrayBuffer> => {
  const ai = getAI();

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio data returned");

  // Decode base64 to ArrayBuffer
  const binaryString = atob(base64Audio);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};
