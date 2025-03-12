// 初始工具数据
const defaultTools = [
    { id: 1, name: 'IP查询', url: 'https://www.ip138.com', icon: 'fas fa-search', iconType: 'fontawesome' },
    { id: 2, name: 'Base64编解码', url: 'https://base64.us', icon: 'fas fa-code', iconType: 'fontawesome' },
    { id: 3, name: 'IP反查域名', url: 'https://www.qvdv.net/tools/qvdv-gethost.html', icon: 'fas fa-globe', iconType: 'fontawesome' },
    { id: 4, name: '时间戳', url: 'https://tool.lu/timestamp', icon: 'fas fa-clock', iconType: 'fontawesome' },
    { id: 5, name: '教育邮箱', url: 'https://email.jm.edu.kg', icon: 'fas fa-envelope', iconType: 'fontawesome' },
    { id: 6, name: 'AI贪吃蛇', url: 'https://snake-game-ai.web.app', icon: 'fas fa-gamepad', iconType: 'fontawesome' }
    
];

// 工具数据管理类
class ToolsManager {
    constructor() {
        this.tools = JSON.parse(localStorage.getItem('tools')) || [];
        
        // 如果本地存储中没有数据，则使用默认数据
        if (this.tools.length === 0) {
            this.tools = defaultTools;
            this.saveTools();
        }
    }
    
    // 获取所有工具
    getAllTools() {
        return this.tools;
    }
    
    // 添加新工具
    addTool(tool) {
        // 生成新ID
        const newId = this.tools.length > 0 ? Math.max(...this.tools.map(t => t.id)) + 1 : 1;
        tool.id = newId;
        this.tools.push(tool);
        this.saveTools();
        return tool;
    }
    
    // 更新工具
    updateTool(tool) {
        const index = this.tools.findIndex(t => t.id === tool.id);
        if (index !== -1) {
            this.tools[index] = tool;
            this.saveTools();
            return true;
        }
        return false;
    }
    
    // 删除工具
    deleteTool(id) {
        const index = this.tools.findIndex(t => t.id === id);
        if (index !== -1) {
            this.tools.splice(index, 1);
            this.saveTools();
            return true;
        }
        return false;
    }
    
    // 根据ID获取工具
    getToolById(id) {
        return this.tools.find(t => t.id === id);
    }
    
    // 保存到本地存储
    saveTools() {
        localStorage.setItem('tools', JSON.stringify(this.tools));
    }
}

// 创建工具管理器实例
const toolsManager = new ToolsManager();

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 判断当前页面
    const isIndexPage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');
    const isManagePage = window.location.pathname.endsWith('manage.html');
    
    if (isIndexPage) {
        // 首页：显示工具列表
        renderToolsGrid();
    } else if (isManagePage) {
        // 管理页：显示工具表格和处理表单
        renderToolsTable();
        setupFormHandlers();
    }
});

// 渲染首页工具网格
function renderToolsGrid() {
    const toolsList = document.getElementById('tools-list');
    if (!toolsList) return;
    
    toolsList.innerHTML = '';
    
    const tools = toolsManager.getAllTools();
    
    tools.forEach(tool => {
        const toolCard = document.createElement('a');
        toolCard.href = tool.url;
        toolCard.target = '_blank';
        toolCard.className = 'tool-card';
        
        let iconHtml = '';
        
        // 根据图标类型生成不同的HTML
        switch(tool.iconType || 'fontawesome') {
            case 'svg':
                iconHtml = tool.icon; // SVG直接作为HTML插入
                break;
            case 'iconfont':
                iconHtml = `<i class="${tool.icon}"></i>`;
                break;
            case 'fontawesome':
            default:
                iconHtml = `<i class="${tool.icon}"></i>`;
                break;
        }
        
        toolCard.innerHTML = `
            <div class="tool-icon">
                ${iconHtml}
            </div>
            <div class="tool-name">${tool.name}</div>
            <div class="tool-url">${tool.url}</div>
        `;
        
        toolsList.appendChild(toolCard);
    });
}

