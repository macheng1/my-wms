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
  uploadFiles: (
    files,
    options?: {
      path?: string;
      url?: string;
      fieldName?: string;
      extraData?: Record<string, string | Blob>;
    }
  ) => {
    const formData = new FormData();
    const fieldName = options?.fieldName || "file";
    if (Array.isArray(files)) {
      files.forEach((file) => formData.append(fieldName, file));
    } else {
      formData.append(fieldName, files);
    }
    if (options?.path) {
      formData.append("path", options.path);
    }
    Object.entries(options?.extraData || {}).forEach(([key, value]) => {
      formData.append(key, value);
    });
    return request.post(options?.url || "upload/fileList", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  sendSMS: (params: { phone: string }) => {
    return request.get("/send/sendSMS", { params });
  },
};

export default CommonApi;
