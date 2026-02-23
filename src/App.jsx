import { Outlet } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"

import Navbar from "./components/Navbar.jsx"

function App() {
  return (
    <>
      <div style={{ backgroundColor: "black", height: "100%", minHeight: "100vh" }}>
        <ToastContainer />
        <Navbar />
        <div className="mb-5 pb-5">
          <Outlet />
        </div>
      </div>
    </>
  )
}

export default App