// 渲染管理页工具表格
function renderToolsTable() {
    const tableBody = document.getElementById('tools-table-body');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    const tools = toolsManager.getAllTools();
    
    tools.forEach(tool => {
        const row = document.createElement('tr');
        
        let iconHtml = '';
        
        // 根据图标类型生成不同的HTML
        switch(tool.iconType || 'fontawesome') {
            case 'svg':
                iconHtml = tool.icon; // SVG直接作为HTML插入
                break;
            case 'iconfont':
                iconHtml = `<i class="${tool.icon}"></i>`;
                break;
            case 'fontawesome':
            default:
                iconHtml = `<i class="${tool.icon}"></i>`;
                break;
        }
        
        row.innerHTML = `
            <td>${iconHtml}</td>
            <td>${tool.name}</td>
            <td><a href="${tool.url}" target="_blank">${tool.url}</a></td>
            <td class="action-buttons">
                <button class="btn" data-id="${tool.id}" data-action="edit">编辑</button>
                <button class="btn btn-danger" data-id="${tool.id}" data-action="delete">删除</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // 添加事件监听器
    const actionButtons = tableBody.querySelectorAll('button[data-action]');
    actionButtons.forEach(button => {
        button.addEventListener('click', handleTableAction);
    });
}

// 处理表格操作
function handleTableAction(event) {
    const button = event.target;
    const action = button.getAttribute('data-action');
    const id = parseInt(button.getAttribute('data-id'));
    
    if (action === 'edit') {
        // 编辑操作
        const tool = toolsManager.getToolById(id);
        if (tool) {
            // 填充表单
            document.getElementById('edit-id').value = tool.id;
            document.getElementById('tool-name').value = tool.name;
            document.getElementById('tool-url').value = tool.url;
            
            // 设置图标类型
            const iconType = tool.iconType || 'fontawesome';
            document.getElementById('icon-type').value = iconType;
            
            // 显示对应的输入框
            document.getElementById('fontawesome-input').style.display = iconType === 'fontawesome' ? 'block' : 'none';
            document.getElementById('svg-input').style.display = iconType === 'svg' ? 'block' : 'none';
            document.getElementById('iconfont-input').style.display = iconType === 'iconfont' ? 'block' : 'none';
            
            // 填充对应的图标值
            if (iconType === 'fontawesome') {
                document.getElementById('tool-icon').value = tool.icon;
            } else if (iconType === 'svg') {
                document.getElementById('tool-svg').value = tool.icon;
            } else if (iconType === 'iconfont') {
                document.getElementById('tool-iconfont').value = tool.icon;
            }
            
            // 更改按钮文本
            document.getElementById('submit-btn').textContent = '更新工具';
            document.getElementById('cancel-btn').style.display = 'inline-block';
        }
    } else if (action === 'delete') {
        // 删除操作
        if (confirm(`确定要删除 "${toolsManager.getToolById(id).name}" 吗？`)) {
            toolsManager.deleteTool(id);
            renderToolsTable();
        }
    }
}

// 设置表单处理程序
function setupFormHandlers() {
    const form = document.getElementById('tool-form');
    const cancelBtn = document.getElementById('cancel-btn');
    const iconTypeSelect = document.getElementById('icon-type');
    
    // 图标类型切换事件
    if (iconTypeSelect) {
        iconTypeSelect.addEventListener('change', function() {
            const iconType = this.value;
            document.getElementById('fontawesome-input').style.display = iconType === 'fontawesome' ? 'block' : 'none';
            document.getElementById('svg-input').style.display = iconType === 'svg' ? 'block' : 'none';
            document.getElementById('iconfont-input').style.display = iconType === 'iconfont' ? 'block' : 'none';
        });
    }
    
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const idInput = document.getElementById('edit-id');
            const nameInput = document.getElementById('tool-name');
            const urlInput = document.getElementById('tool-url');
            const iconTypeSelect = document.getElementById('icon-type');
            const iconType = iconTypeSelect.value;
            
            let iconValue = '';
            
            // 根据图标类型获取对应的值
            if (iconType === 'fontawesome') {
                iconValue = document.getElementById('tool-icon').value.trim() || 'fas fa-link';
            } else if (iconType === 'svg') {
                iconValue = document.getElementById('tool-svg').value.trim() || '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>';
            } else if (iconType === 'iconfont') {
                iconValue = document.getElementById('tool-iconfont').value.trim() || 'iconfont icon-link';
            }
            
            const tool = {
                name: nameInput.value.trim(),
                url: urlInput.value.trim(),
                icon: iconValue,
                iconType: iconType
            };
            
            if (idInput.value) {
                // 更新现有工具
                tool.id = parseInt(idInput.value);
                toolsManager.updateTool(tool);
            } else {
                // 添加新工具
                toolsManager.addTool(tool);
            }
            
            // 重置表单
            resetForm();
            
            // 刷新表格
            renderToolsTable();
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', resetForm);
    }
}

// 重置表单
function resetForm() {
    document.getElementById('edit-id').value = '';
    document.getElementById('tool-form').reset();
    document.getElementById('submit-btn').textContent = '添加工具';
    document.getElementById('cancel-btn').style.display = 'none';
}