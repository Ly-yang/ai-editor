// frontend/src/components/AI/AIAssistant.tsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Tabs,
  List,
  Rate,
  Progress,
  Tag,
  Spin,
  message,
  Radio,
  Input,
  Divider,
  Typography,
  Badge,
  Tooltip
} from 'antd';
import {
  ThunderboltOutlined,
  EditOutlined,
  EyeOutlined,
  SearchOutlined,
  BarChartOutlined,
  BulbOutlined,
  RocketOutlined,
  StarOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useAIStore } from '../../store/aiStore';
import './AIAssistant.css';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

interface AIAssistantProps {
  currentContent: string;
  onApplyOptimization: (optimizedContent: string) => void;
}

interface GeneratedTitle {
  text: string;
  style: string;
  selected: boolean;
}

interface StyleRecommendation {
  templateId: string;
  reason: string;
  confidence: number;
}

interface ArticleAnalysis {
  score: number;
  suggestions: string[];
  keywords: string[];
  readabilityLevel: 'easy' | 'medium' | 'hard';
}

const AIAssistant: React.FC<AIAssistantProps> = ({
  currentContent,
  onApplyOptimization
}) => {
  const [activeTab, setActiveTab] = useState('title');
  const [generatedTitles, setGeneratedTitles] = useState<GeneratedTitle[]>([]);
  const [optimizedContent, setOptimizedContent] = useState('');
  const [styleRecommendations, setStyleRecommendations] = useState<StyleRecommendation[]>([]);
  const [articleAnalysis, setArticleAnalysis] = useState<ArticleAnalysis | null>(null);
  const [seoSuggestions, setSeoSuggestions] = useState<any>(null);
  
  // 设置选项
  const [titleStyle, setTitleStyle] = useState<'creative' | 'professional' | 'clickbait' | 'seo'>('professional');
  const [contentTone, setContentTone] = useState<'formal' | 'casual' | 'humorous' | 'inspiring'>('casual');
  const [optimizationType, setOptimizationType] = useState<'readability' | 'engagement' | 'seo'>('readability');
  const [targetKeywords, setTargetKeywords] = useState('');

  const {
    generateTitle,
    optimizeContent,
    recommendStyle,
    analyzeArticle,
    generateSEO,
    getUserStats,
    isGenerating,
    usageStats
  } = useAIStore();

  // 组件加载时获取用户统计信息
  useEffect(() => {
    getUserStats();
  }, [getUserStats]);

  // 生成标题
  const handleGenerateTitle = async () => {
    if (!currentContent.trim()) {
      message.warning('请先输入文章内容');
      return;
    }

    try {
      const titles = await generateTitle(currentContent, titleStyle, 5);
      setGeneratedTitles(titles.map(text => ({
        text,
        style: titleStyle,
        selected: false
      })));
      message.success('标题生成完成');
    } catch (error) {
      message.error('标题生成失败，请稍后重试');
    }
  };

  // 选择标题
  const handleSelectTitle = (index: number) => {
    setGeneratedTitles(prev => 
      prev.map((title, i) => ({
        ...title,
        selected: i === index
      }))
    );
  };

  // 内容优化
  const handleOptimizeContent = async () => {
    if (!currentContent.trim()) {
      message.warning('请先输入文章内容');
      return;
    }

    try {
      const optimized = await optimizeContent(currentContent, {
        tone: contentTone,
        optimization: optimizationType
      });
      setOptimizedContent(optimized);
      message.success('内容优化完成');
    } catch (error) {
      message.error('内容优化失败，请稍后重试');
    }
  };

  // 应用优化内容
  const handleApplyOptimization = () => {
    if (optimizedContent) {
      onApplyOptimization(optimizedContent);
      message.success('优化内容已应用到编辑器');
    }
  };

  // 获取样式推荐
  const handleGetStyleRecommendations = async () => {
    if (!currentContent.trim()) {
      message.warning('请先输入文章内容');
      return;
    }

    try {
      const recommendations = await recommendStyle(currentContent);
      setStyleRecommendations(recommendations);
      message.success('样式推荐获取完成');
    } catch (error) {
      message.error('样式推荐获取失败');
    }
  };

  // 分析文章
  const handleAnalyzeArticle = async () => {
    if (!currentContent.trim()) {
      message.warning('请先输入文章内容');
      return;
    }

    try {
      const analysis = await analyzeArticle(currentContent);
      setArticleAnalysis(analysis);
      message.success('文章分析完成');
    } catch (error) {
      message.error('文章分析失败');
    }
  };

  // 生成SEO建议
  const handleGenerateSEO = async () => {
    if (!currentContent.trim()) {
      message.warning('请先输入文章内容');
      return;
    }

    try {
      const keywords = targetKeywords ? targetKeywords.split(',').map(k => k.trim()) : undefined;
      const seo = await generateSEO(currentContent, keywords);
      setSeoSuggestions(seo);
      message.success('SEO建议生成完成');
    } catch (error) {
      message.error('SEO建议生成失败');
    }
  };

  // 获取可读性级别颜色
  const getReadabilityColor = (level: string) => {
    switch (level) {
      case 'easy': return 'green';
      case 'medium': return 'orange';
      case 'hard': return 'red';
      default: return 'blue';
    }
  };

  // 获取分数颜色
  const getScoreColor = (score: number) => {
    if (score >= 8) return '#52c41a';
    if (score >= 6) return '#faad14';
    return '#ff4d4f';
  };

  // 标题生成面板
  const titlePanel = (
    <div className="ai-panel">
      <div className="panel-header">
        <Title level={4}>
          <ThunderboltOutlined /> AI标题生成
        </Title>
        <Text type="secondary">
          根据文章内容智能生成吸引人的标题
        </Text>
      </div>

      <div className="panel-controls">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>标题风格：</Text>
            <Radio.Group
              value={titleStyle}
              onChange={(e) => setTitleStyle(e.target.value)}
              style={{ marginTop: 8 }}
            >
              <Radio.Button value="professional">专业</Radio.Button>
              <Radio.Button value="creative">创意</Radio.Button>
              <Radio.Button value="clickbait">吸睛</Radio.Button>
              <Radio.Button value="seo">SEO</Radio.Button>
            </Radio.Group>
          </div>

          <Button
            type="primary"
            icon={<RocketOutlined />}
            loading={isGenerating}
            onClick={handleGenerateTitle}
            block
          >
            生成标题
          </Button>
        </Space>
      </div>

      {generatedTitles.length > 0 && (
        <div className="panel-results">
          <Divider>生成结果</Divider>
          <List
            dataSource={generatedTitles}
            renderItem={(title, index) => (
              <List.Item
                className={`title-item ${title.selected ? 'selected' : ''}`}
                onClick={() => handleSelectTitle(index)}
                actions={[
                  <Button
                    type="link"
                    size="small"
                    icon={<CheckCircleOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectTitle(index);
                    }}
                  >
                    选择
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={title.text}
                  description={
                    <Space>
                      <Tag color="blue">{title.style}</Tag>
                      {title.selected && <Tag color="green">已选择</Tag>}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      )}
    </div>
  );

  // 内容优化面板
  const contentPanel = (
    <div className="ai-panel">
      <div className="panel-header">
        <Title level={4}>
          <EditOutlined /> 内容优化
        </Title>
        <Text type="secondary">
          AI智能优化文章内容，提升可读性和吸引力
        </Text>
      </div>

      <div className="panel-controls">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>语言风格：</Text>
            <Radio.Group
              value={contentTone}
              onChange={(e) => setContentTone(e.target.value)}
              style={{ marginTop: 8 }}
            >
              <Radio.Button value="formal">正式</Radio.Button>
              <Radio.Button value="casual">轻松</Radio.Button>
              <Radio.Button value="humorous">幽默</Radio.Button>
              <Radio.Button value="inspiring">激励</Radio.Button>
            </Radio.Group>
          </div>

          <div>
            <Text strong>优化重点：</Text>
            <Radio.Group
              value={optimizationType}
              onChange={(e) => setOptimizationType(e.target.value)}
              style={{ marginTop: 8 }}
            >
              <Radio.Button value="readability">可读性</Radio.Button>
              <Radio.Button value="engagement">互动性</Radio.Button>
              <Radio.Button value="seo">SEO</Radio.Button>
            </Radio.Group>
          </div>

          <Button
            type="primary"
            icon={<BulbOutlined />}
            loading={isGenerating}
            onClick={handleOptimizeContent}
            block
          >
            优化内容
          </Button>
        </Space>
      </div>

      {optimizedContent && (
        <div className="panel-results">
          <Divider>优化结果</Divider>
          <Card size="small">
            <TextArea
              value={optimizedContent}
              onChange={(e) => setOptimizedContent(e.target.value)}
              rows={8}
              placeholder="优化后的内容将显示在这里..."
            />
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handleApplyOptimization}
              >
                应用到编辑器
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );

  // 样式推荐面板
  const stylePanel = (
    <div className="ai-panel">
      <div className="panel-header">
        <Title level={4}>
          <EyeOutlined /> 样式推荐
        </Title>
        <Text type="secondary">
          AI分析文章特点，推荐最适合的排版样式
        </Text>
      </div>

      <div className="panel-controls">
        <Button
          type="primary"
          icon={<SearchOutlined />}
          loading={isGenerating}
          onClick={handleGetStyleRecommendations}
          block
        >
          获取样式推荐
        </Button>
      </div>

      {styleRecommendations.length > 0 && (
        <div className="panel-results">
          <Divider>推荐结果</Divider>
          <List
            dataSource={styleRecommendations}
            renderItem={(recommendation) => (
              <List.Item>
                <Card size="small" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Title level={5} style={{ margin: 0 }}>
                        {recommendation.templateId}
                      </Title>
                      <Paragraph style={{ margin: '4px 0', fontSize: '12px' }}>
                        {recommendation.reason}
                      </Paragraph>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <Progress
                        type="circle"
                        size={50}
                        percent={Math.round(recommendation.confidence * 100)}
                        format={percent => `${percent}%`}
                      />
                    </div>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </div>
      )}
    </div>
  );

  // 文章分析面板
  const analysisPanel = (
    <div className="ai-panel">
      <div className="panel-header">
        <Title level={4}>
          <BarChartOutlined /> 文章分析
        </Title>
        <Text type="secondary">
          全面分析文章质量，提供改进建议
        </Text>
      </div>

      <div className="panel-controls">
        <Button
          type="primary"
          icon={<BarChartOutlined />}
          loading={isGenerating}
          onClick={handleAnalyzeArticle}
          block
        >
          开始分析
        </Button>
      </div>

      {articleAnalysis && (
        <div className="panel-results">
          <Divider>分析结果</Divider>
          
          {/* 综合评分 */}
          <Card size="small" style={{ marginBottom: 16 }}>
            <div style={{ textAlign: 'center' }}>
              <Progress
                type="circle"
                size={80}
                percent={articleAnalysis.score * 10}
                format={() => (
                  <span style={{ color: getScoreColor(articleAnalysis.score) }}>
                    {articleAnalysis.score.toFixed(1)}
                  </span>
                )}
                strokeColor={getScoreColor(articleAnalysis.score)}
              />
              <div style={{ marginTop: 8 }}>
                <Text strong>综合评分</Text>
              </div>
            </div>
          </Card>

          {/* 可读性等级 */}
          <Card size="small" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong>可读性等级：</Text>
              <Tag color={getReadabilityColor(articleAnalysis.readabilityLevel)}>
                {articleAnalysis.readabilityLevel === 'easy' ? '简单' : 
                 articleAnalysis.readabilityLevel === 'medium' ? '中等' : '困难'}
              </Tag>
            </div>
          </Card>

          {/* 关键词 */}
          {articleAnalysis.keywords.length > 0 && (
            <Card size="small" style={{ marginBottom: 16 }}>
              <Text strong>关键词：</Text>
              <div style={{ marginTop: 8 }}>
                {articleAnalysis.keywords.map((keyword, index) => (
                  <Tag key={index} color="blue" style={{ margin: '2px' }}>
                    {keyword}
                  </Tag>
                ))}
              </div>
            </Card>
          )}

          {/* 改进建议 */}
          {articleAnalysis.suggestions.length > 0 && (
            <Card size="small">
              <Text strong>改进建议：</Text>
              <List
                size="small"
                dataSource={articleAnalysis.suggestions}
                renderItem={(suggestion, index) => (
                  <List.Item>
                    <Text>
                      {index + 1}. {suggestion}
                    </Text>
                  </List.Item>
                )}
              />
            </Card>
          )}
        </div>
      )}
    </div>
  );

  // SEO优化面板
  const seoPanel = (
    <div className="ai-panel">
      <div className="panel-header">
        <Title level={4}>
          <SearchOutlined /> SEO优化
        </Title>
        <Text type="secondary">
          AI生成SEO友好的标题、描述和关键词建议
        </Text>
      </div>

      <div className="panel-controls">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>目标关键词（可选）：</Text>
            <Input
              placeholder="请输入关键词，用逗号分隔"
              value={targetKeywords}
              onChange={(e) => setTargetKeywords(e.target.value)}
              style={{ marginTop: 8 }}
            />
          </div>

          <Button
            type="primary"
            icon={<SearchOutlined />}
            loading={isGenerating}
            onClick={handleGenerateSEO}
            block
          >
            生成SEO建议
          </Button>
        </Space>
      </div>

      {seoSuggestions && (
        <div className="panel-results">
          <Divider>SEO建议</Divider>
          
          {/* SEO标题 */}
          <Card size="small" style={{ marginBottom: 16 }}>
            <Text strong>SEO标题：</Text>
            <div style={{ marginTop: 8 }}>
              <Input.TextArea
                value={seoSuggestions.title}
                rows={2}
                readOnly
              />
            </div>
          </Card>

          {/* SEO描述 */}
          <Card size="small" style={{ marginBottom: 16 }}>
            <Text strong>SEO描述：</Text>
            <div style={{ marginTop: 8 }}>
              <Input.TextArea
                value={seoSuggestions.description}
                rows={3}
                readOnly
              />
            </div>
          </Card>

          {/* SEO关键词 */}
          {seoSuggestions.keywords.length > 0 && (
            <Card size="small" style={{ marginBottom: 16 }}>
              <Text strong>推荐关键词：</Text>
              <div style={{ marginTop: 8 }}>
                {seoSuggestions.keywords.map((keyword: string, index: number) => (
                  <Tag key={index} color="green" style={{ margin: '2px' }}>
                    {keyword}
                  </Tag>
                ))}
              </div>
            </Card>
          )}

          {/* SEO建议 */}
          {seoSuggestions.suggestions.length > 0 && (
            <Card size="small">
              <Text strong>优化建议：</Text>
              <List
                size="small"
                dataSource={seoSuggestions.suggestions}
                renderItem={(suggestion: string, index: number) => (
                  <List.Item>
                    <Text>
                      {index + 1}. {suggestion}
                    </Text>
                  </List.Item>
                )}
              />
            </Card>
          )}
        </div>
      )}
    </div>
  );

  // 使用统计面板
  const statsPanel = (
    <div className="ai-panel">
      <div className="panel-header">
        <Title level={4}>
          <BarChartOutlined /> 使用统计
        </Title>
        <Text type="secondary">
          查看AI功能使用情况和剩余额度
        </Text>
      </div>

      {usageStats && (
        <div className="panel-results">
          {/* 总体统计 */}
          <Card size="small" style={{ marginBottom: 16 }}>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">{usageStats.totalRequests}</div>
                <div className="stat-label">今日使用</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">{usageStats.totalTokens}</div>
                <div className="stat-label">消耗Token</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">${usageStats.costUSD.toFixed(3)}</div>
                <div className="stat-label">今日花费</div>
              </div>
            </div>
          </Card>

          {/* 功能使用详情 */}
          <Card size="small">
            <Text strong>功能使用详情：</Text>
            <div style={{ marginTop: 12 }}>
              {Object.entries(usageStats.features).map(([feature, count]) => {
                const featureNames: { [key: string]: string } = {
                  title_generation: '标题生成',
                  content_optimization: '内容优化',
                  style_recommendation: '样式推荐',
                  article_analysis: '文章分析',
                  seo_optimization: 'SEO优化'
                };

                return (
                  <div key={feature} className="usage-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text>{featureNames[feature] || feature}</Text>
                      <Text strong>{count}</Text>
                    </div>
                    <Progress 
                      percent={Math.min((count / 20) * 100, 100)} 
                      size="small" 
                      showInfo={false}
                    />
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );

  const tabItems = [
    {
      key: 'title',
      label: (
        <span>
          <ThunderboltOutlined />
          标题生成
        </span>
      ),
      children: titlePanel,
    },
    {
      key: 'content',
      label: (
        <span>
          <EditOutlined />
          内容优化
        </span>
      ),
      children: contentPanel,
    },
    {
      key: 'style',
      label: (
        <span>
          <EyeOutlined />
          样式推荐
        </span>
      ),
      children: stylePanel,
    },
    {
      key: 'analysis',
      label: (
        <span>
          <BarChartOutlined />
          文章分析
        </span>
      ),
      children: analysisPanel,
    },
    {
      key: 'seo',
      label: (
        <span>
          <SearchOutlined />
          SEO优化
        </span>
      ),
      children: seoPanel,
    },
    {
      key: 'stats',
      label: (
        <span>
          <BarChartOutlined />
          使用统计
        </span>
      ),
      children: statsPanel,
    },
  ];

  return (
    <div className="ai-assistant">
      {/* 顶部提示 */}
      <div className="assistant-header">
        <div className="header-content">
          <div className="header-left">
            <Badge count={isGenerating ? <Spin size="small" /> : 0}>
              <ThunderboltOutlined style={{ fontSize: 24, color: '#1890ff' }} />
            </Badge>
            <div className="header-text">
              <Title level={4} style={{ margin: 0 }}>AI智能助手</Title>
              <Text type="secondary">让AI帮你打造完美文章</Text>
            </div>
          </div>
          {usageStats && (
            <div className="header-right">
              <Tooltip title="今日剩余使用次数">
                <Badge count={usageStats.totalRequests} showZero>
                  <StarOutlined style={{ fontSize: 18 }} />
                </Badge>
              </Tooltip>
            </div>
          )}
        </div>
      </div>

      {/* 功能面板 */}
      <div className="assistant-content">
        {!currentContent.trim() && (
          <div className="empty-state">
            <div className="empty-icon">
              <EditOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
            </div>
            <Title level={4} type="secondary">请先在编辑器中输入内容</Title>
            <Text type="secondary">AI助手需要分析您的文章内容才能提供智能建议</Text>
          </div>
        )}

        {currentContent.trim() && (
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            className="ai-tabs"
          />
        )}
      </div>

      {/* 快捷操作按钮 */}
      {currentContent.trim() && (
        <div className="quick-actions">
          <Space wrap>
            <Tooltip title="一键优化全部">
              <Button
                type="primary"
                icon={<RocketOutlined />}
                size="small"
                loading={isGenerating}
                onClick={() => {
                  // 执行批量优化
                  message.info('批量优化功能开发中...');
                }}
              >
                全能优化
              </Button>
            </Tooltip>
            
            <Tooltip title="快速分析">
              <Button
                icon={<BarChartOutlined />}
                size="small"
                onClick={() => {
                  setActiveTab('analysis');
                  handleAnalyzeArticle();
                }}
              >
                快速分析
              </Button>
            </Tooltip>
            
            <Tooltip title="样式建议">
              <Button
                icon={<EyeOutlined />}
                size="small"
                onClick={() => {
                  setActiveTab('style');
                  handleGetStyleRecommendations();
                }}
              >
                样式建议
              </Button>
            </Tooltip>
          </Space>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
