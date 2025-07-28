// frontend/src/components/Editor/EditorCore.tsx
import React, { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import { Button, Space, Tooltip, Drawer, message } from 'antd';
import { 
  BoldOutlined, 
  ItalicOutlined, 
  UnderlineOutlined,
  FontColorsOutlined,
  PictureOutlined,
  EyeOutlined,
  SaveOutlined,
  ThunderboltOutlined,
  BgColorsOutlined
} from '@ant-design/icons';
import { useEditorStore } from '../../store/editorStore';
import { useAIStore } from '../../store/aiStore';
import { AIAssistant } from '../AI/AIAssistant';
import { TemplateGallery } from '../Templates/TemplateGallery';
import { PreviewPanel } from './PreviewPanel';
import 'quill/dist/quill.snow.css';
import './EditorCore.css';

interface EditorCoreProps {
  initialContent?: string;
  onContentChange?: (content: string, html: string) => void;
  onSave?: (content: { title: string; content: string; html: string }) => void;
}

const EditorCore: React.FC<EditorCoreProps> = ({
  initialContent = '',
  onContentChange,
  onSave
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const [title, setTitle] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  
  const { 
    currentTemplate, 
    isLoading: editorLoading,
    applyTemplate,
    saveArticle 
  } = useEditorStore();
  
  const { 
    generateTitle, 
    optimizeContent, 
    isGenerating 
  } = useAIStore();

  // 初始化Quill编辑器
  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      // 自定义工具栏配置
      const toolbarOptions = [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ 'header': 1 }, { 'header': 2 }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'direction': 'rtl' }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'font': [] }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['clean']
      ];

      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: {
            container: toolbarOptions,
            handlers: {
              'image': handleImageUpload,
              'ai-optimize': handleAIOptimize
            }
          },
          history: {
            delay: 1000,
            maxStack: 50,
            userOnly: false
          }
        },
        placeholder: '开始写作，让AI帮你打造完美排版...',
        formats: [
          'header', 'bold', 'italic', 'underline', 'strike',
          'blockquote', 'code-block', 'list', 'indent',
          'link', 'image', 'video', 'color', 'background',
          'font', 'size', 'align', 'direction', 'script'
        ]
      });

      // 监听内容变化
      quillRef.current.on('text-change', () => {
        if (quillRef.current) {
          const content = quillRef.current.getText();
          const html = quillRef.current.root.innerHTML;
          onContentChange?.(content, html);
        }
      });

      // 设置初始内容
      if (initialContent) {
        quillRef.current.setText(initialContent);
      }
    }

    return () => {
      if (quillRef.current) {
        quillRef.current = null;
      }
    };
  }, [initialContent, onContentChange]);

  // 应用模板样式
  useEffect(() => {
    if (currentTemplate && quillRef.current) {
      applyTemplateStyles(currentTemplate);
    }
  }, [currentTemplate]);

  // 图片上传处理
  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        const formData = new FormData();
        formData.append('image', file);
        
        try {
          const response = await fetch('/api/upload/image', {
            method: 'POST',
            body: formData,
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          const data = await response.json();
          if (data.success) {
            const range = quillRef.current?.getSelection();
            if (range && quillRef.current) {
              quillRef.current.insertEmbed(range.index, 'image', data.url);
            }
          }
        } catch (error) {
          message.error('图片上传失败');
        }
      }
    };
  };

  // AI内容优化
  const handleAIOptimize = async () => {
    if (!quillRef.current) return;
    
    const content = quillRef.current.getText();
    if (!content.trim()) {
      message.warning('请先输入内容');
      return;
    }

    try {
      const optimizedContent = await optimizeContent(content);
      quillRef.current.setText(optimizedContent);
      message.success('内容优化完成');
    } catch (error) {
      message.error('AI优化失败，请稍后重试');
    }
  };

  // 应用模板样式
  const applyTemplateStyles = (template: any) => {
    if (!quillRef.current) return;
    
    const editor = quillRef.current.root;
    const styles = template.styleConfig;
    
    // 应用字体样式
    if (styles.font) {
      editor.style.fontFamily = styles.font;
    }
    
    // 应用颜色主题
    if (styles.colors) {
      editor.style.color = styles.colors.text;
      editor.style.backgroundColor = styles.colors.background;
    }
    
    // 应用段落样式
    if (styles.paragraph) {
      editor.style.lineHeight = styles.paragraph.lineHeight;
      editor.style.letterSpacing = styles.paragraph.letterSpacing;
    }
  };

  // AI生成标题
  const handleGenerateTitle = async () => {
    if (!quillRef.current) return;
    
    const content = quillRef.current.getText();
    if (!content.trim()) {
      message.warning('请先输入内容');
      return;
    }

    try {
      const generatedTitle = await generateTitle(content);
      setTitle(generatedTitle);
      message.success('标题生成完成');
    } catch (error) {
      message.error('标题生成失败');
    }
  };

  // 保存文章
  const handleSave = async () => {
    if (!quillRef.current) return;
    
    const content = quillRef.current.getText();
    const html = quillRef.current.root.innerHTML;
    
    if (!title.trim()) {
      message.warning('请输入文章标题');
      return;
    }
    
    if (!content.trim()) {
      message.warning('请输入文章内容');
      return;
    }

    try {
      await saveArticle({ title, content, html });
      onSave?.({ title, content, html });
      message.success('文章保存成功');
    } catch (error) {
      message.error('保存失败，请稍后重试');
    }
  };

  // 获取当前内容用于预览
  const getCurrentContent = () => {
    if (!quillRef.current) return { title: '', html: '' };
    return {
      title,
      html: quillRef.current.root.innerHTML
    };
  };

  return (
    <div className="editor-core">
      {/* 顶部工具栏 */}
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <input
            type="text"
            placeholder="请输入文章标题..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="title-input"
          />
          <Button
            type="link"
            icon={<ThunderboltOutlined />}
            loading={isGenerating}
            onClick={handleGenerateTitle}
            className="ai-button"
          >
            AI生成标题
          </Button>
        </div>
        
        <div className="toolbar-right">
          <Space>
            <Tooltip title="选择模板">
              <Button
                icon={<BgColorsOutlined />}
                onClick={() => setShowTemplates(true)}
              >
                模板
              </Button>
            </Tooltip>
            
            <Tooltip title="AI助手">
              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                onClick={() => setShowAIAssistant(true)}
              >
                AI助手
              </Button>
            </Tooltip>
            
            <Tooltip title="预览">
              <Button
                icon={<EyeOutlined />}
                onClick={() => setShowPreview(true)}
              >
                预览
              </Button>
            </Tooltip>
            
            <Tooltip title="保存">
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={editorLoading}
                onClick={handleSave}
              >
                保存
              </Button>
            </Tooltip>
          </Space>
        </div>
      </div>

      {/* 编辑器容器 */}
      <div className="editor-container">
        <div className="editor-wrapper">
          <div ref={editorRef} className="quill-editor" />
        </div>
      </div>

      {/* 模板选择抽屉 */}
      <Drawer
        title="选择模板"
        placement="right"
        width={600}
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
      >
        <TemplateGallery
          onSelect={(template) => {
            applyTemplate(template);
            setShowTemplates(false);
            message.success('模板应用成功');
          }}
        />
      </Drawer>

      {/* AI助手抽屉 */}
      <Drawer
        title="AI智能助手"
        placement="right"
        width={400}
        open={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
      >
        <AIAssistant
          currentContent={quillRef.current?.getText() || ''}
          onApplyOptimization={(optimizedContent) => {
            if (quillRef.current) {
              quillRef.current.setText(optimizedContent);
              message.success('AI优化应用成功');
            }
          }}
        />
      </Drawer>

      {/* 预览抽屉 */}
      <Drawer
        title="文章预览"
        placement="right"
        width={800}
        open={showPreview}
        onClose={() => setShowPreview(false)}
      >
        <PreviewPanel
          title={title}
          content={getCurrentContent().html}
          template={currentTemplate}
        />
      </Drawer>
    </div>
  );
};

export default EditorCore;
