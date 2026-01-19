import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"

type Loan = {
  id: string
  name: string
  principal: number
  emi_amount: number
  total_months: number
  remaining_months: number
  outstanding_amount: number
}

const Loans = () => {
  const [loans, setLoans] = useState<Loan[]>([])

  const [name, setName] = useState("")
  const [principal, setPrincipal] = useState("")
  const [emi, setEmi] = useState("")
  const [months, setMonths] = useState("")

  const fetchLoans = async () => {
    const { data } = await supabase
      .from("loans")
      .select("*")

    if (data) setLoans(data)
  }

  useEffect(() => {
    fetchLoans()
  }, [])

  const addLoan = async () => {
    if (!name || !principal || !emi || !months) return

    await supabase.from("loans").insert([
      {
        name,
        principal: Number(principal),
        emi_amount: Number(emi),
        total_months: Number(months),
        remaining_months: Number(months),
        outstanding_amount: Number(principal),
      },
    ])

    setName("")
    setPrincipal("")
    setEmi("")
    setMonths("")
    fetchLoans()
  }

  const payEmi = async (loan: Loan) => {
    if (loan.remaining_months <= 0) return

    // 1️⃣ Record transaction
    const { error } = await supabase.from("transactions").insert([
        {
        amount: loan.emi_amount,
        type: "expense",
        source: "bank",
        from_account: "SBI Bank", // later selectable
        category: "loan_emi",
        },
    ])

    if (error) {
        console.error(error)
        return
    }

    // 2️⃣ Update loan
    await supabase.rpc("pay_emi", {
        loan_id: loan.id,
    })

    fetchLoans()
}


  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Loans</h1>

      {/* Add Loan */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="Loan Name"
            className="border p-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="number"
            placeholder="Principal Amount"
            className="border p-2 rounded"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
          />

          <input
            type="number"
            placeholder="EMI Amount"
            className="border p-2 rounded"
            value={emi}
            onChange={(e) => setEmi(e.target.value)}
          />

          <input
            type="number"
            placeholder="Total Months"
            className="border p-2 rounded"
            value={months}
            onChange={(e) => setMonths(e.target.value)}
          />
        </div>

        <button
          onClick={addLoan}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Loan
        </button>
      </div>

      {/* Loans List */}
      <div className="grid grid-cols-3 gap-4">
        {loans.map((loan) => (
          <div
            key={loan.id}
            className="bg-white p-4 rounded shadow"
          >
            <h2 className="font-semibold">{loan.name}</h2>
            <p>Principal: ₹{loan.principal}</p>
            <p>EMI: ₹{loan.emi_amount}</p>
            <p>Total Months: {loan.total_months}</p>
            <p>Remaining Months: {loan.remaining_months}</p>
            <p className="text-red-600">
              Outstanding: ₹{loan.outstanding_amount}
            </p>
            {loan.remaining_months > 0 && (
                <button
                    onClick={() => payEmi(loan)}
                    className="mt-3 w-full bg-green-600 text-white py-1 rounded"
                >
                    Pay EMI
                </button>
                )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Loans
