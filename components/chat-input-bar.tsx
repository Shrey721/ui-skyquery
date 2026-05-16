"use client"

import { motion } from "framer-motion"
import { Send } from "lucide-react"
import { useState } from "react"

interface ChatInputBarProps {
  onSubmit: (query: string) => void
}

export function ChatInputBar({ onSubmit }: ChatInputBarProps) {
  const [query, setQuery] = useState("")
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSubmit(query.trim())
      setQuery("")
    }
  }

  return (
    <motion.div
      className="border-t border-border/40 bg-background/80 px-4 py-3 backdrop-blur-xl"
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <form
        onSubmit={handleSubmit}
        className="mx-auto flex max-w-3xl items-center gap-3"
      >
        <div className="relative flex flex-1 items-center">
          {/* Subtle focus glow */}
          {isFocused && (
            <motion.div
              className="absolute -inset-[1px] rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              style={{
                background: "linear-gradient(90deg, rgba(34,211,238,0.15), rgba(168,85,247,0.1), rgba(34,211,238,0.15))",
                filter: "blur(1px)",
              }}
            />
          )}
          <div className="relative flex w-full items-center rounded-xl border border-border/40 bg-secondary/50 backdrop-blur-sm transition-colors focus-within:border-primary/20">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Ask a follow-up question..."
              className="flex-1 bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
              aria-label="Follow-up query"
            />
            <button
              type="submit"
              disabled={!query.trim()}
              className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/90 text-primary-foreground transition-all hover:bg-primary hover:scale-105 disabled:opacity-20 disabled:hover:scale-100 disabled:hover:bg-primary/90"
              aria-label="Submit follow-up"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </form>
      <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-muted-foreground/30">
        SkyQuery may generate incorrect SQL. Always verify results.
      </p>
    </motion.div>
  )
}
