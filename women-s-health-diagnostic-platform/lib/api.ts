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
const SUPABASE_ANON_KEY = getEnvVar(["NEXT_PUBLIC_SUPABASE_ANON_KEY", "VITE_SUPABASE_SUPABASE_ANON_KEY"]);

function getHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    apikey: SUPABASE_ANON_KEY,
  };
}

async function apiCall<T>(endpoint: string, body: unknown): Promise<T> {
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
    apiCall<PredictionResult>("predict", data),

  shap: (data: Record<string, unknown>) =>
    apiCall<SHAPResult>("shap", data),

  cluster: (data: Record<string, unknown>) =>
    apiCall<ClusterResult>("cluster", data),

  analyze: (data: Record<string, unknown>) =>
    apiCall<FullAnalysisResult>("analyze", data),

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
      apiCall<SessionResult>("session", { action: "create", patientData, csvData }),

    get: (sessionId: string) =>
      apiCall<SessionResult>("session", { action: "get", sessionId }),

    update: (sessionId: string, updates: { patientData?: Record<string, unknown>; csvData?: unknown; status?: string }) =>
      apiCall<SessionResult>("session", { action: "update", sessionId, ...updates }),

    saveResult: (sessionId: string, result: Record<string, unknown>) =>
      apiCall<SessionResult>("session", { action: "save-result", sessionId, ...result }),

    list: () =>
      apiCall<SessionResult>("session", { action: "list" }),

    getResults: (sessionId: string) =>
      apiCall<SessionResult>("session", { action: "get-results", sessionId }),
  },
};
