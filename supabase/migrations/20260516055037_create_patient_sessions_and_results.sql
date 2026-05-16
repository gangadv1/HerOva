/*
  # Create Patient Sessions and Analysis Results Tables

  1. New Tables
    - `patient_sessions`
      - `id` (uuid, primary key) - Unique session identifier
      - `created_at` (timestamptz) - Session creation time
      - `patient_data` (jsonb) - Full patient clinical data
      - `csv_data` (jsonb) - Uploaded CSV data if applicable
      - `status` (text) - Session status: active, completed, archived
      - `user_id` (uuid) - Reference to auth user (nullable for anonymous)

    - `analysis_results`
      - `id` (uuid, primary key) - Unique result identifier
      - `session_id` (uuid, foreign key) - Reference to patient session
      - `created_at` (timestamptz) - Result creation time
      - `pcos_risk_score` (float) - PCOS risk percentage (0-100)
      - `phenotype` (text) - PCOS phenotype classification (A, B, C, D, N/A)
      - `phenotype_name` (text) - Human-readable phenotype name
      - `phenotype_description` (text) - Phenotype description
      - `risk_level` (text) - Risk level: low, moderate, high
      - `contributing_factors` (jsonb) - Array of contributing factors
      - `shap_values` (jsonb) - SHAP feature contribution values
      - `cluster_assignment` (jsonb) - Phenotype clustering results
      - `confidence_metrics` (jsonb) - AI confidence scores
      - `recommendations` (jsonb) - Clinical recommendations

  2. Security
    - Enable RLS on both tables
    - Patient sessions: users can only access their own sessions
    - Analysis results: users can only access results for their own sessions
    - Allow anonymous session creation for demo purposes
*/

-- Create patient_sessions table
CREATE TABLE IF NOT EXISTS patient_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  patient_data jsonb NOT NULL DEFAULT '{}',
  csv_data jsonb,
  status text NOT NULL DEFAULT 'active',
  user_id uuid REFERENCES auth.users(id)
);

-- Create analysis_results table
CREATE TABLE IF NOT EXISTS analysis_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES patient_sessions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  pcos_risk_score float NOT NULL DEFAULT 0,
  phenotype text NOT NULL DEFAULT 'N/A',
  phenotype_name text NOT NULL DEFAULT 'Uncertain',
  phenotype_description text NOT NULL DEFAULT '',
  risk_level text NOT NULL DEFAULT 'low',
  contributing_factors jsonb NOT NULL DEFAULT '[]',
  shap_values jsonb NOT NULL DEFAULT '{}',
  cluster_assignment jsonb NOT NULL DEFAULT '{}',
  confidence_metrics jsonb NOT NULL DEFAULT '{}',
  recommendations jsonb NOT NULL DEFAULT '[]'
);

-- Enable RLS
ALTER TABLE patient_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;

-- Policies for patient_sessions
CREATE POLICY "Users can view own sessions"
  ON patient_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
  ON patient_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON patient_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous can create sessions"
  ON patient_sessions FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

CREATE POLICY "Anonymous can view own sessions"
  ON patient_sessions FOR SELECT
  TO anon
  USING (user_id IS NULL);

-- Policies for analysis_results
CREATE POLICY "Users can view results for own sessions"
  ON analysis_results FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM patient_sessions
      WHERE patient_sessions.id = analysis_results.session_id
      AND patient_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create results for own sessions"
  ON analysis_results FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patient_sessions
      WHERE patient_sessions.id = analysis_results.session_id
      AND patient_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Anonymous can view results for anonymous sessions"
  ON analysis_results FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM patient_sessions
      WHERE patient_sessions.id = analysis_results.session_id
      AND patient_sessions.user_id IS NULL
    )
  );

CREATE POLICY "Anonymous can create results for anonymous sessions"
  ON analysis_results FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM patient_sessions
      WHERE patient_sessions.id = analysis_results.session_id
      AND patient_sessions.user_id IS NULL
    )
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_patient_sessions_user_id ON patient_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_session_id ON analysis_results(session_id);
