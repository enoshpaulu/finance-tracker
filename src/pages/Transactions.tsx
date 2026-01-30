import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"

type Transaction = {
  id: string
  amount: number
  type: "income" | "expense"
  source: string
  category: string
  created_at: string
}

const EXPENSE_CATEGORIES = [
  "Food",
  "Rent",
  "Transport",
  "Shopping",
  "Subscriptions",
  "Utilities",
  "Travel",
  "Entertainment",
  "Healthcare",
  "Education",
  "Groceries",
  "Other",
]

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const [amount, setAmount] = useState("")
  const [source, setSource] = useState("")
  const [category, setCategory] = useState("")

  /* ---------- FETCH ---------- */
  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("type", "expense")
      .order("created_at", { ascending: false })

    if (!error && data) setTransactions(data)
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  /* ---------- ADD EXPENSE ---------- */
  const addExpense = async () => {
    if (!amount || !source || !category) {
      alert("Please select category, source and amount")
      return
    }

    await supabase.from("transactions").insert([
      {
        amount: Number(amount),
        type: "expense",
        source,
        category,
      },
    ])

    setAmount("")
    setSource("")
    setCategory("")
    fetchTransactions()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Expenses</h1>

      {/* ADD EXPENSE */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-semibold mb-3">Add Expense</h2>

        <div className="grid grid-cols-3 gap-4">
          {/* CATEGORY FIRST */}
          <select
            className="border p-2 rounded"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <input
            type="number"
            className="border p-2 rounded"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={!category}
          />

          <select
            className="border p-2 rounded"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            disabled={!category}
          >
            <option value="">Select Source</option>
            <option value="cash">Cash</option>
            <option value="bank">Bank</option>
            <option value="credit_card">Credit Card</option>
          </select>
        </div>

        <button
          onClick={addExpense}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
          disabled={!category}
        >
          Add Expense
        </button>
      </div>

      {/* EXPENSE LIST */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Recent Expenses</h2>

        {transactions.length === 0 && (
          <p className="text-gray-500">No expenses yet</p>
        )}

        <ul className="space-y-2">
          {transactions.map((t) => (
            <li
              key={t.id}
              className="flex justify-between border-b pb-1"
            >
              <span>
                {t.category} ({t.source})
              </span>
              <span className="text-red-600">
                ₹{t.amount}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Transactions
