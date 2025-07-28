// backend/src/services/aiService.ts
import OpenAI from 'openai';
import { logger } from '../utils/logger';
import { AIUsage } from '../models/AIUsage';

interface AIServiceConfig {
  apiKey: string;
  baseURL?: string;
  model?: string;
}

interface GenerateTitleOptions {
  content: string;
  style?: 'creative' | 'professional' | 'clickbait' | 'seo';
  count?: number;
}

interface OptimizeContentOptions {
  content: string;
  targetAudience?: string;
  tone?: 'formal' | 'casual' | 'humorous' | 'inspiring';
  optimization?: 'readability' | 'engagement' | 'seo';
}

interface StyleRecommendation {
  templateId: string;
  reason: string;
  confidence: number;
}

export class AIService {
  private openai: OpenAI;
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
    this.openai = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL || 'https://api.openai.com/v1'
    });
  }

  /**
   * 生成文章标题
   */
  async generateTitle(options: GenerateTitleOptions): Promise<string[]> {
    const { content, style = 'professional', count = 5 } = options;
    
    const stylePrompts = {
      creative: '创意有趣、富有想象力',
      professional: '专业严谨、简洁明了',
      clickbait: '吸引眼球、引发好奇',
      seo: '包含关键词、利于搜索'
    };

    const prompt = `
请根据以下文章内容，生成${count}个${stylePrompts[style]}的标题。

文章内容：
${content.substring(0, 2000)}

要求：
1. 标题长度控制在10-30个字符
2. 风格：${stylePrompts[style]}
3. 符合公众号文章特点
4. 每个标题独占一行
5. 不要添加序号或其他标记

请直接输出标题：
`;

    try {
      const startTime = Date.now();
      const response = await this.openai.chat.completions.create({
        model: this.config.model || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的公众号编辑，擅长创作吸引人的标题。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.8
      });

      const endTime = Date.now();
      const usage = response.usage;

      // 记录AI使用情况
      await this.recordUsage({
        featureType: 'title_generation',
        inputTokens: usage?.prompt_tokens || 0,
        outputTokens: usage?.completion_tokens || 0,
        responseTime: endTime - startTime
      });

      const titles = response.choices[0].message.content
        ?.split('\n')
        .filter(line => line.trim())
        .map(line => line.trim()) || [];

      logger.info('AI title generation completed', {
        titlesCount: titles.length,
        usage: usage
      });

      return titles;
    } catch (error) {
      logger.error('AI title generation failed', error);
      throw new Error('标题生成失败，请稍后重试');
    }
  }

  /**
   * 优化文章内容
   */
  async optimizeContent(options: OptimizeContentOptions): Promise<string> {
    const { 
      content, 
      targetAudience = '普通读者',
      tone = 'casual',
      optimization = 'readability'
    } = options;

    const toneDescriptions = {
      formal: '正式专业的语言风格',
      casual: '轻松自然的对话风格',
      humorous: '幽默风趣的表达方式',
      inspiring: '积极向上的激励语调'
    };

    const optimizationTypes = {
      readability: '提高可读性，优化句式结构',
      engagement: '增强互动性，提高读者参与度',
      seo: '优化关键词分布，提升搜索排名'
    };

    const prompt = `
请优化以下文章内容：

原文内容：
${content}

优化要求：
1. 目标读者：${targetAudience}
2. 语言风格：${toneDescriptions[tone]}
3. 优化重点：${optimizationTypes[optimization]}
4. 保持原文的核心观点和信息
5. 适合公众号阅读习惯
6. 段落清晰，逻辑顺畅

请直接输出优化后的内容：
`;

    try {
      const startTime = Date.now();
      const response = await this.openai.chat.completions.create({
        model: this.config.model || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的内容编辑，擅长优化文章可读性和吸引力。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      });

      const endTime = Date.now();
      const usage = response.usage;

      await this.recordUsage({
        featureType: 'content_optimization',
        inputTokens: usage?.prompt_tokens || 0,
        outputTokens: usage?.completion_tokens || 0,
        responseTime: endTime - startTime
      });

      const optimizedContent = response.choices[0].message.content || content;

      logger.info('AI content optimization completed', {
        originalLength: content.length,
        optimizedLength: optimizedContent.length,
        usage: usage
      });

      return optimizedContent;
    } catch (error) {
      logger.error('AI content optimization failed', error);
      throw new Error('内容优化失败，请稍后重试');
    }
  }

  /**
   * 推荐排版样式
   */
  async recommendStyle(content: string): Promise<StyleRecommendation[]> {
    const prompt = `
请分析以下文章内容，推荐最适合的排版样式：

文章内容：
${content.substring(0, 1500)}

请从以下样式中选择最合适的3个，并说明理由：
1. business - 商务专业风格
2. creative - 创意时尚风格  
3. minimalist - 极简清新风格
4. tech - 科技现代风格
5. lifestyle - 生活休闲风格

请按以下JSON格式输出：
[
  {
    "templateId": "样式ID",
    "reason": "推荐理由",
    "confidence": 0.85
  }
]
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.model || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的视觉设计师，擅长分析内容特点并推荐合适的排版样式。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.6
      });

      const usage = response.usage;
      await this.recordUsage({
        featureType: 'style_recommendation',
        inputTokens: usage?.prompt_tokens || 0,
        outputTokens: usage?.completion_tokens || 0,
        responseTime: 0
      });

      const responseContent = response.choices[0].message.content || '[]';
      const recommendations = JSON.parse(responseContent) as StyleRecommendation[];

      logger.info('AI style recommendation completed', {
        recommendationsCount: recommendations.length,
        usage: usage
      });

      return recommendations;
    } catch (error) {
      logger.error('AI style recommendation failed', error);
      // 返回默认推荐
      return [
        {
          templateId: 'minimalist',
          reason: '极简风格适合大多数内容类型',
          confidence: 0.7
        }
      ];
    }
  }

  /**
   * 分析文章质量
   */
  async analyzeArticle(content: string): Promise<{
    score: number;
    suggestions: string[];
    keywords: string[];
    readabilityLevel: 'easy' | 'medium' | 'hard';
  }> {
    const prompt = `
请分析以下文章的质量，并提供改进建议：

文章内容：
${content}

请从以下维度进行分析：
1. 内容质量 (1-10分)
2. 结构逻辑 (1-10分)  
3. 可读性 (1-10分)
4. 吸引力 (1-10分)

请按以下JSON格式输出：
{
  "score": 8.5,
  "suggestions": [
    "建议1",
    "建议2"
  ],
  "keywords": ["关键词1", "关键词2"],
  "readabilityLevel": "medium"
}
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.model || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的内容分析师，擅长评估文章质量并提供改进建议。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.5
      });

      const usage = response.usage;
      await this.recordUsage({
        featureType: 'article_analysis',
        inputTokens: usage?.prompt_tokens || 0,
        outputTokens: usage?.completion_tokens || 0,
        responseTime: 0
      });

      const responseContent = response.choices[0].message.content || '{}';
      const analysis = JSON.parse(responseContent);

      logger.info('AI article analysis completed', {
        score: analysis.score,
        usage: usage
      });

      return analysis;
    } catch (error) {
      logger.error('AI article analysis failed', error);
      return {
        score: 7.0,
        suggestions: ['内容分析暂时不可用'],
        keywords: [],
        readabilityLevel: 'medium'
      };
    }
  }

  /**
   * 生成SEO优化建议
   */
  async generateSEOSuggestions(content: string, targetKeywords?: string[]): Promise<{
    title: string;
    description: string;
    keywords: string[];
    suggestions: string[];
  }> {
    const keywordPrompt = targetKeywords ? 
      `重点关键词：${targetKeywords.join(', ')}` : 
      '请自动识别关键词';

    const prompt = `
请为以下文章内容生成SEO优化建议：

文章内容：
${content.substring(0, 2000)}

${keywordPrompt}

请按以下JSON格式输出：
{
  "title": "SEO优化标题",
  "description": "文章摘要描述",
  "keywords": ["关键词1", "关键词2"],
  "suggestions": [
    "SEO建议1",
    "SEO建议2"
  ]
}
`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.config.model || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一个SEO专家，擅长优化内容以提高搜索引擎排名。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.6
      });

      const usage = response.usage;
      await this.recordUsage({
        featureType: 'seo_optimization',
        inputTokens: usage?.prompt_tokens || 0,
        outputTokens: usage?.completion_tokens || 0,
        responseTime: 0
      });

      const responseContent = response.choices[0].message.content || '{}';
      const seoData = JSON.parse(responseContent);

      logger.info('AI SEO optimization completed', { usage });

      return seoData;
    } catch (error) {
      logger.error('AI SEO optimization failed', error);
      return {
        title: '请手动设置标题',
        description: '请手动设置描述',
        keywords: [],
        suggestions: ['SEO分析暂时不可用']
      };
    }
  }

  /**
   * 记录AI使用情况
   */
  private async recordUsage(data: {
    featureType: string;
    inputTokens: number;
    outputTokens: number;
    responseTime: number;
  }) {
    try {
      // 这里应该保存到数据库
      // await AIUsage.create(data);
      logger.info('AI usage recorded', data);
    } catch (error) {
      logger.error('Failed to record AI usage', error);
    }
  }

  /**
   * 获取用户AI使用统计
   */
  async getUserUsageStats(userId: string, period: 'day' | 'week' | 'month' = 'day') {
    try {
      // 从数据库查询用户使用统计
      // const stats = await AIUsage.getUserStats(userId, period);
      
      // 模拟数据
      const stats = {
        totalRequests: 45,
        totalTokens: 12500,
        costUSD: 0.025,
        features: {
          title_generation: 15,
          content_optimization: 20,
          style_recommendation: 8,
          article_analysis: 2
        }
      };

      return stats;
    } catch (error) {
      logger.error('Failed to get user usage stats', error);
      throw error;
    }
  }

  /**
   * 检查用户AI使用限制
   */
  async checkUsageLimit(userId: string, featureType: string): Promise<boolean> {
    try {
      // 这里应该检查用户订阅类型和使用限制
      // const user = await User.findById(userId);
      // const usage = await AIUsage.getUserDailyUsage(userId, featureType);
      
      // 模拟检查逻辑
      return true;
    } catch (error) {
      logger.error('Failed to check usage limit', error);
      return false;
    }
  }
}

// 创建AI服务实例
export const aiService = new AIService({
  apiKey: process.env.OPENAI_API_KEY || '',
  baseURL: process.env.OPENAI_BASE_URL,
  model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo'
});
