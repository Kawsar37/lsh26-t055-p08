const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const res = await fetch(url, {
    cache: 'no-store',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ message: `HTTP Error ${res.status}` }));
    throw new Error(errorBody.message || `Request failed with status ${res.status}`);
  }

  const data = await res.json();
  return data.data !== undefined ? data.data : data;
}

export const api = {
  // Cases (PUB-01 ... PUB-25)
  getCases: () => fetchApi<any>('/cases'),
  getCaseDetail: (caseId: string) => fetchApi<any>(`/cases/${caseId}`),

  // Dashboard
  getDashboardStats: (caseId: string = 'PUB-01') =>
    fetchApi<any>(`/dashboard/stats?caseId=${caseId}`),

  // Students
  getStudents: (params?: { caseId?: string; className?: string; status?: string; search?: string; page?: number }) => {
    const query = new URLSearchParams();
    if (params?.caseId) query.set('caseId', params.caseId);
    if (params?.className) query.set('className', params.className);
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', String(params.page));
    return fetchApi<any>(`/students?${query.toString()}`);
  },
  getStudentDetail: (id: string, caseId: string = 'PUB-01') =>
    fetchApi<any>(`/students/${id}?caseId=${caseId}`),
  updateStudentMarks: (id: string, marks: any[], caseId: string = 'PUB-01') =>
    fetchApi<any>(`/students/${id}/marks?caseId=${caseId}`, {
      method: 'PUT',
      body: JSON.stringify({ marks }),
    }),

  // Results
  getResults: (params?: { caseId?: string; className?: string; overallResult?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.caseId) query.set('caseId', params.caseId);
    if (params?.className) query.set('className', params.className);
    if (params?.overallResult) query.set('overallResult', params.overallResult);
    if (params?.search) query.set('search', params.search);
    return fetchApi<any>(`/results?${query.toString()}`);
  },
  getResultByStudentId: (studentId: string, caseId: string = 'PUB-01') =>
    fetchApi<any>(`/results/${studentId}?caseId=${caseId}`),
  recalculateResult: (studentId: string, caseId: string = 'PUB-01') =>
    fetchApi<any>(`/results/recalculate/${studentId}?caseId=${caseId}`, { method: 'POST' }),
  recalculateAll: (caseId: string = 'PUB-01') =>
    fetchApi<any>(`/results/recalculate-all?caseId=${caseId}`, { method: 'POST' }),

  // Checking Lists
  getOptionalCheckingList: (caseId: string = 'PUB-01', className?: string) =>
    fetchApi<any>(`/checking-lists/optional?caseId=${caseId}${className ? `&className=${className}` : ''}`),
  getPracticalCheckingList: (caseId: string = 'PUB-01', className?: string) =>
    fetchApi<any>(`/checking-lists/practical?caseId=${caseId}${className ? `&className=${className}` : ''}`),
  getAbsentCheckingList: (caseId: string = 'PUB-01', className?: string) =>
    fetchApi<any>(`/checking-lists/absent?caseId=${caseId}${className ? `&className=${className}` : ''}`),

  // Classes & Summary
  getClasses: (caseId: string = 'PUB-01') =>
    fetchApi<any>(`/classes?caseId=${caseId}`),
  getClassSummary: (classId: string, caseId: string = 'PUB-01') =>
    fetchApi<any>(`/classes/${classId}/summary?caseId=${caseId}`),

  // Print Marksheet
  getPrintMarksheet: (studentId: string, caseId: string = 'PUB-01') =>
    fetchApi<any>(`/print/${studentId}?caseId=${caseId}`),

  // CSV Import
  getTemplateUrl: () => `${API_BASE}/import/template`,
  importMarks: async (formData: FormData, dryRun: boolean = false) => {
    const res = await fetch(`${API_BASE}/import/marks?dryRun=${dryRun}`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },

  // Rule Tester (Pure In-Memory Evaluation)
  evaluateRuleTester: (mode: string, payload: any) =>
    fetchApi<any>('/rule-tester/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, payload })
    })
};
