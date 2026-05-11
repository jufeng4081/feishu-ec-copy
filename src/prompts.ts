export type CopyMode = 'product_title' | 'product_desc' | 'selling_points' | 'social_copy' | 'full_package';

export interface ModeOption {
  label: string;
  value: CopyMode;
}

export const COPY_MODE_OPTIONS: ModeOption[] = [
  { label: '商品标题', value: 'product_title' },
  { label: '商品描述', value: 'product_desc' },
  { label: '卖点提炼', value: 'selling_points' },
  { label: '社交媒体文案', value: 'social_copy' },
  { label: '全套文案 (标题+描述+卖点)', value: 'full_package' },
];

export const MODEL_OPTIONS = [
  { label: 'DeepSeek Chat (快速)', value: 'deepseek-chat' },
  { label: 'DeepSeek Reasoner (深度)', value: 'deepseek-reasoner' },
];

export function getPrompt(mode: CopyMode, customPrompt: string): string {
  const base = `你是一个专业的电商文案写作专家，精通消费者心理学和营销转化。`;
  const extra = customPrompt ? `\n额外要求：${customPrompt}` : '';
  const jsonReq = `\n以JSON格式返回结果，仅返回JSON，不要其他文字。`;

  const modePrompts: Record<CopyMode, string> = {
    product_title: `${base}
根据产品信息，生成吸引人的商品标题。

包含字段：
- title: 主标题（30字以内，突出核心卖点）
- subtitle: 副标题（20字以内，补充说明）
- keywords: 搜索关键词列表（5-8个）
${extra}${jsonReq}`,

    product_desc: `${base}
根据产品信息，生成详细的商品描述。

包含字段：
- description: 详细描述（200字以内，含产品核心优势）
- features: 产品特点列表（5-8项）
- keywords: 关键词列表（3-5个）
${extra}${jsonReq}`,

    selling_points: `${base}
根据产品信息，提炼核心卖点。

包含字段：
- selling_points: 核心卖点列表（5-6个，每个15字以内）
- slogan: 一句宣传语（10字以内）
- keywords: 关键词列表（3-5个）
${extra}${jsonReq}`,

    social_copy: `${base}
根据产品信息，生成社交媒体推广文案。

包含字段：
- social_copy: 推广文案正文（100字以内）
- hashtags: 话题标签列表（5-8个）
- selling_points: 卖点列表（3-5个）
- call_to_action: 引导语（10字以内）
${extra}${jsonReq}`,

    full_package: `${base}
根据产品信息，生成全套电商文案。

包含字段：
- title: 商品标题（30字以内）
- subtitle: 副标题（20字以内）
- slogan: 宣传标语（10字以内）
- selling_points: 核心卖点列表（5-6个）
- description: 详细描述（150字以内）
- keywords: 搜索关键词（5-8个）
- hashtags: 话题标签（5-8个，仅社交媒体用）
${extra}${jsonReq}`,
  };

  return modePrompts[mode];
}
