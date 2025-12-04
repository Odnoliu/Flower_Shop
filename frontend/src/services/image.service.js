import api from "./api";

const ImageService = {
  /**
   * @param {File} file
   * @param {Object} extra 
   */
  upload: async (file, extra = {}) => {
    const form = new FormData();

    form.append("IMAGE_Image", file);

    if (extra.PRODUCT_Id != null) {
      form.append("PRODUCT_Id", extra.PRODUCT_Id);
    } else if (extra.productId != null) {
      form.append("PRODUCT_Id", extra.productId);
    }

    Object.entries(extra).forEach(([key, value]) => {
      if (key == "PRODUCT_Id" || key == "productId") return;
      form.append(key, value);
    });

    const res = await api.post("/image", form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  delete: async (imageId) => {
    const res = await api.delete(`/image/id/${imageId}`);
    return res.data;
  },

  get: async (imageId) => {
    const res = await api.get(`/image/id/${imageId}`);
    return res.data;
  },

  getByProduct: async (productId) => {
    const res = await api.get(`/image/product/${productId}`);
    return res.data;
  },

  list: async (params) => {
    const res = await api.get("/image", { params });
    return res.data;
  },
};

export default ImageService;
