import request from "@/utils/request";
import { QueryPostParams, SavePostParams, PostItem } from "./types";

const PostAPI = {
  getPage: (params?: QueryPostParams) => request.get<{ list: PostItem[]; total: number; page: number; pageSize: number }>("/posts/page", { params }),
  getOptions: () => request.get<PostItem[]>("/posts/options"),
  save: (data: SavePostParams) => request.post<PostItem>("/posts/save", data),
  delete: (id: string) => request.post("/posts/delete", { id }),
};

export default PostAPI;
