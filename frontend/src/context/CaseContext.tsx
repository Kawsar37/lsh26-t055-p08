'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { CaseItem } from '@/lib/types';

interface CaseContextType {
  activeCase: string;
  setActiveCase: (caseId: string) => void;
  availableCases: CaseItem[];
  isLoadingCases: boolean;
  refreshCases: () => Promise<void>;
}

const CaseContext = createContext<CaseContextType>({
  activeCase: 'PUB-01',
  setActiveCase: () => {},
  availableCases: [],
  isLoadingCases: false,
  refreshCases: async () => {},
});

export function CaseProvider({ children }: { children: React.ReactNode }) {
  const [activeCase, setActiveCaseState] = useState<string>('PUB-01');
  const [availableCases, setAvailableCases] = useState<CaseItem[]>([]);
  const [isLoadingCases, setIsLoadingCases] = useState(false);

  const fetchCases = async () => {
    try {
      setIsLoadingCases(true);
      const res = await api.getCases();
      if (Array.isArray(res) && res.length > 0) {
        setAvailableCases(res);
      }
    } catch (err) {
      console.warn('Could not fetch cases list:', err);
    } finally {
      setIsLoadingCases(false);
    }
  };

  useEffect(() => {
    // Read cached case from localStorage if present
    const saved = localStorage.getItem('resultflow_active_case');
    if (saved) {
      setActiveCaseState(saved);
    }
    fetchCases();
  }, []);

  const setActiveCase = (caseId: string) => {
    setActiveCaseState(caseId);
    localStorage.setItem('resultflow_active_case', caseId);
  };

  return (
    <CaseContext.Provider
      value={{
        activeCase,
        setActiveCase,
        availableCases,
        isLoadingCases,
        refreshCases: fetchCases,
      }}
    >
      {children}
    </CaseContext.Provider>
  );
}

export function useCase() {
  return useContext(CaseContext);
}
