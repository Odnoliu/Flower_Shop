import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Minus, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

import CartService from "../../services/cart.service";
import ProductService from "../../services/product.service";
import PriceService from "../../services/price.service";
import PaymentService from "../../services/payment.service";
import OrderService from "../../services/order.service";
import OrderDetailService from "../../services/order_detail.service";

const BANK_BIN = "970423";
const ACCOUNT_NUMBER = "50358064203";
const ACCOUNT_NAME = "Bui Phuoc Thuan";

export default function CartPage() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [qrModal, setQrModal] = useState({
    open: false,
    items: [],
    qr: null,
    amount: 0,
  });

  const navigate = useNavigate();

  const totalCount = useMemo(
    () => cart.reduce((s, it) => s + it.quantity, 0),
    [cart]
  );
  const subTotal = useMemo(
    () => cart.reduce((s, it) => s + it.price * it.quantity, 0),
    [cart]
  );

  const empty = !cart || cart.length == 0;

  const getLatestPrice = async (productId, fallback = 0) => {
    try {
      const res = await PriceService.getByProductId(productId);
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.prices)
        ? res.prices
        : [];
      if (!list.length) return fallback;

      const parseDate = (d) => (d ? new Date(d) : new Date(0));
      const latest = list.reduce((acc, cur) => {
        const dCur = parseDate(
          cur.PRICE_EffectiveDate ?? cur.effective_date ?? cur.created_at
        );
        const dAcc = parseDate(
          acc.PRICE_EffectiveDate ?? acc.effective_date ?? acc.created_at
        );
        return dCur > dAcc ? cur : acc;
      }, list[0]);

      const priceNum =
        Number(latest.PRICE_Price ?? latest.price ?? fallback) || fallback;
      return priceNum;
    } catch (err) {
      console.warn("Không lấy được giá mới nhất", productId, err);
      return fallback;
    }
  };


  const loadCart = async () => {
    setIsSyncing(true);
    try {
      const cartRes = await CartService.getCart();
      const allRows = Array.isArray(cartRes) ? cartRes : cartRes?.data || [];

      const accountId =
        typeof window != "undefined"
          ? Number(localStorage.getItem("accountId") || 0)
          : 0;

      const rows = accountId
        ? allRows.filter(
            (row) => Number(row.ACCOUNT_Id ?? row.account_id) == accountId
          )
        : [];

      if (!rows.length) {
        setCart([]);
        return;
      }

      const productsRes = await ProductService.list();
      const productList = Array.isArray(productsRes)
        ? productsRes
        : productsRes?.products || productsRes?.data || [];

      const productMap = {};
      for (const p of productList) {
        const pid = p.PRODUCT_Id ?? p.id;
        if (pid) productMap[pid] = p;
      }

      const enriched = await Promise.all(
        rows.map(async (row) => {
          const productId = row.PRODUCT_Id;
          const product = productMap[productId] || {};
          const fallbackPrice =
            Number(product.PRICE_Price ?? product.price ?? 0) || 0;
          const price = await getLatestPrice(productId, fallbackPrice);

          return {
            cartId: row.CART_Id ?? row.id,
            id: productId,
            quantity: Number(row.CART_Quantity ?? 1),
            price,
            name: product.PRODUCT_Name ?? product.name ?? "Sản phẩm",
            image:
              product.PRODUCT_Avatar ??
              product.image ??
              "/placeholder.jpg",
            category: product.TYPE_Name ?? product.category ?? "Hoa tươi",
            productData: product,
          };
        })
      );

      setCart(enriched);
    } catch (err) {
      console.error("Lỗi load giỏ hàng:", err);
      setCart([]);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const handleQty = async (productId, newQty) => {
    const item = cart.find((c) => c.id == productId);
    if (!item || newQty <= 0) return;

    try {
      await CartService.updateItem(item.cartId, {
        CART_Quantity: newQty,
      });
      setCart((prev) =>
        prev.map((it) =>
          it.id == productId ? { ...it, quantity: newQty } : it
        )
      );
    } catch (err) {
      console.error("Update qty failed", err);
      await loadCart();
    }
  };

  const clearAllByPhone = async () => {
    const account_id =
      typeof window !== "undefined" ? localStorage.getItem("accountId") : null;
    if (!account_id) {
      console.warn("Không tìm thấy phone trong localStorage để xóa giỏ hàng");
      return;
    }

    try {
      await CartService.clear(account_id);
      await loadCart();
    } catch (err) {
      console.error("Xóa toàn bộ giỏ hàng theo phone thất bại", err);
    }
  };

  const createPaymentAndShowQR = async (items, amount) => {
    const amt = Number(amount || 0);
    if (!items?.length || !amt) return;

    try {
      const payload = {
        bank_bin: BANK_BIN,
        account_number: ACCOUNT_NUMBER,
        account_name: ACCOUNT_NAME,
        amount: amt,
        description: "Thanh toán đơn hàng hoa",
      };
      const qrData = await PaymentService.create(payload);

      setQrModal({
        open: true,
        items,
        qr: { ...qrData, amount: amt },
        amount: amt,
      });
    } catch (err) {
      console.error("Failed to create QR", err);
    }
  };

  const handleCheckoutAll = async () => {
    if (empty) return;
    setLoading(true);
    try {
      await createPaymentAndShowQR(cart, subTotal);
    } catch (err) {
      console.error("Checkout all failed", err);
    } finally {
      setLoading(false);
    }
  };

  const closeQRModal = () => {
    setQrModal({ open: false, items: [], qr: null, amount: 0 });
  };

const handleConfirmPaid = async () => {
  if (!qrModal.items?.length || !qrModal.amount) {
    closeQRModal();
    return;
  }

  const phone =
    typeof window !== "undefined"
      ? localStorage.getItem("phone")
      : null;
  if (!phone) {
    console.warn("Không có USER_Phone để tạo đơn hàng");
    closeQRModal();
    return;
  }

  setLoading(true);
  try {
    const payload = {
      data: {
        USER_Phone: phone,
        ORDER_Total: qrModal.amount,
      },
      detail: qrModal.items.map((it) => ({
        PRODUCT_Id: it.productData?.PRODUCT_Id ?? it.id,
        ORDERDETAIL_Quantity: it.quantity ?? 1,
      })),
    };

    const order = await OrderService.create(payload);
    const orderId = order?.ORDER_Id ?? order?.id;
    if (!orderId) {
      console.error("Không nhận được ORDER_Id");
      setLoading(false);
      return;
    }
    await clearAllByPhone?.(); 

    closeQRModal();
  } catch (err) {
    console.error("Xử lý sau thanh toán thất bại:", err);
  } finally {
    setLoading(false);
  }
};


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
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/")}
                  className="px-6 py-3 rounded-full bg-[#CDB38B] text-white font-semibold"
                >
                  Quay lại mua sắm
                </motion.button>
              </div>
            ) : (
              cart.map((it) => (
                <motion.div
                  key={it.cartId}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="bg-white rounded-2xl border border-[#E8DAB5] p-4 flex items-start gap-4"
                >
                  <img
                    src={it.image}
                    alt={it.name}
                    className="w-24 h-24 object-cover rounded-xl"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#3F3F3F]">
                      {it.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {it.category || "Hoa tươi"}
                    </p>
                    <p className="text-[#CDB38B] font-bold mt-2">
                      {(it.price * it.quantity).toLocaleString()} VND
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() =>
                          handleQty(it.id, it.quantity - 1)
                        }
                        disabled={it.quantity <= 1}
                        className="p-1 rounded-lg bg-gray-100 border border-gray-200 disabled:opacity-50"
                      >
                        <Minus size={14} />
                      </motion.button>
                      <span className="text-sm font-medium w-8 text-center">
                        {it.quantity}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() =>
                          handleQty(it.id, it.quantity + 1)
                        }
                        className="p-1 rounded-lg bg-gray-100 border border-gray-200"
                      >
                        <Plus size={14} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <aside className="bg-white p-6 rounded-2xl shadow-sm border border-[#E8DAB5]">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">Tạm tính</div>
              <div className="font-bold text-lg text-[#3F3F3F]">
                {subTotal.toLocaleString()} VND
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Phí vận chuyển và thuế sẽ được tính khi thanh toán
            </div>
            <div className="mt-6 space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckoutAll}
                disabled={empty || loading || isSyncing}
                className={`w-full px-4 py-3 rounded-xl font-semibold ${
                  empty
                    ? "bg-gray-200 text-gray-500"
                    : "bg-[#CDB38B] text-white"
                } disabled:opacity-70`}
              >
                <div className="flex items-center justify-center gap-3">
                  <CreditCard /> Thanh toán toàn bộ ({totalCount})
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={clearAllByPhone}
                className="w-full px-4 py-3 rounded-xl border border-[#E8DAB5] text-[#3F3F3F]"
              >
                Xóa toàn bộ giỏ hàng
              </motion.button>
            </div>
          </aside>
        </section>
      </div>

      {qrModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h2 className="text-xl font-bold mb-2 text-[#3F3F3F]">
              Thanh toán đơn hàng
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Quét mã QR bên dưới để thanh toán. Sau khi chuyển khoản xong, hãy
              bấm{" "}
              <span className="font-semibold">
                "Xác nhận đã thanh toán"
              </span>
              .
            </p>
            <div className="flex flex-col items-center gap-3 mb-4">
              {qrModal.qr?.qr_code ? (
                <img
                  src={qrModal.qr.qr_code}
                  alt="QR thanh toán"
                  className="w-48 h-48 object-contain rounded-xl border"
                />
              ) : qrModal.qr?.qr_link ? (
                <img
                  src={qrModal.qr.qr_link}
                  alt="QR thanh toán"
                  className="w-48 h-48 object-contain rounded-xl border"
                />
              ) : (
                <p className="text-sm text-red-500">
                  Không lấy được mã QR. Vui lòng thử lại sau.
                </p>
              )}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Số tiền cần thanh toán
                </p>
                <p className="text-lg font-bold text-[#CDB38B]">
                  {(qrModal.qr?.amount ?? 0).toLocaleString()} VND
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <button
                type="button"
                onClick={closeQRModal}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleConfirmPaid}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-[#CDB38B] text-white font-semibold text-sm"
              >
                Xác nhận đã thanh toán
              </button>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Nhân viên cửa hàng sẽ kiểm tra giao dịch và cập nhật trạng thái
              đơn hàng sau khi nhận được tiền.
            </p>
          </div>
        </div>
      )}
    </motion.main>
  );
}
