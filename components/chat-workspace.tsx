"use client"

import { motion } from "framer-motion"
import {
  Database,
  TrendingUp,
  DollarSign,
  Users,
  BarChart3,
  Table2,
  GitCompare,
  MapPin,
  Download,
  Code2,
  Search,
} from "lucide-react"

interface ChatWorkspaceProps {
  query: string
  isLoading: boolean
}

const mockSQL = `SELECT 
  r.region_name,
  SUM(o.total_amount) AS revenue,
  COUNT(DISTINCT o.customer_id) AS customers,
  ROUND(AVG(o.total_amount), 2) AS avg_order
FROM starburst.sales.orders o
JOIN starburst.sales.regions r 
  ON o.region_id = r.id
WHERE o.order_date >= DATE '2025-01-01'
GROUP BY r.region_name
ORDER BY revenue DESC
LIMIT 10;`

const mockKPIs = [
  {
    label: "Total Revenue",
    value: "$12.4M",
    change: "+14.2%",
    icon: DollarSign,
  },
  {
    label: "Active Customers",
    value: "48,291",
    change: "+8.7%",
    icon: Users,
  },
  {
    label: "Avg Order Value",
    value: "$256.80",
    change: "+3.1%",
    icon: TrendingUp,
  },
  {
    label: "Regions",
    value: "10",
    change: "Analyzed",
    icon: BarChart3,
  },
]

const mockTableData = [
  { region: "North America", revenue: "$4.2M", customers: "15,420", growth: "+18.3%" },
  { region: "Europe", revenue: "$3.1M", customers: "12,890", growth: "+12.1%" },
  { region: "Asia Pacific", revenue: "$2.8M", customers: "11,200", growth: "+22.5%" },
  { region: "Latin America", revenue: "$1.4M", customers: "5,640", growth: "+9.8%" },
  { region: "Middle East", revenue: "$0.9M", customers: "3,141", growth: "+15.4%" },
]

const followUpActions = [
  { label: "Compare YoY", icon: GitCompare },
  { label: "Break down by region", icon: MapPin },
  { label: "Export CSV", icon: Download },
  { label: "Show SQL", icon: Code2 },
  { label: "Drill deeper", icon: Search },
]

export function ChatWorkspace({ query, isLoading }: ChatWorkspaceProps) {
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 md:px-8">
        {/* Compact query card -- NOT a chat bubble */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="inline-flex items-center gap-2 rounded-lg border border-border/50 bg-secondary/40 px-4 py-2.5 text-sm text-foreground">
            <Search className="h-3.5 w-3.5 text-primary" />
            <span>{query}</span>
          </div>
        </motion.div>

        {/* Loading state */}
        {isLoading ? (
          <motion.div
            className="flex items-center gap-3 text-muted-foreground"
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
            <span className="text-sm">Querying Starburst cluster...</span>
          </motion.div>
        ) : (
          <div className="space-y-5">
            {/* KPI Cards -- appear FIRST (progressive reveal) */}
            <motion.div
              className="grid grid-cols-2 gap-3 md:grid-cols-4"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
            >
              {mockKPIs.map((kpi, i) => (
                <motion.div
                  key={kpi.label}
                  className="rounded-xl border border-border/60 bg-card/80 p-4 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 + i * 0.06 }}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <kpi.icon className="h-4 w-4 text-primary/70" />
                    <span className="text-xs text-muted-foreground">
                      {kpi.label}
                    </span>
                  </div>
                  <p className="text-xl font-semibold text-foreground">
                    {kpi.value}
                  </p>
                  <p
                    className={`mt-1 text-xs ${kpi.change.startsWith("+") ? "text-[#10b981]" : "text-muted-foreground"}`}
                  >
                    {kpi.change}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* Chart -- appears SECOND */}
            <motion.div
              className="overflow-hidden rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <div className="flex items-center gap-2 border-b border-border/40 px-4 py-2.5">
                <BarChart3 className="h-4 w-4 text-primary/70" />
                <span className="text-xs font-medium text-muted-foreground">
                  Revenue by Region
                </span>
              </div>
              <div className="flex h-48 items-end justify-around gap-3 p-6">
                {[68, 50, 45, 22, 14].map((height, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <motion.div
                      className="w-full rounded-t-md"
                      style={{
                        height: `${height * 2}px`,
                        background:
                          i === 0
                            ? "var(--primary)"
                            : i === 1
                              ? "var(--accent)"
                              : `rgba(34, 211, 238, ${0.3 + i * 0.1})`,
                      }}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{
                        duration: 0.5,
                        delay: 0.4 + i * 0.08,
                        ease: "easeOut",
                      }}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {["NA", "EU", "APAC", "LATAM", "ME"][i]}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Data Table -- appears THIRD */}
            <motion.div
              className="overflow-hidden rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <div className="flex items-center gap-2 border-b border-border/40 px-4 py-2.5">
                <Table2 className="h-4 w-4 text-primary/70" />
                <span className="text-xs font-medium text-muted-foreground">
                  Results Table
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                        Region
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                        Revenue
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                        Customers
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                        Growth
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockTableData.map((row, i) => (
                      <motion.tr
                        key={row.region}
                        className="border-b border-border/30 transition-colors hover:bg-secondary/20"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.25, delay: 0.55 + i * 0.04 }}
                      >
                        <td className="px-4 py-3 font-medium text-foreground">
                          {row.region}
                        </td>
                        <td className="px-4 py-3 text-right text-foreground/80">
                          {row.revenue}
                        </td>
                        <td className="px-4 py-3 text-right text-foreground/80">
                          {row.customers}
                        </td>
                        <td className="px-4 py-3 text-right text-[#10b981]">
                          {row.growth}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* SQL Block -- collapsed by default, shown via "Show SQL" action */}
            <motion.details
              className="group overflow-hidden rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.65 }}
            >
              <summary className="flex cursor-pointer items-center gap-2 px-4 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                <Database className="h-3.5 w-3.5 text-primary/60" />
                Generated SQL
                <span className="ml-auto text-[10px] text-muted-foreground/50 group-open:hidden">
                  Click to expand
                </span>
              </summary>
              <div className="border-t border-border/30">
                <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-foreground/70">
                  <code>{mockSQL}</code>
                </pre>
              </div>
            </motion.details>

            {/* Follow-up action chips -- appear LAST */}
            <motion.div
              className="flex flex-wrap gap-2 pt-1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.75 }}
            >
              {followUpActions.map((action, i) => (
                <motion.button
                  key={action.label}
                  className="flex items-center gap-1.5 rounded-lg border border-border/40 bg-secondary/30 px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-primary/30 hover:bg-secondary/50 hover:text-foreground"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25, delay: 0.8 + i * 0.05 }}
                >
                  <action.icon className="h-3 w-3" />
                  {action.label}
                </motion.button>
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
