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

    let botStarted = false;
    let selectedMessage = null;
    let currentChat = 'botfather';

    // Переменные для мобильной адаптации
    let isMobile = window.innerWidth <= 768;
    let touchStartX = 0;
    let touchEndX = 0;
    const minSwipeDistance = 50;

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

        // Добавляем обработчик контекстного меню
        messageDiv.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            showContextMenu(e, messageDiv, type);
        });

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

    // Функция показа контекстного меню
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

    // Обработчики для контекстного меню
    document.getElementById('contextReply').addEventListener('click', function() {
        if (selectedMessage) {
            const messageText = selectedMessage.querySelector('.message-text').textContent;
            messageInput.value = `Ответ на: ${messageText} `;
            messageInput.focus();
            contextMenu.classList.remove('active');
        }
    });

    document.getElementById('contextForward').addEventListener('click', function() {
        if (selectedMessage) {
            alert('Сообщение будет переслано');
            contextMenu.classList.remove('active');
        }
    });

    document.getElementById('contextCopy').addEventListener('click', function() {
        if (selectedMessage) {
            const messageText = selectedMessage.querySelector('.message-text').textContent;
            navigator.clipboard.writeText(messageText).then(() => {
                console.log('Сообщение скопировано');
            });
            contextMenu.classList.remove('active');
        }
    });

    document.getElementById('contextDelete').addEventListener('click', function() {
        if (selectedMessage) {
            selectedMessage.remove();
            contextMenu.classList.remove('active');
        }
    });

    // Обработчики для реакций
    document.querySelectorAll('.reaction-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (selectedMessage) {
                const reaction = this.getAttribute('data-reaction');
                addReactionToMessage(selectedMessage, reaction);
                contextMenu.classList.remove('active');
            }
        });
    });

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
            child => child.textContent === reaction
        );
        
        if (existingReaction) {
            // Если реакция уже есть, удаляем ее
            existingReaction.remove();
        } else {
            // Если реакции нет, добавляем ее
            const reactionSpan = document.createElement('span');
            reactionSpan.className = 'message-reaction';
            reactionSpan.textContent = reaction;
            reactionSpan.addEventListener('click', function(e) {
                e.stopPropagation();
                this.remove();
            });
            
            reactionsContainer.appendChild(reactionSpan);
        }
    }

    // Обработчики событий
    sendButton.addEventListener('click', sendMessage);

    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    messageInput.addEventListener('input', function() {
        sendButton.disabled = this.value.trim() === '';
    });

    // Обработчик кнопки /start
    startButton.addEventListener('click', handleStartButton);

    // Обработчики для поиска
    searchInput.addEventListener('input', function() {
        searchChats(this.value);
    });

    searchButton.addEventListener('click', function() {
        searchInput.focus();
    });

    // Обработчики для меню
    menuButton.addEventListener('click', toggleMenu);
    menuClose.addEventListener('click', toggleMenu);
    menuOverlay.addEventListener('click', toggleMenu);

    // Выход из системы
    logoutBtn.addEventListener('click', function() {
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
        if (e.key === 'Escape' && sideMenu.classList.contains('active')) {
            toggleMenu();
        }
    });

    // Обработчики для списка чатов
    chatItems.forEach(item => {
        item.addEventListener('click', function() {
            chatItems.forEach(chat => chat.classList.remove('active'));
            this.classList.add('active');

            currentChat = this.getAttribute('data-chat');

            // Очищаем контейнер сообщений
            messagesContainer.innerHTML = '';

            if (currentChat === 'botfather') {
                botStarted = false;
                // Показываем кнопку /start
                startButtonContainer.style.display = 'flex';
                messageInputWrapper.style.display = 'none';
            } else if (currentChat === 'selfwrite') {
                botStarted = true;
                // Показываем поле ввода
                startButtonContainer.style.display = 'none';
                messageInputWrapper.style.display = 'flex';
                // Добавляем начальное сообщение для self.write
                const initialMessage = createMessageElement('Привет! Я тестовый бот. Ты можешь написать мне любое сообщение, мне похуй', 'bot');
                messagesContainer.appendChild(initialMessage);
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
            
            sidebar.classList.remove('hidden', 'swipe-transition');
            chatArea.classList.remove('active', 'swipe-transition');
        }
    });

    // Инициализация при загрузке
    init();
});