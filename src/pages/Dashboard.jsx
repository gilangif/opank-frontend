import Header from "../components/dashboard/Header.jsx"
import Users from "../components/dashboard/Users.jsx"
import Devices from "../components/dashboard/Devices.jsx"
import Recommend from "../components/dashboard/Recommend.jsx"

export default function Dashboard() {
  return (
    <>
      <div>
        <div className="mb-3">
          <Header />
        </div>
        <div className="mb-3">
          <Recommend />
        </div>
        <div className="mb-3">
          <Users />
        </div>
        <div className="mb-3">
          <Devices />
        </div>
      </div>
    </>
  )
}
