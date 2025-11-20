import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useCart } from "../../context/cart_context";
import { Trash2, Plus, Minus, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";


export default function CartPage() {
  const { cart, updateQty, removeFromCart, totalCount, subTotal, checkout, isSyncing, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem("isLoggedIn") === "true");

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleQty = async (productId, newQty) => {
    try {
      await updateQty(productId, newQty);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckoutAll = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    if (cart.length == 0) return;
    setLoading(true);
    try {
      const order = await checkout();
      navigate("/orders", { state: { highlightOrderId: order.id } });
    } catch (err) {
      console.error("checkout failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuySingle = async (entry) => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    setLoading(true);
    try {
      const order = await checkout([entry.id]);
      navigate("/orders", { state: { highlightOrderId: order.id } });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const empty = cart.length == 0;

  return (
    <motion.main
      transition={{ duration: 0.4, type: "spring" }}
      className="min-h-screen p-8 bg-[#FFF9F0]"
    >
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#3F3F3F]">Giỏ hàng</h1>
          <div className="text-sm text-gray-600">{totalCount} mặt hàng</div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {empty ? (
              <div className="p-8 rounded-2xl border border-dashed border-[#E8DAB5] bg-white/60 text-center">
                <p className="text-lg mb-4">Giỏ hàng trống</p>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} onClick={() => navigate("/")} className="px-6 py-3 rounded-full bg-[#CDB38B] text-white font-semibold">
                  Quay lại mua sắm
                </motion.button>
              </div>
            ) : (
              cart.map((it) => (
                <motion.div key={it.localId ?? it.id} layout className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-[#E8DAB5]">
                  <img src={it.image ?? it.productData?.image ?? "/placeholder.jpg"} alt={it.name} className="w-28 h-20 object-cover rounded-lg" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-lg text-[#3F3F3F]">{it.name}</div>
                        <div className="text-sm text-gray-500">{it.productData?.category ?? ""}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#CDB38B]">{Number(it.price || it.productData?.price || 0).toLocaleString()} VND</div>
                        <div className="text-xs text-gray-400">Tạm tính: {(Number(it.price || it.productData?.price || 0) * Number(it.quantity || 0)).toLocaleString()} VND</div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 border border-[#E8DAB5] rounded-full px-2 py-1">
                        <button onClick={() => handleQty(it.id, Math.max(1, (it.quantity || 1) - 1))} className="p-2">
                          <Minus size={14} />
                        </button>
                        <div className="px-3">{it.quantity}</div>
                        <button onClick={() => handleQty(it.id, (it.quantity || 1) + 1)} className="p-2">
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <motion.button whileTap={{ scale: 0.96 }} onClick={() => handleBuySingle(it)} className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FFB6C1] to-[#FFD7A6] text-sm font-semibold shadow">
                          <CreditCard size={16} className="inline-block mr-2" /> Mua ngay
                        </motion.button>

                        <motion.button whileTap={{ scale: 0.96 }} onClick={() => handleRemove(it.id)} className="p-2 rounded-lg bg-red-50 border border-red-100 text-red-600">
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <aside className="bg-white p-6 rounded-2xl shadow-sm border border-[#E8DAB5]">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">Tạm tính</div>
              <div className="font-bold text-lg text-[#3F3F3F]">{subTotal.toLocaleString()} VND</div>
            </div>

            <div className="mt-4 text-sm text-gray-600">Phí vận chuyển và thuế sẽ được tính khi thanh toán</div>

            <div className="mt-6 space-y-3">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleCheckoutAll} disabled={empty || loading || isSyncing} className={`w-full px-4 py-3 rounded-xl font-semibold ${empty ? "bg-gray-200 text-gray-500" : "bg-[#CDB38B] text-white"}`}>
                <div className="flex items-center justify-center gap-3">
                  <CreditCard /> Thanh toán ({totalCount})
                </div>
              </motion.button>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { clear(); }} className="w-full px-4 py-3 rounded-xl border border-[#E8DAB5] text-[#3F3F3F]">
                Xóa giỏ hàng
              </motion.button>
            </div>
          </aside>
        </section>
      </div>
    </motion.main>
  );
}
