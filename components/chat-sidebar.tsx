"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  X,
  PenSquare,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react"
import { useState } from "react"

interface HistoryItem {
  id: string
  label: string
  date: string
}

interface ChatSidebarProps {
  isOpen: boolean
  onClose: () => void
  history: HistoryItem[]
  activeId?: string
  onSelect: (item: HistoryItem) => void
  onNewChat: () => void
}

function groupByDate(items: HistoryItem[]) {
  const groups: { label: string; items: HistoryItem[] }[] = []
  const now = new Date()
  const todayItems: HistoryItem[] = []
  const olderItems: HistoryItem[] = []

  items.forEach((item) => {
    const itemDate = new Date(item.date)
    const diffDays = Math.floor(
      (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (diffDays === 0) todayItems.push(item)
    else olderItems.push(item)
  })

  if (todayItems.length > 0) groups.push({ label: "Today", items: todayItems })
  if (olderItems.length > 0) groups.push({ label: "Older", items: olderItems })

  return groups
}

const MAX_VISIBLE = 10

export function ChatSidebar({
  isOpen,
  onClose,
  history,
  activeId,
  onSelect,
  onNewChat,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showAll, setShowAll] = useState(false)

  // Only show real history (no fake defaults)
  const filtered = history.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const visibleItems = showAll ? filtered : filtered.slice(0, MAX_VISIBLE)
  const grouped = groupByDate(visibleItems)
  const hasMore = filtered.length > MAX_VISIBLE && !showAll

  return (
    <motion.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: isOpen ? 0 : -300, opacity: isOpen ? 1 : 0 }}
      transition={{ type: "spring", damping: 26, stiffness: 200 }}
      className="fixed left-0 top-0 z-30 flex h-screen w-72 flex-col border-r border-border bg-sidebar/95 backdrop-blur-xl"
      aria-label="Chat history sidebar"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-3">
        <button
          onClick={onNewChat}
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          aria-label="New query"
        >
          <PenSquare className="h-3.5 w-3.5" />
          New Query
        </button>
        <button
          onClick={onClose}
          className="rounded-md p-1.5 text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>
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

      {/* History */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {grouped.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-sidebar-foreground/30">
            No queries yet
          </p>
        ) : (
          grouped.map((group) => (
            <div key={group.label} className="mb-3">
              <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/35">
                {group.label}
              </p>
              {group.items.map((item) => {
                const isActive = item.id === activeId
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item)}
                    className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-foreground"
                        : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground/80"
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                    {isActive && (
                      <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    )}
                    {!isActive && (
                      <MoreHorizontal className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-40" />
                    )}
                  </button>
                )
              })}
            </div>
          ))
        )}

        {/* Show more button */}
        {hasMore && (
          <button
            onClick={() => setShowAll(true)}
            className="flex w-full items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs text-sidebar-foreground/40 transition-colors hover:bg-sidebar-accent/40 hover:text-sidebar-foreground/60"
          >
            <ChevronDown className="h-3 w-3" />
            Show older ({filtered.length - MAX_VISIBLE} more)
          </button>
        )}
      </div>
    </motion.aside>
  )
}
