import React, { useEffect, useState } from "react";
import api_client from "../../api/axios_client";
import { Facebook, Instagram, Phone, Mail } from "lucide-react";

export default function Introduction() {
  const [info, setInfo] = useState(null);

  useEffect(() => {
    api_client.get("/shop_info").then((res) => setInfo(res.data));
  }, []);

  if (!info) return <p className="p-8">Đang tải thông tin cửa hàng...</p>;

  return (
    <div className="px-10 py-10 text-[#3F3F3F] max-w-3xl mx-auto">
      <h2 className="text-3xl font-semibold text-[#C07A00] mb-4">{info.name}</h2>
      <p className="italic mb-6">{info.slogan}</p>
      <p>📍 {info.address}</p>
      <p className="flex items-center gap-2 mt-2">
        <Phone size={18} /> {info.phone}
      </p>
      <p className="flex items-center gap-2 mt-2">
        <Mail size={18} /> {info.email}
      </p>
      <div className="flex gap-4 mt-6 text-[#C07A00]">
        <a href={info.facebook} target="_blank" rel="noreferrer">
          <Facebook size={24} />
        </a>
        <a href={info.instagram} target="_blank" rel="noreferrer">
          <Instagram size={24} />
        </a>
      </div>
    </div>
  );
}
