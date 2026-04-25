// 初始工具数据
const defaultTools = [
    { id: 1, name: 'IP查询', url: 'https://www.ip138.com', icon: 'fas fa-search', iconType: 'fontawesome' },
    { id: 2, name: 'Base64编解码', url: 'https://base64.us', icon: 'fas fa-code', iconType: 'fontawesome' },
    { id: 3, name: 'IP反查域名', url: 'https://www.qvdv.net/tools/qvdv-gethost.html', icon: 'fas fa-globe', iconType: 'fontawesome' },
    { id: 4, name: '时间戳', url: 'https://tool.lu/timestamp', icon: 'fas fa-clock', iconType: 'fontawesome' },
    { id: 5, name: '教育邮箱', url: 'https://email.jm.edu.kg', icon: 'fas fa-envelope', iconType: 'fontawesome' },
    { id: 6, name: 'AI贪吃蛇', url: 'https://snake-game-ai.web.app', icon: 'fas fa-gamepad', iconType: 'fontawesome' },
    { id: 7, name: '二维码时间刷新', url: 'qr-time.html', icon: 'fas fa-qrcode', iconType: 'fontawesome', target: '_self' }
    
];

let qrCountdownTimer = null;
let qrDecodedParamList = '';
let qrStatusTimer = null;
const QR_TIME_ACCESS_STORAGE_KEY = 'qrTimeAccessAnswer';
const QR_TIME_ACCESS_ANSWER = '老公';

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
    const isQrTimePage = window.location.pathname.endsWith('qr-time.html');
    
    if (isIndexPage) {
        // 首页：显示工具列表
        renderToolsGrid();
    } else if (isManagePage) {
        // 管理页：显示工具表格和处理表单
        renderToolsTable();
        setupFormHandlers();
    } else if (isQrTimePage) {
        // 二维码时间刷新页：处理图片上传和二维码生成
        setupQrTimeTool();
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
        toolCard.target = tool.target || '_blank';
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

// 设置二维码时间刷新工具
function setupQrTimeTool() {
    const imageInput = document.getElementById('qr-image-input');
    const statusElement = document.getElementById('qr-status');
    const refreshButton = document.getElementById('qr-refresh-btn');
    const accessForm = document.getElementById('qr-access-form');

    if (!imageInput || !statusElement) return;

    if (hasQrTimeAccess()) {
        unlockQrTimeTool();
    } else {
        lockQrTimeTool();
    }

    if (accessForm) {
        accessForm.addEventListener('submit', handleQrAccessSubmit);
    }

    imageInput.addEventListener('change', handleQrImageUpload);

    if (refreshButton) {
        refreshButton.addEventListener('click', refreshQrFromSavedParams);
    }
}

function handleQrAccessSubmit(event) {
    event.preventDefault();

    const answerInput = document.getElementById('qr-access-answer');
    const answer = answerInput ? answerInput.value.trim() : '';

    if (!isValidQrAccessAnswer(answer)) {
        showQrAccessStatus('暗号不正确，请再试一次。', 'error');

        if (answerInput) {
            answerInput.select();
        }

        return;
    }

    localStorage.setItem(QR_TIME_ACCESS_STORAGE_KEY, answer);
    unlockQrTimeTool();
    showQrStatus('验证通过，已解锁工具。', 'success');
}

function hasQrTimeAccess() {
    const savedAnswer = localStorage.getItem(QR_TIME_ACCESS_STORAGE_KEY);
    return isValidQrAccessAnswer(savedAnswer);
}

function isValidQrAccessAnswer(answer) {
    if (!answer) return false;

    const normalizedAnswer = answer.replace(/\s/g, '');
    const validAnswers = [
        QR_TIME_ACCESS_ANSWER,
        `我是你的${QR_TIME_ACCESS_ANSWER}暗号`,
        `暗号：我是你的${QR_TIME_ACCESS_ANSWER}`,
        `暗号：我是你的${QR_TIME_ACCESS_ANSWER}暗号`,
        `暗号:我是你的${QR_TIME_ACCESS_ANSWER}`,
        `暗号:我是你的${QR_TIME_ACCESS_ANSWER}暗号`
    ];

    return validAnswers.includes(normalizedAnswer);
}

function unlockQrTimeTool() {
    const accessSection = document.getElementById('qr-access-section');
    const toolSection = document.getElementById('qr-tool-section');
    const imageInput = document.getElementById('qr-image-input');

    if (accessSection) accessSection.hidden = true;
    if (toolSection) toolSection.hidden = false;
    if (imageInput) imageInput.disabled = false;
}

function lockQrTimeTool() {
    const accessSection = document.getElementById('qr-access-section');
    const toolSection = document.getElementById('qr-tool-section');
    const imageInput = document.getElementById('qr-image-input');
    const refreshButton = document.getElementById('qr-refresh-btn');
    const answerInput = document.getElementById('qr-access-answer');

    if (accessSection) accessSection.hidden = false;
    if (toolSection) toolSection.hidden = true;
    if (imageInput) imageInput.disabled = true;
    if (refreshButton) refreshButton.disabled = true;
    if (answerInput) setTimeout(() => answerInput.focus(), 0);
}

function showQrAccessStatus(message, type) {
    const statusElement = document.getElementById('qr-access-status');

    if (!statusElement) return;

    showQrBubbleStatus(statusElement, message, type);
}

// 处理二维码图片上传
function handleQrImageUpload(event) {
    const file = event.target.files[0];

    clearQrResult();

    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showQrStatus('请上传图片文件。', 'error');
        return;
    }

    if (typeof jsQR !== 'function') {
        showQrStatus('二维码识别库加载失败，请检查网络后重试。', 'error');
        return;
    }

    if (typeof QRCode !== 'function') {
        showQrStatus('二维码生成库加载失败，请检查网络后重试。', 'error');
        return;
    }

    showQrStatus('正在识别二维码...', 'info');

    const reader = new FileReader();
    reader.onload = function(readerEvent) {
        const image = new Image();

        image.onload = function() {
            processQrImage(image);
        };

        image.onerror = function() {
            showQrStatus('图片读取失败，请换一张图片重试。', 'error');
        };

        image.src = readerEvent.target.result;
    };

    reader.onerror = function() {
        showQrStatus('文件读取失败，请重新选择图片。', 'error');
    };

    reader.readAsDataURL(file);
}

