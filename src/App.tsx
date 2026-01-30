import { BrowserRouter, Routes, Route } from "react-router-dom"
import Sidebar from "./components/Sidebar"

import Dashboard from "./pages/Dashboard"
import Amount from "./pages/Amount"
import Transactions from "./pages/Transactions"
import CreditCards from "./pages/CreditCards"
import Loans from "./pages/Loans"
import EMIs from "./pages/EMIs"
import Assets from "./pages/Assets"
import BankAccounts from "./pages/BankAccounts"
import Analytics from "./pages/Analytics"

function App() {
  return (
    <BrowserRouter>
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/amount" element={<Amount />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/credit-cards" element={<CreditCards />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="/emis" element={<EMIs />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/banks" element={<BankAccounts/>} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
