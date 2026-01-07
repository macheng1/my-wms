import { useEffect, useState } from "react";
import DictAPI from "@/api/system";

export function useDictOptions(type: string) {
  const [options, setOptions] = useState<any[]>([]);

  useEffect(() => {
    if (!type) return;
    DictAPI.getOptions(type).then((res) => setOptions(res.data ?? []));
  }, [type]);

  return options;
}
