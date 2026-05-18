"use client"

import { useEffect } from "react"

export default function ClearOnLoad() {
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        // Clear local session store used by the analysis flow
        window.localStorage.removeItem("herova.local.sessions.v1");
      }
    } catch (e) {
      // ignore errors
    }
  }, [])

  return null
}
