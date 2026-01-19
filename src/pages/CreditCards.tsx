import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"

type CreditCard = {
  id: string
  name: string
  total_limit: number
  used_amount: number
  due_amount: number
}

const CreditCards = () => {
  const [cards, setCards] = useState<CreditCard[]>([])
  const [name, setName] = useState("")
  const [limit, setLimit] = useState("")
  const [payAmount, setPayAmount] = useState("")
  const [payingCardId, setPayingCardId] = useState<string | null>(null)

  const fetchCards = async () => {
    const { data } = await supabase
      .from("credit_cards")
      .select("*")

    if (data) setCards(data)
  }

  useEffect(() => {
    fetchCards()
  }, [])

  const addCard = async () => {
    if (!name || !limit) return

    await supabase.from("credit_cards").insert([
      {
        name,
        total_limit: Number(limit),
      },
    ])

    setName("")
    setLimit("")
    fetchCards()
  }

  const payCreditCard = async (card: CreditCard) => {
    if (!payAmount) return

    const amount = Number(payAmount)

    if (amount <= 0 || amount > card.due_amount) {
      alert("Invalid payment amount")
      return
    }

    // 1️⃣ Record transaction
    const { error } = await supabase.from("transactions").insert([
      {
        amount,
        type: "expense",
        source: "bank",
        from_account: "SBI Bank", // later make selectable
        category: "credit_card_payment",
        credit_card_id: card.id,
      },
    ])

    if (error) {
      console.error(error)
      return
    }

    // 2️⃣ Reduce card due
    await supabase.rpc("pay_credit_card", {
      card_id: card.id,
      pay_amount: amount,
    })

    setPayAmount("")
    setPayingCardId(null)
    fetchCards()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Credit Cards</h1>

      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="flex gap-4">
          <input
            placeholder="Card Name"
            className="border p-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            placeholder="Total Limit"
            type="number"
            className="border p-2 rounded"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
          />

          <button
            onClick={addCard}
            className="bg-blue-600 text-white px-4 rounded"
          >
            Add Card
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.id} className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold">{card.name}</h2>
            <p>Total Limit: ₹{card.total_limit}</p>
            <p>Used: ₹{card.used_amount}</p>
            <p className="text-red-600 mb-2">
              Due: ₹{card.due_amount}
            </p>

            {card.due_amount > 0 && (
              <div className="mt-2">
                <input
                  type="number"
                  placeholder="Pay amount"
                  className="border p-2 rounded w-full mb-2"
                  value={payingCardId === card.id ? payAmount : ""}
                  onChange={(e) => {
                    setPayingCardId(card.id)
                    setPayAmount(e.target.value)
                  }}
                />

                <button
                  onClick={() => payCreditCard(card)}
                  className="w-full bg-green-600 text-white py-1 rounded"
                >
                  Pay Card
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default CreditCards
