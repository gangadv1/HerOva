function getEnvVar(keys: string[]): string {
  if (typeof process !== "undefined" && process.env) {
    for (const key of keys) {
      if (process.env[key]) return process.env[key] as string;
    }
  }
  if (typeof import.meta !== "undefined" && import.meta.env) {
    for (const key of keys) {
      if ((import.meta.env as Record<string, string>)[key]) return (import.meta.env as Record<string, string>)[key];
    }
  }
  return "";
}

const SUPABASE_URL = getEnvVar(["NEXT_PUBLIC_SUPABASE_URL", "VITE_SUPABASE_URL"]);
const SUPABASE_ANON_KEY = getEnvVar(["NEXT_PUBLIC_SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY"]);

// Disable mock mode: always call real backend functions using SUPABASE_URL
const USE_MOCK = false;

function getHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    apikey: SUPABASE_ANON_KEY,
  };
}

async function apiCall<T>(endpoint: string, body: unknown): Promise<T> {
  if (!SUPABASE_URL) {
    throw new Error("SUPABASE_URL is not set. Please set NEXT_PUBLIC_SUPABASE_URL in your environment.");
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/${endpoint}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || error.message || `API error: ${response.status}`);
  }

  return response.json();
}

export interface PredictionResult {
  success: boolean;
  pcosRiskScore: number;
  riskLevel: "low" | "moderate" | "high";
  phenotype: {
    type: string;
    name: string;
    description: string;
  };
  contributingFactors: string[];
  confidenceMetrics: {
    pcosClassification: number;
    phenotypeMatch: number;
    dataQuality: number;
  };
  recommendations: string[];
  timestamp: string;
}

export interface SHAPResult {
  success: boolean;
  shapValues: Array<{
    name: string;
    value: number;
    impact: string;
    direction: string;
    explanation: string;
  }>;
  topContributors: Array<{
    feature: string;
    contribution: number;
    impact: string;
    direction: string;
    explanation: string;
  }>;
  summary: {
    totalPositiveContribution: number;
    totalNegativeContribution: number;
    topFeature: string;
    topContribution: number;
  };
  explanation: string;
  timestamp: string;
}

export interface ClusterResult {
  success: boolean;
  clusters: Array<{
    clusterId: number;
    clusterName: string;
    description: string;
    centroid: Record<string, number>;
    patientCount: number;
    characteristics: string[];
    riskProfile: string;
    metabolicRisk: "low" | "moderate" | "high";
  }>;
  assignedCluster: {
    id: number;
    name: string;
    description: string;
    characteristics: string[];
    riskProfile: string;
    metabolicRisk: "low" | "moderate" | "high";
  };
  clusterVisualization: Array<{
    id: number;
    name: string;
    patientCount: number;
    metabolicRisk: string;
  }>;
  timestamp: string;
}

export interface CSVUploadResult {
  success: boolean;
  summary: {
    totalRows: number;
    processedPatients: number;
    highRisk: number;
    moderateRisk: number;
    lowRisk: number;
    phenotypeDistribution: Record<string, number>;
  };
  patients: Array<{
    rowId: number;
    patientData: Record<string, unknown>;
    riskScore: number;
    riskLevel: string;
    phenotype: string;
    phenotypeName: string;
    factors: string[];
  }>;
  timestamp: string;
}

export interface FullAnalysisResult {
  success: boolean;
  prediction: {
    pcosRiskScore: number;
    riskLevel: string;
    contributingFactors: string[];
  };
  phenotype: {
    type: string;
    name: string;
    description: string;
  };
  shap: {
    values: Array<{
      name: string;
      value: number;
      impact: string;
      direction: string;
      explanation: string;
    }>;
    topContributors: Array<{
      feature: string;
      contribution: number;
      impact: string;
      direction: string;
      explanation: string;
    }>;
  };
  clustering: {
    assignedCluster: {
      id: number;
      name: string;
      description: string;
      characteristics: string[];
      riskProfile: string;
      metabolicRisk: string;
    };
    allClusters: Array<{
      id: number;
      name: string;
      patientCount: number;
      metabolicRisk: string;
    }>;
  };
  confidenceMetrics: {
    pcosClassification: number;
    phenotypeMatch: number;
    dataQuality: number;
  };
  recommendations: string[];
  timestamp: string;
}

export interface SessionResult {
  success: boolean;
  session?: {
    id: string;
    created_at: string;
    patient_data: Record<string, unknown>;
    csv_data?: unknown;
    status: string;
  };
  sessions?: Array<{
    id: string;
    created_at: string;
    patient_data: Record<string, unknown>;
    status: string;
  }>;
  result?: Record<string, unknown>;
  results?: Array<Record<string, unknown>>;
}

