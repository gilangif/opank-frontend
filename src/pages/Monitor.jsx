import { useSelector } from "react-redux"
import { useState } from "react"
import { useEffect } from "react"
import { toast } from "react-toastify"
import { Sheet } from "react-modal-sheet"

import { MdRestartAlt, MdStopCircle } from "react-icons/md"

import { Card, CardContent, Typography } from "@mui/material"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"

import axios from "axios"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#06e25aff", "#221e1dff", "#be2082ff"]

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload

    return (
      <div style={{ background: "rgba(0,0,0,0.8)", color: "#fff" }} className="ts-8 p-2 rounded">
        <p className="my-1 mx-0">Name: {data.name}</p>
        <p className="my-1 mx-0">ID: {data.id}</p>
        <p className="my-1 mx-0">PID: {data.pid}</p>
        <p className="my-1 mx-0">Used: {data.used.toFixed(2)} MB</p>
      </div>
    )
  }
  return null
}

function SheetList({ Icon, title, color, onClick }) {
  return (
    <>
      <div className="d-flex flex-row gap-2 disable-select pointer py-2" onClick={onClick}>
        <div className="sheet-list-icon-box px-1">
          <Icon className={`${color} fs-4`} />
        </div>

        <div className="col d-flex align-items-center">
          <p className="font-8 m-0 text-uppercase text-light">{title}</p>
        </div>
      </div>
      <hr className="m-1" />
    </>
  )
}

export default function Monitor() {
  const { API_2 } = useSelector((state) => state.config)

  const [platform, setPlatform] = useState("platform")
  const [lists, setLists] = useState([{ name: "Unknown", id: 0, pid: 0, used: 1, status: "stopped" }])
  const [memory, setMemory] = useState({ total: 0, used: 0, percentage: 0 })
  const [cpus, setCpus] = useState([])
  const [swap, setSwap] = useState({ total: 0, free: 0, used: 0, percentage: 0 })

  const [temp, setTemp] = useState({})

  const [open, setOpen] = useState(false)

  const handleAction = async (action) => {
    try {
      setOpen(false)
      const { data } = await axios.post(API_2 + "/monitor/control", { id: temp.id, action })
      const { message } = data

      await getMonitor()

      toast.success(message, { position: "top-center", autoClose: 2000, hideProgressBar: true, closeOnClick: true, pauseOnHover: false, draggable: true, theme: "colored" })
    } catch (error) {
      const status = error.status && typeof error.status === "number" ? error.status : error.response && error.response.status ? error.response.status : 500
      const message = error.response && error.response.data.message ? error.response.data.message : "Internal Server Error"

      toast.error(message, { position: "top-center", autoClose: 1500, hideProgressBar: true, closeOnClick: true, pauseOnHover: false, draggable: true, progress: undefined, theme: "colored" })
    }
  }

  const getMonitor = async () => {
    try {
      const { data } = await axios(API_2 + "/monitor/detail")
      const { platform, memory, cpus, swap, lists } = data

      setPlatform(platform)
      setMemory(memory)
      setCpus(cpus)
      setSwap(swap)

      if (lists.length > 0) setLists(lists.map((x) => ({ ...x, used: Math.round(x.used) })))
    } catch (error) {
      const status = error.status && typeof error.status === "number" ? error.status : error.response && error.response.status ? error.response.status : 500
      const message = error.response && error.response.data.message ? error.response.data.message : "Internal Server Error"

      toast.error(message, { position: "top-center", autoClose: 1500, hideProgressBar: true, closeOnClick: true, pauseOnHover: false, draggable: true, progress: undefined, theme: "colored" })
    }
  }

  useEffect(() => {
    getMonitor()
  }, [])

  return (
    <div className="p-2">
      <div className="py-4 text-center">
        <h3 className="fw-bold text-uppercase">{platform}</h3>
        <p className="font-8 m-1">
          CPU {cpus.length} CORE (
          {cpus
            .map((x) => x.used)
            .reduce((a, b) => a + b, 0)
            .toFixed(1)}
          %)
        </p>
        <p className="font-8 m-1">
          SWAP {Math.round(swap.used)} / {Math.round(swap.total)} MB ({swap.percentage.toFixed(1)}%)
        </p>
        <p className="font-8 m-1">
          RAM {Math.round(memory.used)} / {Math.round(memory.total)} MB ({memory.percentage.toFixed(1)}%)
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300} style={{ background: "transparent" }}>
        <PieChart style={{ background: "transparent" }}>
          <Pie data={lists} dataKey="used" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
            {lists.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <div className="table-responsive w-100 px-3 py-5">
        <table className="table table-sm table-striped table-transparent">
          <thead>
            <tr>
              <th>#</th>
              <th>NAME</th>
              <th>PM2 ID</th>
              <th>PID</th>
              <th>STATUS</th>
              <th>USED</th>
            </tr>
          </thead>
          <tbody>
            {lists.map((x, i) => {
              const { name, id, pid, used, status } = x

              return (
                <tr
                  key={i}
                  onClick={() => {
                    setTemp(x)
                    setOpen(true)
                  }}
                >
                  <td>{i + 1}</td>
                  <td>{name}</td>
                  <td>{id}</td>
                  <td>{pid}</td>
                  <td className={status === "stopped" ? "text-danger" : ""}>{status}</td>
                  <td>{used} MB</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Sheet isOpen={open} onClose={() => setOpen(false)} disableDrag={true} detent="content-height" className="custom-sheet">
        <Sheet.Container className="bg-dark disable-select">
          <Sheet.Header className="px-3 py-3">
            <div className="d-flex">
              <div className="col d-flex flex-column justify-content-center align-items-start px-2">
                <h5 className="m-0 text-uppercase">
                  PROCESS {temp.name} ({temp.used} MB)
                </h5>
                <p className="m-0 ts-7" id="input-session-info">
                  PM2 ID {temp.id} WITH PID {temp.pid} ({temp.status})
                </p>
              </div>
              <div className="d-flex justify-content-center align-items-center gap-3">
                <span className="material-symbols-outlined p-2 fw-bold" onClick={() => setOpen(false)}>
                  close
                </span>
              </div>
            </div>
          </Sheet.Header>
          <Sheet.Content className="px-3 py-2">
            <div className="row g-2">
              <SheetList Icon={MdRestartAlt} title="restart" onClick={() => handleAction("restart")} />
              <SheetList Icon={MdStopCircle} title="stop" color={temp.status === "online" ? "text-success" : "text-danger"} fill={temp.status === "stopped"} onClick={() => handleAction("stop")} />
              <SheetList Icon={MdStopCircle} title="delete" color="text-danger" onClick={() => handleAction("delete")} />
            </div>
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop onClick={() => setOpen(false)} style={{ backgroundColor: "rgba(0,0,0,0.8)" }} />
      </Sheet>
    </div>
  )
}