// 从图片中识别二维码并生成新二维码
function processQrImage(image) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const maxDecodeSize = 1600;
    const scale = Math.min(1, maxDecodeSize / Math.max(image.width, image.height));
    const previewWidth = Math.max(1, Math.round(image.width * scale));
    const previewHeight = Math.max(1, Math.round(image.height * scale));

    canvas.width = previewWidth;
    canvas.height = previewHeight;
    context.drawImage(image, 0, 0, previewWidth, previewHeight);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

    if (!qrCode) {
        showQrStatus('未识别到二维码，请确认图片包含清晰且完整的二维码。', 'error');
        return;
    }

    try {
        const rawContent = qrCode.data.trim();
        const decodedContent = decodeBase64Content(rawContent);
        qrDecodedParamList = decodedContent;

        refreshQrFromSavedParams();
        showQrStatus('处理完成，已生成新的二维码。', 'success');
    } catch (error) {
        showQrStatus(error.message, 'error');
    }
}

function refreshQrFromSavedParams() {
    const refreshButton = document.getElementById('qr-refresh-btn');

    if (!qrDecodedParamList) {
        showQrStatus('请先上传并识别二维码图片。', 'error');
        return;
    }

    try {
        const updateResult = updateTimeParam(qrDecodedParamList);
        const encodedContent = encodeBase64Content(updateResult.content);

        renderQrCode(encodedContent);
        showQrExpireTime(updateResult.expiresAt);

        if (refreshButton) {
            refreshButton.disabled = false;
        }
    } catch (error) {
        showQrStatus(error.message, 'error');
    }
}

// 解码二维码中的 Base64 内容，兼容 URL-safe Base64 和省略 padding 的情况
function decodeBase64Content(content) {
    const normalizedContent = content
        .replace(/^data:[^,]+,/, '')
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .replace(/\s/g, '');
    const paddedContent = normalizedContent.padEnd(normalizedContent.length + (4 - normalizedContent.length % 4) % 4, '=');

    try {
        const binaryString = atob(paddedContent);
        const bytes = Uint8Array.from(binaryString, char => char.charCodeAt(0));
        return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    } catch (error) {
        throw new Error('不支持的二维码类型。');
    }
}

// 将更新后的参数列表重新编码为 Base64 后写入新二维码
function encodeBase64Content(content) {
    const bytes = new TextEncoder().encode(content);
    let binaryString = '';

    bytes.forEach(byte => {
        binaryString += String.fromCharCode(byte);
    });

    return btoa(binaryString);
}

