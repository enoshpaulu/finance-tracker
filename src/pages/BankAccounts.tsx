import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"

type BankAccount = {
  id: string
  name: string
  account_type: string
  notes?: string | null
}

const BankAccounts = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([])

  const [name, setName] = useState("")
  const [type, setType] = useState("")
  const [notes, setNotes] = useState("")

  /* ---------- FETCH ---------- */
  const fetchAccounts = async () => {
    const { data, error } = await supabase
      .from("bank_accounts")
      .select("*")
      .order("created_at", { ascending: false })

    if (!error && data) setAccounts(data)
  }

  useEffect(() => {
    fetchAccounts()
  }, [])

  /* ---------- ADD BANK ---------- */
  const addAccount = async () => {
    if (!name || !type) return

    await supabase.from("bank_accounts").insert([
      {
        name,
        account_type: type,
        notes,
      },
    ])

    setName("")
    setType("")
    setNotes("")
    fetchAccounts()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Bank Accounts</h1>

      {/* ADD BANK */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-semibold mb-3">Add Bank Account</h2>

        <div className="grid grid-cols-3 gap-4">
          <input
            className="border p-2 rounded"
            placeholder="Bank Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <select
            className="border p-2 rounded"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">Account Type</option>
            <option value="Savings">Savings</option>
            <option value="Current">Current</option>
            <option value="Salary">Salary</option>
          </select>

          <input
            className="border p-2 rounded"
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <button
          onClick={addAccount}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Bank
        </button>
      </div>

      {/* BANK LIST */}
      <div className="grid grid-cols-3 gap-4">
        {accounts.map((acc) => (
          <div key={acc.id} className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">{acc.name}</h3>
            <p className="text-sm text-gray-500">{acc.account_type}</p>

            {acc.notes && (
              <p className="text-sm mt-2 text-gray-600">
                {acc.notes}
              </p>
            )}
          </div>
        ))}

        {accounts.length === 0 && (
          <p className="text-gray-500">No bank accounts added</p>
        )}
      </div>
    </div>
  )
}

export default BankAccounts
