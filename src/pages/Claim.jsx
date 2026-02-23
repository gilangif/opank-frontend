import Statement from "../components/claim/Statement"
import History from "../components/claim/History"

export default function Claim() {
  return (
    <>
      <div className="d-flex flex-column p-2">
        <Statement />
        <History />
      </div>
    </>
  )
}
