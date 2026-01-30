import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"

type Transaction = {
  id: string
  amount: number
  category: string
  source: string
  created_at: string
}

const Amount = () => {
  const [income, setIncome] = useState<Transaction[]>([])
  const [totalIncome, setTotalIncome] = useState(0)

  // Add income form
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [source, setSource] = useState("bank")

  /* ---------- FETCH INCOME ---------- */
  const fetchIncome = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("id, amount, category, source, created_at")
      .eq("type", "income")
      .order("created_at", { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setIncome(data ?? [])

    const total =
      data?.reduce((sum, t) => sum + t.amount, 0) || 0
    setTotalIncome(total)
  }

  useEffect(() => {
    fetchIncome()
  }, [])

  /* ---------- ADD INCOME ---------- */
  const addIncome = async () => {
    if (!amount || !category) return

    await supabase.from("transactions").insert([
      {
        amount: Number(amount),
        type: "income",
        source,
        category,
      },
    ])

    setAmount("")
    setCategory("")
    setSource("bank")
    fetchIncome()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Income</h1>

      {/* SUMMARY */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <p className="text-sm text-gray-500">Total Income</p>
        <p className="text-2xl font-semibold text-green-600">
          ₹{totalIncome}
        </p>
      </div>

      {/* ADD INCOME */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-semibold mb-3">Add Income</h2>

        <div className="grid grid-cols-3 gap-4">
          <input
            type="number"
            className="border p-2 rounded"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <input
            className="border p-2 rounded"
            placeholder="Category (Salary, Freelance)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <select
            className="border p-2 rounded"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          >
            <option value="bank">Bank</option>
            <option value="cash">Cash</option>
          </select>
        </div>

        <button
          onClick={addIncome}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
        >
          Add Income
        </button>
      </div>

      {/* INCOME LIST */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-3">Income History</h2>

        {income.length === 0 && (
          <p className="text-gray-500">No income recorded</p>
        )}

        <ul className="space-y-2">
          {income.map((t) => (
            <li
              key={t.id}
              className="flex justify-between border-b pb-1"
            >
              <span>
                {t.category} ({t.source})
              </span>
              <span className="text-green-600">
                ₹{t.amount}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Amount
