document.addEventListener('DOMContentLoaded', () => {
    // DOM元素
    const aiAssistantBtn = document.getElementById('aiAssistantBtn');
    const aiAssistantModal = document.getElementById('aiAssistantModal');
    const addBookBtn = document.getElementById('addBookBtn');
    const addBookModal = document.getElementById('addBookModal');
    const bookGrid = document.getElementById('bookGrid');
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendMessage = document.getElementById('sendMessage');
    const categoryButtons = document.querySelectorAll('.book-categories button');
    const searchBtn = document.getElementById('searchBtn');
    const closeButtons = document.querySelectorAll('.close-btn');

    // 关闭所有模态框
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });

    // 分类筛选功能
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filterBooks(button.textContent);
        });
    });

    // 搜索功能
    const searchModal = document.createElement('div');
    searchModal.className = 'modal';
    searchModal.innerHTML = `
        <div class="modal-content search-modal">
            <h2><i class="fas fa-search"></i> 搜索书籍</h2>
            <div class="search-container">
                <div class="search-input-group">
                    <input type="text" id="searchInput" placeholder="输入书名、作者、分类或描述...">
                    <button id="searchConfirmBtn" class="search-confirm-btn">
                        <i class="fas fa-search"></i> 搜索
                    </button>
                </div>
                <div class="search-filters">
                    <label><input type="checkbox" value="title" checked> 书名</label>
                    <label><input type="checkbox" value="author" checked> 作者</label>
                    <label><input type="checkbox" value="category" checked> 分类</label>
                </div>
            </div>
            <div id="searchResults" class="search-results"></div>
            <button class="close-btn"><i class="fas fa-times"></i></button>
        </div>
    `;
    document.body.appendChild(searchModal);

    // 搜索按钮点击事件
    searchBtn.addEventListener('click', () => {
        searchModal.style.display = 'block';
        document.getElementById('searchInput').focus();
    });

    // 搜索确认按钮点击事件
    document.getElementById('searchConfirmBtn').addEventListener('click', () => {
        const query = document.getElementById('searchInput').value.trim();
        if (query.length >= 1) {
            searchBooks(query);
        } else {
            showNotification('请输入搜索内容', 'error');
        }
    });

    // 搜索输入框回车事件
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = e.target.value.trim();
            if (query.length >= 1) {
                searchBooks(query);
            } else {
                showNotification('请输入搜索内容', 'error');
            }
        }
    });

    // 搜索函数
    async function searchBooks(query) {
        try {
            const response = await fetch(`/api/books/search?query=${encodeURIComponent(query)}`);
            const data = await response.json();
            if (data.success) {
                displaySearchResults(data.data);
            }
        } catch (error) {
            showNotification('搜索失败，请重试', 'error');
        }
    }

    // 显示搜索结果
    function displaySearchResults(books) {
        const resultsDiv = document.getElementById('searchResults');
        if (books.length === 0) {
            resultsDiv.innerHTML = '<p class="no-results">未找到相关书籍</p>';
            return;
        }

        resultsDiv.innerHTML = books.map(book => `
            <div class="search-result-item" onclick="showBookDetail('${book._id}')">
                <img src="${book.cover || 'images/default-cover.jpg'}" alt="${book.title}">
                <div class="result-info">
                    <h3>${book.title}</h3>
                    <p>${book.author}</p>
                    <p class="category">${book.category || '未分类'}</p>
                    <div class="progress-bar">
                        <div style="width: ${(book.currentPage / book.totalPages * 100) || 0}%"></div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // AI助手功能
    aiAssistantBtn.addEventListener('click', () => {
        aiAssistantModal.style.display = 'block';
        // 清空之前的消息
        chatMessages.innerHTML = '';
        // 显示欢迎消息
        appendMessage('ai', '你好！我是你的AI读书助手。我可以：\n1. 帮你制定阅读计划\n2. 推荐适合的书籍\n3. 提供阅读建议\n4. 生成读书笔记\n\n请告诉我您需要什么帮助？');
    });

    // AI功能按钮点击处理
    document.querySelectorAll('.ai-feature-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const feature = btn.dataset.feature;
            const featureText = btn.textContent.trim();
            
            // 显示用户请求
            appendMessage('user', `请帮我${featureText}`);
            
            try {
                const response = await fetch(`/api/ai/${feature}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ feature })
                });
                
                const data = await response.json();
                if (data.success) {
                    appendMessage('ai', data.data.text);
                    
                    // 如果有建议选项，显示它们
                    if (data.data.suggestions) {
                        const suggestionsHtml = data.data.suggestions
                            .map(suggestion => `<button class="suggestion-btn">${suggestion}</button>`)
                            .join('');
                        appendSuggestions(suggestionsHtml);
                    }
                }
            } catch (error) {
                appendMessage('ai', '抱歉，该功能暂时无法使用。请稍后再试。');
            }
        });
    });

    // 发送消息给AI助手
    async function sendMessageToAI() {
        const message = userInput.value.trim();
        if (!message) return;

        appendMessage('user', message);
        userInput.value = '';

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            
            const data = await response.json();
            if (data.success) {
                appendMessage('ai', data.data.text);
                
                // 如果有建议选项，显示它们
                if (data.data.suggestions) {
                    const suggestionsHtml = data.data.suggestions
                        .map(suggestion => `<button class="suggestion-btn">${suggestion}</button>`)
                        .join('');
                    appendSuggestions(suggestionsHtml);
                }
            }
        } catch (error) {
            appendMessage('ai', '抱歉，我现在无法回答您的问题。请稍后再试。');
        }
    }

    // 添加建议按钮
    function appendSuggestions(suggestionsHtml) {
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.className = 'suggestions';
        suggestionsDiv.innerHTML = suggestionsHtml;
        chatMessages.appendChild(suggestionsDiv);
        
        // 绑定建议按钮点击事件
        suggestionsDiv.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const suggestion = btn.textContent;
                userInput.value = suggestion;
                sendMessageToAI();
            });
        });
    }

    // 添加消息到聊天窗口
    function appendMessage(type, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        // 将换行符转换为 HTML 换行
        messageDiv.innerHTML = text.replace(/\n/g, '<br>');
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // 绑定发送按钮和回车键
    sendMessage.addEventListener('click', sendMessageToAI);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessageToAI();
        }
    });

    // 添加新书功能
    addBookBtn.addEventListener('click', () => {
        addBookModal.style.display = 'block';
    });

    // 处理添加新书表单提交
    document.getElementById('addBookForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const bookData = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookData)
            });
            const data = await response.json();
            if (data.success) {
                addBookModal.style.display = 'none';
                e.target.reset();
                loadBooks();
                showNotification('添加成功！');
            }
        } catch (error) {
            showNotification('添加失败，请重试', 'error');
        }
    });

    // 加载书籍列表
    async function loadBooks() {
        try {
            const response = await fetch('/api/books');
            const data = await response.json();
            if (data.success) {
                renderBooks(data.data);
                updateStats(data.data);
                return data.data;
            }
        } catch (error) {
            showNotification('获取书籍列表失败', 'error');
            return [];
        }
    }

    // 渲染书籍列表
    function renderBooks(books) {
        const bookGrid = document.getElementById('bookGrid');
        if (!books || books.length === 0) {
            bookGrid.innerHTML = '<div class="no-books">还没有添加任何书籍，点击"添加新书"开始吧！</div>';
            return;
        }

        bookGrid.innerHTML = books.map(book => `
            <div class="book-card" data-id="${book._id}">
                <img src="${book.cover || 'images/default-cover.jpg'}" alt="${book.title}" class="book-cover">
                <div class="book-info">
                    <h3>${book.title}</h3>
                    <p class="author">${book.author}</p>
                    <p class="category">${book.category || '未分类'}</p>
                    <div class="progress-bar">
                        <div style="width: ${(book.currentPage / book.totalPages * 100) || 0}%"></div>
                    </div>
                    <div class="book-actions">
                        <button onclick="updateProgress('${book._id}', ${book.totalPages})">
                            <i class="fas fa-tasks"></i> 更新进度
                        </button>
                        <button onclick="showBookDetail('${book._id}')">
                            <i class="fas fa-info-circle"></i> 详情
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // 添加书籍卡片点击事件
        document.querySelectorAll('.book-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    showBookDetail(card.dataset.id);
                }
            });
        });
    }

    // 更新进度函数
    window.updateProgress = async (bookId, totalPages) => {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content progress-update">
                <h2>更新阅读进度</h2>
                <div class="form-group">
                    <label>当前页数</label>
                    <input type="number" id="currentPage" min="0" max="${totalPages}" required>
                    <small>总页数：${totalPages}</small>
                </div>
                <div class="form-actions">
                    <button id="confirmProgress">确认</button>
                    <button class="close-btn">取消</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'block';

        const confirmBtn = modal.querySelector('#confirmProgress');
        const closeBtn = modal.querySelector('.close-btn');
        const input = modal.querySelector('#currentPage');

        confirmBtn.addEventListener('click', async () => {
            const currentPage = parseInt(input.value);
            if (currentPage >= 0 && currentPage <= totalPages) {
                try {
                    const response = await fetch(`/api/books/${bookId}/progress`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            currentPage,
                            readingStatus: currentPage === totalPages ? '已完成' : 
                                         currentPage > 0 ? '阅读中' : '未开始'
                        })
                    });
                    if (response.ok) {
                        showNotification('进度更新成功！');
                        loadBooks();
                        modal.remove();
                    }
                } catch (error) {
                    showNotification('更新失败，请重试', 'error');
                }
            } else {
                showNotification('请输入有效的页数', 'error');
            }
        });

        closeBtn.addEventListener('click', () => modal.remove());
    };

    // AI 助手功能优化
    let currentAiContext = null;

    async function handleAiFeature(feature) {
        const featureActions = {
            summary: {
                prompt: "请为我总结这本书的主要内容",
                context: "summary"
            },
            mindmap: {
                prompt: "请为我创建这本书的思维导图",
                context: "mindmap"
            },
            quiz: {
                prompt: "请根据这本书的内容生成一些理解测验题",
                context: "quiz"
            },
            recommend: {
                prompt: "请根据我的阅读历史推荐一些相关书籍",
                context: "recommend"
            }
        };

        const action = featureActions[feature];
        if (!action) return;

        currentAiContext = action.context;
        appendMessage('user', action.prompt);
        
        try {
            const response = await fetch(`/api/ai/${feature}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    feature,
                    context: currentAiContext,
                    bookId: currentBookId // 如果有当前选中的书
                })
            });
            
            const data = await response.json();
            if (data.success) {
                appendMessage('ai', data.data.text);
                if (data.data.suggestions) {
                    appendSuggestions(data.data.suggestions);
                }
                if (data.data.actions) {
                    appendActions(data.data.actions);
                }
            }
        } catch (error) {
            appendMessage('ai', '抱歉，该功能暂时无法使用。请稍后再试。');
        }
    }

    // 添加动态建议按钮
    function appendSuggestions(suggestions) {
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.className = 'suggestions';
        suggestionsDiv.innerHTML = suggestions.map(suggestion => 
            `<button class="suggestion-btn">${suggestion}</button>`
        ).join('');
        
        chatMessages.appendChild(suggestionsDiv);
        
        suggestionsDiv.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const suggestion = btn.textContent;
                appendMessage('user', suggestion);
                handleAiResponse(suggestion);
            });
        });
    }

    // 处理 AI 响应
    async function handleAiResponse(message) {
        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message,
                    context: currentAiContext
                })
            });
            
            const data = await response.json();
            if (data.success) {
                appendMessage('ai', data.data.text);
                if (data.data.suggestions) {
                    appendSuggestions(data.data.suggestions);
                }
            }
        } catch (error) {
            appendMessage('ai', '抱歉，我现在无法回答您的问题。请稍后再试。');
        }
    }

    // 显示书籍详情
    window.showBookDetail = async (bookId) => {
        try {
            const response = await fetch(`/api/books/${bookId}`);
            const data = await response.json();
            if (data.success) {
                const book = data.data;
                const modal = document.getElementById('bookDetailModal');
                modal.querySelector('.book-cover').src = book.cover || 'images/default-cover.jpg';
                modal.querySelector('.book-title').textContent = book.title;
                modal.querySelector('.book-author').textContent = book.author;
                modal.querySelector('.progress').style.width = `${(book.currentPage / book.totalPages * 100) || 0}%`;
                modal.querySelector('.progress-text').textContent = `${Math.floor((book.currentPage / book.totalPages * 100) || 0)}%`;
                
                // 渲染笔记列表
                const notesList = modal.querySelector('.notes-list');
                notesList.innerHTML = book.notes.map(note => `
                    <div class="note-item">
                        <p>${note.content}</p>
                        <small>第 ${note.page} 页 - ${new Date(note.createdAt).toLocaleDateString()}</small>
                    </div>
                `).join('');
                
                modal.style.display = 'block';
            }
        } catch (error) {
            showNotification('获取书籍详情失败', 'error');
        }
    };

    async function filterBooks(category) {
        const books = await loadBooks();
        if (category === '全部') {
            renderBooks(books);
        } else {
            const filtered = books.filter(book => {
                if (category === '正在阅读') return book.readingStatus === '阅读中';
                if (category === '已完成') return book.readingStatus === '已完成';
                if (category === '计划阅读') return book.readingStatus === '未开始';
                return true;
            });
            renderBooks(filtered);
        }
    }

    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    // 初始加载
    loadBooks();
}); 