import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"

type Transaction = {
  id: string
  amount: number
  type: "income" | "expense"
  source: string
  category: string
  from_account?: string | null
  created_at: string
}

type CreditCard = {
  id: string
  name: string
}

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [cards, setCards] = useState<CreditCard[]>([])

  const [amount, setAmount] = useState("")
  const [type, setType] = useState<"income" | "expense">("expense")
  const [source, setSource] = useState("")
  const [category, setCategory] = useState("")
  const [selectedCard, setSelectedCard] = useState("")

  const fetchTransactions = async () => {
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false })

    if (data) setTransactions(data)
  }

  const fetchCards = async () => {
    const { data } = await supabase
      .from("credit_cards")
      .select("id, name")

    if (data) setCards(data)
  }

  useEffect(() => {
    fetchTransactions()
    fetchCards()
  }, [])

  const addTransaction = async () => {
    if (!amount || !source || !category) return

    const isCardExpense =
      type === "expense" &&
      source === "credit_card" &&
      selectedCard

    const { error } = await supabase.from("transactions").insert([
      {
        amount: Number(amount),
        type,
        source,
        category,
        credit_card_id: isCardExpense ? selectedCard : null,
      },
    ])

    if (error) {
      console.error(error)
      return
    }

    if (isCardExpense) {
      await supabase.rpc("update_credit_card_usage", {
        card_id: selectedCard,
        spend_amount: Number(amount),
      })
    }

    setAmount("")
    setSource("")
    setCategory("")
    setSelectedCard("")
    fetchTransactions()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Transactions</h1>

      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="Amount"
            className="border p-2 rounded"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <select
            className="border p-2 rounded"
            value={type}
            onChange={(e) =>
              setType(e.target.value as "income" | "expense")
            }
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>

          <select
            className="border p-2 rounded"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          >
            <option value="">Select Source</option>
            <option value="cash">Cash</option>
            <option value="bank">Bank</option>
            <option value="credit_card">Credit Card</option>
          </select>

          {type === "expense" && source === "credit_card" && (
            <select
              className="border p-2 rounded"
              value={selectedCard}
              onChange={(e) => setSelectedCard(e.target.value)}
            >
              <option value="">Select Credit Card</option>
              {cards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.name}
                </option>
              ))}
            </select>
          )}

          <input
            type="text"
            placeholder="Category"
            className="border p-2 rounded"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>

        <button
          onClick={addTransaction}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Transaction
        </button>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Recent Transactions</h2>

        {transactions.length === 0 && (
          <p className="text-gray-500">No transactions yet</p>
        )}

        <ul className="space-y-2">
          {transactions.map((t) => (
            <li key={t.id} className="flex justify-between border-b pb-1">
              <span>
                {t.category === "credit_card_payment"
                  ? `Paid Credit Card from ${t.from_account}`
                  : `${t.category} (${t.source})`}
              </span>
              <span
                className={
                  t.type === "income"
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
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
