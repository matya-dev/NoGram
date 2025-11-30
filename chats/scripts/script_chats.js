document.addEventListener('DOMContentLoaded', function() {
    console.log('Chats page script loaded');

    const messagesContainer = document.getElementById('messagesContainer');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const chatItems = document.querySelectorAll('.chat-item');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const menuButton = document.getElementById('menuButton');
    const menuOverlay = document.getElementById('menuOverlay');
    const sideMenu = document.getElementById('sideMenu');
    const menuClose = document.getElementById('menuClose');
    const logoutBtn = document.getElementById('logoutBtn');
    const contextMenu = document.getElementById('messageContextMenu');
    const menuUsername = document.getElementById('menuUsername');
    const accountUsername = document.getElementById('accountUsername');
    const startButton = document.getElementById('startButton');
    const startButtonContainer = document.getElementById('startButtonContainer');
    const messageInputWrapper = document.getElementById('messageInputWrapper');
    const chatBackButton = document.getElementById('chatBackButton');
    const sidebar = document.querySelector('.sidebar');
    const chatArea = document.querySelector('.chat-area');

    // Мобильное контекстное меню
    const mobileContextMenu = document.getElementById('mobileContextMenu');
    const mobileContextOverlay = document.getElementById('mobileContextOverlay');
    const mobileContextClose = document.getElementById('mobileContextClose');
    const mobileContextReply = document.getElementById('mobileContextReply');
    const mobileContextForward = document.getElementById('mobileContextForward');
    const mobileContextCopy = document.getElementById('mobileContextCopy');
    const mobileContextDelete = document.getElementById('mobileContextDelete');
    const mobileContextSelect = document.getElementById('mobileContextSelect');
    const mobileReactionBtns = document.querySelectorAll('.mobile-reaction-btn');

    let botStarted = false;
    let selectedMessage = null;
    let currentChat = 'botfather';

    // Переменные для мобильной адаптации
    let isMobile = window.innerWidth <= 768;
    let touchStartX = 0;
    let touchEndX = 0;
    const minSwipeDistance = 50;

    // Переменные для обработки жестов
    let lastTap = 0;
    let tapTimeout;
    let longPressTimeout;
    const doubleTapDelay = 300;
    const longPressDelay = 500;

    // Загрузка данных пользователя
    function loadUserData() {
        const username = sessionStorage.getItem('nogram_username');
        if (username) {
            if (menuUsername) menuUsername.textContent = username;
            if (accountUsername) accountUsername.textContent = username;
        }
    }

    // Проверка авторизации
    function checkAuth() {
        const isAuthenticated = sessionStorage.getItem('nogram_auth') === 'true';
        if (!isAuthenticated) {
            window.location.href = '../index.html';
            return false;
        }
        return true;
    }

    // Функция для показа чата
    function showChat(chatId) {
        if (!isMobile) return;
        
        const chatArea = document.querySelector('.chat-area');
        const sidebar = document.querySelector('.sidebar');
        
        // Добавляем классы для анимации
        chatArea.classList.add('swipe-transition');
        sidebar.classList.add('swipe-transition');
        
        // Скрываем сайдбар и показываем чат
        sidebar.classList.add('hidden');
        chatArea.classList.add('active');
        
        // Обновляем информацию о чате
        updateChatInfo(chatId);
        
        // Убираем классы анимации после завершения перехода
        setTimeout(() => {
            chatArea.classList.remove('swipe-transition');
            sidebar.classList.remove('swipe-transition');
        }, 300);
    }

    // Функция для возврата к списку чатов
    function showChatList() {
        if (!isMobile) return;
        
        const chatArea = document.querySelector('.chat-area');
        const sidebar = document.querySelector('.sidebar');
        
        // Добавляем классы для анимации
        chatArea.classList.add('swipe-transition');
        sidebar.classList.add('swipe-transition');
        
        // Показываем сайдбар и скрываем чат
        sidebar.classList.remove('hidden');
        chatArea.classList.remove('active');
        
        // Убираем классы анимации после завершения перехода
        setTimeout(() => {
            chatArea.classList.remove('swipe-transition');
            sidebar.classList.remove('swipe-transition');
        }, 300);
    }

    // Функция обновления информации о чате
    function updateChatInfo(chatId) {
        const partnerAvatar = document.querySelector('.partner-avatar img');
        const partnerName = document.querySelector('.partner-name');
        const partnerStatus = document.querySelector('.partner-status');
        
        if (chatId === 'botfather') {
            partnerAvatar.src = 'images/bots/botfather.png';
            partnerName.textContent = 'BotFather';
            partnerStatus.textContent = 'бот';
        } else if (chatId === 'selfwrite') {
            partnerAvatar.src = 'images/my/myself.png';
            partnerName.textContent = 'self.write';
            partnerStatus.textContent = 'online';
        }
    }

    // Обработчики для свайпа
    function handleTouchStart(e) {
        touchStartX = e.touches[0].clientX;
    }

    function handleTouchMove(e) {
        if (!touchStartX) return;
        
        const currentX = e.touches[0].clientX;
        const deltaX = Math.abs(currentX - touchStartX);
        const deltaY = Math.abs(e.touches[0].clientY - touchStartX);
        
        // Если горизонтальное движение больше вертикального, предотвращаем прокрутку
        if (deltaX > deltaY && deltaX > 10) {
            e.preventDefault();
        }
    }

    function handleTouchEnd(e) {
        touchEndX = e.changedTouches[0].clientX;
        handleSwipe();
    }

    function handleSwipe() {
        if (!touchStartX || !touchEndX) return;
        
        const distance = touchEndX - touchStartX;
        const absDistance = Math.abs(distance);
        
        if (absDistance < minSwipeDistance) return;
        
        const chatArea = document.querySelector('.chat-area');
        const sidebar = document.querySelector('.sidebar');
        
        if (distance > 0 && chatArea.classList.contains('active')) {
            // Свайп вправо - возврат к списку чатов
            showChatList();
        } else if (distance < 0 && !chatArea.classList.contains('active')) {
            // Свайп влево - открытие чата (если выбран чат)
            const activeChat = document.querySelector('.chat-item.active');
            if (activeChat) {
                const chatId = activeChat.getAttribute('data-chat');
                showChat(chatId);
            }
        }
        
        // Сбрасываем значения
        touchStartX = 0;
        touchEndX = 0;
    }

    // Функции для мобильного контекстного меню
    function showMobileContextMenu(messageElement) {
        selectedMessage = messageElement;
        mobileContextMenu.classList.add('active');
        mobileContextOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function hideMobileContextMenu() {
        mobileContextMenu.classList.remove('active');
        mobileContextOverlay.classList.remove('active');
        document.body.style.overflow = '';
        selectedMessage = null;
    }

    // Обработчик двойного тапа
    function handleDoubleTap(e, messageElement) {
        e.preventDefault();
        e.stopPropagation();
        
        // Создаем индикатор тапа
        const rect = messageElement.getBoundingClientRect();
        const tapIndicator = document.createElement('div');
        tapIndicator.className = 'message-tap-indicator';
        tapIndicator.style.left = (e.clientX - rect.left - 40) + 'px';
        tapIndicator.style.top = (e.clientY - rect.top - 40) + 'px';
        messageElement.style.position = 'relative';
        messageElement.appendChild(tapIndicator);
        
        // Удаляем индикатор после анимации
        setTimeout(() => {
            tapIndicator.remove();
        }, 400);
        
        // Показываем меню реакций
        showMobileContextMenu(messageElement);
    }

    // Обработчик долгого нажатия
    function handleLongPress(messageElement) {
        messageElement.classList.add('long-press');
        showMobileContextMenu(messageElement);
    }

    // Инициализация жестов для сообщений
    function initMessageGestures(messageElement) {
        if (!isMobile) return;

        let pressTimer;
        let isLongPress = false;

        messageElement.addEventListener('touchstart', function(e) {
            pressTimer = setTimeout(() => {
                isLongPress = true;
                handleLongPress(messageElement);
            }, longPressDelay);
        }, { passive: true });

        messageElement.addEventListener('touchend', function(e) {
            clearTimeout(pressTimer);
            
            if (!isLongPress) {
                const currentTime = new Date().getTime();
                const tapLength = currentTime - lastTap;
                
                if (tapLength < doubleTapDelay && tapLength > 0) {
                    // Двойной тап
                    handleDoubleTap(e, messageElement);
                } else {
                    // Одинарный тап
                    lastTap = currentTime;
                }
            }
            
            isLongPress = false;
            messageElement.classList.remove('long-press');
        });

        messageElement.addEventListener('touchmove', function(e) {
            clearTimeout(pressTimer);
            isLongPress = false;
        });
    }

    // Функция добавления реакции к сообщению
    function addReactionToMessage(messageElement, reaction) {
        let reactionsContainer = messageElement.querySelector('.message-reactions');
        
        if (!reactionsContainer) {
            reactionsContainer = document.createElement('div');
            reactionsContainer.className = 'message-reactions';
            messageElement.querySelector('.message-content').appendChild(reactionsContainer);
        }
        
        // Проверяем, есть ли уже такая реакция
        const existingReaction = Array.from(reactionsContainer.children).find(
            child => child.textContent.includes(reaction)
        );
        
        if (existingReaction) {
            // Если реакция уже есть, увеличиваем счетчик
            const countSpan = existingReaction.querySelector('.message-reaction-count');
            if (countSpan) {
                const currentCount = parseInt(countSpan.textContent) || 1;
                countSpan.textContent = currentCount + 1;
            } else {
                const countSpan = document.createElement('span');
                countSpan.className = 'message-reaction-count';
                countSpan.textContent = '2';
                existingReaction.appendChild(countSpan);
            }
            existingReaction.classList.add('added', 'mobile-added');
        } else {
            // Если реакции нет, добавляем ее
            const reactionSpan = document.createElement('span');
            reactionSpan.className = 'message-reaction added mobile-added';
            reactionSpan.innerHTML = `${reaction} <span class="message-reaction-count">1</span>`;
            reactionSpan.addEventListener('click', function(e) {
                e.stopPropagation();
                // Уменьшаем счетчик или удаляем реакцию
                const countSpan = this.querySelector('.message-reaction-count');
                if (countSpan) {
                    const currentCount = parseInt(countSpan.textContent);
                    if (currentCount > 1) {
                        countSpan.textContent = currentCount - 1;
                    } else {
                        this.remove();
                    }
                } else {
                    this.remove();
                }
            });
            
            reactionsContainer.appendChild(reactionSpan);
        }
        
        // Скрываем меню после добавления реакции
        hideMobileContextMenu();
    }

    // Функция ответа на сообщение
    function replyToMessage(messageElement) {
        const messageText = messageElement.querySelector('.message-text').textContent;
        messageInput.value = `Ответ на: ${messageText} `;
        messageInput.focus();
        hideMobileContextMenu();
    }

    // Функция пересылки сообщения
    function forwardMessage(messageElement) {
        const messageText = messageElement.querySelector('.message-text').textContent;
        // Здесь можно добавить логику выбора чата для пересылки
    alert(`self.message "${messageText}"{message}`);
        hideMobileContextMenu();
    }

    // Функция копирования сообщения
    function copyMessage(messageElement) {
        const messageText = messageElement.querySelector('.message-text').textContent;
        navigator.clipboard.writeText(messageText).then(() => {
            // Показываем уведомление о успешном копировании
            showToast('Сообщение скопировано', 'success');
        }).catch(err => {
            console.error('Ошибка копирования: ', err);
            showToast('Ошибка копирования', 'error');
        });
        hideMobileContextMenu();
    }

    // Функция удаления сообщения
    function deleteMessage(messageElement) {
        if (confirm('Удалить это сообщение?')) {
            messageElement.remove();
            showToast('Сообщение удалено', 'success');
        }
        hideMobileContextMenu();
    }

    // Функция выбора сообщения
    function selectMessage(messageElement) {
        messageElement.classList.toggle('selected');
        // Здесь можно добавить логику для множественного выбора
        showToast('Сообщение выбрано', 'success');
        hideMobileContextMenu();
    }

    // Функция показа уведомлений
    function showToast(message, type = 'success') {
        // Создаем временный toast для мобильных
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(-100px);
            background-color: ${type === 'success' ? '#1D9F7A' : '#ff4444'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            transition: transform 0.4s ease;
            font-weight: bold;
            max-width: 90%;
            text-align: center;
        `;
        
        document.body.appendChild(toast);
        
        // Анимация появления
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(0)';
        }, 100);
        
        // Автоматическое скрытие
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(-100px)';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 400);
        }, 3000);
    }

    // Инициализация
    function init() {
        if (!checkAuth()) return;
        
        loadUserData();
        scrollToBottom();
        
        // На мобильных устройствах показываем только список чатов
        if (isMobile) {
            showChatList();
        }
        
        // Показываем кнопку /start для BotFather
        if (currentChat === 'botfather' && !botStarted) {
            startButtonContainer.style.display = 'flex';
            messageInputWrapper.style.display = 'none';
        }
    }

    // Функция отправки сообщения
    function sendMessage() {
        const text = messageInput.value.trim();
        
        if (text === '') return;

        // Создаем сообщение пользователя
        const messageElement = createMessageElement(text, 'user');
        messagesContainer.appendChild(messageElement);
        
        // Инициализируем жесты для нового сообщения
        initMessageGestures(messageElement);
        
        // Очищаем поле ввода
        messageInput.value = '';
        
        // Прокручиваем к последнему сообщению
        scrollToBottom();
        
        // Имитируем ответ бота через 1-2 секунды
        if (currentChat === 'botfather') {
            setTimeout(() => {
                const botResponse = getBotResponse(text);
                const botMessageElement = createMessageElement(botResponse, 'bot');
                messagesContainer.appendChild(botMessageElement);
                initMessageGestures(botMessageElement);
                scrollToBottom();
            }, 1000 + Math.random() * 1000);
        } else if (currentChat === 'selfwrite') {
            // Имитация набора для self.write
            setTimeout(() => {
                showTypingIndicator();
                setTimeout(() => {
                    hideTypingIndicator();
                    const response = getSelfWriteResponse(text);
                    const responseElement = createMessageElement(response, 'bot');
                    messagesContainer.appendChild(responseElement);
                    initMessageGestures(responseElement);
                    scrollToBottom();
                }, 2000 + Math.random() * 1000);
            }, 1000);
        }
    }

    // Обработчик кнопки /start
    function handleStartButton() {
        if (currentChat === 'botfather' && !botStarted) {
            botStarted = true;
            
            // Создаем сообщение пользователя с /start
            const userMessageElement = createMessageElement('/start', 'user');
            messagesContainer.appendChild(userMessageElement);
            initMessageGestures(userMessageElement);
            
            // Скрываем кнопку /start и показываем поле ввода
            startButtonContainer.style.display = 'none';
            messageInputWrapper.style.display = 'flex';
            messageInput.focus();
            
            // Прокручиваем к последнему сообщению
            scrollToBottom();
            
            // Ответ бота после /start
            setTimeout(() => {
                const botMessageElement = createMessageElement('self.hello1', 'bot');
                messagesContainer.appendChild(botMessageElement);
                initMessageGestures(botMessageElement);
                scrollToBottom();
            }, 1000);
        }
    }

    // Функция создания элемента сообщения
    function createMessageElement(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        const time = new Date().toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        const avatarSrc = type === 'bot' 
            ? (currentChat === 'botfather' ? 'images/bots/botfather.png' : 'images/my/myself.png')
            : 'images/my/myself.png';

        messageDiv.innerHTML = `
            <div class="message-avatar">
                <img src="${avatarSrc}" alt="${type === 'bot' ? 'Bot' : 'User'}">
            </div>
            <div class="message-content">
                <div class="message-text">${text}</div>
                <div class="message-time">${time}</div>
            </div>
        `;

        // Для десктопов добавляем обработчик контекстного меню
        if (!isMobile) {
            messageDiv.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                showContextMenu(e, messageDiv, type);
            });
        }

        return messageDiv;
    }

    // Функция показа индикатора набора
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <img src="images/my/myself.png" alt="self.write">
            </div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        scrollToBottom();
    }

    // Функция скрытия индикатора набора
    function hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // Функция получения ответа от BotFather
    function getBotResponse(userMessage) {
        const responses = [
            "self.message1",
            "self.message2",
            "self.message3",
            "self.message4",
            "self.message5",
            "self.message6",
            "self.message7",
            "self.message8"
        ];
        
        userMessage = userMessage.toLowerCase();
        
        if (userMessage.includes('привет') || userMessage.includes('здравствуй')) {
            return "лох";
        } else if (userMessage.includes('как дела')) {
            return "толстый";
        } else if (userMessage.includes('бот')) {
            return "нет иди нахуй";
        } else if (userMessage.includes('помощь') || userMessage.includes('help')) {
            return "члены";
        }
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // Функция получения ответа от self.write
    function getSelfWriteResponse(userMessage) {
        const responses = [
            "self.message1",
            "self.message2",
            "self.message3",
            "self.message4",
            "self.message5",
            "self.message6",
            "self.message7",
            "self.message8"
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // Функция прокрутки к последнему сообщению
    function scrollToBottom() {
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    // Функция поиска чатов
    function searchChats(query) {
        const chatItems = document.querySelectorAll('.chat-item');
        query = query.toLowerCase().trim();
        
        chatItems.forEach(item => {
            const chatName = item.querySelector('.chat-name').textContent.toLowerCase();
            const lastMessage = item.querySelector('.last-message').textContent.toLowerCase();
            
            if (chatName.includes(query) || lastMessage.includes(query)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Функция открытия/закрытия меню
    function toggleMenu() {
        sideMenu.classList.toggle('active');
        menuOverlay.classList.toggle('active');
        document.body.style.overflow = sideMenu.classList.contains('active') ? 'hidden' : '';
    }

    // Функция показа контекстного меню (для десктопов)
    function showContextMenu(e, messageElement, messageType) {
        selectedMessage = messageElement;
        
        // Позиционируем меню
        const x = e.clientX;
        const y = e.clientY;
        
        contextMenu.style.left = x + 'px';
        contextMenu.style.top = y + 'px';
        contextMenu.classList.add('active');
        
        // Скрываем меню при клике вне его
        const hideMenu = function(e) {
            if (!contextMenu.contains(e.target)) {
                contextMenu.classList.remove('active');
                document.removeEventListener('click', hideMenu);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', hideMenu);
        }, 100);
    }

    // Обработчики для контекстного меню (десктоп)
    document.getElementById('contextReply')?.addEventListener('click', function() {
        if (selectedMessage) {
            replyToMessage(selectedMessage);
            contextMenu.classList.remove('active');
        }
    });

    document.getElementById('contextForward')?.addEventListener('click', function() {
        if (selectedMessage) {
            forwardMessage(selectedMessage);
            contextMenu.classList.remove('active');
        }
    });

    document.getElementById('contextCopy')?.addEventListener('click', function() {
        if (selectedMessage) {
            copyMessage(selectedMessage);
            contextMenu.classList.remove('active');
        }
    });

    document.getElementById('contextDelete')?.addEventListener('click', function() {
        if (selectedMessage) {
            deleteMessage(selectedMessage);
            contextMenu.classList.remove('active');
        }
    });

    // Обработчики для реакций (десктоп)
    document.querySelectorAll('.reaction-btn')?.forEach(btn => {
        btn.addEventListener('click', function() {
            if (selectedMessage) {
                const reaction = this.getAttribute('data-reaction');
                addReactionToMessage(selectedMessage, reaction);
                contextMenu.classList.remove('active');
            }
        });
    });

    // Обработчики для мобильного контекстного меню
    mobileContextClose?.addEventListener('click', hideMobileContextMenu);
    mobileContextOverlay?.addEventListener('click', hideMobileContextMenu);

    // Обработчики для действий в мобильном меню
    mobileContextReply?.addEventListener('click', function() {
        if (selectedMessage) {
            replyToMessage(selectedMessage);
        }
    });

    mobileContextForward?.addEventListener('click', function() {
        if (selectedMessage) {
            forwardMessage(selectedMessage);
        }
    });

    mobileContextCopy?.addEventListener('click', function() {
        if (selectedMessage) {
            copyMessage(selectedMessage);
        }
    });

    mobileContextDelete?.addEventListener('click', function() {
        if (selectedMessage) {
            deleteMessage(selectedMessage);
        }
    });

    mobileContextSelect?.addEventListener('click', function() {
        if (selectedMessage) {
            selectMessage(selectedMessage);
        }
    });

    // Обработчики для реакций в мобильном меню
    mobileReactionBtns?.forEach(btn => {
        btn.addEventListener('click', function() {
            if (selectedMessage) {
                const reaction = this.getAttribute('data-reaction');
                addReactionToMessage(selectedMessage, reaction);
            }
        });
    });

    // Основные обработчики событий
    sendButton?.addEventListener('click', sendMessage);

    messageInput?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    messageInput?.addEventListener('input', function() {
        if (sendButton) {
            sendButton.disabled = this.value.trim() === '';
        }
    });

    // Обработчик кнопки /start
    startButton?.addEventListener('click', handleStartButton);

    // Обработчики для поиска
    searchInput?.addEventListener('input', function() {
        searchChats(this.value);
    });

    searchButton?.addEventListener('click', function() {
        searchInput?.focus();
    });

    // Обработчики для меню
    menuButton?.addEventListener('click', toggleMenu);
    menuClose?.addEventListener('click', toggleMenu);
    menuOverlay?.addEventListener('click', toggleMenu);

    // Выход из системы
    logoutBtn?.addEventListener('click', function() {
        sessionStorage.clear();
        window.location.href = '../index.html';
    });

    // Обработчик кнопки "Назад" в чате
    if (chatBackButton) {
        chatBackButton.addEventListener('click', function() {
            showChatList();
        });
    }

    // Закрытие меню при нажатии ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (sideMenu?.classList.contains('active')) {
                toggleMenu();
            }
            if (mobileContextMenu?.classList.contains('active')) {
                hideMobileContextMenu();
            }
        }
    });

    // Обработчики для списка чатов
    chatItems.forEach(item => {
        item.addEventListener('click', function() {
            chatItems.forEach(chat => chat.classList.remove('active'));
            this.classList.add('active');

            currentChat = this.getAttribute('data-chat');

            // Очищаем контейнер сообщений
            if (messagesContainer) {
                messagesContainer.innerHTML = '';
            }

            if (currentChat === 'botfather') {
                botStarted = false;
                if (startButtonContainer) startButtonContainer.style.display = 'flex';
                if (messageInputWrapper) messageInputWrapper.style.display = 'none';
            } else if (currentChat === 'selfwrite') {
                botStarted = true;
                if (startButtonContainer) startButtonContainer.style.display = 'none';
                if (messageInputWrapper) messageInputWrapper.style.display = 'flex';
                // Добавляем начальное сообщение для self.write
                const initialMessage = createMessageElement('Привет! Я тестовый бот. Ты можешь написать мне любое сообщение, мне похуй', 'bot');
                if (messagesContainer) {
                    messagesContainer.appendChild(initialMessage);
                    initMessageGestures(initialMessage);
                }
            }

            // На мобильных устройствах переходим к чату
            if (isMobile) {
                showChat(currentChat);
            }

            scrollToBottom();
        });
    });

    // Добавляем обработчики touch событий для свайпа
    if (sidebar) {
        sidebar.addEventListener('touchstart', handleTouchStart, { passive: false });
        sidebar.addEventListener('touchmove', handleTouchMove, { passive: false });
        sidebar.addEventListener('touchend', handleTouchEnd, { passive: false });
    }

    if (chatArea) {
        chatArea.addEventListener('touchstart', handleTouchStart, { passive: false });
        chatArea.addEventListener('touchmove', handleTouchMove, { passive: false });
        chatArea.addEventListener('touchend', handleTouchEnd, { passive: false });
    }

    // Обработчик изменения размера окна
    window.addEventListener('resize', function() {
        isMobile = window.innerWidth <= 768;
        
        // Если перешли с мобильного на десктоп, сбрасываем состояния
        if (!isMobile) {
            const chatArea = document.querySelector('.chat-area');
            const sidebar = document.querySelector('.sidebar');
            
            if (sidebar) sidebar.classList.remove('hidden', 'swipe-transition');
            if (chatArea) chatArea.classList.remove('active', 'swipe-transition');
            
            // Скрываем мобильное контекстное меню
            hideMobileContextMenu();
        }
    });

    // Инициализация при загрузке
    init();

    // Инициализируем жесты для существующих сообщений
    setTimeout(() => {
        document.querySelectorAll('.message').forEach(message => {
            initMessageGestures(message);
        });
    }, 100);
});