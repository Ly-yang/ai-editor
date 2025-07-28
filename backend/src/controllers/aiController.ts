// backend/src/controllers/aiController.ts
import { Request, Response } from 'express';
import { aiService } from '../services/aiService';
import { logger } from '../utils/logger';
import { validationResult } from 'express-validator';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    subscriptionType: 'free' | 'pro' | 'enterprise';
  };
}

export class AIController {
  /**
   * 生成文章标题
   * POST /api/ai/generate-title
   */
  async generateTitle(req: AuthenticatedRequest, res: Response) {
    try {
      // 验证输入
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '输入参数有误',
          errors: errors.array()
        });
      }

      const { content, style = 'professional', count = 5 } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      // 检查使用限制
      const canUse = await aiService.checkUsageLimit(userId, 'title_generation');
      if (!canUse) {
        return res.status(429).json({
          success: false,
          message: '今日使用次数已达上限，请升级会员或明日再试'
        });
      }

      // 生成标题
      const titles = await aiService.generateTitle({
        content,
        style,
        count: Math.min(count, 10) // 限制最大数量
      });

      logger.info('Title generation successful', {
        userId,
        titlesCount: titles.length
      });

      res.json({
        success: true,
        data: {
          titles,
          style,
          generatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Title generation failed', {
        userId: req.user?.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({
        success: false,
        message: '标题生成失败，请稍后重试'
      });
    }
  }

  /**
   * 优化文章内容
   * POST /api/ai/optimize-content
   */
  async optimizeContent(req: AuthenticatedRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '输入参数有误',
          errors: errors.array()
        });
      }

      const { 
        content, 
        targetAudience = '普通读者',
        tone = 'casual',
        optimization = 'readability'
      } = req.body;
      
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      // 检查内容长度限制
      if (content.length > 10000) {
        return res.status(400).json({
          success: false,
          message: '内容长度不能超过10000字符'
        });
      }

      // 检查使用限制
      const canUse = await aiService.checkUsageLimit(userId, 'content_optimization');
      if (!canUse) {
        return res.status(429).json({
          success: false,
          message: '今日使用次数已达上限，请升级会员或明日再试'
        });
      }

      // 优化内容
      const optimizedContent = await aiService.optimizeContent({
        content,
        targetAudience,
        tone,
        optimization
      });

      logger.info('Content optimization successful', {
        userId,
        originalLength: content.length,
        optimizedLength: optimizedContent.length
      });

      res.json({
        success: true,
        data: {
          originalContent: content,
          optimizedContent,
          optimization,
          optimizedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Content optimization failed', {
        userId: req.user?.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({
        success: false,
        message: '内容优化失败，请稍后重试'
      });
    }
  }

  /**
   * 推荐排版样式
   * POST /api/ai/recommend-style
   */
  async recommendStyle(req: AuthenticatedRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '输入参数有误',
          errors: errors.array()
        });
      }

      const { content } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      // 检查使用限制
      const canUse = await aiService.checkUsageLimit(userId, 'style_recommendation');
      if (!canUse) {
        return res.status(429).json({
          success: false,
          message: '今日使用次数已达上限，请升级会员或明日再试'
        });
      }

      // 推荐样式
      const recommendations = await aiService.recommendStyle(content);

      logger.info('Style recommendation successful', {
        userId,
        recommendationsCount: recommendations.length
      });

      res.json({
        success: true,
        data: {
          recommendations,
          recommendedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Style recommendation failed', {
        userId: req.user?.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({
        success: false,
        message: '样式推荐失败，请稍后重试'
      });
    }
  }

  /**
   * 分析文章质量
   * POST /api/ai/analyze-article
   */
  async analyzeArticle(req: AuthenticatedRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '输入参数有误',
          errors: errors.array()
        });
      }

      const { content } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      // 检查使用限制
      const canUse = await aiService.checkUsageLimit(userId, 'article_analysis');
      if (!canUse) {
        return res.status(429).json({
          success: false,
          message: '今日使用次数已达上限，请升级会员或明日再试'
        });
      }

      // 分析文章
      const analysis = await aiService.analyzeArticle(content);

      logger.info('Article analysis successful', {
        userId,
        score: analysis.score
      });

      res.json({
        success: true,
        data: {
          ...analysis,
          analyzedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Article analysis failed', {
        userId: req.user?.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({
        success: false,
        message: '文章分析失败，请稍后重试'
      });
    }
  }

  /**
   * 生成SEO建议
   * POST /api/ai/seo-suggestions
   */
  async generateSEOSuggestions(req: AuthenticatedRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '输入参数有误',
          errors: errors.array()
        });
      }

      const { content, targetKeywords } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      // 检查使用限制
      const canUse = await aiService.checkUsageLimit(userId, 'seo_optimization');
      if (!canUse) {
        return res.status(429).json({
          success: false,
          message: '今日使用次数已达上限，请升级会员或明日再试'
        });
      }

      // 生成SEO建议
      const seoSuggestions = await aiService.generateSEOSuggestions(
        content, 
        targetKeywords
      );

      logger.info('SEO suggestions generated successfully', {
        userId,
        keywordsCount: seoSuggestions.keywords.length
      });

      res.json({
        success: true,
        data: {
          ...seoSuggestions,
          generatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('SEO suggestions generation failed', {
        userId: req.user?.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({
        success: false,
        message: 'SEO建议生成失败，请稍后重试'
      });
    }
  }

  /**
   * 获取用户AI使用统计
   * GET /api/ai/usage-stats
   */
  async getUserUsageStats(req: AuthenticatedRequest, res: Response) {
    try {
      const { period = 'day' } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      const stats = await aiService.getUserUsageStats(
        userId, 
        period as 'day' | 'week' | 'month'
      );

      res.json({
        success: true,
        data: {
          ...stats,
          period,
          queriedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Failed to get user usage stats', {
        userId: req.user?.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({
        success: false,
        message: '获取使用统计失败'
      });
    }
  }

  /**
   * 批量处理AI任务
   * POST /api/ai/batch-process
   */
  async batchProcess(req: AuthenticatedRequest, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '输入参数有误',
          errors: errors.array()
        });
      }

      const { content, tasks } = req.body; // tasks: ['title', 'optimize', 'analyze']
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      // 检查用户是否有批量处理权限
      if (req.user?.subscriptionType === 'free') {
        return res.status(403).json({
          success: false,
          message: '批量处理功能仅限付费用户使用'
        });
      }

      const results: any = {};

      // 并行执行多个AI任务
      const promises = tasks.map(async (task: string) => {
        try {
          switch (task) {
            case 'title':
              const titles = await aiService.generateTitle({ content });
              results.titles = titles;
              break;
            
            case 'optimize':
              const optimized = await aiService.optimizeContent({ content });
              results.optimizedContent = optimized;
              break;
            
            case 'analyze':
              const analysis = await aiService.analyzeArticle(content);
              results.analysis = analysis;
              break;
            
            case 'seo':
              const seo = await aiService.generateSEOSuggestions(content);
              results.seo = seo;
              break;
            
            case 'style':
              const styles = await aiService.recommendStyle(content);
              results.styleRecommendations = styles;
              break;
          }
        } catch (error) {
          logger.error(`Batch task ${task} failed`, error);
          results[`${task}Error`] = '处理失败';
        }
      });

      await Promise.allSettled(promises);

      logger.info('Batch processing completed', {
        userId,
        tasks,
        completedTasks: Object.keys(results).length
      });

      res.json({
        success: true,
        data: {
          results,
          processedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Batch processing failed', {
        userId: req.user?.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({
        success: false,
        message: '批量处理失败，请稍后重试'
      });
    }
  }

  /**
   * 获取AI功能使用限制信息
   * GET /api/ai/usage-limits
   */
  async getUsageLimits(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const subscriptionType = req.user?.subscriptionType || 'free';

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      // 根据订阅类型返回使用限制
      const limits = {
        free: {
          dailyLimits: {
            title_generation: 10,
            content_optimization: 5,
            style_recommendation: 3,
            article_analysis: 2,
            seo_optimization: 2
          },
          features: {
            batchProcess: false,
            advancedAnalysis: false,
            prioritySupport: false
          }
        },
        pro: {
          dailyLimits: {
            title_generation: 100,
            content_optimization: 50,
            style_recommendation: 30,
            article_analysis: 20,
            seo_optimization: 20
          },
          features: {
            batchProcess: true,
            advancedAnalysis: true,
            prioritySupport: false
          }
        },
        enterprise: {
          dailyLimits: {
            title_generation: -1, // 无限制
            content_optimization: -1,
            style_recommendation: -1,
            article_analysis: -1,
            seo_optimization: -1
          },
          features: {
            batchProcess: true,
            advancedAnalysis: true,
            prioritySupport: true
          }
        }
      };

      res.json({
        success: true,
        data: {
          subscriptionType,
          limits: limits[subscriptionType],
          queriedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Failed to get usage limits', {
        userId: req.user?.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      res.status(500).json({
        success: false,
        message: '获取使用限制信息失败'
      });
    }
  }
}

export const aiController = new AIController();
