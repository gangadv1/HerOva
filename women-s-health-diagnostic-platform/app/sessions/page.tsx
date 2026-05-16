"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import Logo from "@/components/branding/logo"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Activity, Loader as Loader2, TriangleAlert as AlertTriangle, FileText, ChevronRight, Archive, RefreshCw } from "lucide-react"
import { healthApi, type SessionResult } from "@/lib/api"

interface SessionItem {
  id: string
  created_at: string
  patient_data: Record<string, unknown>
  status: string
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [sessionResults, setSessionResults] = useState<Record<string, unknown>[]>([])

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await healthApi.session.list()
      setSessions(res.sessions || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sessions")
    } finally {
      setLoading(false)
    }
  }

  const handleViewResults = async (sessionId: string) => {
    if (selectedSession === sessionId) {
      setSelectedSession(null)
      return
    }
    setSelectedSession(sessionId)
    try {
      const res = await healthApi.session.getResults(sessionId)
      setSessionResults(res.results || [])
    } catch {
      setSessionResults([])
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateStr
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-300">Active</Badge>
      case "completed":
        return <Badge className="bg-cyan-500/20 text-cyan-300">Completed</Badge>
      case "archived":
        return <Badge className="bg-muted text-muted-foreground">Archived</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-mesh opacity-30 pointer-events-none" />

      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="hover:bg-primary/20">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Logo size="sm" />
                  <span>Patient Sessions</span>
                </h1>
                <p className="text-sm text-muted-foreground">Analysis History & Management</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSessions}
              disabled={loading}
              className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10 max-w-4xl">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <p className="text-foreground font-semibold mb-2">Failed to load sessions</p>
            <p className="text-muted-foreground text-sm mb-4">{error}</p>
            <Button onClick={fetchSessions} variant="outline">Try Again</Button>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">No Sessions Yet</h2>
            <p className="text-muted-foreground mb-6">
              Start a patient analysis to create your first session
            </p>
            <Link href="/analysis">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0">
                Start Analysis
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">
                {sessions.length} session{sessions.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <AnimatePresence>
              {sessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="glass border-border/50 overflow-hidden">
                    <button
                      onClick={() => handleViewResults(session.id)}
                      className="w-full p-5 text-left hover:bg-muted/10 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                            <Activity className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-foreground">
                                Session {session.id.slice(0, 8)}
                              </span>
                              {getStatusBadge(session.status)}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(session.created_at)}
                              </span>
                              {session.patient_data && (
                                <span>
                                  Age: {session.patient_data.age || "N/A"} | BMI: {session.patient_data.bmi || "N/A"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${
                          selectedSession === session.id ? "rotate-90" : ""
                        }`} />
                      </div>
                    </button>

                    <AnimatePresence>
                      {selectedSession === session.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 border-t border-border/50 pt-4">
                            {sessionResults.length > 0 ? (
                              <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-cyan-400" />
                                  Saved Analysis Results
                                </h4>
                                {sessionResults.map((result, idx) => (
                                  <div key={idx} className="p-4 rounded-xl bg-muted/20 border border-border/50">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                      <div>
                                        <p className="text-xs text-muted-foreground">Risk Score</p>
                                        <p className={`font-bold ${
                                          (result.pcos_risk_score as number) >= 70 ? "text-pink-400" :
                                          (result.pcos_risk_score as number) >= 40 ? "text-yellow-400" : "text-green-400"
                                        }`}>
                                          {result.pcos_risk_score as number}%
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-muted-foreground">Risk Level</p>
                                        <p className="font-medium text-foreground capitalize">
                                          {result.risk_level as string}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-muted-foreground">Phenotype</p>
                                        <p className="font-medium text-foreground">
                                          Type {result.phenotype as string} - {result.phenotype_name as string}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-muted-foreground">Metabolic Risk</p>
                                        <p className="font-medium text-foreground capitalize">
                                          {(result.cluster_assignment as Record<string, string>)?.metabolicRisk || "N/A"}
                                        </p>
                                      </div>
                                    </div>
                                    {Array.isArray(result.contributing_factors) && (result.contributing_factors as string[]).length > 0 && (
                                      <div className="mt-3 flex flex-wrap gap-1">
                                        {(result.contributing_factors as string[]).map((f: string) => (
                                          <Badge key={f} variant="outline" className="text-xs border-pink-500/30 text-pink-300">
                                            {f}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                No saved results for this session. Complete an analysis and save results to view them here.
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/analysis">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0">
              New Analysis
            </Button>
          </Link>
          <Link href="/csv-upload">
            <Button variant="outline" className="border-cyan-500/50 text-foreground hover:bg-cyan-500/10">
              Batch CSV Upload
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
