import { useSelector } from "react-redux"
import { MdFaceRetouchingNatural, MdArrowForwardIos } from "react-icons/md"
import { useNavigate } from "react-router-dom"

export default function Recommend() {
  const { DEFAULT_IMAGE } = useSelector((state) => state.config)
  const { groups } = useSelector((state) => state.dana)

  const navigate = useNavigate()

  return (
    <>
      <div className="p-2">
        <div className="d-flex align-items-center justify-content-between gap-1 mb-3 disable-select pointer">
          <div className="d-flex align-items-center gap-1">
            <div className="p-1 fs-5">
              <MdFaceRetouchingNatural />
            </div>
            <span className="fw-bold" onClick={() => navigate("/group")}>
              GROUP RECOMMENDATION
            </span>
          </div>

          <div className="p-1 px-3 fs-5" onClick={() => navigate("/group")}>
            <MdArrowForwardIos />
          </div>
        </div>
        <div className="d-flex overflow-scroll disable-scrollbar p-0 gap-2">
          {groups.map((x, i) => {
            return (
              <div className="col-4 col-lg-1 col-md-2 group-recommend-card" onClick={() => navigate(`/group?search=${x.title}`)} key={i}>
                <div className="ratio ratio-1x1">
                  <img
                    src={x.thumb || DEFAULT_IMAGE}
                    className="rounded"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = DEFAULT_IMAGE
                    }}
                  />
                  {x.dana && x.dana.length > 0 && (
                    <div className="position-absolute d-flex align-items-end justify-content-center p-1 w-100 h-100">
                      <span className="font-7 fw-bold bg-dark text-light rounded py-1 px-2 px-lg-1">CONTAIN {x.dana.length} DANA</span>
                    </div>
                  )}
                </div>
                <div className="p-1 disable-select pointer" style={{ minWidth: 0 }}>
                  <p className="font-8 fw-bold w-100 text-truncate m-0">{x.title}</p>
                  <p className="font-8 fw-bold w-100 text-truncate m-0 text-muted">{x.member} subscriber</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
