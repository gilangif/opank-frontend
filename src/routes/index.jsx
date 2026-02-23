import { createBrowserRouter, Navigate, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"

import App from "../App"
import Dashboard from "../pages/Dashboard.jsx"
import Group from "../pages/Group.jsx"
import Login from "../pages/Login.jsx"
import Chat from "../pages/Chat.jsx"
import Claim from "../pages/Claim.jsx"
import Monitor from "../pages/Monitor.jsx"

function Auth({ children }) {
  const { accessToken } = useSelector((state) => state.auth)

  const location = useLocation()

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <Auth>
            <Dashboard />
          </Auth>
        ),
        Dashboard,
      },
      {
        path: "group",
        element: (
          <Auth>
            <Group />
          </Auth>
        ),
      },
      {
        path: "chat",
        element: (
          <Auth>
            <Chat />
          </Auth>
        ),
      },
      {
        path: "monitor",
        element: (
          <Auth>
            <Monitor />
          </Auth>
        ),
      },
      {
        path: "claim",
        element: (
          <Auth>
            <Claim />
          </Auth>
        ),
      },
    ],
  },
  // {
  //   path: "*",
  //   element: <NotFound />,
  // },
])

export default router
