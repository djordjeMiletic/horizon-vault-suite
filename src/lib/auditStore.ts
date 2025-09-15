import { create } from 'zustand';
import { AuditEntry } from './commission';

interface AuditStore {
  auditEntries: AuditEntry[];
  addAuditEntry: (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => void;
  getAuditEntriesByUser: (userEmail: string) => AuditEntry[];
  getAuditEntriesByEntity: (entityType: string, entityId: string) => AuditEntry[];
}

export const useAuditStore = create<AuditStore>((set, get) => ({
  auditEntries: [],
  
  addAuditEntry: (entry) => {
    const newEntry: AuditEntry = {
      ...entry,
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    
    set((state) => ({
      auditEntries: [newEntry, ...state.auditEntries]
    }));
  },
  
  getAuditEntriesByUser: (userEmail) => {
    return get().auditEntries.filter(entry => entry.actor.email === userEmail);
  },
  
  getAuditEntriesByEntity: (entityType, entityId) => {
    return get().auditEntries.filter(entry => 
      entry.entity.type === entityType && entry.entity.id === entityId
    );
  }
}));