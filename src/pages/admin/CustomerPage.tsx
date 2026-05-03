import { useEffect, useState } from "react";
import { getCustomers } from "@/api/adminApi";

const CustomerPage = () => {
    const [customers, setCustomers] = useState([]);
    const [page, setPage] = useState(1);
    const [searchText, setSearchText] = useState("");

    const fetchCustomers = async () => {
        try {
            const data = await getCustomers({
                page,
                limit: 10,
                keyword: searchText
            });
            setCustomers(data.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, [page, searchText]);

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                    Quản lý khách hàng
                </h2>

                <input
                    className="border rounded-lg px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="🔍 Tìm kiếm..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
            </div>

            {/* Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3">Tên</th>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">SĐT</th>
                            <th className="px-6 py-3">Trạng thái</th>
                        </tr>
                    </thead>

                    <tbody>
                        {customers.length > 0 ? (
                            customers.map((c: any) => (
                                <tr
                                    key={c._id}
                                    className="border-b hover:bg-gray-50 transition"
                                >
                                    <td className="px-6 py-4 font-medium text-gray-800">
                                        {c.name}
                                    </td>

                                    <td className="px-6 py-4 text-gray-600">
                                        {c.email}
                                    </td>

                                    <td className="px-6 py-4 text-gray-600">
                                        {c.phone || "-"}
                                    </td>

                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                c.is_active
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-600"
                                            }`}
                                        >
                                            {c.is_active ? "Hoạt động" : "Bị khóa"}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="text-center py-6 text-gray-500"
                                >
                                    Không có dữ liệu
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination đơn giản */}
            <div className="flex justify-end mt-4 gap-2">
                <button
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                >
                    ← Prev
                </button>

                <button
                    className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                    onClick={() => setPage(page + 1)}
                >
                    Next →
                </button>
            </div>
        </div>
    );
};

export default CustomerPage;