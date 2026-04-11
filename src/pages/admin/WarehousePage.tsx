// src/pages/admin/WarehousePage.tsx
import { useEffect, useState } from "react";
import { fetchLowStockProducts, fetchProducts, restockProductAPI } from "@/api/productService";
import { AlertTriangle, PackagePlus, Search, Archive } from "lucide-react";
import { toast } from "sonner";

const WarehousePage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [filter, setFilter] = useState("all"); // 'all' hoặc 'low'

  const loadData = async () => {
    try {
      // Lấy tất cả sản phẩm để quản lý
      const allData = await fetchProducts();
      setProducts(allData);
      
      // Đếm số lượng sắp hết (ví dụ < 10)
      const low = allData.filter((p: any) => p.stock <= 10).length;
      setLowStockCount(low);

      if (low > 0) {
        toast.warning(`Cảnh báo: Có ${low} sản phẩm sắp hết hàng!`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Hàm xử lý nhập kho nhanh
  const handleQuickRestock = async (id: string, currentStock: number) => {
    const addAmount = prompt("Nhập số lượng muốn cộng thêm:", "10");
    if (!addAmount || isNaN(Number(addAmount))) return;

    try {
      const newStock = currentStock + Number(addAmount);
      await restockProductAPI(id, newStock);
      toast.success("Đã nhập kho thành công!");
      loadData(); // Reload lại bảng
    } catch (error) {
      toast.error("Lỗi nhập kho");
    }
  };

  // Lọc dữ liệu hiển thị
  const displayedProducts = filter === "low" 
    ? products.filter(p => p.stock <= 10) 
    : products;

  return (
    <div className="p-8 space-y-6 bg-gray-50 min-h-screen">
      {/* Header Thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-full text-blue-600"><Archive /></div>
            <div>
                <p className="text-gray-500 text-sm">Tổng sản phẩm</p>
                <h3 className="text-2xl font-bold">{products.length}</h3>
            </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100 flex items-center gap-4 cursor-pointer hover:bg-red-50 transition-colors" onClick={() => setFilter("low")}>
            <div className="p-3 bg-red-100 rounded-full text-red-600"><AlertTriangle /></div>
            <div>
                <p className="text-gray-500 text-sm">Sắp hết hàng (&lt;10)</p>
                <h3 className="text-2xl font-bold text-red-600">{lowStockCount}</h3>
            </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <div className="flex gap-2">
            <button 
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'all' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}
            >
                Tất cả kho
            </button>
            <button 
                onClick={() => setFilter("low")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${filter === 'low' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            >
                Cần nhập hàng
            </button>
        </div>
      </div>

      {/* Bảng Kho */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b">
                <tr>
                    <th className="p-4">Sản phẩm</th>
                    <th className="p-4 text-center">Tồn kho hiện tại</th>
                    <th className="p-4 text-center">Trạng thái</th>
                    <th className="p-4 text-right">Nhập kho</th>
                </tr>
            </thead>
            <tbody>
                {displayedProducts.map((p) => (
                    <tr key={p._id || p.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-medium">{p.name} <br/><span className="text-gray-400 text-xs">{p.sku}</span></td>
                        <td className="p-4 text-center">
                            <span className={`font-bold text-lg ${p.stock <= 10 ? 'text-red-600' : 'text-gray-800'}`}>
                                {p.stock}
                            </span>
                        </td>
                        <td className="p-4 text-center">
                            {p.stock === 0 ? (
                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">Hết hàng</span>
                            ) : p.stock <= 10 ? (
                                <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs flex items-center justify-center gap-1">
                                    <AlertTriangle size={12} /> Sắp hết
                                </span>
                            ) : (
                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Ổn định</span>
                            )}
                        </td>
                        <td className="p-4 text-right">
                            <button 
                                onClick={() => handleQuickRestock(p._id || p.id, p.stock)}
                                className="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 flex items-center gap-2 ml-auto text-xs"
                            >
                                <PackagePlus size={14} /> Nhập thêm
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default WarehousePage;