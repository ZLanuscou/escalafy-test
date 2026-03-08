import prisma from "./prisma";
import { MetricName } from "@/types/reporting";

export interface ReportingData {
  totals: Record<string, number>;
  daily: Array<Record<string, any>>;
}

export async function getReportingData(
    orgId: number,
    startDate: string,
    endDate: string,
    metrics: MetricName[] = ["revenue", "total_spend", "profit"]
): Promise<ReportingData> {
    try {
        const org = await prisma.organization.findUnique({ where: { id: orgId } });
        if (!org) {
            throw new Error(`Organization with id ${orgId} not found`);
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        const allowedMetrics: MetricName[] = [
          "meta_spend",
          "meta_impressions",
          "google_spend",
          "google_impressions",
          "revenue",
          "orders",
          "fees",
          "meta_cpm",
          "google_cpm",
          "average_order_value",
          "total_spend",
          "profit",
          "roas",
        ];
        const unknown = metrics.filter((m) => !allowedMetrics.includes(m as MetricName));
        if (unknown.length) {
          throw new Error(`Unknown metrics requested: ${unknown.join(",")}`);
        }
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new Error("Invalid startDate or endDate");
        }
        if (start > end) {
            throw new Error("startDate must be before or equal to endDate");
        }
       
        const METRIC_DEFINITIONS: Record<string, (d: any) => number> = {
            // Métricas Calculadas
            meta_cpm: (d) => (d.meta_impressions > 0 ? (d.meta_spend / d.meta_impressions) * 1000 : 0),
            google_cpm: (d) => (d.google_impressions > 0 ? (d.google_spend / d.google_impressions) * 1000 : 0),
            average_order_value: (d) => (d.orders > 0 ? d.revenue / d.orders : 0),

            // Métricas Derivadas 
            total_spend: (d) => d.meta_spend + d.google_spend,
            profit: (d) => d.revenue - d.meta_spend - d.google_spend - d.fees,
            roas: (d) => {
                const totalSpend = d.meta_spend + d.google_spend;
                return totalSpend > 0 ? d.revenue / totalSpend : 0;
            }
            };

        const [googleData, metaData, storeData] = await Promise.all([
            prisma.google_ads_data.findMany({
                where: {
                    account_id: org.google_account_id,
                    date: { gte: start, lte: end },
                },
                select: {
                    date: true,
                    spend: true,
                    impressions: true,
                },
                orderBy: { date: "asc" },
            }),
            prisma.meta_ads_data.findMany({
                where: {
                    account_id: org.meta_account_id,
                    date: { gte: start, lte: end },
                },
                select: {
                    date: true,
                    spend: true,
                    impressions: true,
                },
                orderBy: { date: "asc" },
            }),
            prisma.store_data.findMany({
                where: {
                    store_id: org.store_id,
                    date: { gte: start, lte: end },
                },
                select: {
                    date: true,
                    revenue: true,  
                    orders: true,
                    fees: true,
                },
                orderBy: { date: "asc" },
            }),
        ]);
        
        const dailyMap: Record<string, any> = {};

        const mergeData = (data: any[], fieldMapping: Record<string, string>) => {
        data.forEach(item => {
            const dateStr = item.date.toISOString().split('T')[0];
            
            if (!dailyMap[dateStr]) {
            dailyMap[dateStr] = { date: dateStr };
            }

        
            Object.entries(fieldMapping).forEach(([rawKey, targetKey]) => {
            const val = item[rawKey];
            dailyMap[dateStr][targetKey] = (dailyMap[dateStr][targetKey] || 0) + (typeof val === 'object' ? Number(val) : val);
            });
        });
        };

        mergeData(metaData, { spend: 'meta_spend', impressions: 'meta_impressions' });
        mergeData(googleData, { spend: 'google_spend', impressions: 'google_impressions' });
        mergeData(storeData, { revenue: 'revenue', orders: 'orders', fees: 'fees' });

        // agregar resto de días del rango aunque no tengan datos para continuidad 
        const current = new Date(start);
        while (current <= end) {
            const dstr = current.toISOString().split('T')[0];
            if (!dailyMap[dstr]) {
                dailyMap[dstr] = { date: dstr };
            }
            current.setDate(current.getDate() + 1);
        }

        const daily = Object.values(dailyMap)
            .sort((a: any, b: any) => a.date.localeCompare(b.date))
            .map((day: any) => {
                const result: any = { date: day.date };

                metrics.forEach((metric) => {
                    if (METRIC_DEFINITIONS[metric]) {
                        result[metric] = METRIC_DEFINITIONS[metric](day);
                    } else {
                        result[metric] = day[metric] || 0;
                    }
                });

                return result;
            });

            const rawTotals = Object.values(dailyMap).reduce((acc: any, day: any) => {
                Object.keys(day).forEach(key => {
                    if (key !== 'date') acc[key] = (acc[key] || 0) + day[key];
                });
                return acc;
                }, {});

                const totals: any = {};
                metrics.forEach((metric) => {
                if (METRIC_DEFINITIONS[metric]) {
                    totals[metric] = METRIC_DEFINITIONS[metric](rawTotals);
                } else {
                    totals[metric] = rawTotals[metric] || 0;
                }
                });
        return { daily, totals };
        
    } catch (error) {
        console.error("Error fetching reporting data:", error);
        throw error;
    }
}