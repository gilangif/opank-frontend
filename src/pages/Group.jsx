import { Link, useSearchParams } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import { toast, Slide } from "react-toastify"
import { useSelector } from "react-redux"

import axios from "axios"

function ModalGroupHeader({ group }) {
  const { API_1, API_2, DEFAULT_IMAGE } = useSelector((state) => state.config)

  return (
    <div className="modal-header p-2 border-0">
      <div className="d-flex gap-3 p-0">
        <div className="col-3">
          <img
            className="ratio ratio-1x1 rounded"
            src={group.thumb || DEFAULT_IMAGE}
            onError={(e) => {
              e.target.onerror = null
              e.target.src = DEFAULT_IMAGE
            }}
          />
        </div>
        <div className="col d-flex flex-column justify-content-between py-1">
          <h1 className="modal-title fs-6">{group.title}</h1>
          <div className="d-flex flex-column gap-2">
            <span className="font-8">{group.extra}</span>
            <span className="font-8 text-info">{group.link}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Group() {
  const { API_1, API_2, DEFAULT_IMAGE } = useSelector((state) => state.config)
  const { username } = useSelector((state) => state.auth)

  const [lists, setLists] = useState([])
  const [pages, setPages] = useState([])
  const [group, setGroup] = useState({})

  const [searchParams, setSearchParams] = useSearchParams()

  const [search, setSearch] = useState(() => searchParams.get("search") || "")
  const [filter, setFilter] = useState(() => searchParams.get("filter") || "")
  const [sort, setSort] = useState(() => searchParams.get("sort") || "")
  const [pagination, setPagination] = useState({ prev_page: null, next_page: null, total_pages: 0, total_rows: 0, total_data: 0 })

  const [accounts, setAccounts] = useState([])
  const temp = useRef(null)

  const handleSearch = (e, keyword) => {
    const params = new URLSearchParams(searchParams)

    e.preventDefault()

    params.set("search", keyword)
    params.set("page", 1)

    setSearchParams(params)
  }

  const handleAction = (group) => {
    const el = document.getElementById("modal-detail")
    const modal = new bootstrap.Modal(el)

    setGroup(group)

    modal.show()
  }

  const handleCheck = async (group) => {
    try {
      const el = document.getElementById("modal-check")
      const modal = new bootstrap.Modal(el)

      setGroup(group)

      const arr = Array.from({ length: 10 }, async (_, i) => {
        const key = i + 1
        const invite = group.invite

        try {
          const { data } = await axios.post(API_1 + "/telegram/groups/detail", { key, invite })
          const { id, title, user, join, banned } = data
          const { account, name } = user

          const status = banned ? "BANNED" : join ? "LEAVE" : "JOIN"

          return { key, invite, id, title, account, name, join, status }
        } catch (error) {
          const message = error?.response?.data?.message || error.message || "UNKNOWN ERROR"

          toast.error(message, {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
            transition: Slide,
          })

          return { key, invite, id: "", title: "", account: "unknown", name: "unknown", join: false, status: "ERROR" }
        }
      })

      const result = await Promise.all(arr)

      setAccounts(result)
      modal.show()
    } catch (error) {}
  }

  const handleFilter = async (e, type) => {
    const params = new URLSearchParams(searchParams)

    e.preventDefault()

    if (type === "filter") {
      setFilter(e.target.value)

      params.set("page", 1)
      params.set("filter", e.target.value)
    }

    if (type === "sort") {
      setSort(e.target.value)

      params.set("page", 1)
      params.set("sort", e.target.value)
    }

    setSearchParams(params)
  }

  const joinGroup = async (account) => {
    try {
      const key = account.key
      const invite = account.invite

      const action = account.join ? "leave" : "join"

      const { data } = await axios.post(API_1 + "/telegram/groups/action", { key, invite, action })
      const { message } = data

      const arr = accounts.map((x) => (x.key === key ? { ...x, join: !account.join } : x))

      setAccounts(arr)

      toast.success(message, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        transition: Slide,
      })

      await axios.post(API_1 + "/telegraf/message", { caption: `${username}: ${message}` })
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "UNKNOWN ERROR"

      toast.error(message, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        transition: Slide,
      })
    }
  }

  const getLists = async () => {
    try {
      const page = parseInt(searchParams.get("page") || "")
      const search = searchParams.get("search") || ""
      const filter = searchParams.get("filter") || "restrict"
      const sort = searchParams.get("sort") || ""

      const params = {}

      if (page) params.page = page
      if (search) params.search = search
      if (filter) params.filter = filter
      if (sort) params.sort = sort

      const params_str = Object.entries(params)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join("&")

      if (temp.params && temp.params === params_str) return

      temp.params = params_str

      const { data } = await axios.get(API_2 + "/groups/lists", { params })
      const { page: current_page, search: current_search, prev_page, next_page, total_pages, total_rows, total_data, rows, order, dana } = data

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

      setFilter(filter)
      setSort(sort)
      setPages(arr)
      setLists(rows)
    } catch (error) {
      const message = error?.response?.data?.message || error.message || "UNKNOWN ERROR"

      toast.error(message, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        transition: Slide,
      })
    }
  }

  const updateMark = async (invite, mark) => {
    try {
      const { data } = await axios.post(API_2 + "/groups/edit", { invite, mark })

      const arr = lists.map((x) => (x.invite === invite ? { ...x, mark } : x))

      setLists(arr)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getLists()
  }, [searchParams])

  return (
    <div className="p-2">
      <div className="my-3 mx-1 text-center">
        <h1 className="m-0 p-0">TELEGRAM GROUP</h1>
        <span className="font-8">
          SHOW {pagination.total_data} / {pagination.total_rows} DATA FROM {pagination.total_pages} PAGES
        </span>
      </div>

      <div className="modal fade modal-backdrop-filter" id="modal-check" data-bs-backdrop="static" data-bs-keyboard="false">
        <div className="modal-dialog modal-dialog-centered p-2 pb-3 d-flex align-items-end">
          <div className="modal-content" style={{ backgroundColor: "transparent", border: 0 }}>
            <ModalGroupHeader group={group} />
            <div className="modal-body p-2 mt-3">
              <div className="d-flex flex-column gap-2 mb-3">
                {accounts.map((x, i) => {
                  const bg = x.status === "BANNED" ? "bg-warning" : x.status === "ERROR" ? "bg-danger" : x.join ? "bg-success" : "bg-secondary"

                  return (
                    <div className="d-flex flex-row gap-2" key={i}>
                      <div className={`col-1 d-flex justify-content-center align-items-center rounded fs-5 p-2 px-4 ${bg}`}>{x.key}</div>
                      <div className="col d-flex flex-column px-2 py-1 rounded">
                        <span className="fw-bold">{x.account}</span>
                        <span className="font-8">{x.name}</span>
                      </div>
                      <div className="col-1 d-flex justify-content-center align-items-center rounded fs-5">
                        <a className={`btn btn-sm ${bg}`} onClick={() => joinGroup(x)}>
                          {x.status}
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="modal-footer p-0 py-2">
              <button type="button" className="w-100 btn btn-secondary" data-bs-dismiss="modal">
                CLOSE
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade modal-backdrop-filter" id="modal-detail" data-bs-backdrop="static" data-bs-keyboard="false">
        <div className="modal-dialog modal-dialog-centered modal-fullscreen-sm-down p-2">
          <div className="modal-content" style={{ backgroundColor: "transparent", border: 0 }}>
            <ModalGroupHeader group={group} />
            <div className="modal-body p-2 mt-3">
              {group.dana && group.dana.length > 0 && (
                <div className="form-floating mb-3">
                  <textarea className="form-control text-preline font-8" value={group.dana?.join("\n\n----------------\n\n")} style={{ height: "20vh" }} />
                  <label>dana</label>
                </div>
              )}
              <div className="form-floating">
                <textarea className="form-control text-preline font-8" value={group.description} style={{ height: "20vh" }} />
                <label>Description</label>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-sm btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
              <a href={group.link} className="btn btn-sm btn-primary">
                OPEN
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex gap-3 mb-2">
        <div className="form-group col input-group-sm">
          <label className="col-form-label px-1 font-8">Filter</label>
          <select className="form-select fw-bold" value={filter} onChange={(e) => handleFilter(e, "filter")}>
            <option value="">ALL</option>
            <option value="restrict">RESTRICT</option>
          </select>
        </div>

        <div className="form-group col input-group-sm">
          <label className="col-form-label px-1 font-8">Sort</label>
          <select className="form-select fw-bold" value={sort} onChange={(e) => handleFilter(e, "sort")}>
            <option value="">ALL</option>
            <option value="mark">MARK</option>
            <option value="unmark">UNMARK</option>
            <option value="dana">DANA</option>
          </select>
        </div>
      </div>

      <form onSubmit={(e) => handleSearch(e, search)}>
        <div className="d-flex gap-3 mb-3 py-3">
          <div className="input-group input-group-sm">
            <input type="text" className="form-control" placeholder="Search group title, descripion, etc" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button
            type="button"
            className="btn btn-sm btn-danger"
            onClick={() => {
              setSort("")
              setSearch("")
              setFilter("")
              setSearchParams({})
            }}
          >
            DEFAULT
          </button>
          <button type="submit" className="btn btn-sm btn-success">
            SEARCH
          </button>
        </div>
      </form>

      <div className="row d-flex justify-content-center g-1 pb-3">
        {lists.map((x, i) => {
          const { title, thumb, description, subscribers, extra, link, invite, dana, mark } = x

          const src = thumb || DEFAULT_IMAGE

          return (
            <div className="card-container d-flex flex-column gap-2 col-6 col-lg-2 py-1 px-1" key={i}>
              <div className="card p-0 h-100 rounded border-0" style={{ background: "transparent" }}>
                <img
                  src={src}
                  alt={src}
                  className={`card-img-top group-card-thumb rounded ${mark ? "card-img-thumb-disbled" : ""}`}
                  onDoubleClick={() => updateMark(invite, !mark)}
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = DEFAULT_IMAGE
                  }}
                />

                {mark && (
                  <div
                    className="d-flex justify-content-center align-items-center  text-center group-card-thumb-layer position-absolute p-2 w-100 rounded"
                    onDoubleClick={() => updateMark(invite, !mark)}
                  >
                    <span className="text-warning fw-bold">MARKED</span>
                  </div>
                )}

                {!mark && dana.length > 0 && (
                  <div
                    className="d-flex justify-content-center align-items-center text-center group-card-thumb-dana position-absolute p-2 w-100 text-wrap rounded"
                    onDoubleClick={() => updateMark(invite, !mark)}
                  >
                    {dana.length > 0 ? <span className="text-info fs-6 fw-bold font-8">CONTAIN {dana.length} DANA KAGET</span> : ""}
                  </div>
                )}

                <div className="d-flex flex-column justify-content-evenly text-center p-2 pt-3 h-100">
                  <Link to={link}>
                    <span className="card-title pointer disable-select font-8 fw-bold">{title}</span>
                  </Link>
                  <span className="font-8 text-align-justify mt-0 text-wrap text-break pointer disable-select text-muted">{invite || "-"}</span>
                  <span className="font-8 text-align-justify mt-1 text-wrap text-break pointer disable-select text-success">{extra}</span>
                </div>
              </div>

              <div className="d-flex  flex-column p-0 gap-2">
                <a className="btn btn-sm btn-secondary w-100" onClick={() => handleAction(x)}>
                  DETAIL
                </a>
                <a className="btn btn-sm btn-success w-100" onClick={() => handleCheck(x)}>
                  CHECK
                </a>
              </div>
            </div>
          )
        })}
      </div>

      <div className="d-flex justify-content-center align-items-center mt-3 position-relative" style={{ zIndex: 10 }}>
        <nav>
          <ul className="pagination">
            <li
              className={`page-item pointer disable-select ${pagination.prev_page ? "" : "disabled"}`}
              onClick={() => {
                const params = new URLSearchParams(searchParams)

                params.set("page", pagination.prev_page)
                setSearchParams(params)
              }}
            >
              <a className="page-link" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
              </a>
            </li>
            {pages.map((x, i) => {
              const params = new URLSearchParams(searchParams)
              const current = params.get("page")

              return (
                <li
                  className={`page-item pointer disable-select ${current == x ? "active" : ""}`}
                  onClick={() => {
                    params.set("page", x)
                    setSearchParams(params)
                  }}
                  key={i}
                >
                  <a className="page-link">{x}</a>
                </li>
              )
            })}

            <li
              className={`page-item pointer disable-select ${pagination.next_page ? "" : "disabled"}`}
              onClick={() => {
                const params = new URLSearchParams(searchParams)

                params.set("page", pagination.next_page)
                setSearchParams(params)
              }}
            >
              <a className="page-link" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}
