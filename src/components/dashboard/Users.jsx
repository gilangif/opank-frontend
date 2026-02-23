import { useDispatch, useSelector } from "react-redux"
import { MdOutlineMoreVert, MdPeople } from "react-icons/md"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import { toast } from "react-toastify"

import { logout } from "../../store/authSlice.js"
import { setUsers } from "../../store/danaSlice.js"

import axios from "axios"

function ModalGroupHeader({ code }) {
  const { DEFAULT_IMAGE } = useSelector((state) => state.config)

  return (
    <div className="modal-header p-0 border-0 mt-2 mb-4">
      <div className="d-flex gap-3 p-0">
        <div className="col-3">
          <img
            className="ratio ratio-1x1 rounded"
            src={code.avatar || DEFAULT_IMAGE}
            style={{ aspectRatio: "1/1", objectFit: "cover" }}
            onError={(e) => {
              e.target.onerror = null
              e.target.src = DEFAULT_IMAGE
            }}
          />
        </div>
        <div className="col d-flex flex-column justify-content-between py-1" style={{ minWidth: 0 }}>
          <div>
            <h5 className="fw-bold text-truncate w-100" style={{ maxWidth: "80%" }}>
              {code.nickname}
            </h5>
            <p className="font-8 text-truncate w-100" style={{ maxWidth: "80%" }}>
              {code.model}
            </p>
          </div>
          <div className="d-flex flex-column gap-2">
            <span className="font-8">
              community {code.user_community} {code.user_role}
            </span>
            <span className="font-8 text-info">Rp.{code.balance_display}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Users() {
  const { API_1, DEFAULT_IMAGE } = useSelector((state) => state.config)
  const { accessToken } = useSelector((state) => state.auth)
  const { users } = useSelector((state) => state.dana)

  const [code, setCode] = useState({})

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleDetail = async (data) => {
    const el = document.getElementById("modal-detail-user")
    const modal = new bootstrap.Modal(el)

    setCode(data)
    modal.show()
  }

  const checkSession = async (ALIPAYJSESSIONID) => {
    try {
      const { data } = await axios.post(API_1 + "/dana/check", { ALIPAYJSESSIONID }, { headers: { Authorization: `Bearer ${accessToken}` } })

      toast.success("session active", {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "colored",
      })

      setCode({ data, ...code })
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
        onClose: () => {
          if (status === 401) {
            dispatch(logout())
            navigate("/login", { replace: true })
          }
        },
      })
    }
  }

  const removeSession = async (nickname) => {
    try {
      const { data } = await axios.post(API_1 + "/dana/remove", { nickname }, { headers: { Authorization: `Bearer ${accessToken}` } })
      const { message } = data

      toast.warning(message, {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
        progress: undefined,
        theme: "colored",
      })

      const el = document.getElementById("modal-detail-user")
      const modal = bootstrap.Modal.getInstance(el)

      modal.hide()
      dispatch(setUsers(users.filter((x) => x.nickname !== nickname)))
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
        onClose: () => {
          if (status === 401) {
            dispatch(logout())
            navigate("/login", { replace: true })
          }
        },
      })
    }
  }

  return (
    <>
      <div className="modal fade modal-backdrop-filter" id="modal-detail-user" data-bs-backdrop="static" data-bs-keyboard="false">
        <div className="modal-dialog modal-dialog-centered d-flex h-100">
          <div className="modal-content h-100 p-2" style={{ backgroundColor: "transparent", border: 0 }}>
            <ModalGroupHeader code={code} />
            <div className="modal-body d-flex flex-column justify-content-between p-0">
              <div className="col rounded mb-4 border border-2 border-light" style={{ height: "50vh" }}>
                <SyntaxHighlighter language="javascript" className="rounded" style={vscDarkPlus} customStyle={{ margin: 0, height: "100%", background: "#1e1e1e", scrollbarWidth: "none" }}>
                  {JSON.stringify(code, null, 2)}
                </SyntaxHighlighter>
              </div>
              <div className="d-flex gap-2">
                <button className="w-100 btn btn-sm btn-secondary" onClick={() => checkSession(code.ALIPAYJSESSIONID)}>
                  CHECK SESSION
                </button>
                <button className="w-100 btn btn-sm btn-danger" onClick={() => removeSession(code.nickname)}>
                  REMOVE SESSION
                </button>
              </div>
            </div>
            <div className="modal-footer p-0 py-2 border-0 mb-3">
              <button className="w-100 btn btn-sm btn-secondary" data-bs-dismiss="modal">
                CLOSE
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex align-items-center gap-1 p-2 mb-2 disable-select pointer">
        <div className="p-1 fs-5">
          <MdPeople />
        </div>
        <span className="fw-bold">{users.length} USER REGISTER</span>
      </div>
      <div className="row g-1">
        {users.map((x, i) => {
          const { avatar, nickname, model, balance_display, ALIPAYJSESSIONID, user_community, user_username, user_role, type, data } = x

          const bc = balance_display || ""
          const cn = ["invalid", "error", "Unauthorized"].find((x) => bc.includes(x)) ? "dashboard-user-container-error" : bc ? "r" : "dashboard-user-container-warning"
          return (
            <div className="col-12 col-lg-3 col-md-4 px-2 pointer disable-select" key={i}>
              <div className={`d-flex flex-row gap-2 rounded p-1 dashboard-user-container ${cn}`}>
                <div className="dashboard-user-image-container p-1">
                  <img
                    src={avatar || DEFAULT_IMAGE}
                    className="dashboard-user-image-thumb rounded border border-2"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = DEFAULT_IMAGE
                    }}
                  />
                </div>
                <div className="col d-flex flex-column justify-content-between py-1" style={{ minWidth: 0 }}>
                  <div className="d-flex flex-column">
                    <span className="font-8 fw-bold text-uppercase afacad text-truncate w-100">{data.ktpName ? data.ktpName : model}</span>
                    <span className="font-7 text-muted text-uppercase">{type === "device" ? (data.ktpName ? model : nickname) : `${type} ${user_role}`}</span>
                    <span className="font-7 text-muted">community {user_community}</span>
                  </div>
                  <div className="d-flex flex-column">
                    <span className="font-8">Rp.{balance_display || "-"}</span>
                  </div>
                </div>
                <div className="d-flex justify-content-center align-items-center px-2 ">
                  <MdOutlineMoreVert className="text-light fs-2 fw-bold" onClick={() => handleDetail(x)} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
