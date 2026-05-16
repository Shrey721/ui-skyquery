"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Send, ArrowRight } from "lucide-react"
import { useState, useEffect, useRef, useCallback } from "react"

interface LandingHeroProps {
  onSubmit: (query: string) => void
  onTypingChange?: (isTyping: boolean) => void
}

const allSuggestions = [
  ["Show me top revenue by region", "What were last quarter sales?", "Compare YoY growth rates"],
  ["Which customers churned last month?", "Break down costs by department", "Inventory levels by warehouse"],
  ["Marketing ROI by channel", "Show supplier performance", "Predict next quarter revenue"],
]

export function LandingHero({ onSubmit, onTypingChange }: LandingHeroProps) {
  const [query, setQuery] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [chipSet, setChipSet] = useState(0)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const [chipsVisible, setChipsVisible] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Rotate suggestion chips every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setChipSet((prev) => (prev + 1) % allSuggestions.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  // Fade in chips when user scrolls near input area
  useEffect(() => {
    const timer = setTimeout(() => setChipsVisible(true), 1200)
    return () => clearTimeout(timer)
  }, [])

  // Track mouse for title parallax
  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePos({
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    })
  }, [])

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [handleMouseMove])

  // Notify parent of typing state
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    onTypingChange?.(true)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      onTypingChange?.(false)
    }, 600)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setIsSubmitting(true)
      onTypingChange?.(false)
      // Brief glow pulse before submitting
      setTimeout(() => {
        onSubmit(query.trim())
      }, 300)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    setIsSubmitting(true)
    onTypingChange?.(false)
    setTimeout(() => {
      onSubmit(suggestion)
    }, 300)
  }

  // Smooth gradient shift based on mouse position - no movement, just color shift
  const gradientAngle = 90 + (mousePos.x - 0.5) * 20
  const cyanStop = 15 + mousePos.x * 25
  const purpleStop = 55 + mousePos.x * 15
  const enterpriseMid = 35 + mousePos.y * 25

  const currentChips = allSuggestions[chipSet]

  const isTyping = query.length > 0 && isFocused

  return (
    <motion.div
      ref={containerRef}
      className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -40, scale: 0.98 }}
      transition={{ duration: 0.5 }}
    >
      {/* CSS for rotating glow animation */}
      <style jsx global>{`
        @property --glow-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes rotateGlow {
          from { --glow-angle: 0deg; }
          to { --glow-angle: 360deg; }
        }
        .search-glow-ring {
          animation: rotateGlow 3s linear infinite;
          background: conic-gradient(
            from var(--glow-angle),
            #22d3ee 0%,
            #a855f7 25%,
            #ec4899 50%,
            #a855f7 75%,
            #22d3ee 100%
          );
        }
        .search-glow-ring.typing {
          animation-duration: 1.8s;
        }
        @keyframes submitPulse {
          0% { opacity: 0.8; filter: blur(2px); transform: scale(1); }
          50% { opacity: 1; filter: blur(6px); transform: scale(1.02); }
          100% { opacity: 0; filter: blur(8px); transform: scale(1.04); }
        }
        .search-submit-pulse {
          animation: submitPulse 0.4s ease-out forwards;
        }
      `}</style>
      {/* Interactive title with parallax */}
      <motion.h1
        className="mb-3 select-none text-center text-5xl font-light tracking-tight text-foreground md:text-7xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <span
          className="bg-clip-text text-transparent"
          style={{
            backgroundImage: `linear-gradient(${gradientAngle}deg, #22d3ee ${cyanStop}%, #a855f7 ${purpleStop}%)`,
            transition: "background-image 0.3s ease",
          }}
        >
          Sky
        </span>
        <span className="text-foreground">Query </span>
        <span
          className="bg-clip-text text-transparent"
          style={{
            backgroundImage: `linear-gradient(${gradientAngle}deg, var(--foreground) 0%, #a855f7 ${enterpriseMid}%, var(--foreground) 100%)`,
            transition: "background-image 0.3s ease",
          }}
        >
          Enterprise
        </span>
      </motion.h1>

      <motion.p
        className="mb-10 text-center text-lg text-muted-foreground md:text-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        Natural Language Analytics on Starburst
      </motion.p>

      {/* Gemini-style search bar */}
      <motion.form
        onSubmit={handleSubmit}
        className="relative w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        layout
        layoutId="search-bar"
      >
        <div className="group relative">
          {/* Calm default border */}
          <div
            className="absolute -inset-[1px] rounded-full border transition-all duration-500"
            style={{
              borderColor: isFocused || isSubmitting
                ? "transparent"
                : query
                  ? "rgba(34, 211, 238, 0.12)"
                  : "rgba(255, 255, 255, 0.06)",
            }}
          />
          {/* Animated rotating glow ring on focus */}
          {(isFocused || isSubmitting) && (
            <div
              className={`search-glow-ring absolute -inset-[1.5px] rounded-full ${isTyping ? "typing" : ""} ${isSubmitting ? "search-submit-pulse" : ""}`}
              style={{
                opacity: isSubmitting ? 1 : isTyping ? 0.85 : 0.5,
                filter: isSubmitting ? "blur(3px)" : isTyping ? "blur(1px)" : "blur(0px)",
                transition: "opacity 0.4s ease, filter 0.4s ease",
                mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                maskComposite: "exclude",
                WebkitMaskComposite: "xor",
                padding: "1.5px",
              }}
            />
          )}
          <div className="relative flex items-center rounded-full border border-transparent bg-secondary/80 backdrop-blur-xl">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Ask anything about your data...."
              className="flex-1 rounded-full bg-transparent px-6 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none"
              aria-label="Query input"
            />
            <button
              type="submit"
              disabled={!query.trim()}
              className="mr-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all hover:scale-105 hover:brightness-110 disabled:opacity-20 disabled:hover:scale-100"
              aria-label="Submit query"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.form>

      {/* Rotating animated suggestion chips */}
      <div className="mt-8 h-12 w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {chipsVisible && (
            <motion.div
              key={chipSet}
              className="flex flex-wrap justify-center gap-3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
            >
              {currentChips.map((suggestion, i) => (
                <motion.button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="group flex items-center gap-1.5 rounded-full border border-border/30 bg-secondary/30 px-4 py-2 text-sm text-muted-foreground transition-all hover:border-primary/30 hover:bg-secondary/50 hover:text-foreground"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.08 }}
                >
                  {suggestion}
                  <ArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-60" />
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Subtle bottom helper text */}
      <motion.p
        className="absolute bottom-8 text-center text-xs text-muted-foreground/25"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
      >
        Powered by natural language SQL generation across connected enterprise data
      </motion.p>
    </motion.div>
  )
}
