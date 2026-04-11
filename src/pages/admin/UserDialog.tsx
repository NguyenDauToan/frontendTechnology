import { useEffect, useState } from "react";
// Import từ adminApi
import { createAdminUser, updateAdminUser } from "@/api/adminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, ShieldAlert } from "lucide-react";

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Hàm refresh list cha
  userToEdit?: any; // Nếu có -> Mode Edit, Null -> Mode Add
}

const UserDialog = ({ isOpen, onClose, onSuccess, userToEdit }: UserDialogProps) => {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff",
    phone: "",
    is_active: true
  });

  // Reset form hoặc điền dữ liệu khi modal mở
  useEffect(() => {
    if (userToEdit) {
      setFormData({
        name: userToEdit.name,
        email: userToEdit.email,
        password: "", // Password luôn để trống khi edit
        role: userToEdit.role,
        phone: userToEdit.phone || "",
        is_active: userToEdit.is_active !== undefined ? userToEdit.is_active : true
      });
    } else {
      setFormData({ name: "", email: "", password: "", role: "staff", phone: "", is_active: true });
    }
  }, [userToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (userToEdit) {
        // --- MODE SỬA ---
        const updateData = { ...formData };
        // Nếu password rỗng thì xóa key password đi để backend không update đè chuỗi rỗng
        if (!updateData.password) delete (updateData as any).password;

        await updateAdminUser(userToEdit._id, updateData);
        toast.success("Cập nhật thông tin thành công");
      } else {
        // --- MODE THÊM ---
        if (!formData.password) {
          toast.error("Vui lòng nhập mật khẩu cho tài khoản mới");
          setLoading(false);
          return;
        }
        await createAdminUser(formData);
        toast.success("Tạo tài khoản mới thành công");
      }
      
      onSuccess(); // Refresh list
      onClose();   // Đóng modal
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {userToEdit ? "Cập nhật tài khoản" : "Thêm tài khoản mới"}
          </DialogTitle>
          <DialogDescription>
            Điền thông tin chi tiết bên dưới. Mật khẩu là bắt buộc khi tạo mới.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Họ và tên */}
          <div className="space-y-1">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <Input 
              value={formData.name} 
              onChange={e => setFormData({ ...formData, name: e.target.value })} 
              placeholder="Nhập tên hiển thị..." 
              required 
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-sm font-medium leading-none">
              Email đăng nhập <span className="text-red-500">*</span>
            </label>
            <Input 
              value={formData.email} 
              onChange={e => setFormData({ ...formData, email: e.target.value })} 
              placeholder="example@company.com" 
              type="email" 
              required 
            />
          </div>

          {/* Mật khẩu */}
          <div className="space-y-1">
            <label className="text-sm font-medium leading-none">
              Mật khẩu {userToEdit && <span className="font-normal text-muted-foreground">(Để trống nếu không đổi)</span>}
            </label>
            <Input 
              value={formData.password} 
              onChange={e => setFormData({ ...formData, password: e.target.value })} 
              placeholder={userToEdit ? "••••••••" : "Nhập mật khẩu..."} 
              type="password" 
            />
          </div>

          {/* Hàng 2 cột: SĐT và Role */}
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-sm font-medium leading-none">Số điện thoại</label>
                <Input 
                  value={formData.phone} 
                  onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                  placeholder="09..." 
                />
             </div>
             <div className="space-y-1">
                <label className="text-sm font-medium leading-none">Vai trò</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="staff">Nhân viên (Staff)</option>
                  <option value="admin">Quản trị viên (Admin)</option>
                  <option value="user">Khách hàng (User)</option>
                </select>
             </div>
          </div>

          {/* Active Checkbox */}
          <div className="flex items-center space-x-2 pt-2">
            <input 
              type="checkbox" 
              id="active_check"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              checked={formData.is_active}
              onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
            />
            <label 
              htmlFor="active_check" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Kích hoạt tài khoản này (Cho phép đăng nhập)
            </label>
          </div>

          {userToEdit && userToEdit.role === 'admin' && (
             <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-xs flex items-start gap-2 border border-yellow-200">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Lưu ý: Bạn đang chỉnh sửa một tài khoản Quản trị viên. Hãy cẩn thận khi thay đổi quyền hạn.</span>
             </div>
          )}

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Hủy bỏ
            </Button>
            <Button type="submit" disabled={loading} className="min-w-[100px]">
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Xử lý...</>
              ) : (
                userToEdit ? "Lưu thay đổi" : "Tạo tài khoản"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;