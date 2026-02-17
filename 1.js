/* 
 * 插件名称: Basic Formatter
 * 描述: 为编辑器添加简单的代码格式化功能
 * 作者: AI Assistant
 */
(function(context, plugin) {
  plugin.id = "basic-formatter";
  plugin.name = "代码格式化工具";
  plugin.version = "1.0.0";

  plugin.init = function() {
    console.log("Formatter plugin initialized");
  };

  // 监听文件打开事件
  plugin.onHook = function(hookName, data) {
    if (hookName === 'file:open') {
      const { file, text } = data;
      // 检查是否是 JS 或 JSON 文件
      if (!file.name.match(/\.(js|json|ts)$/)) return;

      setTimeout(() => {
        addFormatButton(context);
      }, 100);
    }
  };

  function addFormatButton(ctx) {
    // 寻找编辑器工具栏
    const btns = ctx.ui.mainArea.querySelectorAll('button');
    let targetBar = null;
    btns.forEach(b => {
      if (b.textContent === '保存修改 (上传)') targetBar = b.parentElement;
    });

    if (targetBar && !targetBar.querySelector('.plugin-format-btn')) {
      const btn = ctx.components.createWindowButton('✨ 格式化');
      btn.className = 'plugin-format-btn';
      btn.style.background = 'rgba(100, 255, 100, 0.2)';
      
      btn.onclick = () => {
        const textarea = ctx.ui.editorTextarea;
        if (!textarea) return;
        
        try {
          const raw = textarea.value;
          let formatted = raw;
          
          // 简单的 JSON 格式化
          if (raw.trim().startsWith('{') || raw.trim().startsWith('[')) {
             formatted = JSON.stringify(JSON.parse(raw), null, 2);
          } else {
             // 简单的 JS 缩进修复 (仅作示例，实际应引入 prettier)
             let indent = 0;
             formatted = raw.split('\n').map(line => {
               line = line.trim();
               if (line.endsWith('}') || line.endsWith(']')) indent = Math.max(0, indent - 1);
               const pad = '  '.repeat(indent);
               if (line.endsWith('{') || line.endsWith('[')) indent++;
               return pad + line;
             }).join('\n');
          }
          
          textarea.value = formatted;
          ctx.showMessage('代码已格式化 (Basic)');
        } catch (e) {
          ctx.showMessage('格式化失败: ' + e.message);
        }
      };
      
      targetBar.insertBefore(btn, targetBar.firstChild);
    }
  }

  return plugin;
})
