"use client";

import { useEffect, useState } from "react";
import { Heading, Button } from "@repo/ui";
import { API_URL } from "@/lib/config";
import { Table } from "@/components/ui/Table";
import { FullScreenLoader } from "@/components/ui/Loader";
import { FilterBar } from "@/components/ui/FilterBar";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { X, Search } from "lucide-react";

export default function StockLedgerPage() {
  const [movements, setMovements] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToast();

  // Adjustment Form State
  const [searchTerm, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>("");
  const [adjustmentType, setAdjustmentType] = useState("wastage");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMovements(1);
  }, []);

  // Debounced search
  useEffect(() => {
      const timer = setTimeout(() => {
          if (searchTerm.length >= 2) {
              fetch(`${API_URL}/products?search=${searchTerm}&limit=5`)
                  .then(res => res.json())
                  .then(data => setSearchResults(data.data || []))
                  .catch(console.error);
          } else {
              setSearchResults([]);
          }
      }, 300);
      return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchMovements = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/products/stock-movements?page=${page}&limit=20`);
      const data = await res.json();
      if (data.data && Array.isArray(data.data)) {
          setMovements(data.data);
          setMeta(data.meta);
      } else {
          setMovements([]);
      }
    } catch (e) {
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedProduct) return;
      
      setSubmitting(true);
      try {
          const res = await fetch(`${API_URL}/products/adjust-stock`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  productId: selectedProduct.id,
                  variantId: selectedVariant || undefined,
                  quantity: parseInt(quantity.toString()),
                  type: adjustmentType,
                  reason
              })
          });
          
          if (res.ok) {
              addToast("Stock adjusted successfully", "success");
              setIsModalOpen(false);
              fetchMovements(1);
              // Reset form
              setSelectedProduct(null);
              setSearchQuery("");
              setQuantity(1);
              setReason("");
          } else {
              addToast("Failed to adjust stock", "error");
          }
      } catch (e) {
          addToast("Error adjusting stock", "error");
      } finally {
          setSubmitting(false);
      }
  };

  if (loading && movements.length === 0) return <FullScreenLoader />;

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
            <Heading size="md" className="font-sans text-slate-800 dark:text-white mb-0.5">Stock Ledger</Heading>
            <p className="text-xs text-slate-500">Audit trail of all inventory changes</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="rounded-lg shadow-sm py-2 px-4 text-xs h-auto">
            Adjust Stock
        </Button>
      </div>

      <FilterBar onSearch={() => {}} placeholder="Search by product..." />

      <Table
        data={movements}
        columns={[
          {
            header: "Date",
            cell: (m) => <span className="text-slate-500 dark:text-slate-400 text-xs">{new Date(m.created_at).toLocaleString()}</span>
          },
          {
            header: "Product",
            accessorKey: "product_name",
            className: "font-bold text-slate-900 dark:text-white text-xs"
          },
          {
            header: "Change",
            cell: (m) => (
                <span className={`font-bold text-xs ${m.quantity_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {m.quantity_change > 0 ? '+' : ''}{m.quantity_change}
                </span>
            )
          },
          {
            header: "Type",
            cell: (m) => (
                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                    m.type === 'sale' ? 'bg-blue-50 text-blue-600' :
                    m.type === 'batch_purchase' ? 'bg-green-50 text-green-600' :
                    m.type === 'cancellation_restock' ? 'bg-amber-50 text-amber-600' :
                    ['wastage', 'broken', 'offline_sale'].includes(m.type) ? 'bg-red-50 text-red-600' :
                    'bg-slate-100 text-slate-600'
                }`}>
                    {m.type.replace(/_/g, ' ')}
                </span>
            )
          },
          {
            header: "Reason",
            accessorKey: "reason",
            className: "text-slate-600 dark:text-slate-300 text-xs"
          }
        ]}
      />
      
      {/* Pagination */}
      <div className="flex justify-between items-center pt-2">
          <Button 
              variant="outline" 
              disabled={meta.page === 1}
              onClick={() => fetchMovements(meta.page - 1)}
              className="rounded-lg py-1.5 px-3 text-xs h-auto"
          >
              Previous
          </Button>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Page {meta.page} of {meta.totalPages}
          </span>
          <Button 
              variant="outline" 
              disabled={meta.page === meta.totalPages}
              onClick={() => fetchMovements(meta.page + 1)}
              className="rounded-lg py-1.5 px-3 text-xs h-auto"
          >
              Next
          </Button>
      </div>

      {/* Adjustment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md p-6 rounded-2xl shadow-xl relative">
            <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
                <X size={20} />
            </button>
            
            <Heading size="md" className="mb-6">Adjust Stock</Heading>
            
            <form onSubmit={handleAdjustStock} className="space-y-4">
              {/* Product Search */}
              <div className="relative">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Product</label>
                  {selectedProduct ? (
                      <div className="flex items-center justify-between p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
                          <span className="text-sm font-medium truncate">{selectedProduct.name}</span>
                          <button type="button" onClick={() => { setSelectedProduct(null); setSearchQuery(""); }} className="text-slate-400 hover:text-red-500">
                              <X size={16} />
                          </button>
                      </div>
                  ) : (
                      <>
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search product..." 
                                value={searchTerm}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm"
                            />
                        </div>
                        {searchResults.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                {searchResults.map(p => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => { setSelectedProduct(p); setSearchResults([]); }}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        {p.name}
                                    </button>
                                ))}
                            </div>
                        )}
                      </>
                  )}
              </div>

              {/* Variant Select (if applicable) */}
              {selectedProduct && selectedProduct.has_variants && (
                  <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Variant (Optional)</label>
                      <select 
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm"
                          value={selectedVariant}
                          onChange={e => setSelectedVariant(e.target.value)}
                      >
                          <option value="">Select Variant</option>
                          {/* Note: In a real app, we'd need to fetch variants for this product. 
                              For now, assuming variants are loaded or we fetch them. 
                              Since search results might not have variants, we might need to fetch product details.
                              Let's assume search results include variants or we fetch them on selection.
                           */}
                      </select>
                      <p className="text-[10px] text-amber-500 mt-1">Note: Variants not fully supported in this quick view yet.</p>
                  </div>
              )}

              <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Adjustment Type</label>
                  <select 
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm"
                      value={adjustmentType}
                      onChange={e => setAdjustmentType(e.target.value)}
                  >
                      <option value="wastage">Wastage (Reduce Stock)</option>
                      <option value="broken">Broken (Reduce Stock)</option>
                      <option value="offline_sale">Offline Sale (Reduce Stock)</option>
                      <option value="correction_remove">Correction (Reduce Stock)</option>
                      <option value="correction_add">Correction (Add Stock)</option>
                  </select>
              </div>

              <Input 
                label="Quantity" 
                type="number" 
                min="1"
                value={quantity} 
                onChange={e => setQuantity(parseInt(e.target.value))} 
                required 
              />

              <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Reason / Note</label>
                  <textarea 
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm"
                      rows={3}
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                  />
              </div>
              
              <Button fullWidth type="submit" disabled={submitting} className="mt-4">
                {submitting ? "Adjusting..." : "Confirm Adjustment"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
