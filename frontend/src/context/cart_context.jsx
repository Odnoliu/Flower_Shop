import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";

import CartService from "../services/cart.service";
import ProductService from "../services/product.service";
import PriceService from "../services/price.service";

const CartContext = createContext();

function getAccountId() {
  if (typeof window == "undefined") return null;
  return localStorage.getItem("accountId");
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const accountId = getAccountId();

  const getLatestPrice = async (productId) => {
    try {
      const res = await PriceService.getByProductId(productId);
      const list = Array.isArray(res) ? res : res?.prices || [];
      if (!list.length) return null;

      const latest = list.reduce((acc, cur) => {
        const dCur = new Date(
          cur.PRICE_EffectiveDate || cur.effective_date || cur.created_at || 0
        );
        const dAcc = new Date(
          acc.PRICE_EffectiveDate || acc.effective_date || acc.created_at || 0
        );
        return dCur > dAcc ? cur : acc;
      }, list[0]);

      const priceNum = Number(latest.PRICE_Price ?? latest.price ?? 0) || 0;
      return priceNum;
    } catch (err) {
      console.warn("Không lấy được giá mới nhất cho product", productId, err);
      return null;
    }
  };

  const loadServerCart = async () => {
    if (!accountId) {
      setCart([]);
      return;
    }

    setIsSyncing(true);
    try {
      const res = await CartService.getCart();
      const cartRows = Array.isArray(res) ? res : res?.data || [];

      if (!cartRows.length) {
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
        cartRows.map(async (row) => {
          const productId = row.PRODUCT_Id;
          const product = productMap[productId] || {};

          let price =
            Number(product.PRICE_Price ?? product.price ?? 0) || 0;
          const latestPrice = await getLatestPrice(productId);
          if (latestPrice !== null) price = latestPrice;

          return {
            localId: uuidv4(),
            cartId: row.CART_Id ?? row.id,
            id: productId, 
            quantity: Number(row.CART_Quantity ?? 1),
            price,
            name: product.PRODUCT_Name ?? product.name ?? "Sản phẩm",
            image:
              product.PRODUCT_Avatar ??
              product.image ??
              "/placeholder.jpg",
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
    loadServerCart();
  }, [accountId]);

  const totalCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const subTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const addToCart = async (product, qty = 1) => {
    if (!accountId) {
      console.warn("Chưa có accountId, không thể thêm vào giỏ hàng");
      return;
    }

    const productId = product.PRODUCT_Id ?? product.id;
    if (!productId) return;

    try {
      await CartService.addItem({
        ACCOUNT_Id: Number(accountId),
        PRODUCT_Id: productId,
        CART_Quantity: qty,
      });
      await loadServerCart();
    } catch (err) {
      console.error("Thêm vào giỏ thất bại:", err);
    }
  };

  const updateQty = async (productId, newQty) => {
    const item = cart.find((i) => i.id == productId);
    if (!item) return;
    if (newQty <= 0) return;

    try {
      await CartService.updateItem(item.cartId, {
        CART_Quantity: newQty,
      });
      await loadServerCart();
    } catch (err) {
      console.error("Cập nhật số lượng thất bại:", err);
    }
  };

  const removeFromCart = async (productId) => {
    const item = cart.find((i) => i.id == productId);
    if (!item) return;

    try {
      await CartService.clear(`/${item.cartId}`);
      setCart((prev) => prev.filter((i) => i.id !== productId));
    } catch (err) {
      console.error("Xóa sản phẩm khỏi giỏ thất bại:", err);
      await loadServerCart();
    }
  };

  const removeMany = async (items) => {
    for (const it of items) {
      try {
        const item = cart.find((c) => c.id == it.id);
        if (!item) continue;
        await CartService.clear(`/${item.cartId}`);
      } catch (err) {
        console.error("Xóa dòng cart thất bại:", err);
      }
    }
    await loadServerCart();
  };

  const clear = async () => {
    try {
      for (const it of cart) {
        await CartService.clear(`/${it.cartId}`);
      }
      setCart([]);
    } catch (err) {
      console.error("Xóa toàn bộ giỏ hàng thất bại:", err);
      await loadServerCart();
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        totalCount,
        subTotal,
        isSyncing,
        addToCart,
        updateQty,
        removeFromCart,
        removeMany,
        clear,
        reload: loadServerCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
