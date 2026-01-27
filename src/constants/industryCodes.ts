/**
 * 国民经济行业分类代码字典 (GB/T 4754-2017)
 * 用于将行业代码转换为行业名称和行业分类
 */

export interface IndustryCodeInfo {
  code: string;
  name: string;
  type: string;
  category: string;
}

/**
 * 行业代码映射表
 * code: 行业代码
 * name: 行业名称
 * type: 行业大类 (如: 制造业, 采矿业等)
 * category: 行业门类 (A, B, C 等)
 */
export const INDUSTRY_CODE_MAP: Record<string, IndustryCodeInfo> = {
  // A - 农、林、牧、渔业
  "A01": { code: "A01", name: "农业", type: "农业", category: "A" },
  "A02": { code: "A02", name: "林业", type: "农业", category: "A" },
  "A03": { code: "A03", name: "畜牧业", type: "农业", category: "A" },
  "A04": { code: "A04", name: "渔业", type: "农业", category: "A" },

  // B - 采矿业
  "B06": { code: "B06", name: "煤炭开采和洗选业", type: "采矿业", category: "B" },
  "B07": { code: "B07", name: "石油和天然气开采业", type: "采矿业", category: "B" },
  "B08": { code: "B08", name: "黑色金属矿采选业", type: "采矿业", category: "B" },
  "B09": { code: "B09", name: "有色金属矿采选业", type: "采矿业", category: "B" },

  // C - 制造业
  "C13": { code: "C13", name: "农副食品加工业", type: "制造业", category: "C" },
  "C14": { code: "C14", name: "食品制造业", type: "制造业", category: "C" },
  "C15": { code: "C15", name: "酒、饮料和精制茶制造业", type: "制造业", category: "C" },
  "C17": { code: "C17", name: "纺织业", type: "制造业", category: "C" },
  "C18": { code: "C18", name: "纺织服装、服饰业", type: "制造业", category: "C" },
  "C19": { code: "C19", name: "皮革、毛皮、羽毛及其制品和制鞋业", type: "制造业", category: "C" },
  "C20": { code: "C20", name: "木材加工和木、竹、藤、棕、草制品业", type: "制造业", category: "C" },
  "C21": { code: "C21", name: "家具制造业", type: "制造业", category: "C" },
  "C22": { code: "C22", name: "造纸和纸制品业", type: "制造业", category: "C" },
  "C26": { code: "C26", name: "化学原料和化学制品制造业", type: "制造业", category: "C" },
  "C27": { code: "C27", name: "医药制造业", type: "制造业", category: "C" },
  "C28": { code: "C28", name: "化学纤维制造业", type: "制造业", category: "C" },
  "C29": { code: "C29", name: "橡胶和塑料制品业", type: "制造业", category: "C" },
  "C30": { code: "C30", name: "非金属矿物制品业", type: "制造业", category: "C" },
  "C31": { code: "C31", name: "黑色金属冶炼和压延加工业", type: "制造业", category: "C" },
  "C32": { code: "C32", name: "有色金属冶炼和压延加工业", type: "制造业", category: "C" },
  "C33": { code: "C33", name: "金属制品业", type: "制造业", category: "C" },
  "C34": { code: "C34", name: "通用设备制造业", type: "制造业", category: "C" },
  "C35": { code: "C35", name: "专用设备制造业", type: "制造业", category: "C" },
  "C36": { code: "C36", name: "汽车制造业", type: "制造业", category: "C" },
  "C37": { code: "C37", name: "铁路、船舶、航空航天和其他运输设备制造业", type: "制造业", category: "C" },
  "C38": { code: "C38", name: "电气机械和器材制造业", type: "制造业", category: "C" },
  "C39": { code: "C39", name: "计算机、通信和其他电子设备制造业", type: "制造业", category: "C" },
  "C40": { code: "C40", name: "仪器仪表制造业", type: "制造业", category: "C" },

  // D - 电力、热力、燃气及水生产和供应业
  "D44": { code: "D44", name: "电力、热力生产和供应业", type: "电力、热力、燃气及水生产和供应业", category: "D" },
  "D45": { code: "D45", name: "燃气生产和供应业", type: "电力、热力、燃气及水生产和供应业", category: "D" },
  "D46": { code: "D46", name: "水的生产和供应业", type: "电力、热力、燃气及水生产和供应业", category: "D" },

  // E - 建筑业
  "E47": { code: "E47", name: "房屋建筑业", type: "建筑业", category: "E" },
  "E48": { code: "E48", name: "土木工程建筑业", type: "建筑业", category: "E" },
  "E49": { code: "E49", name: "建筑安装业", type: "建筑业", category: "E" },
  "E50": { code: "E50", name: "建筑装饰、装修和其他建筑业", type: "建筑业", category: "E" },

  // F - 批发和零售业
  "F51": { code: "F51", name: "批发业", type: "批发和零售业", category: "F" },
  "F52": { code: "F52", name: "零售业", type: "批发和零售业", category: "F" },

  // G - 交通运输、仓储和邮政业
  "G53": { code: "G53", name: "铁路运输业", type: "交通运输、仓储和邮政业", category: "G" },
  "G54": { code: "G54", name: "道路运输业", type: "交通运输、仓储和邮政业", category: "G" },
  "G55": { code: "G55", name: "水上运输业", type: "交通运输、仓储和邮政业", category: "G" },
  "G56": { code: "G56", name: "航空运输业", type: "交通运输、仓储和邮政业", category: "G" },
  "G58": { code: "G58", name: "仓储业", type: "交通运输、仓储和邮政业", category: "G" },
  "G60": { code: "G60", name: "邮政业", type: "交通运输、仓储和邮政业", category: "G" },

  // H - 住宿和餐饮业
  "H61": { code: "H61", name: "住宿业", type: "住宿和餐饮业", category: "H" },
  "H62": { code: "H62", name: "餐饮业", type: "住宿和餐饮业", category: "H" },

  // I - 信息传输、软件和信息技术服务业
  "I63": { code: "I63", name: "电信、广播电视和卫星传输服务", type: "信息传输、软件和信息技术服务业", category: "I" },
  "I64": { code: "I64", name: "互联网和相关服务", type: "信息传输、软件和信息技术服务业", category: "I" },
  "I65": { code: "I65", name: "软件和信息技术服务业", type: "信息传输、软件和信息技术服务业", category: "I" },

  // J - 金融业
  "J66": { code: "J66", name: "货币金融服务", type: "金融业", category: "J" },
  "J67": { code: "J67", name: "资本市场服务", type: "金融业", category: "J" },
  "J68": { code: "J68", name: "保险业", type: "金融业", category: "J" },

  // K - 房地产业
  "K70": { code: "K70", name: "房地产业", type: "房地产业", category: "K" },

  // L - 租赁和商务服务业
  "L71": { code: "L71", name: "租赁业", type: "租赁和商务服务业", category: "L" },
  "L72": { code: "L72", name: "商务服务业", type: "租赁和商务服务业", category: "L" },

  // M - 科学研究和技术服务业
  "M73": { code: "M73", name: "研究和试验发展", type: "科学研究和技术服务业", category: "M" },
  "M74": { code: "M74", name: "专业技术服务业", type: "科学研究和技术服务业", category: "M" },
  "M75": { code: "M75", name: "科技推广和应用服务业", type: "科学研究和技术服务业", category: "M" },

  // N - 水利、环境和公共设施管理业
  "N76": { code: "N76", name: "水利管理业", type: "水利、环境和公共设施管理业", category: "N" },
  "N77": { code: "N77", name: "生态保护和环境治理业", type: "水利、环境和公共设施管理业", category: "N" },
  "N78": { code: "N78", name: "公共设施管理业", type: "水利、环境和公共设施管理业", category: "N" },

  // O - 居民服务、修理和其他服务业
  "O79": { code: "O79", name: "居民服务业", type: "居民服务、修理和其他服务业", category: "O" },
  "O80": { code: "O80", name: "机动车、电子产品和日用产品修理业", type: "居民服务、修理和其他服务业", category: "O" },
  "O81": { code: "O81", name: "其他服务业", type: "居民服务、修理和其他服务业", category: "O" },

  // P - 教育
  "P83": { code: "P83", name: "教育", type: "教育", category: "P" },

  // Q - 卫生和社会工作
  "Q84": { code: "Q84", name: "卫生", type: "卫生和社会工作", category: "Q" },
  "Q85": { code: "Q85", name: "社会工作", type: "卫生和社会工作", category: "Q" },

  // R - 文化、体育和娱乐业
  "R86": { code: "R86", name: "新闻和出版业", type: "文化、体育和娱乐业", category: "R" },
  "R87": { code: "R87", name: "广播、电视、电影和录音制作业", type: "文化、体育和娱乐业", category: "R" },
  "R88": { code: "R88", name: "文化艺术业", type: "文化、体育和娱乐业", category: "R" },
  "R89": { code: "R89", name: "体育", type: "文化、体育和娱乐业", category: "R" },
  "R90": { code: "R90", name: "娱乐业", type: "文化、体育和娱乐业", category: "R" },
};

/**
 * 根据行业代码获取行业信息
 */
export function getIndustryByCode(code: string): IndustryCodeInfo | undefined {
  return INDUSTRY_CODE_MAP[code];
}

/**
 * 根据行业代码获取行业名称
 */
export function getIndustryName(code: string): string {
  const info = getIndustryByCode(code);
  return info?.name || code;
}

/**
 * 根据行业代码获取行业分类
 */
export function getIndustryType(code: string): string {
  const info = getIndustryByCode(code);
  return info?.type || "未分类";
}

/**
 * 获取所有行业选项（用于下拉选择）
 */
export function getIndustryOptions(): Array<{ label: string; value: string }> {
  return Object.values(INDUSTRY_CODE_MAP).map((item) => ({
    label: `${item.code} - ${item.name}`,
    value: item.code,
  }));
}

/**
 * 获取行业大类列表
 */
export function getIndustryTypes(): string[] {
  const types = new Set(Object.values(INDUSTRY_CODE_MAP).map((item) => item.type));
  return Array.from(types);
}
