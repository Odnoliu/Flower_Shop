import api from "./api";

const CityService = {
  listCities: async () => {
    const res = await api.get("/city");
    return res.data;
  },

  listDistricts: async (cityId) => {
    const res = await api.get(`/city/${cityId}/districts`);
    return res.data;
  },

  listWards: async (districtId) => {
    const res = await api.get(`/districts/${districtId}/wards`);
    return res.data;
  }
};

export default CityService;
