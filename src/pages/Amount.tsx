import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"

const Amount = () => {
  const [income, setIncome] = useState(0)
  const [expense, setExpense] = useState(0)

  const fetchAmounts = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("amount, type")

    if (error || !data) return

    let totalIncome = 0
    let totalExpense = 0

    data.forEach((t) => {
      if (t.type === "income") {
        totalIncome += t.amount
      } else {
        totalExpense += t.amount
      }
    })

    setIncome(totalIncome)
    setExpense(totalExpense)
  }

  useEffect(() => {
    fetchAmounts()
  }, [])

  const balance = income - expense

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Amount Overview</h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Total Income</p>
          <p className="text-2xl font-bold text-green-600">
            ₹{income}
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Total Expense</p>
          <p className="text-2xl font-bold text-red-600">
            ₹{expense}
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Available Balance</p>
          <p
            className={`text-2xl font-bold ${
              balance >= 0 ? "text-blue-600" : "text-red-600"
            }`}
          >
            ₹{balance}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Amount