export const healthApi = {
  predict: (data: Record<string, unknown>) =>
    USE_MOCK
      ? Promise.resolve({ success: true, pcosRiskScore: 12, riskLevel: "low", phenotype: { type: "NA", name: "Non-PCOS", description: "Mock result" }, contributingFactors: [], confidenceMetrics: { pcosClassification: 0.9, phenotypeMatch: 0.8, dataQuality: 0.9 }, recommendations: [], timestamp: new Date().toISOString() } as PredictionResult)
      : apiCall<PredictionResult>("predict", data),

  shap: (data: Record<string, unknown>) =>
    apiCall<SHAPResult>("shap", data),

  cluster: (data: Record<string, unknown>) =>
    apiCall<ClusterResult>("cluster", data),

  analyze: (data: Record<string, unknown>) =>
    USE_MOCK
      ? Promise.resolve({
          success: true,
          prediction: { pcosRiskScore: 42, riskLevel: "moderate", contributingFactors: ["Irregular periods", "Elevated AMH"] },
          phenotype: { type: "C", name: "Ovulatory PCOS", description: "Mock phenotype description" },
          shap: { values: [{ name: "AMH", value: 0.8, impact: "high", direction: "positive", explanation: "Higher AMH increases PCOS risk" }], topContributors: [{ feature: "AMH", contribution: 0.8, impact: "high", direction: "positive", explanation: "Top contributor" }] },
          clustering: { assignedCluster: { id: 1, name: "Cluster A", description: "Mock cluster", characteristics: ["feature1"], riskProfile: "moderate", metabolicRisk: "moderate" }, allClusters: [] },
          confidenceMetrics: { pcosClassification: 0.85, phenotypeMatch: 0.7, dataQuality: 0.95 },
          recommendations: ["Refer to endocrinology"],
          timestamp: new Date().toISOString(),
        } as FullAnalysisResult)
      : apiCall<FullAnalysisResult>("analyze", data),

  csvUpload: async (file: File): Promise<CSVUploadResult> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${SUPABASE_URL}/functions/v1/csv-upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Upload failed" }));
      throw new Error(error.error || error.message || `Upload error: ${response.status}`);
    }

    return response.json();
  },

  csvUploadText: (csvText: string) =>
    apiCall<CSVUploadResult>("csv-upload", { csvText }),

  session: {
    create: (patientData: Record<string, unknown>, csvData?: unknown) =>
      USE_MOCK
        ? Promise.resolve({ success: true, session: { id: "mock-session-1", created_at: new Date().toISOString(), patient_data: patientData, csv_data: csvData, status: "created" } } as SessionResult)
        : apiCall<SessionResult>("session", { action: "create", patientData, csvData }),

    get: (sessionId: string) =>
      USE_MOCK
        ? Promise.resolve({ success: true, session: { id: sessionId, created_at: new Date().toISOString(), patient_data: {}, status: "created" } } as SessionResult)
        : apiCall<SessionResult>("session", { action: "get", sessionId }),

    update: (sessionId: string, updates: { patientData?: Record<string, unknown>; csvData?: unknown; status?: string }) =>
      USE_MOCK
        ? Promise.resolve({ success: true, session: { id: sessionId, created_at: new Date().toISOString(), patient_data: updates.patientData || {}, csv_data: updates.csvData, status: updates.status || "updated" } } as SessionResult)
        : apiCall<SessionResult>("session", { action: "update", sessionId, ...updates }),

    saveResult: (sessionId: string, result: Record<string, unknown>) =>
      USE_MOCK
        ? Promise.resolve({ success: true, session: { id: sessionId, created_at: new Date().toISOString(), patient_data: {}, status: "saved" }, result } as SessionResult)
        : apiCall<SessionResult>("session", { action: "save-result", sessionId, ...result }),

    list: () =>
      USE_MOCK
        ? Promise.resolve({ success: true, sessions: [{ id: "mock-session-1", created_at: new Date().toISOString(), patient_data: {}, status: "created" }] } as SessionResult)
        : apiCall<SessionResult>("session", { action: "list" }),

    getResults: (sessionId: string) =>
      USE_MOCK
        ? Promise.resolve({ success: true, results: [ { pcos_risk_score: 42, phenotype: "Ovulatory PCOS", phenotype_name: "Ovulatory", phenotype_description: "Mock" , contributing_factors: ["AMH"] } ] } as SessionResult)
        : apiCall<SessionResult>("session", { action: "get-results", sessionId }),
  },
};
