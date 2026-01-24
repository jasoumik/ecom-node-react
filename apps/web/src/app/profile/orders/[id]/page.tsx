"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Heading } from "@repo/ui";
import { API_URL } from "@/lib/config";
import { FullScreenLoader } from "@/components/ui/Loader";
import { formatDate } from "@/lib/utils";

export default function OrderInvoicePage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch(`${API_URL}/orders/${id}`)
      .then(res => res.json())
      .then(setOrder)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <FullScreenLoader />;
  if (!order) return <div>Order not found</div>;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 print:bg-white print:p-0 print:min-h-0">
        <div className="max-w-4xl mx-auto px-4 print:max-w-none print:px-0 print:mx-0">
          <div className="flex justify-between items-start mb-8 print:hidden">
            <Button variant="outline" onClick={() => router.back()}>← Back</Button>
            <Button onClick={handlePrint}>Print Invoice</Button>
          </div>

          <div id="invoice-content" className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 print:shadow-none print:border-0 print:rounded-none print:bg-white print:text-black print:p-0">
            {/* Header */}
            <div className="flex justify-between items-start mb-8 border-b border-slate-100 dark:border-slate-700 pb-8 print:border-slate-200">
              <div>
                <h1 className="text-3xl font-bold text-sky-500 mb-2 print:text-sky-600">Prithibee</h1>
                <p className="text-sm text-slate-500 print:text-slate-600">Your trusted partner in parenting</p>
                <p className="text-sm text-slate-500 print:text-slate-600">Dhaka, Bangladesh</p>
                <p className="text-sm text-slate-500 print:text-slate-600">support@prithibee.com</p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 print:text-black">INVOICE</h2>
                <p className="text-slate-600 dark:text-slate-300 font-medium print:text-slate-700">#{order.order_number}</p>
                <p className="text-sm text-slate-500 print:text-slate-600">Date: {formatDate(order.created_at)}</p>
                <div className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold capitalize border print:border-slate-300 print:bg-transparent print:text-black ${
                    order.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                    order.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-slate-50 text-slate-700 border-slate-200'
                }`}>
                    {order.status}
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 print:text-slate-500">Bill To</h3>
              <div className="text-slate-900 dark:text-white font-bold text-lg print:text-black">{order.customer_name}</div>
              <div className="text-slate-600 dark:text-slate-300 print:text-slate-700">{order.customer_phone}</div>
              <div className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap max-w-md print:text-slate-700">{order.customer_address}</div>
            </div>

            {/* Items */}
            <table className="w-full mb-8">
              <thead>
                <tr className="border-b-2 border-slate-100 dark:border-slate-700 print:border-slate-200">
                  <th className="text-left py-3 font-bold text-slate-600 dark:text-slate-300 print:text-slate-700">Item</th>
                  <th className="text-center py-3 font-bold text-slate-600 dark:text-slate-300 print:text-slate-700">Quantity</th>
                  <th className="text-right py-3 font-bold text-slate-600 dark:text-slate-300 print:text-slate-700">Price</th>
                  <th className="text-right py-3 font-bold text-slate-600 dark:text-slate-300 print:text-slate-700">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800 print:divide-slate-200">
                {order.items.map((item: any) => (
                  <tr key={item.id}>
                    <td className="py-4 text-slate-900 dark:text-white print:text-black">{item.product_name}</td>
                    <td className="py-4 text-center text-slate-600 dark:text-slate-400 print:text-slate-700">{item.quantity}</td>
                    <td className="py-4 text-right text-slate-600 dark:text-slate-400 print:text-slate-700">৳{item.price}</td>
                    <td className="py-4 text-right font-bold text-slate-900 dark:text-white print:text-black">৳{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-3">
                <div className="flex justify-between text-slate-600 dark:text-slate-400 print:text-slate-700">
                  <span>Subtotal</span>
                  <span>৳{order.subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 print:text-slate-700">
                  <span>Delivery</span>
                  <span>৳{order.delivery_charge}</span>
                </div>
                {parseFloat(order.discount) > 0 && (
                    <div className="flex justify-between text-green-600 print:text-slate-700">
                    <span>Discount</span>
                    <span>-৳{order.discount}</span>
                    </div>
                )}
                <div className="flex justify-between text-xl font-bold text-slate-900 dark:text-white border-t-2 border-slate-100 dark:border-slate-700 pt-3 print:border-slate-200 print:text-black">
                  <span>Total</span>
                  <span>৳{order.total_amount}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 text-center text-slate-500 text-sm print:border-slate-200 print:text-slate-600">
              <p>Thank you for shopping with Prithibee!</p>
              <p className="mt-1">For any queries, please contact us at +880 1700-000000</p>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        @media print {
          @page { margin: 20px; size: auto; }
          body { visibility: hidden; }
          #invoice-content {
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            background: white;
            color: black;
          }
          /* Ensure text colors are forced to black/dark for printing */
          #invoice-content * {
            color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </>
  );
}
