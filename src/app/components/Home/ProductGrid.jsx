import products from "../../data/products.json";

const ProductGrid = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {products.map(product => (
        <div key={product.id} className="bg-white rounded-xl border shadow-sm p-4">
          <img src={product.image} alt={product.title} className="h-48 w-full object-contain" />
          <h3 className="text-sm font-semibold text-gray-800">{product.title}</h3>
          <p className="text-sm text-gray-600">{product.category}</p>
          <p className="text-green-700 font-bold">${product.price}</p>
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
