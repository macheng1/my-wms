import request from "@/utils/request";

/**
 * 类目管理 (Category) API
 * 负责产品分类定义及属性绑定关系维护
 */
const CommonApi = {
  /**
   * 上传文件，支持多文件，自动构建 FormData
   * @param files File | File[]
   * @returns Promise
   */
  uploadFiles: (files) => {
    const formData = new FormData();
    if (Array.isArray(files)) {
      files.forEach((file) => formData.append("file", file));
    } else {
      formData.append("file", files);
    }
    return request.post("upload/fileList", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  sendSMS: (params: { phone: string }) => {
    return request.get("/send/sendSMS", { params });
  },
};

export default CommonApi;
