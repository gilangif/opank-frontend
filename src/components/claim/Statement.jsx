import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState, useRef } from "react"
import { Sheet } from "react-modal-sheet"
import { toast } from "react-toastify"

import { logout } from "../../store/authSlice.js"

import axios from "axios"
import Chart from "./Chart.jsx"

const date = new Date()
const date_str = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-")

const currency = (number) => new Intl.NumberFormat("id-ID", { minimumFractionDigits: 0 }).format(number)

export default function Statement() {
  const { API_1 } = useSelector((state) => state.config)
  const { accessToken, role, community } = useSelector((state) => state.auth)

  const [statement, setStatement] = useState({})
  const [date, setDate] = useState(date_str)
  const [open, setOpen] = useState(false)

  const [detail, setDetail] = useState({})

  const temp = useRef(null)

  const handleDate = () => temp.current.showPicker?.()

  const handleSummary = (data) => {
    const el = document.getElementById("modal-detail")
    const modal = new bootstrap.Modal(el)

    setDetail(data)

    modal.show()
  }

  const getStatement = async () => {
    try {
      if (temp.date === date) return

      temp.date = date

      const { data } = await axios.get(API_1 + "/claims/statement", { headers: { Authorization: `Bearer ${accessToken}` }, params: { date } })

      setStatement(data)
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

  useEffect(() => {
    getStatement()
  }, [date])

  return (
    <>
      <div class="modal fade modal-backdrop-filter" id="modal-detail" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content bg-light">
            <div class="modal-header">
              <div>
                <h1 class="modal-title fs-5 text-dark text-uppercase" id="exampleModalLabel">
                  {detail.type}
                </h1>
                <p className="font-8 text-dark m-0">MTD Rp.{detail.month}</p>
              </div>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div className="table-responsive disable-scroll disable-select pointer w-100">
                <table className="table table-sm table-striped table-light table-transparent">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">AMOUNT</th>
                      <th scope="col">CLAIM</th>
                      <th scope="col">TOTAL</th>
                      <th scope="col">PERCENTAGE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail?.summary?.map((x, i) => {
                      return (
                        <tr key={i}>
                          <td scope="row">{i + 1}</td>
                          <td>RP {x.amount}</td>
                          <td>{x.claim}</td>
                          <td>{x.total}</td>
                          <td>{x.percentage > 0 ? x.percentage.toFixed(1) : 0}%</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">
                CLOSE
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-2">
        <div>
          <h1 className="disable-select m-0" onClick={handleDate} style={{ fontSize: "2.6rem" }}>
            {date}
          </h1>
          <div className="mt-3 mb-2">
            <span className="font-85 fw-bold">Monthly Statement</span>
          </div>
          <div className="d-flex gap-2">
            <span className="font-85 fw-bold">TODAY :</span>
            <span className="font-85">Rp.{currency(statement?.global?.today?.amount || 0)}</span>
            <span className="font-85">({statement?.global?.today?.total} transaction)</span>
          </div>
          <div className="d-flex gap-3">
            <span className="font-85 fw-bold">MTD :</span>
            <span className="font-85">Rp.{currency(statement?.global?.mtd?.amount || 0)}</span>
            <span className="font-85">({statement?.global?.mtd?.total} transaction)</span>
          </div>
          <input ref={temp} value={date} type="date" style={{ position: "absolute", opacity: 0, pointerEvents: "none" }} onChange={(e) => setDate(e.target.value)} />
        </div>

        <Chart summary={statement?.global?.summary} />

        <div className="col flex-grow-1 d-flex flex-column py-1">
          {Object.keys(statement).map((key, i) => {
            if (key == "owner") return

            if (key === "global") return

            const owner = statement["owner"]
            const data = Object.keys(statement[key])
              .map((name) => ({ name, ...statement[key][name] }))
              .sort((a, b) => b.today.amount - a.today.amount)

            if (data.length === 0) return

            return (
              <div key={i}>
                <div className="py-3 disable-select">
                  <p className="text-uppercase fw-bold">SUMMARY BY {key}</p>

                  <table className="table table-sm table-striped table-transparent">
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">NAME</th>
                        <th scope="col">TODAY</th>
                        <th scope="col">MTD</th>
                        <th scope="col">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((x, j) => {
                        let censor = false
                        let creator = false

                        if (key === "model" && !owner.find((y) => y === x.name)) {
                          censor = true
                          creator = true
                        }

                        if (key === "community" && x.name !== community) {
                          censor = true
                          creator = true
                        }

                        if (key === "type") censor = false
                        if (role === "admin") censor = false

                        const today = censor ? String(x.today.amount).replace(/./g, "*") : currency(x.today.amount)
                        const month = censor ? String(x.mtd.amount).replace(/./g, "*") : currency(x.mtd.amount)

                        const type = `${key} ${x.name}`

                        let name = ""

                        if (censor && /^[0-9]+$/.test(x.name)) {
                          for (let z = 0; z < x.name.length; z++) {
                            if (z > 3 && z <= 7) name += "*"
                            else name += x.name[z]
                          }
                        } else {
                          name = x.name
                        }

                        const obj = { type, today, month, summary: x.summary.map((x) => ({ ...x, amount: censor ? String(x.amount).replace(/./g, "*") : currency(x.amount) })) }

                        return (
                          <tr key={j} onClick={() => handleSummary(obj)}>
                            <td>{j + 1}</td>
                            <td className={creator ? "" : "fw-bold text-warning"}>{name.split(" ").slice(0, 3).join(" ")}</td>
                            <td>RP {today}</td>
                            <td>RP {month}</td>
                            <td>{x.today.percentage ? x.today.percentage.toFixed(2) : 0}%</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
