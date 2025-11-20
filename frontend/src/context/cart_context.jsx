import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import axiosClient from "../api/axios_client"; 
import { v4 as uuidv4 } from "uuid";


const CartContext = createContext();

const LOCAL_KEY = "cart_v1";

function getUserFromStorage() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function getToken() {
  return localStorage.getItem("token") || null;
}

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const user = useMemo(() => getUserFromStorage(), []);
  const token = useMemo(() => getToken(), []);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setIsSyncing(true);
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axiosClient.get(`/cart?userId=${user.id}`, { headers });
        const serverCart = Array.isArray(res.data) ? res.data : [];
        const merged = mergeCarts(cart, serverCart);
        const synced = await syncMergedToServer(merged, user.id, headers);
        setCart(synced);
      } catch (err) {
        console.error("Cart sync failed:", err);
      } finally {
        setIsSyncing(false);
      }
    })();
  }, [user]);

  function mergeCarts(local, server) {
    const map = new Map();
    for (const s of server) {
      const pid = s.productId ?? s.product?.id ?? s.productId;
      const key = `${pid}`;
      map.set(key, {
        productId: pid,
        quantity: Number(s.quantity || 1),
        serverId: s.id,
        productData: s.product ?? s.productData ?? { id: pid, name: s.name, image: s.image, price: s.price },
      });
    }
    for (const l of local) {
      const pid = l.id ?? l.product?.id ?? l.productId;
      const key = `${pid}`;
      const existing = map.get(key);
      if (existing) {
        existing.quantity = (existing.quantity || 0) + (l.quantity || 1);
      } else {
        map.set(key, {
          productId: pid,
          quantity: Number(l.quantity || 1),
          serverId: l.serverId ?? null,
          productData: l.productData ?? { id: pid, name: l.name, image: l.image, price: l.price },
        });
      }
    }
    const out = [];
    for (const [k, v] of map) {
      out.push({
        localId: uuidv4(),
        id: v.productId,
        quantity: v.quantity,
        serverId: v.serverId ?? null,
        productData: v.productData,
        name: v.productData?.name,
        image: v.productData?.image,
        price: v.productData?.price,
      });
    }
    return out;
  }

  async function syncMergedToServer(merged, userId, headers = {}) {
    const out = [];
    for (const item of merged) {
      try {
        if (item.serverId) {
          await axiosClient.patch(`/cart/${item.serverId}`, { quantity: item.quantity }, { headers }).catch(() => {});
          out.push({ ...item });
        } else {
          const payload = {
            userId,
            productId: item.id,
            quantity: item.quantity,
            productData: item.productData,
          };
          const created = await axiosClient.post("/cart", payload, { headers });
          const serverId = created?.data?.id ?? null;
          out.push({ ...item, serverId });
        }
      } catch (err) {
        console.warn("sync item failed", err);
        out.push(item);
      }
    }
    return out;
  }

  const totalCount = useMemo(() => cart.reduce((s, it) => s + Number(it.quantity || 0), 0), [cart]);
  const subTotal = useMemo(
    () => cart.reduce((s, it) => s + (Number(it.price || it.productData?.price || 0) * Number(it.quantity || 0)), 0),
    [cart]
  );

  const findIndexByProductId = (productId) => cart.findIndex((c) => `${c.id}` == `${productId}` || `${c.productData?.id}` == `${productId}`);

  const addToCart = async (product, qty = 1, options = {}) => {
    const pid = product.id ?? product.productId ?? product._id;
    const price = product.price ?? product.pricePerUnit ?? product.product?.price ?? 0;
    const name = product.name ?? product.title ?? "Sản phẩm";
    const image = product.image ?? product.img ?? (product.product?.image) ?? "";

    setCart((prev) => {
      const idx = prev.findIndex((it) => `${it.id}` == `${pid}`);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + qty };
        return copy;
      } else {
        return [
          ...prev,
          {
            localId: uuidv4(),
            id: pid,
            name,
            image,
            price,
            quantity: qty,
            productData: product,
            serverId: null,
          },
        ];
      }
    });

    if (user) {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axiosClient.get(`/cart?userId=${user.id}&productId=${pid}`, { headers });
        const found = Array.isArray(res.data) && res.data.length > 0 ? res.data[0] : null;
        if (found) {
          await axiosClient.patch(`/cart/${found.id}`, { quantity: found.quantity + qty }, { headers });
          setCart((prev) => prev.map((it) => (`${it.id}` == `${pid}` ? { ...it, serverId: found.id } : it)));
        } else {
          const payload = {
            userId: user.id,
            productId: pid,
            quantity: qty,
            productData: product,
          };
          const created = await axiosClient.post("/cart", payload, { headers });
          const serverId = created?.data?.id ?? null;
          setCart((prev) => prev.map((it) => (`${it.id}` == `${pid}` ? { ...it, serverId } : it)));
        }
      } catch (err) {
        console.error("addToCart sync error", err);
      }
    }
  };

  const removeFromCart = async (productId) => {
    const pid = productId;
    setCart((prev) => prev.filter((it) => `${it.id}` !== `${pid}`));
    if (user) {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axiosClient.get(`/cart?userId=${user.id}&productId=${pid}`, { headers });
        const found = Array.isArray(res.data) && res.data.length > 0 ? res.data[0] : null;
        if (found) {
          await axiosClient.delete(`/cart/${found.id}`, { headers });
        }
      } catch (err) {
        console.error("removeFromCart error", err);
      }
    }
  };

  const updateQty = async (productId, qty) => {
    const newQty = Math.max(1, Math.floor(Number(qty) || 1));
    setCart((prev) => prev.map((it) => (`${it.id}` == `${productId}` ? { ...it, quantity: newQty } : it)));
    if (user) {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axiosClient.get(`/cart?userId=${user.id}&productId=${productId}`, { headers });
        const found = Array.isArray(res.data) && res.data.length > 0 ? res.data[0] : null;
        if (found) {
          await axiosClient.patch(`/cart/${found.id}`, { quantity: newQty }, { headers });
        }
      } catch (err) {
        console.error("updateQty error", err);
      }
    }
  };

  const checkout = async (items = null, extra = { address: null, note: "" }) => {
    if (!user) {
      const err = new Error("NOT_AUTHENTICATED");
      err.code = "NOT_AUTH";
      throw err;
    }

    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const itemsToBuy = (() => {
      if (!items) return [...cart];
      if (Array.isArray(items) && items.length > 0 && (typeof items[0] == "string" || typeof items[0] == "number")) {
        return cart.filter((c) => items.includes(`${c.id}`) || items.includes(c.id));
      }
      return cart.filter((c) => items.some((it) => `${it.id}` == `${c.id}` || `${it.localId}` == `${c.localId}`));
    })();

    if (itemsToBuy.length == 0) {
      throw new Error("NO_ITEMS");
    }
    const total = itemsToBuy.reduce((s, it) => s + Number(it.price || it.productData?.price || 0) * Number(it.quantity || 0), 0);
    const orderPayload = {
      userId: user.id,
      items: itemsToBuy.map((it) => ({
        productId: it.id,
        quantity: it.quantity,
        price: it.price ?? it.productData?.price ?? 0,
        productData: it.productData ?? { id: it.id, name: it.name, image: it.image },
      })),
      total,
      address: extra.address ?? user.address ?? null,
      note: extra.note ?? "",
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await axiosClient.post("/orders", orderPayload, { headers });
      const order = res?.data;
      for (const it of itemsToBuy) {
        try {
          if (it.serverId) {
            await axiosClient.delete(`/cart/${it.serverId}`, { headers });
          } else {
            const found = await axiosClient.get(`/cart?userId=${user.id}&productId=${it.id}`, { headers });
            if (Array.isArray(found.data) && found.data.length > 0) {
              await axiosClient.delete(`/cart/${found.data[0].id}`, { headers });
            }
          }
        } catch (innerErr) {
          console.warn("Failed to remove item from server cart after checkout", innerErr);
        }
      }
      setCart((prev) => prev.filter((p) => !itemsToBuy.some((b) => `${b.id}` == `${p.id}`)));

      return order;
    } catch (err) {
      console.error("checkout error", err);
      throw err;
    }
  };

  const clear = async () => {
    const old = cart;
    setCart([]);
    if (user) {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axiosClient.get(`/cart?userId=${user.id}`, { headers });
        if (Array.isArray(res.data)) {
          await Promise.all(res.data.map((it) => axiosClient.delete(`/cart/${it.id}`, { headers })));
        }
      } catch (err) {
        console.error("clear server cart failed", err);
        setCart(old);
      }
    }
  };

  const refreshFromServer = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axiosClient.get(`/cart?userId=${user.id}`, { headers });
      const serverCart = Array.isArray(res.data)
        ? res.data.map((s) => ({
            localId: uuidv4(),
            id: s.productId,
            serverId: s.id,
            quantity: s.quantity,
            productData: s.productData ?? {},
            name: s.productData?.name ?? "",
            image: s.productData?.image ?? "",
            price: s.productData?.price ?? s.price ?? 0,
          }))
        : [];
      setCart(serverCart);
    } catch (err) {
      console.error("refreshFromServer error", err);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        totalCount,
        subTotal,
        checkout,
        clear,
        refreshFromServer,
        isSyncing,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
