"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export type MetricName =
  | "meta_spend"
  | "meta_impressions"
  | "google_spend"
  | "google_impressions"
  | "revenue"
  | "orders"
  | "fees"
  | "meta_cpm"
  | "google_cpm"
  | "average_order_value"
  | "total_spend"
  | "profit"
  | "roas";

export interface ReportingData {
  totals: Record<string, number>;
  daily: Array<Record<string, any>>;
}

interface Props {
  initialData: ReportingData;
  defaultRange: { startDate: string; endDate: string };
  defaultMetrics: MetricName[];
  orgId: number;
}

const ALL_METRICS: MetricName[] = [
  "revenue",
  "orders",
  "fees",
  "meta_spend",
  "meta_impressions",
  "google_spend",
  "google_impressions",
  "meta_cpm",
  "google_cpm",
  "average_order_value",
  "total_spend",
  "profit",
  "roas",
];

export default function Reporting({
  initialData,
  defaultRange,
  defaultMetrics,
  orgId,
}: Props) {
  const [data, setData] = useState<ReportingData>(initialData);
  const [startDate, setStartDate] = useState(defaultRange.startDate);
  const [endDate, setEndDate] = useState(defaultRange.endDate);
  const [metrics, setMetrics] = useState<MetricName[]>(defaultMetrics);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({
        orgId: String(orgId),
        startDate,
        endDate,
        metrics: metrics.join(","),
      });
      const res = await fetch(`/api/reporting?${qs.toString()}`);
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [startDate, endDate, metrics]);

  const toggleMetric = (m: MetricName) => {
    setMetrics((curr) =>
      curr.includes(m) ? curr.filter((x) => x !== m) : [...curr, m]
    );
  };

  return (
    <div className="space-y-6">
     
          
        

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((m) => (
          <Card key={m} className="bg-card">
            <CardContent>
              <h3 className="text-lg font-semibold capitalize text-card-foreground">
                {m}
              </h3>
              <p className="text-2xl">
                {data.totals[m] !== undefined
                  ? data.totals[m].toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })
                  : "—"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-end md:space-x-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium">Start date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-40 rounded border bg-background px-2 py-1 text-foreground"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium">End date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-40 rounded border bg-background px-2 py-1 text-foreground"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Metrics</label>
              <div className="mt-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Select metrics ▾</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48">
                    {ALL_METRICS.map((m) => (
                      <DropdownMenuCheckboxItem
                        key={m}
                        checked={metrics.includes(m)}
                        onCheckedChange={(checked) => {
                          if (checked) toggleMetric(m);
                          else toggleMetric(m);
                        }}
                      >
                        {m}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

      <div className="border rounded p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              {metrics.map((m) => (
                <TableHead key={m} className="capitalize">
                  {m}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.daily.map((row) => (
              <TableRow key={row.date}>
                <TableCell>{row.date}</TableCell>
                {metrics.map((m) => (
                  <TableCell key={m} className="">
                    {row[m] != null
                      ? Number(row[m]).toLocaleString(undefined, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 2,
                        })
                      : "—"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p className="text-destructive">{error}</p>}
    </div>
  );
}