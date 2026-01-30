import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"

type Asset = {
  id: string
  name: string
  type: string
  invested_amount: number
  current_value: number
  notes?: string | null
}

const assetTypes = [
  "Mutual Fund",
  "Fixed Deposit",
  "Stock",
  "Crypto",
  "Gold",
  "Land",
  "Other",
]

const DEFAULT_BANK_ID = "5d35b8f7-d32f-47b3-9e60-1a0e4834e8d1" // temp

const Assets = () => {
  const [assets, setAssets] = useState<Asset[]>([])

  // Add asset
  const [name, setName] = useState("")
  const [type, setType] = useState("")
  const [invested, setInvested] = useState("")
  const [current, setCurrent] = useState("")
  const [notes, setNotes] = useState("")

  // Invest / Withdraw
  const [actionAmount, setActionAmount] = useState("")
  const [activeAssetId, setActiveAssetId] = useState<string | null>(null)

  // Edit current value
  const [editValue, setEditValue] = useState("")
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null)

  /* ---------- FETCH ---------- */
  const fetchAssets = async () => {
    const { data, error } = await supabase
      .from("assets")
      .select("*")
      .order("created_at", { ascending: false })

    if (!error && data) setAssets(data)
  }

  useEffect(() => {
    fetchAssets()
  }, [])

  /* ---------- ADD ASSET ---------- */
  const addAsset = async () => {
    if (!name || !type || !invested || !current) return

    await supabase.from("assets").insert([
      {
        name,
        type,
        invested_amount: Number(invested),
        current_value: Number(current),
        notes,
      },
    ])

    setName("")
    setType("")
    setInvested("")
    setCurrent("")
    setNotes("")
    fetchAssets()
  }

  /* ---------- INVEST ---------- */
  const investInAsset = async (asset: Asset) => {
    if (!actionAmount) return
    const amount = Number(actionAmount)
    if (amount <= 0) return

    // Bank expense transaction
    await supabase.from("transactions").insert([
      {
        amount,
        type: "expense",
        source: "bank",
        category: "asset_investment",
        asset_id: asset.id,
        bank_account_id: DEFAULT_BANK_ID,
      },
    ])

    // Update asset
    await supabase
      .from("assets")
      .update({
        invested_amount: asset.invested_amount + amount,
        current_value: asset.current_value + amount,
      })
      .eq("id", asset.id)

    setActionAmount("")
    setActiveAssetId(null)
    fetchAssets()
  }

  /* ---------- WITHDRAW ---------- */
  const withdrawFromAsset = async (asset: Asset) => {
    if (!actionAmount) return
    const amount = Number(actionAmount)

    if (amount <= 0 || amount > asset.current_value) {
      alert("Invalid withdrawal amount")
      return
    }

    // Bank income transaction
    await supabase.from("transactions").insert([
      {
        amount,
        type: "income",
        source: "bank",
        category: "asset_withdrawal",
        asset_id: asset.id,
        bank_account_id: DEFAULT_BANK_ID,
      },
    ])

    // Update asset
    await supabase
      .from("assets")
      .update({
        current_value: asset.current_value - amount,
      })
      .eq("id", asset.id)

    setActionAmount("")
    setActiveAssetId(null)
    fetchAssets()
  }

  /* ---------- UPDATE CURRENT VALUE (MARKET CHANGE) ---------- */
  const updateCurrentValue = async (asset: Asset) => {
    if (!editValue) return
    const value = Number(editValue)
    if (value < 0) return

    await supabase
      .from("assets")
      .update({ current_value: value })
      .eq("id", asset.id)

    setEditValue("")
    setEditingAssetId(null)
    fetchAssets()
  }

  /* ---------- TOTALS ---------- */
  const totalInvested = assets.reduce(
    (sum, a) => sum + a.invested_amount,
    0
  )

  const totalValue = assets.reduce(
    (sum, a) => sum + a.current_value,
    0
  )

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Assets</h1>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Total Invested</p>
          <p className="text-xl font-semibold">₹{totalInvested}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-gray-500">Current Value</p>
          <p
            className={`text-xl font-semibold ${
              totalValue >= totalInvested
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            ₹{totalValue}
          </p>
        </div>
      </div>

      {/* ADD ASSET */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-semibold mb-3">Add Asset</h2>

        <div className="grid grid-cols-2 gap-4">
          <input
            className="border p-2 rounded"
            placeholder="Asset Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <select
            className="border p-2 rounded"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">Select Type</option>
            {assetTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <input
            type="number"
            className="border p-2 rounded"
            placeholder="Invested Amount"
            value={invested}
            onChange={(e) => setInvested(e.target.value)}
          />

          <input
            type="number"
            className="border p-2 rounded"
            placeholder="Current Value"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />

          <input
            className="border p-2 rounded col-span-2"
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <button
          onClick={addAsset}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Asset
        </button>
      </div>

      {/* ASSET LIST */}
      <div className="grid grid-cols-3 gap-4">
        {assets.map((a) => (
          <div key={a.id} className="bg-white p-4 rounded shadow">
            <h3 className="font-semibold">{a.name}</h3>
            <p className="text-sm text-gray-500">{a.type}</p>

            <p className="mt-2">Invested: ₹{a.invested_amount}</p>
            <p
              className={
                a.current_value >= a.invested_amount
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              Current: ₹{a.current_value}
            </p>

            {/* INVEST / WITHDRAW */}
            <input
              type="number"
              placeholder="Amount"
              className="border p-2 rounded w-full mt-3"
              value={activeAssetId === a.id ? actionAmount : ""}
              onChange={(e) => {
                setActiveAssetId(a.id)
                setActionAmount(e.target.value)
              }}
            />

            <div className="flex gap-2 mt-2">
              <button
                onClick={() => investInAsset(a)}
                className="flex-1 bg-green-600 text-white py-1 rounded"
              >
                Invest
              </button>

              <button
                onClick={() => withdrawFromAsset(a)}
                className="flex-1 bg-red-600 text-white py-1 rounded"
              >
                Withdraw
              </button>
            </div>

            {/* UPDATE CURRENT VALUE */}
            <div className="mt-3 border-t pt-3">
              <input
                type="number"
                placeholder="Update current value"
                className="border p-2 rounded w-full mb-2"
                value={editingAssetId === a.id ? editValue : ""}
                onChange={(e) => {
                  setEditingAssetId(a.id)
                  setEditValue(e.target.value)
                }}
              />

              <button
                onClick={() => updateCurrentValue(a)}
                className="w-full bg-blue-500 text-white py-1 rounded"
              >
                Update Value
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Assets
