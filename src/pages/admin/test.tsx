<div className="relative group hidden lg:block shrink-0">
<Button className="bg-green-600 hover:bg-green-700 text-white font-bold border-none shadow-md gap-2 h-10 px-4 rounded-md transition-all">
  <Menu className="w-5 h-5" />
  SẢN PHẨM
</Button>

{/* --- DROPDOWN CONTAINER --- */}
{/* Sử dụng CategorySlider ở đây */}
<div className="absolute top-[100%] left-0 pt-2 w-[280px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out z-50">
    <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-100">
        {/* Gọi Component CategorySlider vào đây */}
        {/* Lưu ý: CategorySlider cần bỏ phần Header 'Danh mục' bên trong nó đi nếu thấy thừa */}
        <CategorySlider /> 
    </div>
</div>
</div>