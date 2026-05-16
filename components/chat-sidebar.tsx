"use client"

import { motion } from "framer-motion"
import {
  Search,
  X,
  PenSquare,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react"
import { useState } from "react"
import type { ChatSession } from "@/app/page"
import { SkyQueryLogo } from "@/components/skyquery-logo"

interface ChatSidebarProps {
  isOpen: boolean
  onClose: () => void
  sessions: ChatSession[]
  activeSessionId?: string
  onSelectSession: (sessionId: string) => void
  onNewChat: () => void
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return "Just now"
  if (diffMin < 60) return `${diffMin} min ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  return `${diffDay}d ago`
}

function sessionMeta(session: ChatSession): string {
  if (session.messages.length === 0) return "New session"
  const lastMsg = session.messages[session.messages.length - 1]
  const rowCount = lastMsg.response?.rowCount
  const rows = rowCount ? `${rowCount.toLocaleString()} rows` : ""
  const time = timeAgo(session.createdAt)
  return [time, rows].filter(Boolean).join(" \u00b7 ")
}

function groupSessions(sessions: ChatSession[]) {
  const groups: { label: string; sessions: ChatSession[] }[] = []
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterdayStart = new Date(todayStart.getTime() - 86400000)
  const weekStart = new Date(todayStart.getTime() - 7 * 86400000)

  const thisSession: ChatSession[] = []
  const yesterday: ChatSession[] = []
  const lastWeek: ChatSession[] = []
  const older: ChatSession[] = []

  sessions.forEach((s) => {
    const d = new Date(s.createdAt)
    if (d >= todayStart) thisSession.push(s)
    else if (d >= yesterdayStart) yesterday.push(s)
    else if (d >= weekStart) lastWeek.push(s)
    else older.push(s)
  })

  if (thisSession.length > 0)
    groups.push({ label: "This Session", sessions: thisSession })
  if (yesterday.length > 0)
    groups.push({ label: "Yesterday", sessions: yesterday })
  if (lastWeek.length > 0)
    groups.push({ label: "Last Week", sessions: lastWeek })
  if (older.length > 0)
    groups.push({ label: "Older Chats", sessions: older })

  return groups
}

const OLDER_THRESHOLD = 20

export function ChatSidebar({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [olderExpanded, setOlderExpanded] = useState(true)

  // Filter sessions by search query — match on title
  const filtered = sessions.filter((s) => {
    if (!searchQuery) return true
    return s.title.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const grouped = groupSessions(filtered)
  const totalSessions = sessions.length

  return (
    <motion.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: isOpen ? 0 : -300, opacity: isOpen ? 1 : 0 }}
      transition={{ type: "spring", damping: 26, stiffness: 200 }}
      className="fixed left-0 top-0 z-30 flex h-screen w-72 flex-col border-r border-border bg-sidebar/95 backdrop-blur-xl"
      aria-label="Chat history sidebar"
    >
      {/* Header with logo */}
      <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-3">
        <SkyQueryLogo size="sm" />
        <div className="flex items-center gap-1">
          <button
            onClick={onNewChat}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            aria-label="New query"
          >
            <PenSquare className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-3">
        <div className="flex items-center gap-2 rounded-lg bg-sidebar-accent/60 px-3 py-2">
          <Search className="h-3.5 w-3.5 text-sidebar-foreground/40" />
          <input
            type="text"
            placeholder="Search queries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-sidebar-foreground placeholder:text-sidebar-foreground/30 focus:outline-none"
            aria-label="Search conversations"
          />
        </div>
      </div>

      {/* Sessions */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {grouped.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-sidebar-foreground/30">
            No queries yet
          </p>
        ) : (
          grouped.map((group) => {
            const isOlderGroup = group.label === "Older Chats"
            // Only make "Older Chats" collapsible when total sessions exceed threshold
            const isCollapsible =
              isOlderGroup && totalSessions >= OLDER_THRESHOLD

            return (
              <div key={group.label} className="mb-3">
                {/* Group label */}
                {isCollapsible ? (
                  <button
                    onClick={() => setOlderExpanded(!olderExpanded)}
                    className="flex w-full items-center gap-1 px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/35 transition-colors hover:text-sidebar-foreground/50"
                  >
                    <ChevronDown
                      className={`h-3 w-3 transition-transform ${
                        olderExpanded ? "" : "-rotate-90"
                      }`}
                    />
                    {group.label}
                    <span className="ml-1 text-[10px] font-normal normal-case tracking-normal text-sidebar-foreground/25">
                      ({group.sessions.length})
                    </span>
                  </button>
                ) : (
                  <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/35">
                    {group.label}
                  </p>
                )}

                {/* Session items */}
                {(!isCollapsible || olderExpanded) &&
                  group.sessions.map((session) => {
                    const isActive = session.id === activeSessionId
                    const title =
                      session.title ||
                      (session.messages[0]?.query ?? "New chat")
                    const meta = sessionMeta(session)

                    return (
                      <button
                        key={session.id}
                        onClick={() => onSelectSession(session.id)}
                        className={`group flex w-full flex-col rounded-lg px-3 py-2 text-left transition-colors ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-foreground"
                            : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground/80"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm">{title}</span>
                          {isActive && (
                            <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          )}
                          {!isActive && (
                            <MoreHorizontal className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-40" />
                          )}
                        </div>
                        <span className="mt-0.5 text-[11px] text-sidebar-foreground/30">
                          {meta}
                        </span>
                      </button>
                    )
                  })}
              </div>
            )
          })
        )}
      </div>
    </motion.aside>
  )
}
