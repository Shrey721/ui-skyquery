"use client"

import { useState, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { PanelLeft } from "lucide-react"
import { AnimatedWave } from "@/components/animated-wave"
import { LandingHero } from "@/components/landing-hero"
import { ChatSidebar } from "@/components/chat-sidebar"
import { ChatWorkspace } from "@/components/chat-workspace"
import { ChatInputBar } from "@/components/chat-input-bar"
import { ThinkingTransition } from "@/components/thinking-transition"
import { pickMockResponse } from "@/lib/mock-data"
import { SkyQueryLogo } from "@/components/skyquery-logo"
import type { MockResponse } from "@/lib/mock-data"

export interface ChatMessage {
  id: string
  query: string
  response: MockResponse | null
  timestamp: string
  isLoading: boolean
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: string
}

type AppPhase = "landing" | "thinking" | "workspace"

export default function SkyQueryApp() {
  const [phase, setPhase] = useState<AppPhase>("landing")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [pendingQuery, setPendingQuery] = useState<string | null>(null)

  const currentSession = sessions.find((s) => s.id === currentSessionId) || null

  const addMessageToSession = useCallback(
    (sessionId: string, query: string) => {
      const messageId = `msg-${Date.now()}`
      const newMessage: ChatMessage = {
        id: messageId,
        query,
        response: null,
        timestamp: new Date().toISOString(),
        isLoading: true,
      }

      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? { ...s, messages: [...s.messages, newMessage] }
            : s
        )
      )

      // Simulate loading then resolve with mock data
      setTimeout(() => {
        const mockResponse = pickMockResponse(query)
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: s.messages.map((m) =>
                    m.id === messageId
                      ? { ...m, response: mockResponse, isLoading: false }
                      : m
                  ),
                }
              : s
          )
        )
      }, 1200)
    },
    []
  )

  const handleQuerySubmit = useCallback(
    (query: string) => {
      setIsTyping(false)

      if (phase === "landing") {
        // First query: create session, show thinking, then workspace
        const sessionId = `session-${Date.now()}`
        const newSession: ChatSession = {
          id: sessionId,
          title: query,
          messages: [],
          createdAt: new Date().toISOString(),
        }
        setSessions((prev) => [newSession, ...prev])
        setCurrentSessionId(sessionId)
        setPendingQuery(query)
        setPhase("thinking")
      } else if (phase === "workspace" && currentSessionId) {
        // Follow-up: append message to current session
        addMessageToSession(currentSessionId, query)
      }
    },
    [phase, currentSessionId, addMessageToSession]
  )

  const handleThinkingComplete = useCallback(() => {
    setPhase("workspace")
    setSidebarOpen(true)

    // Now add the first message to the session
    if (currentSessionId && pendingQuery) {
      addMessageToSession(currentSessionId, pendingQuery)
      setPendingQuery(null)
    }
  }, [currentSessionId, pendingQuery, addMessageToSession])

  const handleSessionSelect = useCallback(
    (sessionId: string) => {
      setCurrentSessionId(sessionId)
    },
    []
  )

  const handleNewChat = useCallback(() => {
    const sessionId = `session-${Date.now()}`
    const newSession: ChatSession = {
      id: sessionId,
      title: "",
      messages: [],
      createdAt: new Date().toISOString(),
    }
    setSessions((prev) => [newSession, ...prev])
    setCurrentSessionId(sessionId)
  }, [])

  const handleFollowUp = useCallback(
    (text: string) => {
      if (currentSessionId) {
        addMessageToSession(currentSessionId, text)
      }
    },
    [currentSessionId, addMessageToSession]
  )

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
            {/* Top bar — shifts right when sidebar opens */}
            <motion.header
              className="flex items-center justify-between border-b border-border/40 bg-background/80 px-4 py-3 backdrop-blur-xl transition-all duration-300"
              style={{ marginLeft: sidebarOpen ? "288px" : "0" }}
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
                <SkyQueryLogo size="sm" />
                {/* Connection badge */}
                <div className="flex items-center gap-1.5 rounded-full bg-secondary/40 px-3 py-1 text-[11px] text-muted-foreground/70">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10b981] opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#10b981]" />
                  </span>
                  <span className="hidden sm:inline">prod-starburst.corp</span>
                  <span className="text-muted-foreground/30 hidden sm:inline">&#183;</span>
                  <span className="hidden sm:inline">jdbc:trino://...</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Via GitHub Copilot label */}
                <span className="hidden text-xs text-muted-foreground/50 sm:inline">
                  via GitHub Copilot
                </span>
                {/* User avatar */}
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary/60 text-xs font-semibold text-muted-foreground">
                  JD
                </div>
              </div>
            </motion.header>

            {/* Sidebar */}
            <ChatSidebar
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              sessions={sessions}
              activeSessionId={currentSessionId || undefined}
              onSelectSession={handleSessionSelect}
              onNewChat={handleNewChat}
            />

            {/* Main content area */}
            <div
              className="flex flex-1 flex-col overflow-hidden transition-all duration-300"
              style={{ marginLeft: sidebarOpen ? "288px" : "0" }}
            >
              <div className="flex-1 overflow-y-auto">
                <ChatWorkspace
                  messages={currentSession?.messages || []}
                  onFollowUp={handleFollowUp}
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
