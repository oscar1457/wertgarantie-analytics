import { DashboardData, Anomaly, BrandStat, ChartDataPoint, Language, TimelineDataPoint, PieChartDataPoint, HeatmapDataPoint } from "../types";

// Helper: Detect if a string looks like a number
const parseNumericValue = (val: string): number | null => {
    if (!val) return null;
    const clean = val.replace(/[^0-9.,-]/g, '');
    if (!clean) return null;
    
    let normalized = clean;
    if (clean.includes(',') && clean.includes('.')) {
        if (clean.lastIndexOf(',') > clean.lastIndexOf('.')) {
             normalized = clean.replace(/\./g, '').replace(',', '.');
        } else {
             normalized = clean.replace(/,/g, '');
        }
    } else if (clean.includes(',')) {
         normalized = clean.replace(',', '.');
    }

    const num = parseFloat(normalized);
    return isNaN(num) ? null : num;
};

// Helper: Parse CSV/Text into rows
const parseRawText = (text: string): string[][] => {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return [];

    const firstLine = lines[0];
    const separators = [',', ';', '\t', '|'];
    let bestSep = ',';
    let maxCols = 0;

    separators.forEach(sep => {
        const cols = firstLine.split(sep).length;
        if (cols > maxCols) {
            maxCols = cols;
            bestSep = sep;
        }
    });

    return lines.map(line => {
        if (line.includes('"')) {
             return line.split(bestSep).map(c => c.replace(/^"|"$/g, '').trim());
        }
        return line.split(bestSep).map(c => c.trim());
    });
};

const getTranslations = (lang: Language) => {
    switch (lang) {
        case 'de':
            return {
                highPrice: (avg: string) => `Preis deutlich über dem Durchschnitt (€${avg})`,
                marketMedia: 'Marktdurchschnitt',
                target: 'Ziel',
                limit: 'Grenze'
            };
        case 'en':
            return {
                highPrice: (avg: string) => `Price significantly above average (€${avg})`,
                marketMedia: 'Market Avg',
                target: 'Target',
                limit: 'Limit'
            };
        case 'es':
        default:
            return {
                highPrice: (avg: string) => `Precio muy superior al promedio (€${avg})`,
                marketMedia: 'Media Mercado',
                target: 'Objetivo',
                limit: 'Límite'
            };
    }
};

