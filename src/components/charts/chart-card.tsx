"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMetric } from "@/lib/format";

type DataPoint = Record<string, string | number>;

export function ChartCard({
  title,
  description,
  type,
  data,
  xKey,
  yKey,
  color
}: {
  title: string;
  description: string;
  type: "area" | "bar";
  data: DataPoint[];
  xKey: string;
  yKey: string;
  color: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {type === "area" ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`gradient-${yKey}`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "rgba(15,23,42,0.96)",
                  border: "1px solid rgba(148,163,184,0.2)",
                  borderRadius: 16
                }}
                formatter={(value: number) => formatMetric(value, 1)}
              />
              <Area dataKey={yKey} type="monotone" stroke={color} fill={`url(#gradient-${yKey})`} strokeWidth={2.5} />
            </AreaChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: "rgba(15,23,42,0.96)",
                  border: "1px solid rgba(148,163,184,0.2)",
                  borderRadius: 16
                }}
                formatter={(value: number) => formatMetric(value, 0)}
              />
              <Bar dataKey={yKey} fill={color} radius={[10, 10, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
