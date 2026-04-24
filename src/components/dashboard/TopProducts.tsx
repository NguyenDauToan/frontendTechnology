import { cn } from "@/lib/utils";

interface TopProduct {
  _id: string;
  name: string;
  sold: number;
  price: number;
}

interface Props {
  products: TopProduct[];
}

const TopProducts = ({ products }: Props) => {
  if (!products || products.length === 0)
    return <div className="p-6">Không có dữ liệu</div>;

  const maxSold = Math.max(...products.map(p => p.sold || 0), 1);

  return (
    <div className="card-sharp p-6">
      <h3 className="text-lg font-bold mb-6">Sản phẩm bán chạy</h3>

      <div className="space-y-4">
        {products.map((product, index) => (
          <div key={product._id}>
            
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">{product.name}</span>
              <span className="text-muted-foreground">
                {product.sold} đã bán
              </span>
            </div>

            <div className="h-2 bg-muted border border-border">
              <div
                className="h-full bg-accent transition-all duration-500"
                style={{
                  width: `${(product.sold / maxSold) * 100}%`
                }}
              />
            </div>

            <p className="text-xs text-muted-foreground mt-1">
              Giá: {product.price?.toLocaleString("vi-VN")}đ
            </p>

          </div>
        ))}
      </div>
    </div>
  );
};

export default TopProducts;