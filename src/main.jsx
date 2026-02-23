import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import { Provider } from "react-redux"

import { store } from "./store/index.js" 

import router from "./routes/index.jsx"

import "bootstrap/dist/css/bootstrap.min.css"
import "./index.css"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
)
