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