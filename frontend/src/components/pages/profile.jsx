import React, { useEffect, useState } from "react";
import api_client from "../../api/axios_client";

export default function Profile({ userId = 1 }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    api_client.get(`/user/${userId}`).then((res) => setUser(res.data));
  }, [userId]);

  if (!user) return <p className="p-8">Đang tải thông tin...</p>;

  return (
    <div className="flex flex-col items-center py-10 text-[#3F3F3F]">
      <img
        src={user.avatar}
        alt={user.name}
        className="w-32 h-32 rounded-full border-4 border-[#CDB38B] mb-4"
      />
      <h2 className="text-2xl font-semibold">{user.name}</h2>
      <p className="text-gray-600">{user.email}</p>
      <div className="mt-4 bg-[#FFF9F0] rounded-2xl p-6 shadow-md w-80">
        <p>📞 {user.phone}</p>
        <p>🏠 {user.address}</p>
        <p>🎂 Tuổi: {user.age}</p>
      </div>
    </div>
  );
}
