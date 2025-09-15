import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ReportTemplate {
  id: string;
  name: string;
  selectedFields: string[];
  filters: {
    dateRange?: { from: string; to: string };
    products?: string[];
    providers?: string[];
    roles?: string[];
    status?: string[];
    advisors?: string[];
  };
  createdAt: string;
  createdBy: string;
}

interface ReportTemplateStore {
  templates: ReportTemplate[];
  addTemplate: (template: Omit<ReportTemplate, 'id' | 'createdAt'>) => void;
  removeTemplate: (id: string) => void;
  getTemplate: (id: string) => ReportTemplate | undefined;
}

export const useReportTemplateStore = create<ReportTemplateStore>()(
  persist(
    (set, get) => ({
      templates: [],
      addTemplate: (template) => {
        const newTemplate: ReportTemplate = {
          ...template,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          templates: [...state.templates, newTemplate]
        }));
      },
      removeTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter(t => t.id !== id)
        }));
      },
      getTemplate: (id) => {
        return get().templates.find(t => t.id === id);
      }
    }),
    {
      name: 'reportTemplates:v1',
    }
  )
);