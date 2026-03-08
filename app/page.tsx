import { getReportingData } from "@/lib/reporting";
import Reporting from "@/components/Reporting";
import { MetricName } from "@/types/reporting";

const DEFAULT_ORG_ID = 1;
const DEFAULT_METRICS = ["revenue", "total_spend", "profit"];

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

export default async function Home() {
  
  const today = new Date();
  const lastWeek = new Date();
  lastWeek.setDate(today.getDate() - 7);
  const startDate = formatDate(lastWeek);
  const endDate = formatDate(today);

  const initialData = await getReportingData(
    DEFAULT_ORG_ID,
    startDate,
    endDate,
    DEFAULT_METRICS as MetricName[]
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Reporting Dashboard</h1>
      <Reporting
        initialData={initialData}
        defaultRange={{ startDate, endDate }}
        defaultMetrics={DEFAULT_METRICS as MetricName[]}
        orgId={DEFAULT_ORG_ID}
      />
    </div>
  );
}
