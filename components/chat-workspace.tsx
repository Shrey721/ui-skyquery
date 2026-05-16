"use client"

import { motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import {
  Database,
  Search,
  BarChart3,
  Table2,
  Code2,
  Download,
  ArrowUpRight,
} from "lucide-react"
import type { ChatMessage } from "@/app/page"
import type { MockResponse, ChartBar } from "@/lib/mock-data"

interface ChatWorkspaceProps {
  messages: ChatMessage[]
  onFollowUp: (text: string) => void
}

type ActiveTab = "chart" | "table" | "sql" | "export"

function barColor(color: ChartBar["color"]): string {
  switch (color) {
    case "primary":
      return "var(--primary)"
    case "accent":
      return "var(--accent)"
    case "warning":
      return "#f59e0b"
    case "muted":
    default:
      return "rgba(34,211,238,0.25)"
  }
}

// ---------- Inline loading dots ----------
function InlineLoader() {
  const steps = [
    "Interpreting schema...",
    "Generating SQL...",
    "Querying Starburst cluster...",
    "Rendering results...",
  ]
  const [step, setStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s < steps.length - 1 ? s + 1 : s))
    }, 350)
    return () => clearInterval(interval)
  }, [steps.length])

  return (
    <motion.div
      className="flex items-center gap-3 py-4 text-muted-foreground"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center gap-1.5">
        <span
          className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent"
          style={{ animationDelay: "200ms" }}
        />
        <span
          className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary"
          style={{ animationDelay: "400ms" }}
        />
      </div>
      <span className="text-sm">{steps[step]}</span>
    </motion.div>
  )
}

// ---------- Single message result ----------
function MessageResult({
  response,
  isLatest,
  onFollowUp,
}: {
  response: MockResponse
  isLatest: boolean
  onFollowUp: (text: string) => void
}) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("chart")

  const tabs: { key: ActiveTab; label: string; icon: typeof BarChart3 }[] = [
    { key: "chart", label: "chart", icon: BarChart3 },
    { key: "table", label: "table", icon: Table2 },
    { key: "sql", label: "sql", icon: Code2 },
    { key: "export", label: "export", icon: Download },
  ]

  const maxBar = Math.max(...response.chartBars.map((b) => b.value), 1)

  return (
    <div className="space-y-4">
      {/* Summary text */}
      <motion.p
        className="text-sm leading-relaxed text-foreground/80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {response.summary}
      </motion.p>

      {/* KPI row */}
      <motion.div
        className="grid grid-cols-2 gap-3 md:grid-cols-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
      >
        {response.kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            className="rounded-xl border border-border/60 bg-card/80 p-4 backdrop-blur-sm"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 + i * 0.05 }}
          >
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
            <p className="mt-1 text-xl font-semibold text-foreground">
              {kpi.value}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground/70">
              {kpi.sub}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Action tabs */}
      <motion.div
        className="overflow-hidden rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.25 }}
      >
        {/* Tab bar */}
        <div className="flex items-center border-b border-border/40">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-b-2 border-primary bg-secondary/20 text-foreground"
                  : "text-muted-foreground hover:text-foreground/70"
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
          {/* Storm window / metadata chip on the right */}
          {response.resultType === "chart" && (
            <div className="ml-auto mr-3 flex flex-col items-end gap-0.5 py-1">
              <span className="text-[10px] text-muted-foreground/50">
                {response.rowCount} rows
              </span>
            </div>
          )}
        </div>

        {/* Tab content */}
        <div className="p-4">
          {activeTab === "chart" && (
            <div>
              <p className="mb-3 text-xs text-muted-foreground">
                {response.chartTitle}
              </p>
              <div className="flex h-44 items-end gap-1.5">
                {response.chartBars.map((bar, i) => (
                  <div
                    key={i}
                    className="flex flex-1 flex-col items-center gap-1.5"
                  >
                    <motion.div
                      className="w-full rounded-t"
                      style={{
                        height: `${(bar.value / maxBar) * 140}px`,
                        backgroundColor: barColor(bar.color),
                      }}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.05 + i * 0.03,
                        ease: "easeOut",
                      }}
                    />
                    <span className="text-[9px] text-muted-foreground/60">
                      {bar.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "table" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40">
                    {response.tableHeaders.map((h) => (
                      <th
                        key={h}
                        className="px-3 py-2 text-left text-xs font-medium text-muted-foreground"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {response.tableRows.map((row, ri) => (
                    <motion.tr
                      key={ri}
                      className="border-b border-border/30 transition-colors hover:bg-secondary/20"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: ri * 0.03 }}
                    >
                      {row.cells.map((cell, ci) => (
                        <td
                          key={ci}
                          className={`px-3 py-2.5 ${
                            ci === 0
                              ? "font-medium text-foreground"
                              : "text-foreground/70"
                          } ${
                            cell.startsWith("+")
                              ? "text-[#10b981]"
                              : ""
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "sql" && (
            <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-foreground/70">
              <code>{response.sql}</code>
            </pre>
          )}

          {activeTab === "export" && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <Download className="h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                Export as CSV, JSON, or Parquet
              </p>
              <div className="flex gap-2">
                {["CSV", "JSON", "Parquet"].map((fmt) => (
                  <button
                    key={fmt}
                    className="rounded-lg border border-border/40 bg-secondary/40 px-4 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Follow-up pills -- only on latest message */}
      {isLatest && (
        <motion.div
          className="flex flex-wrap gap-2 pt-1"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          {response.followUps.map((fu) => (
            <button
              key={fu}
              onClick={() => onFollowUp(fu)}
              className="flex items-center gap-1.5 rounded-full border border-border/40 bg-secondary/30 px-3.5 py-1.5 text-xs text-muted-foreground transition-all hover:border-primary/30 hover:bg-secondary/50 hover:text-foreground"
            >
              {fu}
              <ArrowUpRight className="h-3 w-3" />
            </button>
          ))}
        </motion.div>
      )}
    </div>
  )
}

// ---------- Main workspace ----------
export function ChatWorkspace({ messages, onFollowUp }: ChatWorkspaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground/40">
          Ask a question to get started
        </p>
      </div>
    )
  }

  return (
    <div ref={scrollRef} className="flex h-full flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-4xl space-y-8 px-4 py-6 md:px-8">
        {messages.map((msg, idx) => {
          const isLatest = idx === messages.length - 1

          return (
            <div key={msg.id} className="space-y-4">
              {/* Query card */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="inline-flex items-center gap-2 rounded-lg border border-border/50 bg-secondary/40 px-4 py-2.5 text-sm text-foreground">
                  <Search className="h-3.5 w-3.5 text-primary" />
                  <span>{msg.query}</span>
                </div>
              </motion.div>

              {/* Loading or result */}
              {msg.isLoading ? (
                <InlineLoader />
              ) : msg.response ? (
                <MessageResult
                  response={msg.response}
                  isLatest={isLatest}
                  onFollowUp={onFollowUp}
                />
              ) : null}

              {/* Separator between messages (not after last) */}
              {!isLatest && (
                <div className="border-t border-border/20 pt-2" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
