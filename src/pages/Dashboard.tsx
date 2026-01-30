import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"

const Dashboard = () => {
  const [totalAssets, setTotalAssets] = useState(0)
  const [creditDue, setCreditDue] = useState(0)
  const [loanDue, setLoanDue] = useState(0)

  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpense, setTotalExpense] = useState(0)

  /* ---------- FETCH DASHBOARD DATA ---------- */
  const fetchDashboardData = async () => {
    // Assets
    const { data: assets } = await supabase
      .from("assets")
      .select("current_value")

    // Credit cards
    const { data: cards } = await supabase
      .from("credit_cards")
      .select("due_amount")

    // Loans
    const { data: loans } = await supabase
      .from("loans")
      .select("outstanding_amount")

    // Income
    const { data: incomeTx } = await supabase
      .from("transactions")
      .select("amount")
      .eq("type", "income")

    // Expenses
    const { data: expenseTx } = await supabase
      .from("transactions")
      .select("amount")
      .eq("type", "expense")

    const assetTotal =
      assets?.reduce((sum, a) => sum + a.current_value, 0) || 0

    const cardTotal =
      cards?.reduce((sum, c) => sum + c.due_amount, 0) || 0

    const loanTotal =
      loans?.reduce((sum, l) => sum + l.outstanding_amount, 0) || 0

    const incomeTotal =
      incomeTx?.reduce((sum, t) => sum + t.amount, 0) || 0

    const expenseTotal =
      expenseTx?.reduce((sum, t) => sum + t.amount, 0) || 0

    setTotalAssets(assetTotal)
    setCreditDue(cardTotal)
    setLoanDue(loanTotal)
    setTotalIncome(incomeTotal)
    setTotalExpense(expenseTotal)
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const liabilities = creditDue + loanDue
  const netWorth = totalAssets - liabilities
  const savings = totalIncome - totalExpense

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* TOP SUMMARY */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Total Income</p>
          <p className="text-xl font-semibold text-green-600">
            ₹{totalIncome}
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Total Expenses</p>
          <p className="text-xl font-semibold text-red-600">
            ₹{totalExpense}
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Savings</p>
          <p
            className={`text-xl font-semibold ${
              savings >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            ₹{savings}
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Liabilities</p>
          <p className="text-xl font-semibold text-red-600">
            ₹{liabilities}
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Net Worth</p>
          <p
            className={`text-xl font-semibold ${
              netWorth >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            ₹{netWorth}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
