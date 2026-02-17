// Markdown分析插件 v2.2 - 完全修复版
(function() {
  'use strict';

  class MarkdownAnalyzerPlugin {
    constructor() {
      this.id = 'markdown-analyzer';
      this.name = 'Markdown分析器 Pro';
      this.version = '2.2.0';
      this.context = null;
      this.editor = null;
      this.preview = null;
      this.stats = null;
      this.isSyncEnabled = false;
    }

    init(context) {
      this.context = context;
      this.registerTab();
      console.log('✅ Markdown分析器插件已加载 (v' + this.version + ')');
    }

    registerTab() {
      const { registerTab } = this.context;
      
      registerTab(this.id, '📝 Markdown分析', () => {
        return this.renderUI();
      });
    }

    renderUI() {
      const container = document.createElement('div');
      container.style.cssText = 'display:flex;flex-direction:column;height:100%;padding:10px;gap:10px;overflow:hidden;';
      
      const toolbar = this.createToolbar();
      container.appendChild(toolbar);
      
      const mainArea = document.createElement('div');
      mainArea.style.cssText = 'flex:1;display:flex;gap:10px;min-height:0;';
      
      const editorPanel = this.createEditorPanel();
      mainArea.appendChild(editorPanel);
      
      const previewPanel = this.createPreviewPanel();
      mainArea.appendChild(previewPanel);
      
      const statusBar = this.createStatusBar();
      container.appendChild(statusBar);
      
      setTimeout(() => {
        this.editor = document.getElementById('md-editor');
        this.preview = document.getElementById('md-preview');
        this.stats = document.getElementById('md-stats');
        this.updatePreview();
      }, 100);
      
      return container;
    }

    createToolbar() {
      const toolbar = document.createElement('div');
      toolbar.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;align-items:center;padding:8px;background:rgba(255,255,255,0.05);border-radius:8px;border:1px solid rgba(255,255,255,0.1);';
      
      const buttons = [
        { label: '🔄 解析', action: () => this.parseMarkdown(), title: '手动解析Markdown (Ctrl+Enter)' },
        { label: '🗑️ 清空', action: () => this.clearContent(), title: '清空内容' },
        { label: '📋 示例', action: () => this.loadExample(), title: '加载示例文档' },
        { label: '📊 统计', action: () => this.showStats(), title: '显示文档统计' },
        { label: '📄 导出HTML', action: () => this.exportHTML(), title: '导出为HTML文件 (Ctrl+S)' },
        { label: '🔍 语法检查', action: () => this.lintMarkdown(), title: '检查Markdown语法' },
        { label: '🎨 主题', action: () => this.toggleTheme(), title: '切换预览主题' },
        { label: '🔗 同步', action: () => this.toggleSyncScroll(), title: '切换同步滚动' }
      ];
      
      buttons.forEach(({ label, action, title }) => {
        const btn = document.createElement('button');
        btn.textContent = label;
        btn.title = title;
        btn.style.cssText = 'background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;padding:6px 10px;border-radius:6px;cursor:pointer;font-size:12px;transition:all 0.2s;';
        btn.onmouseover = () => btn.style.background = 'rgba(255,255,255,0.2)';
        btn.onmouseout = () => btn.style.background = 'rgba(255,255,255,0.1)';
        btn.onclick = action;
        toolbar.appendChild(btn);
      });
      
      return toolbar;
    }

    createEditorPanel() {
      const panel = document.createElement('div');
      panel.style.cssText = 'flex:1;display:flex;flex-direction:column;min-width:0;';
      
      const header = document.createElement('div');
      header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;';
      
      const title = document.createElement('div');
      title.textContent = 'Markdown 输入';
      title.style.cssText = 'font-size:12px;opacity:0.7;';
      
      const charCount = document.createElement('div');
      charCount.id = 'char-count';
      charCount.textContent = '0 字符';
      charCount.style.cssText = 'font-size:11px;opacity:0.6;';
      
      header.appendChild(title);
      header.appendChild(charCount);
      
      const textarea = document.createElement('textarea');
      textarea.id = 'md-editor';
      textarea.style.cssText = 'flex:1;width:100%;background:rgba(0,0,0,0.3);color:#fff;border:1px solid #555;border-radius:6px;padding:10px;resize:none;font-family:Consolas,Monaco,Courier New,monospace;font-size:13px;line-height:1.5;';
      textarea.placeholder = '在此输入Markdown内容...\n支持实时预览、语法高亮、自动保存\n\n快捷键:\n- Ctrl+Enter: 手动解析\n- Ctrl+S: 导出HTML';
      
      textarea.addEventListener('input', () => {
        this.updatePreview();
        this.updateCharCount();
        this.autoSave();
      });
      
      textarea.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          this.parseMarkdown();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault();
          this.exportHTML();
        }
      });
      
      const saved = localStorage.getItem('md-plugin-autosave');
      if (saved) {
        textarea.value = saved;
        setTimeout(() => this.updateCharCount(), 100);
      }
      
      panel.appendChild(header);
      panel.appendChild(textarea);
      
      return panel;
    }

    createPreviewPanel() {
      const panel = document.createElement('div');
      panel.style.cssText = 'flex:1;display:flex;flex-direction:column;min-width:0;';
      
      const header = document.createElement('div');
      header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;';
      
      const title = document.createElement('div');
      title.textContent = '实时预览';
      title.style.cssText = 'font-size:12px;opacity:0.7;';
      
      const previewControls = document.createElement('div');
      previewControls.style.cssText = 'display:flex;gap:5px;';
      
      const themeBtn = document.createElement('button');
      themeBtn.textContent = '🌙';
      themeBtn.title = '切换主题';
      themeBtn.style.cssText = 'background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;padding:2px 6px;border-radius:4px;cursor:pointer;font-size:11px;';
      themeBtn.onclick = () => this.toggleTheme();
      
      previewControls.appendChild(themeBtn);
      header.appendChild(title);
      header.appendChild(previewControls);
      
      const preview = document.createElement('div');
      preview.id = 'md-preview';
      preview.style.cssText = 'flex:1;width:100%;background:rgba(0,0,0,0.2);border:1px solid #555;border-radius:6px;padding:10px;overflow-y:auto;font-size:14px;line-height:1.6;';
      preview.className = 'md-theme-light';
      
      panel.appendChild(header);
      panel.appendChild(preview);
      
      return panel;
    }

    createStatusBar() {
      const bar = document.createElement('div');
      bar.id = 'md-stats';
      bar.style.cssText = 'display:flex;gap:15px;justify-content:space-between;align-items:center;padding:8px;background:rgba(255,255,255,0.05);border-radius:8px;border:1px solid rgba(255,255,255,0.1);font-size:11px;';
      
      const left = document.createElement('div');
      left.style.cssText = 'display:flex;gap:15px;';
      
      const stats = ['行数', '单词', '字符', '标题', '代码块', '链接'];
      stats.forEach(stat => {
        const item = document.createElement('div');
        item.innerHTML = stat + ': <span id="stat-' + stat + '" style="color:#8af;font-weight:bold;">0</span>';
        left.appendChild(item);
      });
      
      const right = document.createElement('div');
      right.textContent = '就绪';
      right.id = 'md-status';
      right.style.cssText = 'color:#8f8;';
      
      bar.appendChild(left);
      bar.appendChild(right);
      
      return bar;
    }

    updatePreview() {
      if (!this.editor || !this.preview) return;
      
      const markdown = this.editor.value;
      const html = this.advancedMarkdownParser(markdown);
      this.preview.innerHTML = html;
      this.highlightCodeBlocks(this.preview);
      this.updateStats();
    }

    updateCharCount() {
      const editor = document.getElementById('md-editor');
      const counter = document.getElementById('char-count');
      if (!editor || !counter) return;
      
      const count = editor.value.length;
      counter.textContent = count + ' 字符';
      counter.style.color = count > 5000 ? '#f88' : count > 2000 ? '#fa8' : '#8f8';
    }

    updateStats() {
      const editor = document.getElementById('md-editor');
      if (!editor) return;
      
      const text = editor.value;
      const lines = text.split('\n').length;
      const words = text.trim().split(/\s+/).filter(w => w).length;
      const chars = text.length;
      const headings = (text.match(/^#+ /gm) || []).length;
      const codeBlocks = (text.match(/```/g) || []).length / 2;
      const links = (text.match(/\[([^\]]+)\]\([^)]+\)/g) || []).length;
      
      document.getElementById('stat-行数').textContent = lines;
      document.getElementById('stat-单词').textContent = words;
      document.getElementById('stat-字符').textContent = chars;
      document.getElementById('stat-标题').textContent = headings;
      document.getElementById('stat-代码块').textContent = codeBlocks;
      document.getElementById('stat-链接').textContent = links;
    }

    autoSave() {
      const editor = document.getElementById('md-editor');
      if (!editor) return;
      
      localStorage.setItem('md-plugin-autosave', editor.value);
      const status = document.getElementById('md-status');
      if (status) {
        status.textContent = '已自动保存';
        status.style.color = '#8f8';
        setTimeout(() => {
          status.textContent = '就绪';
          status.style.color = '#8f8';
        }, 2000);
      }
    }

    advancedMarkdownParser(markdown) {
      if (!markdown) return '';
      
      let html = markdown;
      
      const codeBlocks = [];
      html = html.replace(/```(\w+)?([\s\S]*?)```/g, (match, lang, code) => {
        const index = codeBlocks.length;
        codeBlocks.push({ lang: lang || '', code: code.trim() });
        return '__CODE_BLOCK_' + index + '__';
      });
      
      html = html.replace(/^#### (.*$)/gim, '<h6>$1</h6>');
      html = html.replace(/^### (.*$)/gim, '<h5>$1</h5>');
      html = html.replace(/^## (.*$)/gim, '<h4>$1</h4>');
      html = html.replace(/^# (.*$)/gim, '<h3>$1</h3>');
      
      const quoteBlocks = [];
      html = html.replace(/^> (.*\n?)+/gm, (match) => {
        const index = quoteBlocks.length;
        const content = match.replace(/^> /gm, '');
        quoteBlocks.push(content);
        return '__QUOTE_BLOCK_' + index + '__';
      });
      
      const tableRegex = /\|(.+)\|\n\|([-:| ]+)\|(\n(?:\|.*\|\n?)*)?/g;
      html = html.replace(tableRegex, (match, header, separator, body) => {
        if (!body) return match;
        const headers = header.split('|').map(h => h.trim()).filter(h => h);
        const rows = body.trim().split('\n').map(row => {
          return row.split('|').map(c => c.trim()).filter(c => c);
        });
        let table = '<table style="border-collapse:collapse;width:100%;margin:10px 0;border:1px solid #555;">';
        table += '<thead><tr style="background:rgba(255,255,255,0.1)">';
        headers.forEach(h => table += '<th style="border:1px solid #555;padding:6px;text-align:left;">' + h + '</th>');
        table += '</tr></thead><tbody>';
        rows.forEach(row => {
          table += '<tr>';
          row.forEach((cell, i) => {
            if (i < headers.length) table += '<td style="border:1px solid #555;padding:6px;">' + cell + '</td>';
          });
          table += '</tr>';
        });
        table += '</tbody></table>';
        return table;
      });
      
      html = html.replace(/^\s*-\s+\[x\]\s+(.*)/gim, '<li><input type="checkbox" checked disabled> $1</li>');
      html = html.replace(/^\s*-\s+\[ \]\s+(.*)/gim, '<li><input type="checkbox" disabled> $1</li>');
      html = html.replace(/^\s*-\s+(.*)/gim, '<li>$1</li>');
      html = html.replace(/(<li>.*<\/li>)/s, '<ul style="margin:5px 0;padding-left:20px;">$1</ul>');
      
      html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" style="max-width:100%;border-radius:4px;margin:5px 0;">');
      html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" style="color:#8af;text-decoration:none;">$1</a>');
      
      html = html.replace(/\*\*(.*)\*\*/gim, '<b>$1</b>');
      html = html.replace(/\*(.*)\*/gim, '<i>$1</i>');
      html = html.replace(/___(.*)___/gim, '<b><i>$1</i></b>');
      html = html.replace(/`([^`]+)`/g, '<code style="background:#333;padding:2px 4px;border-radius:3px;font-family:monospace;">$1</code>');
      html = html.replace(/^---$/gim, '<hr style="border:1px solid #555;margin:15px 0;">');
      
      html = html.replace(/__QUOTE_BLOCK_(\d+)__/g, (match, index) => {
        return '<blockquote style="border-left:3px solid #555;padding-left:10px;margin:10px 0;opacity:0.9;">' + quoteBlocks[index] + '</blockquote>';
      });
      
      html = html.replace(/__CODE_BLOCK_(\d+)__/g, (match, index) => {
        const block = codeBlocks[index];
        const lang = block.lang ? ' data-lang="' + block.lang + '"' : '';
        return '<pre' + lang + ' style="background:#1e1e1e;padding:10px;border-radius:4px;overflow-x:auto;margin:10px 0;border:1px solid #444;"><code>' + block.code + '</code></pre>';
      });
      
      html = html.replace(/\n/g, '<br>');
      
      return html;
    }

    highlightCodeBlocks(container) {
      const blocks = container.querySelectorAll('pre code');
      blocks.forEach(block => {
        const pre = block.parentElement;
        const lang = pre.getAttribute('data-lang');
        let code = block.textContent;
        
        if (lang === 'javascript' || lang === 'js' || code.includes('function') || code.includes('const')) {
          code = code.replace(/\b(function|const|let|var|if|else|for|while|return|class|import|export|async|await|try|catch|throw|new|this|super|extends|static|get|set)\b/g, '<span style="color:#569cd6;font-weight:bold;">$1</span>');
          code = code.replace(/(['"`])([^'"`]*)\\1/g, '<span style="color:#ce9178;">$1$2$1</span>');
          code = code.replace(/(\/\/.*$)/gm, '<span style="color:#6a9955;">$1</span>');
          code = code.replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color:#6a9955;">$1</span>');
          code = code.replace(/\b(\d+)\b/g, '<span style="color:#b5cea8;">$1</span>');
        } else if (lang === 'python' || lang === 'py' || code.includes('def ') || code.includes('import ')) {
          code = code.replace(/\b(def|class|import|from|if|else|elif|for|while|return|try|except|with|as|pass|break|continue|lambda|yield|async|await|finally|raise|assert|del|global|nonlocal|True|False|None)\b/g, '<span style="color:#569cd6;font-weight:bold;">$1</span>');
          code = code.replace(/(['"])([^'"]*)\\1/g, '<span style="color:#ce9178;">$1$2$1</span>');
          code = code.replace(/(#.*$)/gm, '<span style="color:#6a9955;">$1</span>');
          code = code.replace(/\b(\d+)\b/g, '<span style="color:#b5cea8;">$1</span>');
        } else if (lang === 'html' || code.includes('<') && code.includes('>')) {
          code = code.replace(/(&lt;[^&gt;]+&gt;)/g, '<span style="color:#569cd6;">$1</span>');
          code = code.replace(/(&lt;\/[^&gt;]+&gt;)/g, '<span style="color:#569cd6;">$1</span>');
        } else if (lang === 'css' || code.includes('{') && code.includes(':')) {
          code = code.replace(/([a-z-]+):/g, '<span style="color:#9cdcfe;">$1</span>:');
          code = code.replace(/:\s*([^;]+);/g, ': <span style="color:#ce9178;">$1</span>;');
        }
        
        block.innerHTML = code;
      });
    }

    toggleSyncScroll() {
      const editor = document.getElementById('md-editor');
      const preview = document.getElementById('md-preview');
      if (!editor || !preview) return;
      
      this.isSyncEnabled = !this.isSyncEnabled;
      
      if (this.isSyncEnabled) {
        let isSyncing = false;
        
        editor.addEventListener('scroll', () => {
          if (isSyncing) return;
          isSyncing = true;
          const percentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
          preview.scrollTop = percentage * (preview.scrollHeight - preview.clientHeight);
          setTimeout(() => isSyncing = false, 50);
        });
        
        preview.addEventListener('scroll', () => {
          if (isSyncing) return;
          isSyncing = true;
          const percentage = preview.scrollTop / (preview.scrollHeight - preview.clientHeight);
          editor.scrollTop = percentage * (editor.scrollHeight - editor.clientHeight);
          setTimeout(() => isSyncing = false, 50);
        });
        
        alert('🔗 同步滚动已启用');
      } else {
        alert('🔗 同步滚动已禁用');
      }
    }

    toggleTheme() {
      const preview = document.getElementById('md-preview');
      if (!preview) return;
      
      if (preview.className === 'md-theme-light') {
        preview.className = 'md-theme-dark';
        preview.style.background = '#0a0a0a';
        preview.style.color = '#e0e0e0';
      } else {
        preview.className = 'md-theme-light';
        preview.style.background = '#f5f5f5';
        preview.style.color = '#333';
      }
    }

    lintMarkdown() {
      const editor = document.getElementById('md-editor');
      if (!editor) return;
      
      const text = editor.value;
      const issues = [];
      
      const emptyLinks = text.match(/\[\]\([^)]+\)/g);
      if (emptyLinks) issues.push('⚠️ 发现空链接: ' + emptyLinks.length + ' 处');
      
      const codeBlockCount = (text.match(/```/g) || []).length;
      if (codeBlockCount % 2 !== 0) issues.push('❌ 代码块未闭合');
      
      const quoteLines = text.split('\n').filter(line => line.startsWith('>')).length;
      if (quoteLines > 0 && !text.includes('</blockquote>')) {
        issues.push('⚠️ 引用块可能未正确闭合');
      }
      
      const longLines = text.split('\n').filter(line => line.length > 120).length;
      if (longLines > 0) issues.push('⚠️ 有 ' + longLines + ' 行超过120字符');
      
      if (issues.length === 0) {
        alert('✅ Markdown 语法检查通过！');
      } else {
        alert('🔍 发现以下问题:\n\n' + issues.join('\n'));
      }
    }

    parseMarkdown() {
      this.updatePreview();
    }

    clearContent() {
      const editor = document.getElementById('md-editor');
      const preview = document.getElementById('md-preview');
      
      if (editor) editor.value = '';
      if (preview) preview.innerHTML = '';
      this.updateStats();
    }

    loadExample() {
      const editor = document.getElementById('md-editor');
      if (!editor) return;
      
      const example = '# 示例文档\n\n## 二级标题\n\n这是一个 **加粗** 和 *斜体* 的示例。\n\n### 列表\n- 项目1\n- 项目2\n  - 子项目\n  - 子项目\n\n### 任务列表\n- [x] 已完成任务\n- [ ] 未完成任务\n\n### 代码块\n```javascript\nfunction hello() {\n  console.log("Hello World");\n}\n```\n\n### 表格\n| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| A   | B   | C   |\n| 1   | 2   | 3   |\n\n### 引用\n> 这是一个引用块\n> 多行引用\n\n### 链接和图片\n[GitHub](https://github.com)\n![Logo](https://github.com/favicon.ico)\n';
      
      editor.value = example;
      this.updatePreview();
    }

    showStats() {
      const editor = document.getElementById('md-editor');
      if (!editor) return;
      
      const text = editor.value;
      const lines = text.split('\n').length;
      const words = text.trim().split(/\s+/).filter(w => w).length;
      const chars = text.length;
      const headings = (text.match(/^#+ /gm) || []).length;
      const codeBlocks = (text.match(/```/g) || []).length / 2;
      const links = (text.match(/\[([^\]]+)\]\([^)]+\)/g) || []).length;
      const images = (text.match(/!\[([^\]]*)\]\([^)]+\)/g) || []).length;
      
      alert('📊 Markdown 统计信息:\n\n' +
        '行数: ' + lines + '\n' +
        '单词: ' + words + '\n' +
        '字符: ' + chars + '\n' +
        '标题: ' + headings + '\n' +
        '代码块: ' + codeBlocks + '\n' +
        '链接: ' + links + '\n' +
        '图片: ' + images
      );
    }

    exportHTML() {
      const preview = document.getElementById('md-preview');
      if (!preview) return;
      
      const html = preview.innerHTML;
      const fullHTML = '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<title>Markdown Export</title>\n<style>\nbody { font-family: system-ui, -apple-system, sans-serif; padding: 20px; background: #f5f5f5; color: #333; }\npre { background: #f0f0f0; padding: 10px; border-radius: 4px; overflow-x: auto; }\ncode { background: #f0f0f0; padding: 2px 4px; border-radius: 3px; }\ntable { border-collapse: collapse; width: 100%; margin: 10px 0; }\nth, td { border: 1px solid #ddd; padding: 8px; text-align: left; }\nth { background: #f0f0f0; }\nblockquote { border-left: 3px solid #ddd; padding-left: 10px; margin: 10px 0; }\nimg { max-width: 100%; height: auto; }\n</style>\n</head>\n<body>\n' + html + '\n</body>\n</html>';
      
      const blob = new Blob([fullHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'markdown-export.html';
      a.click();
      URL.revokeObjectURL(url);
      
      alert('📄 HTML已导出');
    }

    destroy() {
      console.log('🧹 Markdown分析器插件已卸载');
    }
  }

  // 创建插件实例并返回
  const pluginInstance = new MarkdownAnalyzerPlugin();
  pluginInstance.init(context);
  return pluginInstance;
})();
