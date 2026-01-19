import { Link } from "react-router-dom"

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-blue-700 text-white p-4">
      <h1 className="text-xl font-bold mb-6">Finance Tracker</h1>

      <ul className="space-y-3">
        <li>
          <Link to="/" className="hover:text-blue-200">
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/amount" className="hover:text-blue-200">
            Amount
          </Link>
        </li>
        <li>
          <Link to="/transactions" className="hover:text-blue-200">
            Transactions
          </Link>
        </li>
        <li>
          <Link to="/credit-cards" className="hover:text-blue-200">
            Credit Cards
          </Link>
        </li>
        <li>
          <Link to="/loans" className="hover:text-blue-200">
            Loans
          </Link>
        </li>
        <li>
          <Link to="/emis" className="hover:text-blue-200">
            EMIs
          </Link>
        </li>
        <li>
          <Link to="/assets" className="hover:text-blue-200">
            Assets
          </Link>
        </li>
      </ul>
    </div>
  )
}

export default Sidebar
