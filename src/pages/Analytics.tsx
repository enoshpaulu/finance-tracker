import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

type Transaction = {
  amount: number
  category: string
  created_at: string
}

type MonthlyTotal = {
  month: string
  total: number
}

const COLORS = [
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#ca8a04",
  "#9333ea",
  "#0d9488",
  "#ea580c",
]

const Analytics = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [monthlyTotals, setMonthlyTotals] = useState<MonthlyTotal[]>([])
  const [selectedMonth, setSelectedMonth] = useState("")
  const [categoryTotals, setCategoryTotals] = useState<
    { category: string; total: number }[]
  >([])

  /* ---------- FETCH EXPENSES ---------- */
  const fetchExpenses = async () => {
    const { data } = await supabase
      .from("transactions")
      .select("amount, category, created_at")
      .eq("type", "expense")

    if (data) {
      setTransactions(data)
      calculateMonthlyTotals(data)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [])

  /* ---------- MONTHLY TOTALS ---------- */
  const calculateMonthlyTotals = (data: Transaction[]) => {
    const map: Record<string, number> = {}

    data.forEach((t) => {
      const date = new Date(t.created_at)
      const month = date.toLocaleString("default", {
        month: "short",
        year: "numeric",
      })

      map[month] = (map[month] || 0) + t.amount
    })

    const result = Object.entries(map).map(([month, total]) => ({
      month,
      total,
    }))

    setMonthlyTotals(result)
  }

  /* ---------- CATEGORY TOTALS ---------- */
  const calculateCategoryTotals = (month: string) => {
    const map: Record<string, number> = {}

    transactions.forEach((t) => {
      const date = new Date(t.created_at)
      const txMonth = date.toLocaleString("default", {
        month: "short",
        year: "numeric",
      })

      if (txMonth === month) {
        map[t.category] = (map[t.category] || 0) + t.amount
      }
    })

    const result = Object.entries(map).map(([category, total]) => ({
      category,
      total,
    }))

    setCategoryTotals(result)
  }

  useEffect(() => {
    if (selectedMonth) {
      calculateCategoryTotals(selectedMonth)
    }
  }, [selectedMonth])

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      {/* MONTHLY BAR CHART */}
      <div className="bg-white p-4 rounded shadow mb-8">
        <h2 className="font-semibold mb-4">Monthly Spending</h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyTotals}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* MONTH LIST */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-semibold mb-3">Select Month</h2>

        <div className="flex flex-wrap gap-2">
          {monthlyTotals.map((m) => (
            <button
              key={m.month}
              onClick={() => setSelectedMonth(m.month)}
              className={`px-3 py-1 rounded border ${
                selectedMonth === m.month
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100"
              }`}
            >
              {m.month}
            </button>
          ))}
        </div>
      </div>

      {/* CATEGORY PIE CHART */}
      {selectedMonth && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-4">
            Category-wise Spend — {selectedMonth}
          </h2>

          {categoryTotals.length === 0 ? (
            <p className="text-gray-500">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryTotals}
                  dataKey="total"
                  nameKey="category"
                  outerRadius={120}
                  label
                >
                  {categoryTotals.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  )
}

export default Analytics
