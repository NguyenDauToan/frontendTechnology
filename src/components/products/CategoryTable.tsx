import { Edit, Trash2, Image as ImageIcon } from "lucide-react";

export interface Category {
  _id: string; // MongoDB ID usually starts with underscore
  id?: string; // Sometimes mapped to id
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id?: { _id: string; name: string } | string; // Parent can be object or string
  createdAt?: string;
}

interface CategoryTableProps {
  categories: Category[];
  onDelete: (id: string) => void;
  // FIX: Update onEdit type to accept the full Category object
  onEdit: (category: Category) => void; 
}

const CategoryTable = ({ categories = [], onDelete, onEdit }: CategoryTableProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 font-medium text-gray-900">Hình ảnh</th>
            <th className="px-6 py-4 font-medium text-gray-900">Tên danh mục</th>
            <th className="px-6 py-4 font-medium text-gray-900">Slug</th>
            <th className="px-6 py-4 font-medium text-gray-900">Danh mục cha</th>
            <th className="px-6 py-4 font-medium text-gray-900 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {categories.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                Chưa có danh mục nào.
              </td>
            </tr>
          ) : (
            categories.map((cat) => (
              <tr key={cat._id || cat.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-3">
                  <div className="w-10 h-10 rounded border border-gray-200 overflow-hidden bg-white flex items-center justify-center">
                    {cat.image ? (
                      <img 
                        src={cat.image} 
                        alt={cat.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = ""; }} 
                      />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-gray-300" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-3 font-medium text-gray-900">{cat.name}</td>
                <td className="px-6 py-3 text-gray-500 font-mono text-xs">{cat.slug}</td>
                <td className="px-6 py-3 text-gray-500">
                  {/* Handle populated parent object or string ID */}
                  {typeof cat.parent_id === 'object' && cat.parent_id !== null 
                    ? cat.parent_id.name 
                    : (cat.parent_id ? "ID: " + cat.parent_id.toString().substring(0, 6) + "..." : "—")}
                </td>
                <td className="px-6 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      // FIX: Pass the full 'cat' object instead of just ID
                      onClick={() => onEdit(cat)} 
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Sửa"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(cat._id || cat.id!)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryTable;