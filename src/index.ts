import {
  basekit,
  FieldType,
  FieldComponent,
  FieldCode,
} from '@lark-opdev/block-basekit-server-api';
import { callDeepSeek, extractJSON } from './ai';
import { COPY_MODE_OPTIONS, MODEL_OPTIONS, getPrompt, CopyMode } from './prompts';

basekit.addDomainList(['api.deepseek.com']);

basekit.addField({
  i18n: {
    messages: {
      'zh-CN': {
        field_name: '电商文案生成',
        api_key: 'DeepSeek API Key',
        api_key_placeholder: '请输入你的 DeepSeek API Key',
        source_field: '产品信息字段',
        copy_mode: '文案类型',
        target_platform: '目标平台',
        model: 'AI 模型',
        no_api_key: '请先配置 DeepSeek API Key',
        no_input: '（请填写产品信息）',
        ai_error: '生成失败',
        result_title: '📌 标题',
        result_subtitle: '📎 副标题',
        result_selling_points: '✨ 卖点',
        result_description: '📝 描述',
        result_keywords: '🔑 关键词',
        result_slogan: '💬 标语',
        result_hashtags: '#️⃣ 话题标签',
        result_social_copy: '📱 社交媒体文案',
        result_platform: '🎯 平台',
        platform_placeholder: '如：淘宝/京东/拼多多/抖音/小红书',
        custom_prompt: '自定义要求',
        custom_prompt_placeholder: '额外要求，如：针对25-35岁女性用户',
      },
      'en-US': {
        field_name: 'EC Copy Generator',
        api_key: 'DeepSeek API Key',
        api_key_placeholder: 'Enter your DeepSeek API Key',
        source_field: 'Product Info Field',
        copy_mode: 'Copy Type',
        target_platform: 'Target Platform',
        model: 'AI Model',
        no_api_key: 'Please configure your DeepSeek API Key',
        no_input: '(Please enter product info)',
        ai_error: 'Generation failed',
        result_title: '📌 Title',
        result_subtitle: '📎 Subtitle',
        result_selling_points: '✨ Selling Points',
        result_description: '📝 Description',
        result_keywords: '🔑 Keywords',
        result_slogan: '💬 Slogan',
        result_hashtags: '#️⃣ Hashtags',
        result_social_copy: '📱 Social Copy',
        result_platform: '🎯 Platform',
        platform_placeholder: 'e.g. Amazon/Shopify/Instagram/TikTok',
        custom_prompt: 'Custom Requirements',
        custom_prompt_placeholder: 'e.g. Target audience: 25-35 female',
      },
    },
  },
  formItems: [
    {
      key: 'apiKey',
      label: 'api_key',
      component: FieldComponent.Input,
      props: { placeholder: 'api_key_placeholder' },
      validator: { required: true },
    },
    {
      key: 'sourceField',
      label: 'source_field',
      component: FieldComponent.FieldSelect,
      props: { supportType: [FieldType.Text] },
      validator: { required: true },
    },
    {
      key: 'copyMode',
      label: 'copy_mode',
      component: FieldComponent.SingleSelect,
      props: { options: COPY_MODE_OPTIONS },
      validator: { required: true },
    },
    {
      key: 'targetPlatform',
      label: 'target_platform',
      component: FieldComponent.Input,
      props: { placeholder: 'platform_placeholder' },
    },
    {
      key: 'customPrompt',
      label: 'custom_prompt',
      component: FieldComponent.Input,
      props: { placeholder: 'custom_prompt_placeholder' },
    },
    {
      key: 'model',
      label: 'model',
      component: FieldComponent.SingleSelect,
      props: { options: MODEL_OPTIONS },
      validator: { required: true },
    },
  ],
  resultType: { type: FieldType.Text },
  execute: async (formItemParams: Record<string, any>, context: any) => {
    const logID = context?.logID || '未知';
    try {
      const apiKey: string = formItemParams.apiKey || '';
      const sourceValue: string = formItemParams.sourceField ?? '';
      const mode: CopyMode = formItemParams.copyMode || 'product_title';
      const platform: string = formItemParams.targetPlatform || '';
      const customPrompt: string = formItemParams.customPrompt || '';
      const model: string = formItemParams.model || 'deepseek-chat';

      if (!apiKey) return { code: FieldCode.Success, data: '⚠️ 请先配置 DeepSeek API Key' };
      if (!sourceValue) return { code: FieldCode.Success, data: '（请填写产品信息）' };

      const systemPrompt = getPrompt(mode, customPrompt);
      const userInput = `产品信息:\n${String(sourceValue)}\n\n${platform ? `目标平台: ${platform}` : ''}`;

      const result = await callDeepSeek(systemPrompt, userInput, { apiKey, model });

      if (!result.success) {
        return { code: FieldCode.Error, data: `⚠️ ${result.error}` };
      }

      const parsed = extractJSON(result.data!);
      const formatted = formatResult(parsed, mode);
      return { code: FieldCode.Success, data: formatted };
    } catch (err: any) {
      return { code: FieldCode.Error, data: `⚠️ 生成异常: ${err.message || '未知错误'}` };
    }
  },
});

function formatResult(parsed: any, mode: CopyMode): string {
  if (!parsed) return '⚠️ AI 返回格式异常，请重试';
  const lines: string[] = [];

  if (parsed.title) lines.push(`📌 ${parsed.title}`);
  if (parsed.subtitle) lines.push(`📎 ${parsed.subtitle}`);
  if (parsed.slogan) lines.push(`💬 ${parsed.slogan}`);
  if (parsed.selling_points?.length) {
    lines.push(`\n✨ 卖点:`);
    parsed.selling_points.slice(0, 6).forEach((p: string) => lines.push(`  • ${p}`));
  }
  if (parsed.description) lines.push(`\n📝 描述:\n  ${parsed.description}`);
  if (parsed.social_copy) lines.push(`\n📱 ${parsed.social_copy}`);
  if (parsed.features?.length) {
    lines.push(`\n📋 特点:`);
    parsed.features.slice(0, 5).forEach((f: string) => lines.push(`  • ${f}`));
  }
  if (parsed.keywords?.length) lines.push(`\n🔑 关键词: ${parsed.keywords.slice(0, 8).join('、')}`);
  if (parsed.hashtags?.length) lines.push(`#️⃣ ${Array.isArray(parsed.hashtags) ? parsed.hashtags.slice(0, 5).join(' ') : parsed.hashtags}`);
  if (parsed.platform) lines.push(`\n🎯 ${parsed.platform}`);

  return lines.join('\n') || String(parsed);
}

export default basekit;
