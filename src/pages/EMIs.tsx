import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"

type Loan = {
  id: string
  name: string
  emi_amount: number
  remaining_months: number
  outstanding_amount: number
  is_active: boolean
}

const Emis = () => {
  const [loans, setLoans] = useState<Loan[]>([])

  const fetchEmis = async () => {
    const { data } = await supabase
      .from("loans")
      .select("*")
      .eq("is_active", true)

    if (data) setLoans(data)
  }

  useEffect(() => {
    fetchEmis()
  }, [])

  const totalMonthlyEmi = loans.reduce(
    (sum, loan) => sum + loan.emi_amount,
    0
  )

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">EMIs</h1>

      <div className="bg-white p-4 rounded shadow mb-6">
        <p className="text-gray-500">Total Monthly EMI</p>
        <p className="text-3xl font-bold text-red-600">
          ₹{totalMonthlyEmi}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {loans.map((loan) => (
          <div
            key={loan.id}
            className="bg-white p-4 rounded shadow"
          >
            <h2 className="font-semibold">{loan.name}</h2>
            <p>EMI: ₹{loan.emi_amount}</p>
            <p>Remaining Months: {loan.remaining_months}</p>
            <p className="text-red-600">
              Outstanding: ₹{loan.outstanding_amount}
            </p>
          </div>
        ))}
      </div>

      {loans.length === 0 && (
        <p className="text-gray-500">
          No active EMIs 🎉
        </p>
      )}
    </div>
  )
}

export default Emis
