import api from "./api";

const AuthorizedService = {
  getByAccountId: async (accountId) => {
    const res = await api.get(`/authorized/${accountId}`);
    const authRecord = res.data;
    if (!authRecord) return null;

    const authId = authRecord.AUTHORIZATION_Id ?? authRecord.authorization_id ?? null;
    if (!authId) return null;

    const roleRes = await api.get(`/authorization/${authId}`);
    const roleName = roleRes.data?.AUTHORIZATION_Name || roleRes.data?.name || null;

    return {
      id: authId,
      role: roleName
    };
  },
   create: async (payload) => {
    const res = await api.post("/authorized", payload);
    return res.data;
  },

  remove: async (accountId) => {
    const res = await api.delete(`/authorized/${accountId}`);
    return res.data;
  }
};

export default AuthorizedService;
