import { useEffect, useState } from "react";
import { fetchBrands } from "@/api/brandService";
import {
    fetchSeriesByBrand,
    createSeriesAPI,
    deleteSeriesAPI,
} from "@/api/seriesService";
import { Trash2, Plus, Layers, PackageX } from "lucide-react";

interface Brand {
    _id: string;
    name: string;
}

interface Series {
    _id: string;
    name: string;
    brand: {
        _id: string;
        name: string;
    };
}

const SeriesAdminPage = () => {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [seriesList, setSeriesList] = useState<Series[]>([]);
    const [selectedBrand, setSelectedBrand] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    // load brands
    useEffect(() => {
        const load = async () => {
            const data = await fetchBrands();
            setBrands(data);
            if (data.length > 0) setSelectedBrand(data[0]._id);
        };
        load();
    }, []);

    // load series when brand changes
    useEffect(() => {
        if (!selectedBrand) return;

        const loadSeries = async () => {
            const data = await fetchSeriesByBrand(selectedBrand);
            setSeriesList(data);
        };

        loadSeries();
    }, [selectedBrand]);

    const handleAdd = async () => {
        if (!name.trim()) return alert("Vui lòng nhập tên series");

        setLoading(true);
        try {
            await createSeriesAPI({
                name,
                brand: selectedBrand,
            });

            setName("");
            const data = await fetchSeriesByBrand(selectedBrand);
            setSeriesList(data);
        } catch (err: any) {
            alert(err.response?.data?.message || "Lỗi khi thêm series");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa series này?")) return;

        await deleteSeriesAPI(id);
        const data = await fetchSeriesByBrand(selectedBrand);
        setSeriesList(data);
    };

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Layers size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Quản lý Series</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Thêm mới và quản lý các dòng sản phẩm theo thương hiệu
                    </p>
                </div>
            </div>

            {/* Controls Section */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start md:items-end">
                {/* Chọn Brand */}
                <div className="w-full md:w-auto flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Thương hiệu</label>
                    <select
                        className="w-full md:w-64 border border-gray-300 px-4 py-2.5 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                    >
                        {brands.map((b) => (
                            <option key={b._id} value={b._id}>
                                {b.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Thêm Series */}
                <div className="w-full md:w-auto flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Tạo series mới</label>
                    <div className="flex gap-2 w-full">
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nhập tên series..."
                            className="w-full md:w-72 border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        />
                        <button
                            onClick={handleAdd}
                            disabled={loading || !selectedBrand}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            <Plus size={18} />
                            <span>{loading ? "Đang thêm..." : "Thêm"}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/80 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Tên Series</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Thương hiệu</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Thao tác</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {seriesList.map((s) => (
                                <tr key={s._id} className="hover:bg-blue-50/50 transition-colors group">
                                    <td className="px-6 py-4 font-medium text-gray-800">
                                        {s.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                            {s.brand?.name || 'Không xác định'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(s._id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50 opacity-0 group-hover:opacity-100 md:opacity-100"
                                            title="Xóa series"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {/* Empty State */}
                            {seriesList.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <PackageX size={48} className="text-gray-300 mb-3" />
                                            <p className="text-base font-medium text-gray-600">Chưa có series nào</p>
                                            <p className="text-sm mt-1 text-gray-400">Hãy thêm series mới cho thương hiệu này ở form bên trên.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SeriesAdminPage;