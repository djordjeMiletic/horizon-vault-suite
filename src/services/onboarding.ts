import { api } from '@/lib/api';

export interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Overdue';
  assignee: string;
  dueDate: string;
  completedDate?: string;
  priority: 'Low' | 'Medium' | 'High';
  createdAt: string;
  updatedAt: string;
}

export const onboardingService = {
  async getTasks(): Promise<OnboardingTask[]> {
    return api.get('/onboarding/tasks');
  },

  async getTasksByAssignee(assigneeId: string): Promise<OnboardingTask[]> {
    return api.get(`/onboarding/tasks?assignee=${assigneeId}`);
  },

  async createTask(task: Omit<OnboardingTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<OnboardingTask> {
    return api.post('/onboarding/tasks', task);
  },

  async updateTask(id: string, updates: Partial<OnboardingTask>): Promise<OnboardingTask> {
    return api.put(`/onboarding/tasks/${id}`, updates);
  },

  async completeTask(id: string): Promise<OnboardingTask> {
    return api.put(`/onboarding/tasks/${id}/complete`);
  },

  async deleteTask(id: string): Promise<void> {
    return api.delete(`/onboarding/tasks/${id}`);
  }
};