export const processFileLocally = async (fileContent: string, fileName: string, lang: Language): Promise<DashboardData> => {
    const t = getTranslations(lang);

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                let rows: string[][] = [];

                if (fileContent.trim().startsWith('[') || fileContent.trim().startsWith('{')) {
                    try {
                        const json = JSON.parse(fileContent);
                        const array = Array.isArray(json) ? json : [json];
                        if (array.length > 0) {
                            rows = array.map(obj => Object.values(obj).map(String));
                        }
                    } catch (e) {
                        rows = parseRawText(fileContent);
                    }
                } else {
                    rows = parseRawText(fileContent);
                }

                if (rows.length < 1) {
                    throw new Error("Empty file");
                }

                let bestBrandColIndex = -1;
                let bestCostColIndex = -1;
                
                const sampleLimit = Math.min(rows.length, 20);
                const colTypes: { isNumeric: boolean, uniqueValues: Set<string> }[] = [];
                const numCols = rows[0].length;

                for (let c = 0; c < numCols; c++) {
                    let numericCount = 0;
                    let uniqueValues = new Set<string>();
                    
                    for (let r = 1; r < sampleLimit; r++) { 
                        if (rows[r] && rows[r][c]) {
                            uniqueValues.add(rows[r][c]);
                            if (parseNumericValue(rows[r][c]) !== null) {
                                numericCount++;
                            }
                        }
                    }
                    colTypes[c] = {
                        isNumeric: numericCount > (sampleLimit * 0.5),
                        uniqueValues: uniqueValues
                    };
                }

                const header = rows[0].map(h => h.toLowerCase());
                bestCostColIndex = header.findIndex(h => h.includes('cost') || h.includes('precio') || h.includes('amount') || h.includes('total') || h.includes('eur') || h.includes('preis') || h.includes('wert'));
                
                if (bestCostColIndex === -1) {
                    bestCostColIndex = colTypes.findIndex(t => t.isNumeric);
                }

                bestBrandColIndex = header.findIndex(h => h.includes('brand') || h.includes('marca') || h.includes('model') || h.includes('device') || h.includes('producto') || h.includes('marke') || h.includes('modell'));

                if (bestBrandColIndex === -1) {
                    bestBrandColIndex = colTypes.findIndex((t, idx) => !t.isNumeric && idx !== bestCostColIndex);
                }

                if (bestBrandColIndex === -1) bestBrandColIndex = 0;
                if (bestCostColIndex === -1) bestCostColIndex = bestBrandColIndex === 0 ? 1 : 0;

                const brandStats: Record<string, { totalCost: number, count: number, prices: number[] }> = {};
                const monthlyData: Record<string, { totalCost: number, count: number }> = {};
                const brandMonthData: Record<string, number> = {};
                let totalCost = 0;
                let validRows = 0;
                const anomalies: Anomaly[] = [];

                // Generate simulated months for temporal data (last 12 months)
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const currentMonth = new Date().getMonth();
                const last12Months = [];
                for (let i = 11; i >= 0; i--) {
                    const monthIdx = (currentMonth - i + 12) % 12;
                    last12Months.push(months[monthIdx]);
                }

                for (let i = 1; i < rows.length; i++) {
                    const row = rows[i];
                    if (!row || row.length <= Math.max(bestBrandColIndex, bestCostColIndex)) continue;

                    const rawBrand = row[bestBrandColIndex] || "Unknown";
                    const brand = rawBrand.replace(/['"]/g, '').trim().toUpperCase() || "N/A";

                    const rawCost = row[bestCostColIndex];
                    const cost = parseNumericValue(rawCost) || 0;

                    if (cost > 0) {
                        totalCost += cost;
                        validRows++;

                        // Assign to a simulated month (distribute evenly with some randomness)
                        const monthIndex = Math.floor((i / rows.length) * 12);
                        const month = last12Months[Math.min(monthIndex, 11)];

                        if (!brandStats[brand]) {
                            brandStats[brand] = { totalCost: 0, count: 0, prices: [] };
                        }
                        brandStats[brand].totalCost += cost;
                        brandStats[brand].count++;
                        brandStats[brand].prices.push(cost);

                        // Track monthly data for line chart
                        if (!monthlyData[month]) {
                            monthlyData[month] = { totalCost: 0, count: 0 };
                        }
                        monthlyData[month].totalCost += cost;
                        monthlyData[month].count++;

                        // Track brand-month frequency for heatmap
                        const key = `${brand}-${month}`;
                        brandMonthData[key] = (brandMonthData[key] || 0) + 1;
                    }
                }

                const globalAvg = validRows > 0 ? totalCost / validRows : 0;
                const stdDevThreshold = globalAvg * 1.5;

                Object.keys(brandStats).forEach(brand => {
                    const stats = brandStats[brand];
                    stats.prices.forEach(price => {
                         if (price > (globalAvg + stdDevThreshold) && price > 50) {
                             if (anomalies.length < 50) {
                                 anomalies.push({
                                     id: `HIGH-${Math.floor(Math.random()*1000)}`,
                                     item: brand,
                                     cost: price,
                                     reason: t.highPrice(globalAvg.toFixed(0))
                                 });
                             }
                         }
                    });
                });
                
                anomalies.sort((a,b) => b.cost - a.cost);

                const topBrands: BrandStat[] = Object.keys(brandStats)
                    .map(key => ({
                        brand: key,
                        avgCost: brandStats[key].totalCost / brandStats[key].count,
                        claimCount: brandStats[key].count,
                        retentionRate: Math.min(100, Math.max(20, (brandStats[key].count / validRows) * 100 * 2))
                    }))
                    .sort((a, b) => b.claimCount - a.claimCount);

                let radarSource = [...topBrands].slice(0, 6);
                
                if (radarSource.length < 3) {
                     radarSource.push({ brand: t.marketMedia, avgCost: globalAvg || 100, claimCount: 0, retentionRate: 50 });
                     radarSource.push({ brand: t.target, avgCost: (globalAvg || 100) * 0.8, claimCount: 0, retentionRate: 60 });
                     radarSource.push({ brand: t.limit, avgCost: (globalAvg || 100) * 1.2, claimCount: 0, retentionRate: 40 });
                }

                const radarMax = Math.max(...radarSource.map(b => b.avgCost)) || 100;
                const radarMin = Math.min(...radarSource.map(b => b.avgCost)) || 0;

                const radarData: ChartDataPoint[] = radarSource.map(b => {
                     const range = radarMax - radarMin;
                     const normalized = range === 0 ? 100 : 50 + ((b.avgCost - radarMin) / range) * 50;

                     return {
                         name: b.brand,
                         value: normalized,
                         fullMark: 100,
                         originalValue: b.avgCost,
                         topModel: 'N/A',
                         topModelPrice: b.avgCost
                     };
                });


                // Generate timeline data for line chart
                const trendData: TimelineDataPoint[] = last12Months.map(month => {
                    const data = monthlyData[month] || { totalCost: 0, count: 0 };
                    return {
                        month,
                        cost: Math.round(data.totalCost),
                        claims: data.count
                    };
                });

                // Generate pie chart data for cost distribution by brand (top 7 brands)
                const topBrandsForPie = topBrands.slice(0, 7);
                const pieTotal = topBrandsForPie.reduce((sum, b) => sum + b.avgCost * b.claimCount, 0);
                const costDistribution: PieChartDataPoint[] = topBrandsForPie.map(b => {
                    const value = b.avgCost * b.claimCount;
                    return {
                        name: b.brand,
                        value: Math.round(value),
                        percentage: (value / pieTotal) * 100
                    };
                });

                // Generate heatmap data for brand-month frequency (top 8 brands)
                const topBrandsForHeatmap = topBrands.slice(0, 8).map(b => b.brand);
                const heatmapData: HeatmapDataPoint[] = [];
                topBrandsForHeatmap.forEach(brand => {
                    last12Months.forEach(month => {
                        const key = `${brand}-${month}`;
                        const frequency = brandMonthData[key] || 0;
                        heatmapData.push({ brand, month, frequency });
                    });
                });

                const finalData: DashboardData = {
                    summary: {
                        totalRevenue: totalCost,
                        activePolicies: validRows,
                        claimRatio: (anomalies.length / (validRows || 1)) * 100,
                        customerSatisfaction: 0
                    },
                    charts: {
                        radarData: radarData,
                        retentionData: topBrands.slice(0,5).map(b => ({ name: b.brand, value: Math.round(b.retentionRate) })),
                        claimsData: topBrands.slice(0,5).map(b => ({ name: b.brand, value: b.claimCount })),
                        timelineData: [],
                        trendData: trendData,
                        costDistribution: costDistribution,
                        heatmapData: heatmapData
                    },
                    anomalies: anomalies,
                    topBrands: topBrands
                };

                resolve(finalData);

            } catch (err) {
                console.error(err);
                reject(err);
            }
        }, 800);
    });
};
