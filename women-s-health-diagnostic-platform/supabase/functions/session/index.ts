const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  try {
    const body = await req.json();
    const { action, sessionId, patientData, csvData, status, pcosRiskScore, phenotype, phenotypeName, phenotypeDescription, riskLevel, contributingFactors, shapValues, clusterAssignment, confidenceMetrics, recommendations } = body;
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const headers = { "Content-Type": "application/json", apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, Prefer: "return=representation" };

    if (action === "create") {
      const res = await fetch(`${supabaseUrl}/rest/v1/patient_sessions`, { method: "POST", headers, body: JSON.stringify({ patient_data: patientData || {}, csv_data: csvData || null, status: "active" }) });
      const data = await res.json();
      return new Response(JSON.stringify({ success: true, session: Array.isArray(data) ? data[0] : data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "get") {
      const res = await fetch(`${supabaseUrl}/rest/v1/patient_sessions?id=eq.${sessionId}&select=*`, { headers });
      const data = await res.json();
      return new Response(JSON.stringify({ success: true, session: data[0] || null }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "update") {
      const updatePayload: Record<string, unknown> = {};
      if (patientData) updatePayload.patient_data = patientData;
      if (csvData) updatePayload.csv_data = csvData;
      if (status) updatePayload.status = status;
      const res = await fetch(`${supabaseUrl}/rest/v1/patient_sessions?id=eq.${sessionId}`, { method: "PATCH", headers, body: JSON.stringify(updatePayload) });
      const data = await res.json();
      return new Response(JSON.stringify({ success: true, session: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "save-result") {
      const res = await fetch(`${supabaseUrl}/rest/v1/analysis_results`, { method: "POST", headers, body: JSON.stringify({ session_id: sessionId, pcos_risk_score: pcosRiskScore, phenotype, phenotype_name: phenotypeName, phenotype_description: phenotypeDescription, risk_level: riskLevel, contributing_factors: contributingFactors, shap_values: shapValues, cluster_assignment: clusterAssignment, confidence_metrics: confidenceMetrics, recommendations }) });
      const data = await res.json();
      return new Response(JSON.stringify({ success: true, result: Array.isArray(data) ? data[0] : data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "list") {
      const res = await fetch(`${supabaseUrl}/rest/v1/patient_sessions?select=*&order=created_at.desc&limit=20`, { headers });
      const data = await res.json();
      return new Response(JSON.stringify({ success: true, sessions: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "get-results") {
      const res = await fetch(`${supabaseUrl}/rest/v1/analysis_results?session_id=eq.${sessionId}&select=*`, { headers });
      const data = await res.json();
      return new Response(JSON.stringify({ success: true, results: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: false, error: "Invalid action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: "Session operation failed", message: error instanceof Error ? error.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
