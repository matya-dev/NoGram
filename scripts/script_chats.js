document.addEventListener('DOMContentLoaded', function() {
    console.log('Chats page script loaded');

    const messagesContainer = document.getElementById('messagesContainer');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const chatItems = document.querySelectorAll('.chat-item');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchWrapper = document.getElementById('searchWrapper');
    const menuButton = document.getElementById('menuButton');
    const menuOverlay = document.getElementById('menuOverlay');
    const sideMenu = document.getElementById('sideMenu');
    const menuClose = document.getElementById('menuClose');

    // Фокус на поле ввода при загрузке
    if (messageInput) messageInput.focus();

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
        setTimeout(() => {
            const botResponse = getBotResponse(text);
            const botMessageElement = createMessageElement(botResponse, 'bot');
            messagesContainer.appendChild(botMessageElement);
            scrollToBottom();
        }, 1000 + Math.random() * 1000);
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
            ? '../images/bots/botfather.png' 
            : '../images/my/myself.png';

        messageDiv.innerHTML = `
            <div class="message-avatar">
                <img src="${avatarSrc}" alt="${type === 'bot' ? 'BotFather' : 'User'}">
            </div>
            <div class="message-content">
                <div class="message-text">${text}</div>
                <div class="message-time">${time}</div>
            </div>
        `;

        return messageDiv;
    }

    // Функция получения ответа от бота
    function getBotResponse(userMessage) {
        const responses = [
            "Привет! Я BotFather.",
            "Чем могу помочь?",
            "Интересное сообщение!",
            "Продолжайте, я слушаю.",
            "self.test_message1 - это мое первое сообщение.",
            "Рад общению с вами!",
            "Что еще хотите узнать?",
            "Отличный вопрос!",
            "Продолжайте диалог..."
        ];
        
        userMessage = userMessage.toLowerCase();
        
        if (userMessage.includes('привет') || userMessage.includes('здравствуй')) {
            return "Привет! Как дела?";
        } else if (userMessage.includes('как дела')) {
            return "У меня все отлично! А у вас?";
        } else if (userMessage.includes('бот')) {
            return "Да, я бот. Но стараюсь быть полезным!";
        } else if (userMessage.includes('помощь') || userMessage.includes('help')) {
            return "Я могу отвечать на ваши сообщения. Просто пишите!";
        }
        
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
            scrollToBottom();
        });
    });

    // Прокручиваем к последнему сообщению при загрузке
    scrollToBottom();
});