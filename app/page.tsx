"use client"

import { useState, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { PanelLeft, Sparkles, Database } from "lucide-react"
import { AnimatedWave } from "@/components/animated-wave"
import { LandingHero } from "@/components/landing-hero"
import { ChatSidebar } from "@/components/chat-sidebar"
import { ChatWorkspace } from "@/components/chat-workspace"
import { ChatInputBar } from "@/components/chat-input-bar"
import { ThinkingTransition } from "@/components/thinking-transition"

interface HistoryItem {
  id: string
  label: string
  date: string
}

type AppPhase = "landing" | "thinking" | "workspace"

export default function SkyQueryApp() {
  const [phase, setPhase] = useState<AppPhase>("landing")
  const [submittedQuery, setSubmittedQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)

  const handleQuerySubmit = useCallback(
    (query: string) => {
      const newId = Date.now().toString()
      setSubmittedQuery(query)
      setActiveHistoryId(newId)
      setIsTyping(false)

      // Add to history
      setHistory((prev) => [
        { id: newId, label: query, date: new Date().toISOString() },
        ...prev,
      ])

      if (phase === "landing") {
        // Show thinking transition first
        setPhase("thinking")
      } else {
        // Already in workspace, just reload results
        setIsLoading(true)
        setTimeout(() => {
          setIsLoading(false)
        }, 800)
      }
    },
    [phase]
  )

  const handleThinkingComplete = useCallback(() => {
    setPhase("workspace")
    setSidebarOpen(true)
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 600)
  }, [])

  const handleHistorySelect = useCallback(
    (item: HistoryItem) => {
      setSubmittedQuery(item.label)
      setActiveHistoryId(item.id)
      setIsLoading(true)
      setTimeout(() => {
        setIsLoading(false)
      }, 800)
    },
    []
  )

  const handleNewChat = useCallback(() => {
    setPhase("landing")
    setSidebarOpen(false)
    setSubmittedQuery("")
    setActiveHistoryId(null)
  }, [])

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {/* Animated wave background */}
      <AnimatedWave isTyping={isTyping} />

      {/* Thinking transition overlay */}
      <AnimatePresence>
        {phase === "thinking" && (
          <ThinkingTransition onComplete={handleThinkingComplete} />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {phase === "landing" ? (
          <LandingHero
            key="landing"
            onSubmit={handleQuerySubmit}
            onTypingChange={setIsTyping}
          />
        ) : phase === "workspace" ? (
          <motion.div
            key="workspace"
            className="relative z-10 flex h-screen flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* Top bar */}
            <motion.header
              className="flex items-center justify-between border-b border-border/40 bg-background/80 px-4 py-3 backdrop-blur-xl"
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.05 }}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  aria-label="Toggle sidebar"
                >
                  <PanelLeft className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h1 className="text-sm font-medium text-foreground">
                    <span className="text-primary">Sky</span>Query Enterprise
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Context awareness badge */}
                <div className="flex items-center gap-1.5 rounded-full bg-secondary/40 px-3 py-1 text-[11px] text-muted-foreground/70">
                  <Database className="h-3 w-3 text-primary/50" />
                  <span>Connected to Starburst</span>
                  <span className="text-muted-foreground/30">|</span>
                  <span>Schema indexed</span>
                  <span className="text-primary/60">148 tables</span>
                </div>
              </div>
            </motion.header>

            {/* Sidebar */}
            <ChatSidebar
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              history={history}
              activeId={activeHistoryId || undefined}
              onSelect={handleHistorySelect}
              onNewChat={handleNewChat}
            />

            {/* Main content area */}
            <div
              className="flex flex-1 flex-col overflow-hidden transition-all duration-300"
              style={{ marginLeft: sidebarOpen ? "288px" : "0" }}
            >
              <div className="flex-1 overflow-y-auto">
                <ChatWorkspace
                  query={submittedQuery}
                  isLoading={isLoading}
                />
              </div>
              <ChatInputBar onSubmit={handleQuerySubmit} />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
