import { Link, useLocation } from "react-router-dom"
import { FaHouse, FaAnchor, FaRegHandPeace, FaPaw, FaTableList } from "react-icons/fa6"

function NavItems({ to, Icon, active }) {
  const cn = active ? "text-danger fs-4" : "text-light fs-4"

  return (
    <div className="text-center">
      <Link to={to} className={cn}>
        <Icon className="fs-3" />
      </Link>
    </div>
  )
}

export default function Navbar() {
  const location = useLocation()

  const items = [
    { to: "/", Icon: FaHouse },
    { to: "/chat", Icon: FaRegHandPeace },
    { to: "/monitor", Icon: FaPaw },
    { to: "/claim", Icon: FaTableList },
    { to: "/group", Icon: FaAnchor },
  ]

  return (
    <nav className="navbar fixed-bottom navbar-dark bg-dark p-1 p-lg-0 px-lg-3" style={{ borderRadius: "1.1rem 1.1rem 0 0" }}>
      <div className="d-flex justify-content-around justify-content-lg-start align-items-center gap-2 gap-lg-5 w-100 px-2 py-3 py-lg-2">
        {items.map((x, i) => {
          const { to, Icon } = x
          const active = location.pathname === x.to
          return <NavItems key={i} to={to} Icon={Icon} active={active} />
        })}
      </div>
    </nav>
  )
}
