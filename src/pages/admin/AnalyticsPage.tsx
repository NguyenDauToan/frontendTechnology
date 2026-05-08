import { useEffect, useState } from "react";
import { fetchRevenueStats } from "@/api/analyticsService";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Line,
    ComposedChart
} from 'recharts';

import {
    Loader2,
    TrendingUp,
    DollarSign,
    Package
} from "lucide-react";

import {
    format,
    parseISO,
    subDays
} from "date-fns";

const AnalyticsPage = () => {

    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [timeRange, setTimeRange] =
        useState<'daily' | 'monthly'>('daily');

    // filter date
    const [fromDate, setFromDate] = useState(
        format(subDays(new Date(), 7), "yyyy-MM-dd")
    );

    const [toDate, setToDate] = useState(
        format(new Date(), "yyyy-MM-dd")
    );

    // load data
    useEffect(() => {

        const loadStats = async () => {

            setLoading(true);

            try {

                // backend nhớ support fromDate + toDate
                const result = await fetchRevenueStats(
                    timeRange,
                    fromDate,
                    toDate
                );

                if (Array.isArray(result)) {
                    setData(result);
                } else {
                    console.error("API trả về không phải mảng:", result);
                    setData([]);
                }

            } catch (error: any) {

                console.error(
                    "Lỗi tải thống kê:",
                    error?.response?.data || error.message
                );

                setData([]);

            } finally {
                setLoading(false);
            }
        };

        loadStats();

    }, [timeRange, fromDate, toDate]);

    // format VND
    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(value);

    const safeData = Array.isArray(data) ? data : [];

    const totalRevenue =
        safeData.reduce((acc, curr) =>
            acc + (curr.revenue || 0), 0);

    const totalProfit =
        safeData.reduce((acc, curr) =>
            acc + (curr.profit || 0), 0);

    const totalOrders =
        safeData.reduce((acc, curr) =>
            acc + (curr.orderCount || 0), 0);

    return (
        <div className="p-8 space-y-8 bg-gray-50 min-h-screen">

            {/* HEADER */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Thống kê doanh thu
                    </h1>

                    <p className="text-gray-500">
                        Báo cáo doanh thu và lợi nhuận chi tiết
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-3">

                    {/* filter time */}
                    <div className="bg-white p-1 rounded-lg border shadow-sm flex">

                        <button
                            onClick={() => setTimeRange('daily')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                                timeRange === 'daily'
                                    ? 'bg-black text-white shadow'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            Theo ngày
                        </button>

                        <button
                            onClick={() => setTimeRange('monthly')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                                timeRange === 'monthly'
                                    ? 'bg-black text-white shadow'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            Theo tháng
                        </button>

                    </div>

                    {/* date picker */}
                    <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2 shadow-sm">

                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="text-sm outline-none"
                        />

                        <span className="text-gray-400">
                            →
                        </span>

                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="text-sm outline-none"
                        />

                    </div>

                </div>
            </div>

            {/* LOADING */}
            {loading ? (

                <div className="h-64 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>

            ) : (

                <>
                    {/* STATS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* doanh thu */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border">

                            <div className="flex items-center gap-4">

                                <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                                    <DollarSign className="w-6 h-6" />
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Tổng doanh thu
                                    </p>

                                    <h3 className="text-2xl font-bold">
                                        {formatCurrency(totalRevenue)}
                                    </h3>
                                </div>

                            </div>

                        </div>

                        {/* profit */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border">

                            <div className="flex items-center gap-4">

                                <div className="p-3 bg-green-50 text-green-600 rounded-full">
                                    <TrendingUp className="w-6 h-6" />
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Lợi nhuận
                                    </p>

                                    <h3 className="text-2xl font-bold">
                                        {formatCurrency(totalProfit)}
                                    </h3>

                                    <p className="text-xs text-green-600 mt-1">
                                        Tỷ suất:
                                        {" "}
                                        {
                                            totalRevenue > 0
                                                ? (
                                                    (totalProfit / totalRevenue) * 100
                                                ).toFixed(1)
                                                : 0
                                        }%
                                    </p>

                                </div>

                            </div>

                        </div>

                        {/* orders */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border">

                            <div className="flex items-center gap-4">

                                <div className="p-3 bg-purple-50 text-purple-600 rounded-full">
                                    <Package className="w-6 h-6" />
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">
                                        Tổng đơn hàng
                                    </p>

                                    <h3 className="text-2xl font-bold">
                                        {totalOrders}
                                    </h3>
                                </div>

                            </div>

                        </div>

                    </div>

                    {/* CHART */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border h-[500px]">

                        <h3 className="text-lg font-bold mb-6">
                            Biểu đồ doanh thu
                        </h3>

                        {safeData.length === 0 ? (

                            <div className="h-full flex items-center justify-center text-gray-400">
                                Chưa có dữ liệu thống kê
                            </div>

                        ) : (

                            <ResponsiveContainer width="100%" height="100%">

                                <ComposedChart
                                    data={safeData}
                                    margin={{
                                        top: 20,
                                        right: 30,
                                        left: 20,
                                        bottom: 20
                                    }}
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                        stroke="#E5E7EB"
                                    />

                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(str) => {

                                            if (!str) return "";

                                            try {

                                                const date = parseISO(str);

                                                return timeRange === 'daily'
                                                    ? format(date, "dd/MM")
                                                    : format(date, "MM/yyyy");

                                            } catch {
                                                return str;
                                            }
                                        }}
                                    />

                                    <YAxis
                                        yAxisId="left"
                                        tickFormatter={(val) =>
                                            val >= 1000000
                                                ? `${(val / 1000000).toFixed(1)}M`
                                                : `${val / 1000}k`
                                        }
                                    />

                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                    />

                                    <Tooltip
                                        formatter={(value: number) =>
                                            formatCurrency(value)
                                        }

                                        labelFormatter={(label) => {

                                            try {

                                                return `Ngày: ${
                                                    format(
                                                        parseISO(label),
                                                        "dd/MM/yyyy"
                                                    )
                                                }`;

                                            } catch {
                                                return label;
                                            }
                                        }}
                                    />

                                    <Legend />

                                    <Bar
                                        yAxisId="left"
                                        dataKey="revenue"
                                        name="Doanh thu"
                                        fill="#000000"
                                        radius={[4, 4, 0, 0]}
                                        barSize={40}
                                    />

                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="profit"
                                        name="Lợi nhuận"
                                        stroke="#10B981"
                                        strokeWidth={3}
                                    />

                                </ComposedChart>

                            </ResponsiveContainer>

                        )}

                    </div>

                    {/* TABLE */}
                    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">

                        <div className="p-4 border-b">
                            <h3 className="font-bold">
                                Chi tiết thống kê
                            </h3>
                        </div>

                        <table className="w-full text-sm">

                            <thead className="bg-gray-50">

                                <tr>

                                    <th className="text-left p-4">
                                        Ngày
                                    </th>

                                    <th className="text-right p-4">
                                        Doanh thu
                                    </th>

                                    <th className="text-right p-4">
                                        Lợi nhuận
                                    </th>

                                    <th className="text-right p-4">
                                        Đơn hàng
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {safeData.map((item, index) => (

                                    <tr
                                        key={index}
                                        className="border-t hover:bg-gray-50"
                                    >

                                        <td className="p-4 font-medium">

                                            {
                                                item.date
                                                    ? format(
                                                        parseISO(item.date),
                                                        "dd/MM/yyyy"
                                                    )
                                                    : "---"
                                            }

                                        </td>

                                        <td className="p-4 text-right font-medium">

                                            {
                                                formatCurrency(
                                                    item.revenue || 0
                                                )
                                            }

                                        </td>

                                        <td className="p-4 text-right text-green-600 font-medium">

                                            {
                                                formatCurrency(
                                                    item.profit || 0
                                                )
                                            }

                                        </td>

                                        <td className="p-4 text-right">

                                            {
                                                item.orderCount || 0
                                            }

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                </>
            )}

        </div>
    );
};

export default AnalyticsPage;