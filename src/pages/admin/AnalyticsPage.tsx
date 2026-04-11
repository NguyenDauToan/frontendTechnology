import { useEffect, useState } from "react";
import { fetchRevenueStats } from "@/api/analyticsService";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart 
} from 'recharts';
import { Loader2, TrendingUp, DollarSign, Package } from "lucide-react";
import { format, parseISO } from "date-fns";

const AnalyticsPage = () => {
    // Khởi tạo state là mảng rỗng []
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'daily' | 'monthly'>('daily');

    // Load dữ liệu
    useEffect(() => {
        const loadStats = async () => {
            setLoading(true);
            try {
                const result = await fetchRevenueStats(timeRange);
                
                // --- FIX LỖI TẠI ĐÂY ---
                // Kiểm tra xem result có phải là mảng không trước khi set
                if (Array.isArray(result)) {
                    setData(result);
                } else {
                    console.error("API trả về dữ liệu không phải mảng:", result);
                    setData([]); // Nếu lỗi, set về mảng rỗng để không crash
                }
            } catch (error) {
                console.error("Lỗi tải thống kê:", error);
                setData([]);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, [timeRange]);

    // Format tiền tệ VND
    const formatCurrency = (value: number) => 
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);

    // --- FIX LỖI TẠI ĐÂY ---
    // Đảm bảo biến safeData luôn là mảng trước khi dùng .reduce
    const safeData = Array.isArray(data) ? data : [];

    const totalRevenue = safeData.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
    const totalProfit = safeData.reduce((acc, curr) => acc + (curr.profit || 0), 0);
    const totalOrders = safeData.reduce((acc, curr) => acc + (curr.orderCount || 0), 0);

    return (
        <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Thống kê doanh thu</h1>
                    <p className="text-gray-500">Báo cáo hiệu quả kinh doanh và lợi nhuận</p>
                </div>
                
                {/* Bộ lọc thời gian */}
                <div className="bg-white p-1 rounded-lg border shadow-sm flex">
                    <button 
                        onClick={() => setTimeRange('daily')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                            timeRange === 'daily' ? 'bg-black text-white shadow' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        Theo Ngày
                    </button>
                    <button 
                        onClick={() => setTimeRange('monthly')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                            timeRange === 'monthly' ? 'bg-black text-white shadow' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                        Theo Tháng
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <>
                    {/* 1. Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Card Doanh Thu */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                                    <DollarSign className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Tổng doanh thu</p>
                                    <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</h3>
                                </div>
                            </div>
                        </div>

                        {/* Card Lợi Nhuận */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-50 text-green-600 rounded-full">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Lợi nhuận thực tế</p>
                                    <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(totalProfit)}</h3>
                                    <p className="text-xs text-green-600 mt-1">
                                        Tỷ suất: {totalRevenue > 0 ? ((totalProfit/totalRevenue)*100).toFixed(1) : 0}%
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Card Đơn Hàng */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-full">
                                    <Package className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Tổng đơn hàng</p>
                                    <h3 className="text-2xl font-bold text-gray-900">{totalOrders}</h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. Biểu đồ */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-[500px]">
                        <h3 className="text-lg font-bold mb-6">Biểu đồ tăng trưởng</h3>
                        
                        {/* Kiểm tra nếu không có dữ liệu thì hiện thông báo thay vì biểu đồ trắng */}
                        {safeData.length === 0 ? (
                             <div className="h-full flex items-center justify-center text-gray-400">
                                Chưa có dữ liệu đơn hàng nào để thống kê.
                             </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={safeData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis 
                                        dataKey="date" 
                                        tickFormatter={(str) => {
                                            if (!str) return "";
                                            try {
                                                const date = parseISO(str);
                                                return timeRange === 'daily' ? format(date, "dd/MM") : format(date, "MM/yyyy");
                                            } catch (e) { return str; }
                                        }}
                                        stroke="#9CA3AF"
                                        tick={{fontSize: 12}}
                                    />
                                    <YAxis 
                                        yAxisId="left"
                                        stroke="#9CA3AF"
                                        tick={{fontSize: 12}}
                                        tickFormatter={(val) => val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : `${val/1000}k`}
                                    />
                                    <YAxis 
                                        yAxisId="right" 
                                        orientation="right" 
                                        stroke="#10B981"
                                        tickFormatter={(val) => val >= 1000000 ? `${(val/1000000).toFixed(1)}M` : `${val/1000}k`}
                                    />
                                    <Tooltip 
                                        formatter={(value: number) => formatCurrency(value)}
                                        labelFormatter={(label) => `Thời gian: ${label}`}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
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
                                        dot={{ r: 4, fill: "#10B981" }}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default AnalyticsPage;