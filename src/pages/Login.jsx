import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

import { login } from "../store/authSlice"

import axios from "axios"

export default function Login() {
  const { API_1, API_2, DEFAULT_IMAGE } = useSelector((state) => state.config)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const auth = async (e) => {
    try {
      e.preventDefault()

      const { data } = await axios.post(API_1 + "/users/auth", { username, password })
      const { id, role, avatar, accessToken, refreshToken } = data

      const message = `Welcome back ${username}`

      toast.success(message, { position: "top-center", autoClose: 1000, hideProgressBar: true, closeOnClick: true, pauseOnHover: false, draggable: true, theme: "colored" })

      dispatch(login(data))
      navigate("/")
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "UNKNOWN ERROR"

      console.log(error)
      toast.error(message, { position: "top-center", autoClose: 1000, hideProgressBar: true, closeOnClick: true, pauseOnHover: false, draggable: true, theme: "colored" })
    }
  }

  return (
    <div className="container vh-100 d-flex justify-content-center align-items-center">
      <form onSubmit={auth} className="form-signin" style={{ maxWidth: "420px" }}>
        <div className="text-center mb-6">
          <img
            className="mb-4"
            src="https://media.tenor.com/TQTVSmxhX5kAAAAi/apu-apustaja-apu.gif"
            alt=""
            width="110"
            height="110"
            onError={(e) => {
              e.target.onerror = null
              e.target.src = DEFAULT_IMAGE
            }}
          />
          <h1 className="h3 mb-2 font-weight-normal">Welcome back !</h1>
          <span className="font-8">You can sign in to access with your existing account.</span>
        </div>

        <div className="input-group input-group-sm mt-4 mb-3">
          <input type="text" className="form-control" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>

        <div className="input-group input-group-sm mb-5">
          <input type="password" id="inputPassword" className="form-control" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <button className="btn btn-lg btn-sm btn-primary btn-block w-100 p-2" type="submit">
          Sign in
        </button>
      </form>
    </div>
  )
}
