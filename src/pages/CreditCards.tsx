import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"

type CreditCard = {
  id: string
  name: string
  total_limit: number
  used_amount: number
  due_amount: number
  emi_blocked_amount: number
}

const CreditCards = () => {
  const [cards, setCards] = useState<CreditCard[]>([])
  const [name, setName] = useState("")
  const [limit, setLimit] = useState("")
  const [payAmount, setPayAmount] = useState("")
  const [payingCardId, setPayingCardId] = useState<string | null>(null)

  const [emiAmount, setEmiAmount] = useState("")
  const [emiTenure, setEmiTenure] = useState("")
  const [convertAmount, setConvertAmount] = useState("")
  const [convertingCardId, setConvertingCardId] = useState<string | null>(null)

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

    const { error } = await supabase.from("transactions").insert([
      {
        amount,
        type: "expense",
        source: "bank",
        bank_account_id: "5d35b8f7-d32f-47b3-9e60-1a0e4834e8d1",
        category: "credit_card_payment",
        credit_card_id: card.id,
      },
    ])

    if (error) {
      console.error("INSERT ERROR: ",error)
      alert(error.message)
      return
    }

    await supabase.rpc("pay_credit_card", {
      card_id: card.id,
      pay_amount: amount,
    })

    setPayAmount("")
    setPayingCardId(null)
    fetchCards()
  }

  const convertToEmi = async (card: CreditCard) => {
    if (!convertAmount || !emiAmount || !emiTenure) return

    const amount = Number(convertAmount)

    if (amount <= 0 || amount > card.due_amount) {
      alert("Invalid conversion amount")
      return
    }

    await supabase.rpc("convert_cc_to_emi", {
      card_id: card.id,
      amount,
      loan_name: `${card.name} EMI`,
      emi_amount: Number(emiAmount),
      tenure: Number(emiTenure),
    })

    await supabase.from("transactions").insert([
      {
        amount,
        type: "expense",
        source: "credit_card",
        category: "cc_to_emi_conversion",
        credit_card_id: card.id,
      },
    ])

    setConvertAmount("")
    setEmiAmount("")
    setEmiTenure("")
    setConvertingCardId(null)
    fetchCards()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Credit Cards</h1>

      {/* Add Card */}
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

      {/* Cards */}
      <div className="grid grid-cols-3 gap-4">
        {cards.map((card) => {
          const available = Math.max(
            card.total_limit -
              (card.used_amount + card.emi_blocked_amount),
            0
          )

          return (
            <div
              key={card.id}
              className="bg-white p-4 rounded shadow"
            >
              <h2 className="font-semibold">{card.name}</h2>

              <p>Total Limit: ₹{card.total_limit}</p>
              <p>Used: ₹{card.used_amount}</p>

              <p className="text-red-600">
                Due: ₹{card.due_amount}
              </p>

              <p className="text-sm text-gray-500">
                EMI Blocked: ₹{card.emi_blocked_amount}
              </p>

              <p className="text-green-600 font-semibold">
                Available: ₹{available}
              </p>

              {/* Pay Card */}
              {card.due_amount > 0 && (
                <div className="mt-3">
                  <input
                    type="number"
                    placeholder="Pay amount"
                    className="border p-2 rounded w-full mb-2"
                    value={
                      payingCardId === card.id ? payAmount : ""
                    }
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

              {/* Convert to EMI */}
              {card.due_amount > 0 && (
                <div className="mt-4 border-t pt-3">
                  <p className="text-sm font-semibold mb-2">
                    Convert to EMI
                  </p>

                  <input
                    type="number"
                    placeholder="Amount to convert"
                    className="border p-2 rounded w-full mb-2"
                    value={
                      convertingCardId === card.id
                        ? convertAmount
                        : ""
                    }
                    onChange={(e) => {
                      setConvertingCardId(card.id)
                      setConvertAmount(e.target.value)
                    }}
                  />

                  <input
                    type="number"
                    placeholder="Monthly EMI"
                    className="border p-2 rounded w-full mb-2"
                    value={emiAmount}
                    onChange={(e) => setEmiAmount(e.target.value)}
                  />

                  <input
                    type="number"
                    placeholder="Tenure (months)"
                    className="border p-2 rounded w-full mb-2"
                    value={emiTenure}
                    onChange={(e) => setEmiTenure(e.target.value)}
                  />

                  <button
                    onClick={() => convertToEmi(card)}
                    className="w-full bg-purple-600 text-white py-1 rounded"
                  >
                    Convert to EMI
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CreditCards
