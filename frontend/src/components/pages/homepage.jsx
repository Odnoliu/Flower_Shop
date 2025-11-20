import React, { Suspense, useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Html,
  useGLTF,
  ContactShadows,
} from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { Flower2, Truck, Heart, Star, ShoppingBag } from "lucide-react";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Helmet, HelmetProvider } from "@vuer-ai/react-helmet-async";
import { useSidebar } from "../../context/sidebar_context";
function BackgroundModel({ src }) {
  const gltf = useGLTF(src, true);
  const ref = useRef();
  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.12;
    ref.current.position.y = Math.sin(state.clock.elapsedTime / 3) * 0.04;
  });
  return (
    <group ref={ref} dispose={null} scale={[1.4, 1.4, 1.4]}>
      <primitive object={gltf.scene} />
    </group>
  );
}

function CanvasWrapper({ model, visible = true }) {
  return (
    <div
      className={`w-full h-full ${
        visible
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      } transition-opacity duration-500`}
    >
      <Canvas
        shadows
        dpr={[1, 1.6]}
        camera={{ position: [0, 1.5, 0], fov: 40 }}
        style={{ height: "100%", width: "100%" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 1, 5]} intensity={0.8} castShadow />
        <Suspense
          fallback={
            <Html center>
              <div className="bg-white/90 px-6 py-2 rounded">Loading 3D...</div>
            </Html>
          }
        >
          {model ? <BackgroundModel src={model} /> : null}
          <Environment preset="sunset" />
          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={0.6}
            blur={1.2}
            far={3}
          />
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          maxPolarAngle={Math.PI / 2.1}
          autoRotate
          autoRotateSpeed={0.25}
        />
      </Canvas>
    </div>
  );
}

