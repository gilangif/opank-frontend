import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Sheet } from "react-modal-sheet"
import { toast } from "react-toastify"

import { BsFillPencilFill } from "react-icons/bs"
import { IoCloseSharp } from "react-icons/io5"
import { MdDeleteForever } from "react-icons/md"
import { IoMdAdd } from "react-icons/io"

import { setUsers, setDevices, setGroups } from "../../store/danaSlice.js"
import { logout } from "../../store/authSlice.js"

import axios from "axios"

export default function Header() {
  const { API_1, API_2, DEFAULT_IMAGE } = useSelector((state) => state.config)
  const { username, accessToken, community, role, avatar } = useSelector((state) => state.auth)

  const [isOpen, setOpen] = useState(false)

  const [text, setText] = useState("")
  const [session, setSession] = useState("")

  const dispatch = useDispatch()

  const getUsers = async () => {
    try {
      const { data } = await axios.get(API_1 + "/dana/lists", { headers: { Authorization: `Bearer ${accessToken}` } })

      const arr = data.sort((a, b) => {
        if (a.balance_display === "Unauthorized" && b.balance_display !== "Unauthorized") return -1
        if (a.balance_display !== "Unauthorized" && b.balance_display === "Unauthorized") return 1

        if (a.user_username === username && b.user_username !== username) return -1
        if (a.user_username !== username && b.user_username === username) return 1

        return new Date(b.updated_at) - new Date(a.updated_at)
      })

      dispatch(setUsers(arr))
    } catch (error) {
      const status = error.status && typeof error.status === "number" ? error.status : error.response && error.response.status ? error.response.status : 500
      const message = error.response && error.response.data.message ? error.response.data.message : "Internal Server Error"

      toast.error(message, {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "colored",
        onClose: () => {
          if (status === 401) {
            dispatch(logout())
            navigate("/login", { replace: true })
          }
        },
      })
    }
  }

  const getDevices = async () => {
    try {
      const { data } = await axios.get(API_1 + "/socket/devices", { headers: { Authorization: `Bearer ${accessToken}` } })

      const arr = data.reverse()

      dispatch(setDevices(arr))
    } catch (error) {
      const status = error.status && typeof error.status === "number" ? error.status : error.response && error.response.status ? error.response.status : 500
      const message = error.response && error.response.data.message ? error.response.data.message : "Internal Server Error"

      toast.error(message, {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "colored",
        onClose: () => {
          if (status === 401) {
            dispatch(logout())
            navigate("/login", { replace: true })
          }
        },
      })
    }
  }

  const getRecommend = async () => {
    try {
      const params = { page: 1, filter: "restrict", sort: "unmark" }

      const { data } = await axios.get(API_2 + "/groups/lists", { params })
      const { rows } = data

      dispatch(setGroups(rows))
    } catch (error) {
      const status = error.status && typeof error.status === "number" ? error.status : error.response && error.response.status ? error.response.status : 500
      const message = error.response && error.response.data.message ? error.response.data.message : "Internal Server Error"

      toast.error(message, {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "colored",
      })
    }
  }

  const addSession = async () => {
    try {
      const { data } = await axios.post(API_1 + "/dana/add", { ALIPAYJSESSIONID: session }, { headers: { Authorization: `Bearer ${accessToken}` } })
      const { ALIPAYJSESSIONID, result, message } = data

      await getUsers()

      toast.success(message, { position: "top-center", autoClose: 2000, hideProgressBar: true, closeOnClick: true, pauseOnHover: false, draggable: true, theme: "colored" })
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "UNKNOWN ERROR"
      toast.error(message, { position: "top-center", autoClose: 2000, hideProgressBar: true, closeOnClick: true, pauseOnHover: false, draggable: true, theme: "colored" })
    } finally {
      setOpen(false)
    }
  }

  useEffect(() => {
    getUsers()
    getDevices()
    getRecommend()
  }, [])

  useEffect(() => {
    const el = document.getElementById("input-session-info")

    const match = text?.match(/GZ00(.*?)GZ00/)

    if (match && match[0]) setSession(match[0])

    if (el && !text) {
      el.innerHTML = "PLEASE INPUT SESSION"
      el.style.color = "white"
    }

    if (el && text && !match) {
      el.innerHTML = "NOT FOUND"
      el.style.color = "red"
    }

    if (el && text && match) {
      el.innerHTML = match[0]
      el.style.color = "#198754"
    }
  }, [text, isOpen])

  return (
    <>
      <Sheet isOpen={isOpen} onClose={() => setOpen(false)} disableDrag={true} detent="content-height" className="custom-sheet">
        <Sheet.Container className="bg-dark disable-select pointer">
          <Sheet.Header className="px-3 py-3">
            <div className="d-flex">
              <div className="col d-flex flex-column justify-content-center align-items-start px-2">
                <h5 className="m-0 font-8">ALIPAYJSESSIONID</h5>
                <span className="m-0 font-7" id="input-session-info">
                  PLEASE INPUT SESSION
                </span>
              </div>
              <div className="d-flex justify-content-center align-items-center gap-4">
                <IoMdAdd className="fs-1 fw-bold" onClick={() => addSession()} />
                <MdDeleteForever className="fs-1 fw-bold" onClick={() => setText("")} />
                <IoCloseSharp className="fs-1 fw-bold" onClick={() => setOpen(false)} />
              </div>
            </div>
          </Sheet.Header>
          <Sheet.Content className="px-3">
            <div className="form-floating py-1 py-lg-4">
              <textarea className="form-control font-8" style={{ height: "35vh" }} id="header-input-textarea" value={text} onChange={(e) => setText(e.target.value)}></textarea>
            </div>
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop onClick={() => setOpen(false)} style={{ backgroundColor: "rgba(0,0,0,0.8)" }} />
      </Sheet>

      <div className="d-flex align-items-center py-2">
        <div className="col d-flex px-1 gap-1">
          <div className="dashboard-profile-container p-2">
            <img src={avatar || DEFAULT_IMAGE} className="dashboard-profile-image rounded-circle border border-1" />
          </div>
          <div className="d-flex flex-column justify-content-center p-0">
            <h3 className="fw-bold text-capitalize p-0 m-0">Hi, {username}</h3>
            <span className="font-8">
              {role} {community} community
            </span>
          </div>
        </div>
        <div className="d-flex justify-content-end align-items-center px-3">
          <div className="p-2 text-light rounded-circle" onClick={() => setOpen(true)}>
            <BsFillPencilFill className="fs-5 fw-bold" />
          </div>
        </div>
      </div>
    </>
  )
}
