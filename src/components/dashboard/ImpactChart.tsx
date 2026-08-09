import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Point = { date: string; gb: number };

/** Lazy chunk: recharts is the heaviest dashboard dependency, so it is kept
 *  out of the initial dashboard bundle. */
export default function ImpactChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6f7f4a" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#6f7f4a" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#8b8b84" }} tickFormatter={(v) => v.slice(5)} />
        <YAxis hide />
        <Tooltip
          contentStyle={{
            background: "#212b23",
            border: "1px solid rgba(234,230,223,0.08)",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "#8b8b84" }}
          formatter={(v: number) => [`${v.toFixed(2)} GB`, "Liberado"]}
        />
        <Area type="monotone" dataKey="gb" stroke="#6f7f4a" fill="url(#g)" strokeWidth={1.5} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