export default function HomePageContent({
  isActive = true,
  onNavigate, 
}) {
  const {setActivePage } = useSidebar();

  useEffect(() => {
    setActivePage("Trang chủ");
  }, [setActivePage]);
  const backgroundModel = "/models/flower_bouquet.glb"; 

  const products = useMemo(
    () => [
      {
        id: 1,
        img: "https://tramhoa.com/wp-content/uploads/2019/09/Bo-Hoa-Tuoi-TH-B005-Ron-Rang.webp",
        title: "Bó Hoa Hồng",
        price: 500000,
      },
      {
        id: 2,
        img: "https://shophoahong.com/wp-content/uploads/2022/03/55.jpg",
        title: "Bó Hoa Tươi Sinh Nhật",
        price: 750000,
      },
      {
        id: 3,
        img: "https://hoatuoihoamy.com/wp-content/uploads/2020/10/IMG_8813-1.jpg.webp",
        title: "Bó Hoa Sự Kiện",
        price: 600000,
      },
    ],
    []
  );

  const handleNavigate = (label) => {
    setActivePage(label);

    if (typeof onNavigate == "function") {
      try {
        onNavigate(label);
        return;
      } catch (err) {
        console.warn("onNavigate error:", err);
      }
    }
    const slugMap = {
      "Trang chủ": "/",
      "Giới thiệu": "/introduction",
      "Sản phẩm": "/product-lists",
      "Giỏ hàng": "/cart",
      "Đơn hàng": "/orders",
      "Lịch sử": "/history",
      "Cá nhân": "/profile",
    };
    const slug = slugMap[label] || "/";

    try {
      window.location.hash = `#${slug}`;
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <HelmetProvider>
      <Helmet>
        <title>Shop Hoa - Hương Sắc Thiên Nhiên | Đặt hoa tươi</title>
      </Helmet>

      <motion.main
        initial={false}
        transition={{ type: "spring", stiffness: 110, damping: 18 }}
        className="min-h-screen bg-gradient-to-b from-[#FFF9F0] to-[#FFEEF0] overflow-x-hidden"
      >
        <AnimatePresence mode="wait">
          <motion.section
            key={"hero"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45 }}
            className="relative h-[80vh] grid grid-cols-1 md:grid-cols-2"
          >
            <div className="order-2 md:order-1 flex items-center justify-center md:pl-20 px-8 z-10">
              <div className="max-w-xl text-center md:text-left">
                <motion.h1
                  className="text-5xl md:text-6xl font-extrabold leading-tight"
                  style={{ color: "#3B2E2E" }}
                >
                  Khám Phá Hương Sắc Thiên Nhiên
                </motion.h1>
                <motion.p className="mt-4 text-lg text-gray-600">
                  Hoa tươi nhập trực tiếp từ Đà Lạt — giao nhanh, thiết kế riêng
                  theo yêu cầu.
                </motion.p>

                <div className="mt-8 flex flex-col sm:flex-row sm:gap-4 gap-3">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.03 }}
                    className="inline-flex cursor-pointer items-center justify-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-[#FFB6C1] to-[#FFD7A6] font-semibold shadow-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-[#FFD7A6]/40"
                    onClick={() => handleNavigate("Sản phẩm")}
                    aria-label="Mua Ngay - đến danh sách sản phẩm"
                  >
                    <ShoppingBag /> Mua Ngay
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.03 }}
                    className="inline-flex cursor-pointer items-center justify-center gap-3 px-6 py-3 rounded-full border border-[#E8DAB5] bg-white text-gray-800 shadow"
                    onClick={() => handleNavigate("Giới thiệu")}
                    aria-label="Tìm Hiểu Thêm - tới Giới thiệu"
                  >
                    Tìm Hiểu Thêm
                  </motion.button>
                </div>

                <div className="mt-8 flex flex-wrap gap-4 text-sm text-gray-700">
                  <div className="inline-flex items-center gap-2">
                    <Flower2 /> <span>Hoa tươi 100%</span>
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <Truck /> <span>Giao nhanh trong 2 giờ</span>
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <Heart /> <span>Thiết kế cá nhân hóa</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2 relative h-96 md:h-full">
              <div className="absolute inset-0">
                <CanvasWrapper model={backgroundModel} visible={isActive} />
              </div>
            </div>
          </motion.section>
        </AnimatePresence>
        <section className="py-16 px-6 md:px-20 bg-[#FFF9F0]">
          <h2 className="text-3xl font-bold text-center mb-8 text-[#4B3A2F]">
            Tại sao chọn chúng tôi?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                icon: Flower2,
                title: "Hoa tươi 100%",
                desc: "Nhập từ vườn, giữ được hương lâu",
              },
              {
                icon: Truck,
                title: "Giao nhanh",
                desc: "Miễn phí nội thành, trong 2 giờ",
              },
              {
                icon: Heart,
                title: "Thiết kế",
                desc: "Tùy chỉnh theo yêu cầu",
              },
              {
                icon: Star,
                title: "Đánh giá 5 sao",
                desc: "Hơn 10.000 khách hàng hài lòng",
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -6 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }}
                className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-lg border border-[#F1E7D6]"
              >
                <f.icon size={48} className="mx-auto mb-3 text-[#FF8FB3]" />
                <h3 className="font-semibold text-lg mb-1">{f.title}</h3>
                <p className="text-sm text-gray-600">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
        <section
          id="shop"
          className="py-16 px-6 md:px-20 bg-gradient-to-r from-[#FFE4E1] to-[#FFE4E9]"
        >
          <h2 className="text-3xl font-bold text-center mb-8 text-[#4B3A2F]">
            Sản phẩm tiêu biểu
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onBuy={() => handleNavigate("Sản phẩm")}
              />
            ))}
          </div>
        </section>
        <section className="py-12 px-6 md:px-20 bg-gradient-to-r from-[#FFB6C1] to-[#FFD7A6] text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">
              Sẵn sàng mang hương sắc đến nhà bạn?
            </h3>
            <button
              className="inline-block cursor-pointer px-8 py-3 rounded-full bg-white text-[#4B3A2F] font-semibold shadow-lg"
              aria-label="Đặt hàng ngay"
              onClick={() => handleNavigate("Giỏ hàng")}
            >
              Đặt hàng ngay
            </button>
          </div>
        </section>
      </motion.main>
    </HelmetProvider>
  );
}

function ProductCard({ product, onBuy }) {
  const [src, handleError] = useImageFallback(product.img);

  return (
    <motion.article
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-2xl overflow-hidden shadow"
      aria-labelledby={`product-title-${product.id}`}
    >
      <img
        src={src}
        onError={handleError}
        alt={product.title}
        className="w-full h-64 object-cover"
      />
      <div className="p-4">
        <h3
          id={`product-title-${product.id}`}
          className="font-semibold text-lg"
        >
          {product.title}
        </h3>
        <div className="mt-2 text-[#FF6B94] font-bold">{product.price}</div>
        <div className="mt-4 flex gap-2">
          <button
            className="flex-1 px-4 py-2 cursor-pointer rounded-full bg-[#FFB6C1] text-white font-semibold focus:outline-none focus:ring-4 focus:ring-[#FFB6C1]/30"
            aria-label={`Mua ${product.title}`}
            onClick={() => {
              if (typeof onBuy == "function") onBuy();
            }}
          >
            Mua ngay
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function useImageFallback(src, fallback = "/images/fallback.jpg") {
  const [currentSrc, setCurrentSrc] = useState(src || fallback);
  useEffect(() => {
    setCurrentSrc(src || fallback);
  }, [src]);

  const handleError = () => {
    if (currentSrc == fallback) return;
    setCurrentSrc(fallback);
  };
  return [currentSrc, handleError];
}
