import { Card, CardContent, Typography } from "@mui/material"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from "recharts"

const currency = (number) => new Intl.NumberFormat("id-ID", { minimumFractionDigits: 0 }).format(number)

export default function Chart({ summary }) {
  return (
    <div>
      <Card sx={{ width: "100%", background: "transparent", boxShadow: "none", border: "none" }}>
        <CardContent className="p-0 disable-select">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={summary} margin={{ top: 20, right: 0, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" interval={0} className="font-5" />
              <Tooltip
                formatter={(value, name, props) => (name === "day" ? [value, "Statement"] : [value, name])}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload

                    return (
                      <div style={{ background: "#333", color: "#fff", padding: "5px", borderRadius: "4px" }} className="font-7">
                        <div>Date: {data.day}</div>
                        <div>Claim: {data.claim}</div>
                        <div>Total: {data.total}</div>
                        <div>Amount: {currency(data.amount)}</div>
                        <div>Percentage: {data.percentage > 0 ? data.percentage.toFixed(1) : 0}%</div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend />
              <Bar dataKey="amount" fill="#ffc107" name="Summary" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
