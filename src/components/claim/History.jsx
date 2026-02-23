import { useSearchParams } from "react-router-dom"
import { RiResetLeftFill, RiCloseLargeLine, RiFilterFill, RiPencilFill } from "react-icons/ri"
import { useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import { Sheet } from "react-modal-sheet"
import { toast } from "react-toastify"

import { logout } from "../../store/authSlice.js"

import timestamp from "../../utils/timestamp.js"

import axios from "axios"

function Pagination({ pages, pagination }) {
  const [searchParams, setSearchParams] = useSearchParams()

  return (
    <div className="d-flex justify-content-center align-items-center py-3 position-relative disable-select pointer" style={{ zIndex: 10 }}>
      <nav>
        <ul className="pagination disable-select pointer">
          <li
            className={`page-item disable-select pointer ${pagination.prev_page ? "" : "disabled"}`}
            onClick={() => {
              const params = new URLSearchParams(searchParams)

              params.set("page", pagination.prev_page)
              setSearchParams(params)
            }}
          >
            <a className="page-link disable-select pointer" aria-label="Previous">
              <span aria-hidden="true">&laquo;</span>
            </a>
          </li>
          {pages.map((x, i) => {
            const params = new URLSearchParams(searchParams)
            const current = params.get("page")

            return (
              <li
                className={`page-item disable-select pointer ${current == x ? "active" : ""}`}
                onClick={() => {
                  params.set("page", x)
                  setSearchParams(params)
                }}
                key={i}
              >
                <a className="page-link disable-select pointer">{x}</a>
              </li>
            )
          })}

          <li
            className={`page-item disable-select pointer ${pagination.next_page ? "" : "disabled"}`}
            onClick={() => {
              const params = new URLSearchParams(searchParams)

              params.set("page", pagination.next_page)
              setSearchParams(params)
            }}
          >
            <a className="page-link disable-select pointer" aria-label="Next">
              <span aria-hidden="true">&raquo;</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  )
}

function FilterSheets() {
  const { API_1 } = useSelector((state) => state.config)
  const { accessToken } = useSelector((state) => state.auth)

  const [searchParams, setSearchParams] = useSearchParams()

  const [date, setDate] = useState(() => searchParams.get("date") || "")
  const [type, setType] = useState(() => searchParams.get("type") || "")
  const [limit, setLimit] = useState(() => searchParams.get("limit") || 50)
  const [model, setModel] = useState(() => searchParams.get("model") || "")
  const [order, setOrder] = useState(() => searchParams.get("sort") || "DESC")
  const [community, setCommunity] = useState(() => searchParams.get("community") || "")

  const [filter, setFilter] = useState({})

  const [open, setOpen] = useState(false)

  const handleFilter = () => {
    const params = new URLSearchParams(searchParams)

    params.set("date", date)
    params.set("type", type)
    params.set("limit", limit)
    params.set("model", model)
    params.set("order", order)
    params.set("community", community)

    setSearchParams(params)
    setOpen(false)
  }

  const getFilters = async () => {
    try {
      const { data } = await axios.get(API_1 + "/claims/filters", { headers: { Authorization: `Bearer ${accessToken}` } })
      setFilter(data)
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
    getFilters()
  }, [])

  return (
    <>
      <Sheet isOpen={open} onClose={() => setOpen(false)} detent="content-height" className="custom-sheet">
        <Sheet.Container className="bg-dark">
          <Sheet.Header className="px-3 py-3">
            <div className="d-flex text-light">
              <div className="col d-flex flex-column justify-content-center align-items-start px-2">
                <h6 className="m-0">CLAIM FILTER</h6>
                <p className="m-0 mt-1 font-8">click filter icon to apply filter</p>
              </div>
              <div className="d-flex justify-content-center align-items-center gap-4 px-3">
                <RiResetLeftFill
                  className="fs-3"
                  onClick={() => {
                    setOpen(false)
                    setSearchParams({})
                  }}
                />
                <RiFilterFill className="fs-3" onClick={() => handleFilter()} />
                <RiCloseLargeLine className="fs-3" onClick={() => setOpen(false)} />
              </div>
            </div>
          </Sheet.Header>
          <Sheet.Content className="px-3 py-2 p-lg-3">
            <div className="py-3">
              <div className="input-group input-group-sm mb-3">
                <label className="disable-select input-group-text" style={{ width: "25%" }}>
                  DATE
                </label>
                <input type="date" className="form-control" placeholder="" min="1" value={date} onChange={(e) => setDate(e.target.value)}></input>
              </div>

              <div className="input-group input-group-sm mb-3">
                <label className="disable-select input-group-text" style={{ width: "25%" }}>
                  ORDER
                </label>
                <select className="form-select" value={order} onChange={(e) => setOrder(e.target.value)}>
                  <option value="DESC">DESC</option>
                  <option value="ASC">ASC</option>
                </select>
              </div>

              <div className="input-group input-group-sm mb-3">
                <label className="disable-select input-group-text" style={{ width: "25%" }}>
                  MODEL
                </label>
                <select className="form-select" value={model} onChange={(e) => setModel(e.target.value)}>
                  <option value="">ALL MODEL</option>

                  {filter?.models?.map((x, i) => {
                    return (
                      <option key={i} value={x}>
                        {x}
                      </option>
                    )
                  })}
                </select>
              </div>

              <div className="input-group input-group-sm mb-3">
                <label className="disable-select input-group-text" style={{ width: "25%" }}>
                  COMMUNITY
                </label>
                <select className="form-select" value={community} onChange={(e) => setCommunity(e.target.value)}>
                  <option value="">ALL COMMUNITY</option>

                  {filter?.communities?.map((x, i) => {
                    return (
                      <option key={i} value={x}>
                        {x}
                      </option>
                    )
                  })}
                </select>
              </div>

              <div className="input-group input-group-sm mb-3">
                <label className="disable-select input-group-text" style={{ width: "25%" }}>
                  TYPE
                </label>
                <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="">ALL TYPE</option>

                  {filter?.types?.map((x, i) => {
                    return (
                      <option key={i} value={x}>
                        {x}
                      </option>
                    )
                  })}
                </select>
              </div>

              <div className="input-group input-group-sm mb-3">
                <label className="disable-select input-group-text" style={{ width: "25%" }}>
                  LIMIT
                </label>
                <input type="number" className="form-control" placeholder="" min="1" value={limit} onChange={(e) => setLimit(e.target.value)}></input>
              </div>
            </div>
          </Sheet.Content>
        </Sheet.Container>
        <Sheet.Backdrop style={{ backgroundColor: "rgba(0,0,0,0.7)" }} onTap={() => setOpen(false)} />
      </Sheet>

      <div className="float-btn bg-warning text-dark disable-select" onClick={() => setOpen(true)}>
        <RiPencilFill className="disable-select fs-4 fw-bold" />
      </div>
    </>
  )
}

export default function History() {
  const { API_1 } = useSelector((state) => state.config)
  const { accessToken, community } = useSelector((state) => state.auth)

  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(() => searchParams.get("search") || "")

  const [history, setHistory] = useState({})
  const [pages, setPages] = useState([])

  const [pagination, setPagination] = useState({ prev_page: null, next_page: null, total_pages: 0, total_rows: 0, total_data: 0 })

  const temp = useRef(null)

  const handleSearch = (e, keyword) => {
    const params = new URLSearchParams(searchParams)

    e.preventDefault()

    params.set("search", keyword)
    params.set("page", 1)

    setSearchParams(params)
  }

  const getHistory = async () => {
    try {
      const community = searchParams.get("community") || ""
      const model = searchParams.get("model") || ""
      const limit = parseInt(searchParams.get("limit") || "50")
      const page = parseInt(searchParams.get("page") || "1")
      const search = searchParams.get("search") || ""
      const order = searchParams.get("order") || "DESC"
      const type = searchParams.get("type") || ""
      const date = searchParams.get("date") || ""

      const params = {}

      if (community) params.community = community
      if (model) params.model = model
      if (limit) params.limit = limit
      if (page) params.page = page
      if (search) params.search = search
      if (order) params.order = order
      if (type) params.type = type
      if (date) params.date = date

      const params_str = Object.entries(params)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join("&")

      if (temp.params && temp.params === params_str) return

      temp.params = params_str

      const { data } = await axios.get(API_1 + "/claims", { headers: { Authorization: `Bearer ${accessToken}` }, params })
      const { page: current_page, prev_page, next_page, total_pages, total_rows, total_data, start, end, rows } = data

      const arr = [current_page]

      for (let i = 1; i <= 2; i++) {
        if (current_page - i >= 1) arr.unshift(current_page - i)
      }

      for (let i = 1; i <= 2; i++) {
        if (current_page + i <= total_pages) arr.push(current_page + i)
      }

      if (current_page > 10) arr.unshift(1)
      if (current_page < total_pages - 10) arr.push(total_pages)

      setSearchParams(params)
      setPagination({ prev_page, next_page, total_data, total_pages, total_rows })

      setPages(arr)
      setHistory(data)
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
    getHistory()
  }, [searchParams])

  return (
    <>
      <div className="p-3">
        <div className="col">
          <div className="d-flex flex-column justify-content-between  disable-select py-3">
            <h5 className="py-2 fw-bold m-0">Claim history</h5>
            <p className="font-8 m-0">
              {history.total_data} from {history.total_rows} rows ({history.total_pages} pages)
            </p>
          </div>

          <form onSubmit={(e) => handleSearch(e, search)}>
            <div className="input-group input-group-sm py-3 mb-3">
              <input type="text" className="form-control py-2" placeholder="Search claim, code order, model or community" value={search} onChange={(e) => setSearch(e.target.value)} />
              <button className="btn btn-sm btn-outline-secondary text-light" type="submit" id="button-addon1">
                SEARCH
              </button>
            </div>
          </form>

          <Pagination pages={pages} pagination={pagination} />

          <div className="table-responsive w-100 disable-scroll">
            <table className="table table-striped table-sm table-transparent align-middle">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">MODEL</th>
                  <th scope="col">CLAIM</th>
                  <th scope="col">ORDERID</th>
                  <th scope="col">CODE</th>
                  <th scope="col">AMOUNT</th>
                  <th scope="col">GROUP</th>
                  <th scope="col">COMMUNITY</th>
                  <th scope="col">TYPE</th>
                  <th scope="col">DATE</th>
                </tr>
              </thead>
              <tbody>
                {history?.rows?.map((x, i) => {
                  return (
                    <tr key={i}>
                      <td scope="row">{i + 1}</td>
                      <td className={`text-uppercase ${x.community === community ? "text-warning" : ""}`}>{x.model}</td>
                      <td className="text-uppercase">{x.claim}</td>
                      <td className="text-uppercase">{x.order_id}</td>
                      <td>
                        <a href={`https://link.dana.id/kaget?c=${x.code}`} className="text-warning text-decoration-none fw-bold text-uppercase">
                          {x.code}
                        </a>
                      </td>
                      <td className={`text-uppercase ${x.community === community ? "text-warning" : ""}`}>{x.amount}</td>
                      <td className="text-uppercase">{x.group_title}</td>
                      <td className={`text-uppercase ${x.community === community ? "text-warning" : ""}`}>{x.community}</td>
                      <td className="text-uppercase">{x.type}</td>
                      <td className="text-uppercase">{timestamp(x.created_at)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <Pagination pages={pages} pagination={pagination} />
        </div>
      </div>

      <FilterSheets />
    </>
  )
}