// 将参数列表中的 time 修改为 10 分钟后的时间戳
function updateTimeParam(paramList) {
    const cleanedParamList = extractQueryString(paramList);
    const parts = cleanedParamList.split('&').filter(Boolean);
    const timeIndex = parts.findIndex(part => {
        const equalIndex = part.indexOf('=');
        const key = equalIndex === -1 ? part : part.slice(0, equalIndex);
        return safeDecodeParamKey(key) === 'time';
    });

    if (timeIndex === -1) {
        throw new Error('不支持的二维码类型。');
    }

    const equalIndex = parts[timeIndex].indexOf('=');
    const timeKey = equalIndex === -1 ? 'time' : parts[timeIndex].slice(0, equalIndex);
    const oldTimeValue = equalIndex === -1 ? '' : parts[timeIndex].slice(equalIndex + 1);
    const nextTime = getTimestampTenMinutesLater(oldTimeValue);
    parts[timeIndex] = `${timeKey}=${nextTime}`;

    return {
        content: parts.join('&'),
        expiresAt: Number(nextTime)
    };
}

function extractQueryString(content) {
    const trimmedContent = content.trim();

    try {
        const url = new URL(trimmedContent);
        return url.search.replace(/^\?/, '');
    } catch (error) {
        const queryStart = trimmedContent.indexOf('?');
        return (queryStart === -1 ? trimmedContent : trimmedContent.slice(queryStart + 1)).replace(/^\?/, '');
    }
}

function safeDecodeParamKey(key) {
    try {
        return decodeURIComponent(key.replace(/\+/g, ' ')).trim();
    } catch (error) {
        return key.trim();
    }
}

// 根据原 time 字段长度保留秒级或毫秒级时间戳
function getTimestampTenMinutesLater(oldTimeValue) {
    const decodedValue = decodeURIComponent((oldTimeValue || '').replace(/\+/g, ' '));
    const tenMinutesLater = Date.now() + 10 * 60 * 1000;

    if (/^\d{13,}$/.test(decodedValue)) {
        return String(tenMinutesLater);
    }

    return String(Math.floor(tenMinutesLater / 1000));
}

// 生成新的二维码
function renderQrCode(content) {
    const output = document.getElementById('qr-output');
    output.innerHTML = '';

    new QRCode(output, {
        text: content,
        width: 240,
        height: 240,
        correctLevel: QRCode.CorrectLevel.M
    });
}

function showQrExpireTime(timestamp) {
    const expireTimeElement = document.getElementById('qr-expire-time');

    if (!expireTimeElement) return;

    const timestampMs = timestamp >= 1000000000000 ? timestamp : timestamp * 1000;
    const expireDate = new Date(timestampMs);

    if (qrCountdownTimer) {
        clearInterval(qrCountdownTimer);
    }

    const updateCountdown = function() {
        const remainingMs = timestampMs - Date.now();

        if (remainingMs <= 0) {
            expireTimeElement.textContent = `已过期：${formatDateTime(expireDate)}`;
            clearInterval(qrCountdownTimer);
            qrCountdownTimer = null;
            return;
        }

        expireTimeElement.textContent = `剩余：${formatDuration(remainingMs)}\n有效至：${formatDateTime(expireDate)}`;
    };

    updateCountdown();
    qrCountdownTimer = setInterval(updateCountdown, 1000);
}

function formatDateTime(date) {
    const pad = value => String(value).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function formatDuration(milliseconds) {
    const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes > 0) {
        return `${minutes}分${String(seconds).padStart(2, '0')}秒`;
    }

    return `${seconds}秒`;
}

function clearQrResult() {
    const output = document.getElementById('qr-output');
    const expireTimeElement = document.getElementById('qr-expire-time');
    const refreshButton = document.getElementById('qr-refresh-btn');

    qrDecodedParamList = '';

    if (qrCountdownTimer) {
        clearInterval(qrCountdownTimer);
        qrCountdownTimer = null;
    }

    if (output) output.innerHTML = '';
    if (expireTimeElement) expireTimeElement.textContent = '';
    if (refreshButton) refreshButton.disabled = true;
}

function showQrStatus(message, type) {
    const statusElement = document.getElementById('qr-status');

    if (!statusElement) return;

    showQrBubbleStatus(statusElement, message, type);
}

function showQrBubbleStatus(statusElement, message, type) {
    if (qrStatusTimer) {
        clearTimeout(qrStatusTimer);
        qrStatusTimer = null;
    }

    statusElement.textContent = message;
    statusElement.className = `status-message status-${type} status-visible`;

    qrStatusTimer = setTimeout(() => {
        statusElement.textContent = '';
        statusElement.className = 'status-message';
        qrStatusTimer = null;
    }, 2400);
}


