import { useEffect, useState } from "react";
// Import từ adminApi thay vì userApi
import { getAdminUsers, deleteAdminUser } from "@/api/adminApi";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Shield, User, Truck, Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import UserDialog from "./UserDialog";

const UserList = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // State quản lý Modal
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Load danh sách user từ API Admin
  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAdminUsers();
      setUsers(data);
    } catch (error) {
      toast.error("Lỗi tải danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Xử lý nút Thêm mới
  const handleAddNew = () => {
    setSelectedUser(null);
    setIsDialogOpen(true);
  };

  // Xử lý nút Sửa
  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  // Xử lý nút Xóa
  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài khoản này? Hành động này không thể hoàn tác.")) return;
    try {
      await deleteAdminUser(id);
      toast.success("Đã xóa thành công");
      loadUsers(); // Refresh lại bảng
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Lỗi khi xóa");
    }
  };

  // Helper hiển thị Badge Role
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 gap-1"><Shield className="w-3 h-3" /> Quản trị viên</Badge>;
      case 'staff':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 gap-1"><Truck className="w-3 h-3" /> Nhân viên</Badge>;
      default:
        return <Badge variant="outline" className="gap-1"><User className="w-3 h-3" /> Khách hàng</Badge>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý nhân sự</h2>
          <p className="text-sm text-gray-500">Quản lý tài khoản Admin, Staff và Khách hàng</p>
        </div>
        <Button onClick={handleAddNew} className="gap-2 bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Thêm tài khoản
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="w-[300px]">Thông tin cá nhân</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow>
                 <TableCell colSpan={5} className="h-32 text-center">
                   <div className="flex justify-center items-center gap-2 text-gray-500">
                     <Loader2 className="w-5 h-5 animate-spin" /> Đang tải dữ liệu...
                   </div>
                 </TableCell>
               </TableRow>
            ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                    Chưa có nhân viên nào.
                  </TableCell>
                </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id} className="hover:bg-gray-50/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell className="text-gray-600 font-medium">
                    {user.phone || <span className="text-gray-400 italic">Chưa cập nhật</span>}
                  </TableCell>
                  <TableCell>
                    {user.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                            <CheckCircle className="w-3 h-3" /> Hoạt động
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                            <XCircle className="w-3 h-3" /> Đã khóa
                        </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-blue-600 hover:bg-blue-50" onClick={() => handleEdit(user)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(user._id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog Form Component */}
      <UserDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        onSuccess={loadUsers} 
        userToEdit={selectedUser} 
      />
    </div>
  );
};

export default UserList;