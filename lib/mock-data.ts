// Mock data layer for SkyQuery workspace
// Provides aviation analytics datasets and keyword-based response picking

export interface KPI {
  label: string
  value: string
  sub: string
}

export interface ChartBar {
  label: string
  value: number
  color: "primary" | "accent" | "warning" | "muted"
}

export interface TableRow {
  cells: string[]
}

export interface MockResponse {
  summary: string
  kpis: KPI[]
  chartTitle: string
  chartBars: ChartBar[]
  tableHeaders: string[]
  tableRows: TableRow[]
  sql: string
  followUps: string[]
  rowCount: number
  resultType: string
}

// ---------- Aviation datasets ----------

const delayResponse: MockResponse = {
  summary:
    "The remaining 71 delays show no correlated weather event. ATL Delta May 8 — delay distribution by hour.",
  kpis: [
    { label: "Total flights", value: "847", sub: "May 8, ATL" },
    { label: "Delayed", value: "312", sub: "36.8%" },
    { label: "Weather-caused", value: "241", sub: "77% of delays" },
    { label: "Avg delay", value: "54m", sub: "peak: 2h 10m" },
  ],
  chartTitle: "Delayed flights per hour (orange = weather-correlated)",
  chartBars: [
    { label: "00", value: 5, color: "muted" },
    { label: "03", value: 3, color: "muted" },
    { label: "06", value: 28, color: "warning" },
    { label: "07", value: 45, color: "warning" },
    { label: "08", value: 52, color: "warning" },
    { label: "09", value: 38, color: "warning" },
    { label: "10", value: 22, color: "muted" },
    { label: "12", value: 15, color: "muted" },
    { label: "14", value: 18, color: "muted" },
    { label: "16", value: 12, color: "muted" },
    { label: "18", value: 20, color: "muted" },
    { label: "20", value: 10, color: "muted" },
    { label: "22", value: 6, color: "muted" },
  ],
  tableHeaders: ["Hour", "Total delayed", "Weather", "Other", "Avg (min)"],
  tableRows: [
    { cells: ["06:00", "28", "24", "4", "42"] },
    { cells: ["07:00", "45", "39", "6", "58"] },
    { cells: ["08:00", "52", "48", "4", "67"] },
    { cells: ["09:00", "38", "31", "7", "51"] },
    { cells: ["10:00", "22", "14", "8", "34"] },
    { cells: ["12:00", "15", "8", "7", "28"] },
    { cells: ["14:00", "18", "10", "8", "31"] },
    { cells: ["16:00", "12", "7", "5", "25"] },
  ],
  sql: `SELECT
  EXTRACT(HOUR FROM f.scheduled_departure) AS dep_hour,
  COUNT(*) AS total_delayed,
  SUM(CASE WHEN w.event_id IS NOT NULL THEN 1 ELSE 0 END) AS weather_delayed,
  SUM(CASE WHEN w.event_id IS NULL THEN 1 ELSE 0 END) AS other_delayed,
  ROUND(AVG(f.delay_minutes), 0) AS avg_delay
FROM starburst.aviation.flights f
LEFT JOIN starburst.weather.events w
  ON f.airport_code = w.airport_code
  AND f.scheduled_departure BETWEEN w.start_time AND w.end_time
WHERE f.flight_date = DATE '2025-05-08'
  AND f.carrier = 'DL'
  AND f.airport_code = 'ATL'
  AND f.delay_minutes > 0
GROUP BY dep_hour
ORDER BY dep_hour;`,
  followUps: [
    "Same for United at ORD",
    "Which tail numbers?",
    "All carriers at ATL",
    "Route geo map",
  ],
  rowCount: 847,
  resultType: "chart",
}

const tablesResponse: MockResponse = {
  summary:
    "Found 12 tables related to airports across 3 schemas. Most frequently queried: flights, weather_events, and gate_assignments.",
  kpis: [
    { label: "Schemas", value: "3", sub: "aviation, weather, ops" },
    { label: "Tables", value: "12", sub: "airport-related" },
    { label: "Total rows", value: "48.2M", sub: "across all tables" },
    { label: "Last updated", value: "2h ago", sub: "auto-refresh" },
  ],
  chartTitle: "Row count by table (millions)",
  chartBars: [
    { label: "flights", value: 95, color: "primary" },
    { label: "weather", value: 60, color: "accent" },
    { label: "gates", value: 35, color: "primary" },
    { label: "carriers", value: 20, color: "muted" },
    { label: "routes", value: 15, color: "muted" },
    { label: "airports", value: 8, color: "muted" },
  ],
  tableHeaders: ["Schema", "Table", "Rows", "Columns", "Last query"],
  tableRows: [
    { cells: ["aviation", "flights", "22.4M", "28", "2 min ago"] },
    { cells: ["weather", "events", "14.1M", "16", "12 min ago"] },
    { cells: ["ops", "gate_assignments", "8.3M", "12", "1h ago"] },
    { cells: ["aviation", "carriers", "1.2M", "8", "3h ago"] },
    { cells: ["aviation", "routes", "890K", "14", "5h ago"] },
    { cells: ["aviation", "airports", "12K", "22", "1d ago"] },
  ],
  sql: `SELECT
  t.table_schema,
  t.table_name,
  s.row_count,
  COUNT(c.column_name) AS col_count
FROM information_schema.tables t
JOIN information_schema.columns c
  ON t.table_name = c.table_name
LEFT JOIN system.table_stats s
  ON t.table_name = s.table_name
WHERE t.table_name ILIKE '%airport%'
   OR t.table_schema IN ('aviation', 'weather', 'ops')
GROUP BY t.table_schema, t.table_name, s.row_count
ORDER BY s.row_count DESC;`,
  followUps: [
    "Show columns for flights",
    "Sample 10 rows from weather",
    "Join flights + weather",
    "Which tables have geo data?",
  ],
  rowCount: 12,
  resultType: "rows",
}

const weatherImpactResponse: MockResponse = {
  summary:
    "Southwest had the highest weather-related delays this quarter at 34% of total delays, followed by American at 28%. JetBlue had the lowest impact at 12%.",
  kpis: [
    { label: "Carriers analyzed", value: "8", sub: "major US" },
    { label: "Weather events", value: "1,247", sub: "Q1 2025" },
    { label: "Flights impacted", value: "89,420", sub: "14.2% of total" },
    { label: "Worst corridor", value: "ORD-DFW", sub: "2,340 delays" },
  ],
  chartTitle: "Weather delay % by carrier",
  chartBars: [
    { label: "WN", value: 85, color: "warning" },
    { label: "AA", value: 70, color: "warning" },
    { label: "DL", value: 55, color: "primary" },
    { label: "UA", value: 50, color: "primary" },
    { label: "NK", value: 40, color: "muted" },
    { label: "B6", value: 30, color: "muted" },
  ],
  tableHeaders: ["Carrier", "Total delays", "Weather", "% Weather", "Avg min"],
  tableRows: [
    { cells: ["Southwest (WN)", "18,420", "6,263", "34.0%", "62"] },
    { cells: ["American (AA)", "15,890", "4,449", "28.0%", "48"] },
    { cells: ["Delta (DL)", "12,100", "2,904", "24.0%", "41"] },
    { cells: ["United (UA)", "14,200", "3,124", "22.0%", "38"] },
    { cells: ["Spirit (NK)", "8,400", "1,512", "18.0%", "55"] },
    { cells: ["JetBlue (B6)", "6,800", "816", "12.0%", "32"] },
  ],
  sql: `SELECT
  c.carrier_name,
  c.iata_code,
  COUNT(*) AS total_delays,
  SUM(CASE WHEN w.event_id IS NOT NULL THEN 1 ELSE 0 END) AS weather_delays,
  ROUND(100.0 * SUM(CASE WHEN w.event_id IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 1) AS pct_weather,
  ROUND(AVG(f.delay_minutes), 0) AS avg_delay_min
FROM starburst.aviation.flights f
JOIN starburst.aviation.carriers c ON f.carrier = c.iata_code
LEFT JOIN starburst.weather.events w
  ON f.airport_code = w.airport_code
  AND f.scheduled_departure BETWEEN w.start_time AND w.end_time
WHERE f.delay_minutes > 0
  AND f.flight_date >= DATE '2025-01-01'
GROUP BY c.carrier_name, c.iata_code
ORDER BY pct_weather DESC;`,
  followUps: [
    "Drill into Southwest routes",
    "Compare ORD vs ATL weather",
    "Monthly trend for Delta",
    "Export carrier report",
  ],
  rowCount: 8,
  resultType: "chart",
}

const onTimeResponse: MockResponse = {
  summary:
    "On-time performance across all routes over the last 7 days averages 78.4%. Domestic routes outperform international by 12 percentage points.",
  kpis: [
    { label: "Routes analyzed", value: "3,241", sub: "last 7 days" },
    { label: "On-time rate", value: "78.4%", sub: "+2.1% vs prior week" },
    { label: "Best route", value: "SFO-LAX", sub: "96.2% on-time" },
    { label: "Worst route", value: "ORD-EWR", sub: "52.1% on-time" },
  ],
  chartTitle: "On-time % by day (last 7 days)",
  chartBars: [
    { label: "Mon", value: 75, color: "primary" },
    { label: "Tue", value: 82, color: "primary" },
    { label: "Wed", value: 80, color: "primary" },
    { label: "Thu", value: 70, color: "warning" },
    { label: "Fri", value: 65, color: "warning" },
    { label: "Sat", value: 88, color: "primary" },
    { label: "Sun", value: 85, color: "primary" },
  ],
  tableHeaders: ["Route", "Flights", "On-time", "Avg delay", "Cancellations"],
  tableRows: [
    { cells: ["SFO-LAX", "420", "96.2%", "8m", "0"] },
    { cells: ["ATL-MIA", "385", "89.1%", "14m", "2"] },
    { cells: ["DFW-DEN", "310", "84.5%", "19m", "1"] },
    { cells: ["JFK-LAX", "290", "76.2%", "28m", "4"] },
    { cells: ["ORD-ATL", "340", "68.8%", "35m", "7"] },
    { cells: ["ORD-EWR", "280", "52.1%", "52m", "12"] },
  ],
  sql: `SELECT
  CONCAT(f.origin, '-', f.destination) AS route,
  COUNT(*) AS total_flights,
  ROUND(100.0 * SUM(CASE WHEN f.delay_minutes <= 15 THEN 1 ELSE 0 END) / COUNT(*), 1) AS on_time_pct,
  ROUND(AVG(f.delay_minutes), 0) AS avg_delay,
  SUM(CASE WHEN f.status = 'CANCELLED' THEN 1 ELSE 0 END) AS cancellations
FROM starburst.aviation.flights f
WHERE f.flight_date >= CURRENT_DATE - INTERVAL '7' DAY
GROUP BY f.origin, f.destination
ORDER BY on_time_pct DESC
LIMIT 20;`,
  followUps: [
    "Show me tail numbers with 3+ delays",
    "Fleet utilization heatmap",
    "Weather correlation with delays",
    "Compare ORD vs MDW operational",
  ],
  rowCount: 3241,
  resultType: "rows",
}

const revenueResponse: MockResponse = {
  summary:
    "Total revenue across all regions is $12.4M for Q1 2025, up 14.2% year-over-year. North America leads with $4.2M in revenue.",
  kpis: [
    { label: "Total Revenue", value: "$12.4M", sub: "+14.2% YoY" },
    { label: "Active Customers", value: "48,291", sub: "+8.7%" },
    { label: "Avg Order Value", value: "$256.80", sub: "+3.1%" },
    { label: "Regions", value: "10", sub: "Analyzed" },
  ],
  chartTitle: "Revenue by Region",
  chartBars: [
    { label: "NA", value: 85, color: "primary" },
    { label: "EU", value: 62, color: "accent" },
    { label: "APAC", value: 56, color: "primary" },
    { label: "LATAM", value: 28, color: "muted" },
    { label: "ME", value: 18, color: "muted" },
  ],
  tableHeaders: ["Region", "Revenue", "Customers", "Growth"],
  tableRows: [
    { cells: ["North America", "$4.2M", "15,420", "+18.3%"] },
    { cells: ["Europe", "$3.1M", "12,890", "+12.1%"] },
    { cells: ["Asia Pacific", "$2.8M", "11,200", "+22.5%"] },
    { cells: ["Latin America", "$1.4M", "5,640", "+9.8%"] },
    { cells: ["Middle East", "$0.9M", "3,141", "+15.4%"] },
  ],
  sql: `SELECT
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
LIMIT 10;`,
  followUps: [
    "Compare YoY by region",
    "Break down by product category",
    "Top 10 customers by spend",
    "Export full report",
  ],
  rowCount: 10,
  resultType: "rows",
}

// ---------- Keyword matcher ----------

const responseMap: { keywords: string[]; response: MockResponse }[] = [
  {
    keywords: ["delay", "delays", "delayed", "atl", "delta"],
    response: delayResponse,
  },
  {
    keywords: ["table", "tables", "schema", "related", "airport"],
    response: tablesResponse,
  },
  {
    keywords: ["weather", "impact", "carrier", "worst"],
    response: weatherImpactResponse,
  },
  {
    keywords: ["on-time", "ontime", "on time", "route", "performance", "7 day", "last week"],
    response: onTimeResponse,
  },
  {
    keywords: ["revenue", "sales", "order", "customer", "region"],
    response: revenueResponse,
  },
  {
    keywords: ["united", "ord", "ual", "chicago"],
    response: { ...delayResponse, kpis: [
      { label: "Total flights", value: "1,203", sub: "May 8, ORD" },
      { label: "Delayed", value: "486", sub: "40.4%" },
      { label: "Weather-caused", value: "312", sub: "64% of delays" },
      { label: "Avg delay", value: "48m", sub: "peak: 1h 55m" },
    ], followUps: ["Compare with Delta at ATL", "ORD gate utilization", "Tail numbers affected", "Weekly trend"] },
  },
  {
    keywords: ["tail", "tail number", "aircraft", "fleet"],
    response: { ...onTimeResponse, summary: "Found 41 tail numbers with 3 or more delays in the past 7 days. N843UA leads with 7 delays across ORD-based routes.", kpis: [
      { label: "Aircraft flagged", value: "41", sub: "3+ delays" },
      { label: "Worst tail", value: "N843UA", sub: "7 delays" },
      { label: "Avg delays/tail", value: "3.8", sub: "flagged set" },
      { label: "Hub concentration", value: "ORD", sub: "58% of flagged" },
    ], followUps: ["Maintenance history for N843UA", "Fleet age correlation", "Route patterns for flagged", "Export tail list"], rowCount: 41 },
  },
]

// All available responses for cycling
const allResponses = [
  delayResponse,
  tablesResponse,
  weatherImpactResponse,
  onTimeResponse,
  revenueResponse,
]

export function pickMockResponse(query: string): MockResponse {
  const lower = query.toLowerCase()

  // Check keyword matches
  for (const entry of responseMap) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.response
    }
  }

  // Fallback: cycle through responses based on query length
  const idx = query.length % allResponses.length
  return allResponses[idx]
}
