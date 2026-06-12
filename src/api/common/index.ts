import request from "@/utils/request";

const MAX_UPLOAD_FILE_SIZE = 5 * 1024 * 1024;
const MAX_UPLOAD_FILE_COUNT = 6;
const ALLOWED_UPLOAD_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);
const ALLOWED_UPLOAD_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".pdf",
  ".xls",
  ".xlsx",
]);

const validateUploadFiles = (files: File[]) => {
  if (files.length > MAX_UPLOAD_FILE_COUNT) {
    throw new Error("单次最多上传 6 个文件");
  }

  files.forEach((file) => {
    if (file.size > MAX_UPLOAD_FILE_SIZE) {
      throw new Error("文件大小不能超过 5MB");
    }

    const extension = file.name.includes(".")
      ? `.${file.name.split(".").pop()?.toLowerCase()}`
      : "";
    if (
      !ALLOWED_UPLOAD_MIME_TYPES.has(file.type) ||
      !ALLOWED_UPLOAD_EXTENSIONS.has(extension)
    ) {
      throw new Error("不支持的文件类型");
    }
  });
};

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
    const normalizedFiles = Array.isArray(files) ? files : [files];
    validateUploadFiles(normalizedFiles);

    const formData = new FormData();
    const fieldName = options?.fieldName || "file";
    normalizedFiles.forEach((file) => formData.append(fieldName, file));
    if (options?.path) {
      formData.append("path", options.path);
    }
    Object.entries(options?.extraData || {}).forEach(([key, value]) => {
      formData.append(key, value);
    });
    return request.post(options?.url || "upload/fileList", formData);
  },
  sendSMS: (params: { phone: string }) => {
    return request.get("/send/sendSMS", { params });
  },
};

export default CommonApi;
