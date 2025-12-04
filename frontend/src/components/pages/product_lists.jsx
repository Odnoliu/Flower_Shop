import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Info } from "lucide-react";
import { useSidebar } from "../../context/sidebar_context";
import { useNavigate } from "react-router-dom";
import ProductService from "../../services/product.service";
import PriceService from "../../services/price.service";
import ImageService from "../../services/image.service";
import CartService from "../../services/cart.service";
import { gsap } from "gsap";

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [detailProduct, setDetailProduct] = useState(null);
  const [detailImages, setDetailImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);

  const { setActivePage } = useSidebar();
  const navigate = useNavigate();

  useEffect(() => {
    setActivePage("Sản phẩm");
  }, [setActivePage]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await ProductService.list();
        const arr = Array.isArray(data)
          ? data
          : Array.isArray(data?.products)
          ? data.products
          : [];

        const basic = arr.map((raw) => {
          const id = raw.PRODUCT_Id ?? raw.id;
          const name = raw.PRODUCT_Name ?? raw.name;
          const image = raw.PRODUCT_Avatar ?? raw.image ?? "/placeholder.jpg";
          const category = raw.TYPE_Name ?? raw.category ?? "Hoa tươi";
          const rawPrice = Number(raw.PRICE_Price ?? raw.price ?? 0) || 0;

          return { ...raw, id, name, image, category, price: rawPrice };
        });

        const withPrice = await Promise.all(
          basic.map(async (p) => {
            if (!p.id) return p;
            try {
              const res = await PriceService.getByProductId(p.id);
              const list = Array.isArray(res)
                ? res
                : Array.isArray(res?.prices)
                ? res.prices
                : [];
              if (!list.length) return p;

              const parseDate = (d) => (d ? new Date(d) : new Date(0));
              const latest = list.reduce((acc, cur) => {
                const dCur = parseDate(
                  cur.PRICE_EffectiveDate ??
                    cur.effective_date ??
                    cur.created_at
                );
                const dAcc = parseDate(
                  acc.PRICE_EffectiveDate ??
                    acc.effective_date ??
                    acc.created_at
                );
                return dCur > dAcc ? cur : acc;
              }, list[0]);

              const priceNum =
                Number(latest.PRICE_Price ?? latest.price ?? 0) || p.price;
              return { ...p, price: priceNum };
            } catch (err) {
              console.warn("Failed to fetch price for product", p.id, err);
              return p;
            }
          })
        );

        setProducts(withPrice);
      } catch (err) {
        console.error("Failed to load products", err);
        setProducts([]);
      }
    };

    load();
  }, []);

  const addOrUpdateCart = async (product, qty = 1) => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") == "true";
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const accountId = Number(localStorage.getItem("accountId") || 0);
    if (!accountId) {
      console.warn("Không có ACCOUNT_Id trong localStorage");
      return;
    }

    const productId = product.PRODUCT_Id ?? product.id;
    if (!productId) return;

    const cartRes = await CartService.getCart();
    const cartList = Array.isArray(cartRes) ? cartRes : cartRes?.data || [];

    const existed = cartList.find(
      (row) =>
        Number(row.ACCOUNT_Id) == accountId &&
        Number(row.PRODUCT_Id) == Number(productId)
    );

    if (existed) {
      const newQty = Number(existed.CART_Quantity || 0) + qty;
      await CartService.updateItem(existed.CART_Id ?? existed.id, {
        CART_Quantity: newQty,
      });
    } else {
      await CartService.addItem({
        ACCOUNT_Id: accountId,
        PRODUCT_Id: productId,
        CART_Quantity: qty,
      });
    }
  };

  const handleAdd = async (e, product) => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") == "true";
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const imgEl =
      e?.currentTarget?.closest(".product-card")?.querySelector("img") ?? null;

    if (imgEl) {
      const clone = imgEl.cloneNode(true);
      const { top, left, width, height } = imgEl.getBoundingClientRect();
      clone.style.position = "absolute";
      clone.style.top = `${top}px`;
      clone.style.left = `${left}px`;
      clone.style.width = `${width}px`;
      clone.style.height = `${height}px`;
      clone.style.zIndex = 9999;
      clone.style.transition = "none";
      document.body.appendChild(clone);

      const cartIcon = document.getElementById("sidebar-cart-icon");
      if (cartIcon) {
        const { top: targetTop, left: targetLeft } =
          cartIcon.getBoundingClientRect();
        gsap.to(clone, {
          x: targetLeft - left,
          y: targetTop - top,
          scale: 0.2,
          duration: 0.6,
          ease: "power2.out",
          onComplete: () => clone.remove(),
        });
      } else {
        clone.remove();
      }
    }

    try {
      await addOrUpdateCart(product, 1);
    } catch (err) {
      console.error("Thêm vào giỏ thất bại", err);
    }
  };

  const openDetail = async (product) => {
    setDetailProduct(product);
    setDetailImages([]);
    setLoadingImages(true);
    try {
      const res = await ImageService.getByProduct(product.id);
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.images)
        ? res.images
        : [];
      setDetailImages(list);
    } catch (err) {
      console.error("Failed to load extended images", err);
      setDetailImages([]);
    } finally {
      setLoadingImages(false);
    }
  };

  const moneyFmt = (v) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(v || 0);

  return (
    <motion.main
      transition={{ duration: 0.4, type: "spring" }}
      className="p-8 bg-[#FFF9F0] min-h-screen"
    >
      <h1 className="text-3xl font-bold mb-6 text-[#3F3F3F]">
        Danh sách sản phẩm
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p, index) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
            className="bg-white border border-[#E8DAB5] rounded-2xl shadow-md hover:shadow-lg transition-all p-4 flex flex-col product-card"
          >
            <img
              src={p.image}
              alt={p.name}
              className="h-48 w-full object-cover rounded-xl mb-3"
            />
            <h3 className="text-lg font-semibold text-[#3F3F3F]">{p.name}</h3>
            <p className="text-sm text-gray-500 flex-grow mt-1">
              {p.category || "Hoa tươi"}
            </p>
            <p className="text-[#CDB38B] font-bold mt-2">
              {moneyFmt(p.price)} VND
            </p>
            <div className="flex justify-between mt-4">
              <button
                className="flex items-center gap-2 bg-[#CDB38B] text-white py-2 px-3 rounded-xl hover:bg-[#B8976D] transition"
                onClick={(e) => handleAdd(e, p)}
              >
                <ShoppingCart size={18} /> Thêm vào giỏ
              </button>
              <button
                className="flex items-center gap-2 border border-[#CDB38B] text-[#CDB38B] py-2 px-3 rounded-xl hover:bg-[#CDB38B] hover:text-white transition"
                onClick={() => openDetail(p)}
              >
                <Info size={18} /> Chi tiết
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {detailProduct && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-3xl w-full">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-[#3F3F3F]">
                {detailProduct.name}
              </h2>
              <button
                onClick={() => {
                  setDetailProduct(null);
                  setDetailImages([]);
                }}
                className="text-sm text-gray-500 hover:text-gray-800"
              >
                Đóng
              </button>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <img
                  src={detailProduct.image}
                  alt={detailProduct.name}
                  className="w-full h-56 object-cover rounded-xl border border-[#E8DAB5] mb-3"
                />
                <div className="flex gap-2 flex-wrap">
                  {loadingImages && (
                    <p className="text-xs text-gray-500">
                      Đang tải hình ảnh mở rộng...
                    </p>
                  )}
                  {!loadingImages &&
                    detailImages.map((img) => {
                      const id = img.IMAGE_Id ?? img.id;
                      const src = img.IMAGE_Image ?? img.url;
                      return (
                        <img
                          key={id}
                          src={src}
                          alt="extra"
                          className="w-16 h-16 object-cover rounded-lg border border-[#E8DAB5]"
                        />
                      );
                    })}
                  {!loadingImages && detailImages.length == 0 && (
                    <p className="text-xs text-gray-400">
                      Chưa có hình ảnh bổ sung cho sản phẩm này.
                    </p>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">
                  Loại: {detailProduct.category || "Hoa tươi"}
                </p>
                <p className="text-lg font-bold text-[#CDB38B] mb-2">
                  {moneyFmt(detailProduct.price)} VND
                </p>
                {detailProduct.description && (
                  <p className="text-sm text-gray-600 mb-3">
                    {detailProduct.description}
                  </p>
                )}
                <button
                  className="mt-2 px-4 py-2 rounded-xl bg-[#CDB38B] text-white text-sm font-semibold"
                  onClick={(e) => handleAdd(e, detailProduct)}
                >
                  Thêm vào giỏ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.main>
  );
}
