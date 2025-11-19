import { create } from 'zustand';
import { BookProject, StyleProfile, Entity, Chapter } from './types';

export const DEFAULT_STYLE: StyleProfile = {
  id: 'default',
  name: 'Hydra Default',
  tone: 'Professional yet engaging',
  voiceStrength: 80,
  avoid: ['passive voice', 'clichés', 'overly flowery language']
};

export const DEFAULT_ENTITIES: Entity[] = [
  { id: '1', type: 'Character', name: 'Protagonist', description: 'The main viewpoint character.' },
  { id: '2', type: 'Location', name: 'Central City', description: 'The primary setting.' }
];

interface ProjectState {
  // Active Project
  currentProject: BookProject | null;
  setProject: (project: BookProject | null) => void;
  
  // Project Modification
  updateChapter: (chapterId: string, updates: Partial<Chapter>) => void;
  updateProjectEntities: (entities: Entity[]) => void;
  
  // Global Configs (Mock DB)
  savedStyles: StyleProfile[];
  activeStyle: StyleProfile;
  setActiveStyle: (style: StyleProfile) => void;
  updateActiveStyle: (updates: Partial<StyleProfile>) => void;
  
  globalEntities: Entity[];
  addGlobalEntity: (entity: Entity) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  currentProject: null,
  setProject: (project) => set({ currentProject: project }),
  
  updateChapter: (chapterId, updates) => set((state) => {
    if (!state.currentProject) return {};
    return {
      currentProject: {
        ...state.currentProject,
        chapters: state.currentProject.chapters.map(c => 
          c.id === chapterId ? { ...c, ...updates } : c
        )
      }
    };
  }),

  updateProjectEntities: (entities) => set((state) => {
    if (!state.currentProject) return {};
    return {
      currentProject: {
        ...state.currentProject,
        entities
      }
    };
  }),

  savedStyles: [DEFAULT_STYLE],
  activeStyle: DEFAULT_STYLE,
  setActiveStyle: (style) => set({ activeStyle: style }),
  updateActiveStyle: (updates) => set((state) => ({
    activeStyle: { ...state.activeStyle, ...updates }
  })),

  globalEntities: DEFAULT_ENTITIES,
  addGlobalEntity: (entity) => set((state) => ({
    globalEntities: [...state.globalEntities, entity]
  }))
}));
