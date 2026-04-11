interface TopProduct {
  name: string;
  sold: number;
  revenue: number;
}

const topProducts: TopProduct[] = [
  { name: "Áo thun nam cao cấp", sold: 156, revenue: 23400000 },
  { name: "Quần jean nữ slim fit", sold: 134, revenue: 26800000 },
  { name: "Giày sneaker unisex", sold: 98, revenue: 29400000 },
  { name: "Túi xách da thật", sold: 87, revenue: 43500000 },
  { name: "Đồng hồ thời trang", sold: 65, revenue: 32500000 },
];

const TopProducts = () => {
  const maxSold = Math.max(...topProducts.map((p) => p.sold));

  return (
    <div className="card-sharp p-6">
      <h3 className="text-lg font-bold mb-6">Sản phẩm bán chạy</h3>

      <div className="space-y-4">
        {topProducts.map((product, index) => (
          <div 
            key={product.name}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">{product.name}</span>
              <span className="text-sm text-muted-foreground">
                {product.sold} đã bán
              </span>
            </div>
            <div className="h-2 bg-muted border border-border">
              <div
                className="h-full bg-accent transition-all duration-500"
                style={{ width: `${(product.sold / maxSold) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Doanh thu: {product.revenue.toLocaleString("vi-VN")}đ
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopProducts;
