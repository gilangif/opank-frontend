import { useRef } from "react"
import { useEffect } from "react"
import { useSelector } from "react-redux"
import { toast } from "react-toastify"
import { io } from "socket.io-client"
import { useState } from "react"

import { initialState } from "../store/config.js"

const { API_1 } = initialState

import timestamp from "../utils/timestamp.js"

const socket = io(API_1, { autoConnect: false, reconnection: true, reconnectionAttempts: Infinity })

export default function Chat() {
  const { username } = useSelector((state) => state.auth)

  const [message, setMessage] = useState([])

  useEffect(() => {
    const handleConnect = async () => socket.emit("hs", { model: `${username} web`, start: new Date() })

    const handleHS = async (data) => {
      const { id, model, start, community, online, status } = data
      const text = `${model} connected`

      if (status === "private") {
        toast.success(text, { position: "top-right", autoClose: 2000, hideProgressBar: false, closeOnClick: false, pauseOnHover: false, draggable: true, progress: undefined, theme: "colored" })
      } else {
        toast.info(text, { position: "top-right", autoClose: 2000, hideProgressBar: false, closeOnClick: true, pauseOnHover: false, draggable: true, progress: undefined, theme: "colored" })
      }

      console.log(status === "private" ? "\x1b[32m" : "\x1b[35m")
      console.log(`# ${timestamp()} (${online} online)`)
      console.log(`  ${model} connected (${id})`)
      console.log(`  comunity ${community}`)
      console.log("\x1b[0m")
    }

    const handleDisconnect = (data) => {
      const { id, model, start, community, duration, online } = data
      const text = `${model} disconnected (${duration})`

      toast.warning(text, { position: "top-right", autoClose: 2000, hideProgressBar: false, closeOnClick: true, pauseOnHover: false, draggable: true, progress: undefined, theme: "colored" })

      console.log("\x1b[33m")
      console.log(`# ${timestamp()} (${online} online)`)
      console.log(`  ${model} disconnected (${id})`)
      console.log(`  comunity ${community}`)
      console.log("\x1b[33m")
      console.log(`  start    : ${timestamp(new Date(start))}`)
      console.log(`  end      : ${timestamp(new Date())}`)
      console.log(`  duration : ${duration}`)
      console.log("\x1b[0m")
    }

    const handleDisconnectServer = () => {
      const text = "server network disconnect"
      toast.warning(text, { position: "top-right", autoClose: 2000, hideProgressBar: false, closeOnClick: true, pauseOnHover: false, draggable: true, progress: undefined, theme: "colored" })

      console.log("\x1b[33m")
      console.log(`# ${timestamp()}`)
      console.log(`  Server network disconnected`)
      console.log("\x1b[0m")
    }

    const handleConnectError = (err) => {
      console.log("\x1b[31m")
      console.log(`# ${timestamp(null, "time")} : socket connection ${err}`)
      console.log("\x1b[0m")
    }

    const handleMessage = (msg) => {
      const id = msg.id
      const key = msg.key
      const title = msg.group.title
      const chat = msg.chat
      const name = msg.name
      const created = timestamp(msg.created, "time")

      const unique = `${msg.key}_${msg.id}`

      setMessage((prev) => {
        const newMsg = { id, key, unique, title, name, chat, created }

        const filtered = prev.filter((m) => m.unique !== unique)

        return [newMsg, ...filtered].slice(0, 100)
      })
    }

    if (!socket.connected) {
      socket.open()

      socket.on("connect", handleConnect)
      socket.on("hs", handleHS)
      socket.on("dc", handleDisconnect)
      socket.on("disconnect", handleDisconnectServer)
      socket.on("connect_error", handleConnectError)

      socket.on("message", handleMessage)
    }

    return () => {
      socket.removeAllListeners()
      socket.close()
    }
  }, [])

  return (
    <>
      <div className="container-fluid d-flex flex-column justify-content-end gap-2 py-3" style={{ maHeight: "94vh" }}>
        {message.map((x, i) => {
          return (
            <div className="d-flex gap-2" key={x.unique}>
              <div className="d-flex align-items-start py-1">
                <div className="bg-success p-2 d-flex align-items-center justify-content-center rounded-circle border border-1" style={{ width: "40px", height: "40px" }}>
                  <span className="fw-bold">{x.key}</span>
                </div>
              </div>
              <div className="bg-light text-dark rounded d-flex flex-column align-items-start justify-content-center px-2 py-2 font-7 text-wrap">
                <div className="p-0 mb-2">
                  <p className="m-0 fw-bold font-8">{x.name}</p>
                  <p className="m-0 font-7">{x.title}</p>
                </div>
                <span>{x.chat}</span>
              </div>
            </div>
          )
        })}
      </div>

      {}
    </>
  )
}
