import { useEffect, useState } from "react";
import {
  fetchBrands,
  createBrandAPI,
  deleteBrandAPI,
} from "@/api/brandService";

const BrandPage = () => {
  const [brands, setBrands] = useState<any[]>([]);
  const [name, setName] = useState("");

  const loadBrands = async () => {
    try {
      const data = await fetchBrands();
      setBrands(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  // ========================
  // ADD BRAND
  // ========================
  const handleAdd = async () => {
    if (!name.trim()) return alert("Nhập tên brand");

    try {
      await createBrandAPI({ name });
      setName("");
      loadBrands();
    } catch (error) {
      console.error(error);
      alert("Lỗi tạo brand");
    }
  };

  // ========================
  // DELETE BRAND
  // ========================
  const handleDelete = async (id: string) => {
    if (!confirm("Xóa brand này?")) return;

    try {
      await deleteBrandAPI(id);
      loadBrands();
    } catch (error) {
      console.error(error);
      alert("Không thể xóa");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Quản lý Brand</h1>

      {/* ADD FORM */}
      <div className="flex gap-2 mb-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tên brand (Apple, Asus...)"
          className="border px-3 py-2 rounded w-64"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Thêm
        </button>
      </div>

      {/* LIST */}
      <div className="bg-white border rounded">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">Tên</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {brands.map((b) => (
              <tr key={b._id} className="border-t">
                <td className="p-3">{b.name}</td>
                <td className="p-3 text-gray-500">{b.name}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleDelete(b._id)}
                    className="text-red-500"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {brands.length === 0 && (
          <div className="p-4 text-gray-500 text-center">
            Chưa có brand
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandPage;