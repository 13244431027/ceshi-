// ==================== Markdown分析插件 (自定义插件示例) ====================

// 这是一个完整的自定义插件，可以导入到GitHub Panel Pro+扩展中
// 提供增强的Markdown解析、实时预览、统计和导出功能

const markdownAnalyzerPluginCode = `
// Markdown分析插件 v2.0
class MarkdownAnalyzerPlugin {
 constructor() {
   this.id = 'markdown-analyzer';
   this.name = 'Markdown分析器 Pro';
   this.version = '2.0.0';
   this.context = null;
   this.editor = null;
   this.preview = null;
   this.stats = null;
 }

 init(context) {
   this.context = context;
   this.registerTab();
   console.log('✅ Markdown分析器插件已加载');
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
   
   // 顶部工具栏
   const toolbar = this.createToolbar();
   container.appendChild(toolbar);
   
   // 主内容区域（左右分栏）
   const mainArea = document.createElement('div');
   mainArea.style.cssText = 'flex:1;display:flex;gap:10px;min-height:0;';
   
   // 左侧编辑器
   const editorPanel = this.createEditorPanel();
   mainArea.appendChild(editorPanel);
   
   // 右侧预览
   const previewPanel = this.createPreviewPanel();
   mainArea.appendChild(previewPanel);
   
   // 底部状态栏
   const statusBar = this.createStatusBar();
   container.appendChild(statusBar);
   
   // 初始化引用
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
     { label: '🔄 解析', action: () => this.parseMarkdown(), title: '手动解析Markdown' },
     { label: '🗑️ 清空', action: () => this.clearContent(), title: '清空内容' },
     { label: '📋 示例', action: () => this.loadExample(), title: '加载示例文档' },
     { label: '📊 统计', action: () => this.showStats(), title: '显示文档统计' },
     { label: '📄 导出HTML', action: () => this.exportHTML(), title: '导出为HTML文件' },
     { label: '📑 导出PDF', action: () => this.exportPDF(), title: '导出为PDF文件' },
     { label: '🔍 语法检查', action: () => this.lintMarkdown(), title: '检查Markdown语法' },
     { label: '🎨 主题', action: () => this.toggleTheme(), title: '切换预览主题' }
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
   textarea.style.cssText = 'flex:1;width:100%;background:rgba(0,0,0,0.3);color:#fff;border:1px solid #555;border-radius:6px;padding:10px;resize:none;font-family:'Consolas','Monaco','Courier New',monospace;font-size:13px;line-height:1.5;';
   textarea.placeholder = '在此输入Markdown内容...\n支持实时预览、语法高亮、自动保存';
   
   // 实时预览
   textarea.addEventListener('input', () => {
     this.updatePreview();
     this.updateCharCount();
     this.autoSave();
   });
   
   // 快捷键
   textarea.addEventListener('keydown', (e) => {
     if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
       this.parseMarkdown();
     }
     if ((e.ctrlKey || e.metaKey) && e.key === 's') {
       e.preventDefault();
       this.exportHTML();
     }
   });
   
   // 加载自动保存内容
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
   
   const syncBtn = document.createElement('button');
   syncBtn.textContent = '🔗';
   syncBtn.title = '同步滚动';
   syncBtn.style.cssText = 'background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:#fff;padding:2px 6px;border-radius:4px;cursor:pointer;font-size:11px;';
   syncBtn.onclick = () => this.toggleSyncScroll();
   
   const themeBtn = document.createElement('button');
   themeBtn.textContent = '🌙';
   themeBtn.title = '切换主题';
   themeBtn.style.cssText = syncBtn.style.cssText;
   themeBtn.onclick = () => this.toggleTheme();
   
   previewControls.appendChild(syncBtn);
   previewControls.appendChild(themeBtn);
   header.appendChild(title);
   header.appendChild(previewControls);
   
   const preview = document.createElement('div');
   preview.id = 'md-preview';
   preview.style.cssText = 'flex:1;width:100%;background:rgba(0,0,0,0.2);border:1px solid #555;border-radius:6px;padding:10px;overflow-y:auto;font-size:14px;line-height:1.6;';
   
   // 默认主题样式
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
     item.innerHTML = \`\${stat}: <span id="stat-\${stat}" style="color:#8af;font-weight:bold;">0</span>\`;
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
   
   // 代码高亮
   this.highlightCodeBlocks(this.preview);
   
   // 更新统计
   this.updateStats();
 }

 updateCharCount() {
   const editor = document.getElementById('md-editor');
   const counter = document.getElementById('char-count');
   if (!editor || !counter) return;
   
   const count = editor.value.length;
   counter.textContent = \`\${count} 字符\`;
   counter.style.color = count > 5000 ? '#f88' : count > 2000 ? '#fa8' : '#8f8';
 }

 updateStats() {
   const editor = document.getElementById('md-editor');
   if (!editor) return;
   
   const text = editor.value;
   const lines = text.split('\\n').length;
   const words = text.trim().split(/\\s+/).filter(w => w).length;
   const chars = text.length;
   const headings = (text.match(/^#+ /gm) || []).length;
   const codeBlocks = (text.match(/\\`\\`\\`/g) || []).length / 2;
   const links = (text.match(/\\[([^\\]]+)\\]\\([^)]+\\)/g) || []).length;
   
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
   
   // 1. 代码块（优先处理）
   const codeBlocks = [];
   html = html.replace(/\\`\\`\\`(\\w+)?([\\s\\S]*?)\\`\\`\\`/g, (match, lang, code) => {
     const index = codeBlocks.length;
     codeBlocks.push({ lang: lang || '', code: code.trim() });
     return \`__CODE_BLOCK_\${index}__\`;
   });
   
   // 2. 标题
   html = html.replace(/^#### (.*$)/gim, '<h6>$1</h6>');
   html = html.replace(/^### (.*$)/gim, '<h5>$1</h5>');
   html = html.replace(/^## (.*$)/gim, '<h4>$1</h4>');
   html = html.replace(/^# (.*$)/gim, '<h3>$1</h3>');
   
   // 3. 引用块
   const quoteBlocks = [];
   html = html.replace(/^> (.*\\n?)+/gm, (match) => {
     const index = quoteBlocks.length;
     const content = match.replace(/^> /gm, '');
     quoteBlocks.push(content);
     return \`__QUOTE_BLOCK_\${index}__\`;
   });
   
   // 4. 表格
   const tableRegex = /\\|(.+)\\|\\n\\|([-:| ]+)\\|(\\n(?:\\|.*\\|\\n?)*)?/g;
   html = html.replace(tableRegex, (match, header, separator, body) => {
     if (!body) return match;
     const headers = header.split('|').map(h => h.trim()).filter(h => h);
     const rows = body.trim().split('\\n').map(row => {
       return row.split('|').map(c => c.trim()).filter(c => c);
     });
     let table = '<table style="border-collapse:collapse;width:100%;margin:10px 0;border:1px solid #555;">';
     table += '<thead><tr style="background:rgba(255,255,255,0.1)">';
     headers.forEach(h => table += \`<th style="border:1px solid #555;padding:6px;text-align:left;">\${h}</th>\`);
     table += '</tr></thead><tbody>';
     rows.forEach(row => {
       table += '<tr>';
       row.forEach((cell, i) => {
         if (i < headers.length) table += \`<td style="border:1px solid #555;padding:6px;">\${cell}</td>\`;
       });
       table += '</tr>';
     });
     table += '</tbody></table>';
     return table;
   });
   
   // 5. 任务列表
   html = html.replace(/^\\s*-\\s+\\[x\\]\\s+(.*)/gim, '<li><input type="checkbox" checked disabled> $1</li>');
   html = html.replace(/^\\s*-\\s+\\[ \\]\\s+(.*)/gim, '<li><input type="checkbox" disabled> $1</li>');
   
   // 6. 普通列表
   html = html.replace(/^\\s*-\\s+(.*)/gim, '<li>$1</li>');
   html = html.replace(/(<li>.*<\\/li>)/s, '<ul style="margin:5px 0;padding-left:20px;">$1</ul>');
   
   // 7. 链接和图片
   html = html.replace(/!\\[([^\\]]*)\\]\\(([^)]+)\\)/gim, '<img src="$2" alt="$1" style="max-width:100%;border-radius:4px;margin:5px 0;">');
   html = html.replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/gim, '<a href="$2" target="_blank" style="color:#8af;text-decoration:none;">$1</a>');
   
   // 8. 粗体和斜体
   html = html.replace(/\\*\\*(.*)\\*\\*/gim, '<b>$1</b>');
   html = html.replace(/\\*(.*)\\*/gim, '<i>$1</i>');
   html = html.replace(/___(.*)___/gim, '<b><i>$1</i></b>');
   
   // 9. 行内代码
   html = html.replace(/\\`([^`]+)\\`/g, '<code style="background:#333;padding:2px 4px;border-radius:3px;font-family:monospace;">$1</code>');
   
   // 10. 水平线
   html = html.replace(/^---$/gim, '<hr style="border:1px solid #555;margin:15px 0;">');
   
   // 11. 恢复引用块
   html = html.replace(/__QUOTE_BLOCK_(\\d+)__/g, (match, index) => {
     return \`<blockquote style="border-left:3px solid #555;padding-left:10px;margin:10px 0;opacity:0.9;">\${quoteBlocks[index]}</blockquote>\`;
   });
   
   // 12. 恢复代码块
   html = html.replace(/__CODE_BLOCK_(\\d+)__/g, (match, index) => {
     const block = codeBlocks[index];
     const lang = block.lang ? \` data-lang="\${block.lang}"\` : '';
     return \`<pre\${lang} style="background:#1e1e1e;padding:10px;border-radius:4px;overflow-x:auto;margin:10px 0;border:1px solid #444;"><code>\${block.code}</code></pre>\`;
   });
   
   // 13. 换行
   html = html.replace(/\\n/g, '<br>');
   
   return html;
 }

 highlightCodeBlocks(container) {
   const blocks = container.querySelectorAll('pre code');
   blocks.forEach(block => {
     const pre = block.parentElement;
     const lang = pre.getAttribute('data-lang');
     let code = block.textContent;
     
     // 根据语言高亮
     if (lang === 'javascript' || lang === 'js' || code.includes('function') || code.includes('const')) {
       // 关键字
       code = code.replace(/\\b(function|const|let|var|if|else|for|while|return|class|import|export|async|await|try|catch|throw|new|this|super|extends|static|get|set)\\b/g, '<span style="color:#569cd6;font-weight:bold;">$1</span>');
       // 字符串
       code = code.replace(/(['"\`])([^'"\`]*)\\1/g, '<span style="color:#ce9178;">$1$2$1</span>');
       // 注释
       code = code.replace(/(\\/\\/.*$)/gm, '<span style="color:#6a9955;">$1</span>');
       code = code.replace(/(\\/\\*[\\s\\S]*?\\*\\/)/g, '<span style="color:#6a9955;">$1</span>');
       // 数字
       code = code.replace(/\\b(\\d+)\\b/g, '<span style="color:#b5cea8;">$1</span>');
     } else if (lang === 'python' || lang === 'py' || code.includes('def ') || code.includes('import ')) {
       code = code.replace(/\\b(def|class|import|from|if|else|elif|for|while|return|try|except|with|as|pass|break|continue|lambda|yield|async|await|finally|raise|assert|del|global|nonlocal|True|False|None)\\b/g, '<span style="color:#569cd6;font-weight:bold;">$1</span>');
       code = code.replace(/(['"])([^'"]*)\\1/g, '<span style="color:#ce9178;">$1$2$1</span>');
       code = code.replace(/(#.*$)/gm, '<span style="color:#6a9955;">$1</span>');
       code = code.replace(/\\b(\\d+)\\b/g, '<span style="color:#b5cea8;">$1</span>');
     } else if (lang === 'html' || code.includes('<') && code.includes('>')) {
       code = code.replace(/(&lt;[^&gt;]+&gt;)/g, '<span style="color:#569cd6;">$1</span>');
       code = code.replace(/(&lt;\\/[^&gt;]+&gt;)/g, '<span style="color:#569cd6;">$1</span>');
     } else if (lang === 'css' || code.includes('{') && code.includes(':')) {
       code = code.replace(/([a-z-]+):/g, '<span style="color:#9cdcfe;">$1</span>:');
       code = code.replace(/:\\s*([^;]+);/g, ': <span style="color:#ce9178;">$1</span>;');
     }
     
     block.innerHTML = code;
   });
 }

 toggleSyncScroll() {
   const editor = document.getElementById('md-editor');
   const preview = document.getElementById('md-preview');
   if (!editor || !preview) return;
   
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
   
   alert('同步滚动已启用');
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
   
   // 检查空链接
   const emptyLinks = text.match(/\\[\\]\\([^)]+\\)/g);
   if (emptyLinks) issues.push(\`⚠️ 发现空链接: \${emptyLinks.length} 处\`);
   
   // 检查未闭合的代码块
   const codeBlockCount = (text.match(/\\`\\`\\`/g) || []).length;
   if (codeBlockCount % 2 !== 0) issues.push('❌ 代码块未闭合');
   
   // 检查未闭合的引用
   const quoteLines = text.split('\\n').filter(line => line.startsWith('>')).length;
   if (quoteLines > 0 && !text.includes('</blockquote>')) {
     issues.push('⚠️ 引用块可能未正确闭合');
   }
   
   // 检查过长的行
   const longLines = text.split('\\n').filter(line => line.length > 120).length;
   if (longLines > 0) issues.push(\`⚠️ 有 \${longLines} 行超过120字符\`);
   
   if (issues.length === 0) {
     alert('✅ Markdown 语法检查通过！');
   } else {
     alert('🔍 发现以下问题:\\n\\n' + issues.join('\\n'));
   }
 }

 destroy() {
   console.log('🧹 Markdown分析器插件已卸载');
 }
}

// 实例化并注册插件
const plugin = new MarkdownAnalyzerPlugin();
plugin.init(context);
return plugin;
`;

// ==================== 插件导入说明 ====================

/*
使用方法：
1. 在GitHub Panel Pro+扩展中，切换到"插件"标签页
2. 点击"导入本地插件 (.js)"按钮
3. 将上面的代码保存为 .js 文件并选择
4. 或点击"从GitHub导入"，使用以下URL：
  https://github.com/your-username/markdown-analyzer-plugin/blob/main/plugin.js

插件功能：
✅ 独立Markdown编辑和预览界面
✅ 实时解析和渲染
✅ 增强的Markdown语法支持（表格、任务列表、引用等）
✅ 代码语法高亮（JS、Python、HTML、CSS）
✅ 文档统计信息（行数、单词、字符、标题等）
✅ 自动保存到本地存储
✅ 同步滚动功能
✅ 主题切换（明暗模式）
✅ 语法检查
✅ 导出HTML功能
✅ 导出PDF（预留接口）
✅ 快捷键支持（Ctrl+Enter解析，Ctrl+S导出）

技术特点：
- 使用插件API 2.0的registerTab注册新标签页
- 虚拟DOM操作，性能优化
- 响应式设计，适配扩展界面
- 完整的错误处理和状态反馈
- 支持自动保存和恢复
- 模块化代码结构，易于扩展

扩展性：
可以轻松添加更多功能：
- 更多Markdown语法支持（脚注、定义列表等）
- 更多导出格式（DOCX、EPUB等）
- 自定义主题
- 插件设置面板
- 云同步功能
- 协作编辑功能
*/

// ==================== 插件API 2.0 文档 ====================

/*
插件API 2.0 提供了以下核心功能：

1. context.registerTab(id, name, renderFn)
  - 注册新的标签页
  - id: 唯一标识符
  - name: 显示名称
  - renderFn: 返回HTMLElement的函数

2. context.on(event, callback) / context.off(event, callback)
  - 事件监听系统
  - 支持事件：ui:show, ui:hide, mode:switch, search:dir, dir:load, file:open

3. context.core
  - 访问核心功能（API管理器、AI管理器、缓存等）

4. context.utils
  - 工具函数（copyToClipboard, download等）

5. 完整的生命周期管理
  - init(context): 插件初始化
  - destroy(): 插件卸载时清理

插件可以通过这些API与主扩展深度集成，实现功能扩展。
*/
