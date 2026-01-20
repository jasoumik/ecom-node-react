import { Heading, Text, Button, ResponsiveImage } from "@repo/ui";

async function getProduct(id: string) {
  const res = await fetch(`http://localhost:3000/api/products/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center dark:bg-slate-900 dark:text-white">Product not found</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square rounded-3xl overflow-hidden bg-white shadow-lg dark:bg-slate-800">
              {product.images && product.images[0] ? (
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 dark:bg-slate-700 dark:text-slate-500">No Image</div>
              )}
            </div>
            <div className="grid grid-cols-4 gap-4">
              {product.images?.slice(1).map((img: string, i: number) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-white shadow cursor-pointer hover:opacity-80 dark:bg-slate-800">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <div className="text-sm font-bold text-rose-500 uppercase tracking-wider mb-2">{product.category}</div>
              <Heading as="h1" size="xl" className="font-serif dark:text-white">{product.name}</Heading>
              <div className="text-3xl font-bold text-slate-900 dark:text-white mt-4">৳{product.price}</div>
            </div>

            <Text className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              {product.description}
            </Text>

            <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
              <Button className="w-full py-4 text-lg rounded-full shadow-xl shadow-rose-500/20 bg-rose-500 text-white hover:bg-rose-600 hover:scale-105 transition-all duration-300">
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
