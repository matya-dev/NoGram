document.addEventListener('DOMContentLoaded', function() {
    // Элементы страницы телефона
    const phoneInput = document.getElementById('phoneInput');
    const continueBtn = document.getElementById('continueBtn');
    const tokenLoginBtn = document.getElementById('tokenLoginBtn');
    const phonePage = document.querySelector('.phone-page');
    
    // Элементы страницы токена
    const backToPhoneBtn = document.getElementById('backToPhoneBtn');
    const tokenPage = document.querySelector('.token-page');
    const tokenError = document.getElementById('tokenError');
    const tokenInputs = document.querySelectorAll('.token-digit');
    
    // Toast уведомления
    const toast = document.getElementById('toast');
    
    // Правильный токен
    const CORRECT_TOKEN = '111';
    let currentToken = '';
    
    // Автоматическое форматирование номера телефона
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        // Форматирование: 000 000 00 00
        if (value.length > 0) {
            let formattedValue = '';
            
            if (value.length <= 3) {
                formattedValue = value;
            } else if (value.length <= 6) {
                formattedValue = value.substring(0, 3) + ' ' + value.substring(3);
            } else if (value.length <= 8) {
                formattedValue = value.substring(0, 3) + ' ' + value.substring(3, 6) + ' ' + value.substring(6);
            } else {
                formattedValue = value.substring(0, 3) + ' ' + value.substring(3, 6) + ' ' + value.substring(6, 8) + ' ' + value.substring(8, 10);
            }
            
            e.target.value = formattedValue;
        }
    });
    
    // Обработчик для кнопки "Продолжить" на странице телефона
    continueBtn.addEventListener('click', function() {
        const phoneNumber = phoneInput.value;
        const cleanPhoneNumber = '+7' + phoneNumber.replace(/\D/g, '');
        
        if (cleanPhoneNumber.length === 12) { // +7 + 10 цифр
            showToast('Номер телефона: ' + cleanPhoneNumber, 'success');
            // Здесь можно добавить логику отправки номера на сервер
        } else {
            showToast('Пожалуйста, введите корректный номер телефона', 'error');
        }
    });
    
    // Переключение на страницу ввода токена
    tokenLoginBtn.addEventListener('click', function() {
        switchPage(phonePage, tokenPage);
    });
    
    // Возврат на страницу ввода телефона
    backToPhoneBtn.addEventListener('click', function() {
        switchPage(tokenPage, phonePage);
        resetTokenInputs();
    });
    
    // Обработчики для полей ввода токена
    tokenInputs.forEach((input, index) => {
        // Обработчик ввода
        input.addEventListener('input', function(e) {
            const value = e.target.value;
            
            if (value.length === 1 && /[0-9]/.test(value)) {
                // Добавляем цифру к текущему токену
                currentToken += value;
                
                // Добавляем класс correct для визуальной обратной связи
                input.classList.add('correct');
                
                // Переходим к следующему полю, если оно есть
                if (index < tokenInputs.length - 1) {
                    tokenInputs[index + 1].focus();
                }
                
                // Проверяем токен, если введены все 3 цифры
                if (currentToken.length === 3) {
                    setTimeout(() => checkToken(), 300);
                }
            } else if (value.length === 0) {
                // Если удалили символ, убираем из текущего токена
                currentToken = currentToken.slice(0, -1);
                input.classList.remove('correct');
            }
        });
        
        // Обработчик клавиш
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && input.value === '' && index > 0) {
                // Переходим к предыдущему полю при Backspace
                tokenInputs[index - 1].focus();
            }
        });
        
        // Обработчик вставки
        input.addEventListener('paste', function(e) {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text').slice(0, 3);
            
            if (/^\d{3}$/.test(pastedData)) {
                // Заполняем все поля
                pastedData.split('').forEach((char, i) => {
                    if (tokenInputs[i]) {
                        tokenInputs[i].value = char;
                        tokenInputs[i].classList.add('correct');
                    }
                });
                currentToken = pastedData;
                setTimeout(() => checkToken(), 300);
            }
        });
    });
    
    // Функция проверки токена
    function checkToken() {
        if (currentToken === CORRECT_TOKEN) {
            showToast('Успешный вход по токену!', 'success');
            // Здесь можно добавить логику успешного входа
        } else {
            tokenError.classList.add('show');
            tokenInputs.forEach(input => {
                input.classList.remove('correct');
                input.classList.add('incorrect');
            });
            showToast('Неверный токен', 'error');
            
            // Сбрасываем через 1.5 секунды
            setTimeout(() => {
                resetTokenInputs();
            }, 1500);
        }
    }
    
    // Функция сброса полей ввода токена
    function resetTokenInputs() {
        currentToken = '';
        tokenInputs.forEach(input => {
            input.value = '';
            input.classList.remove('correct', 'incorrect');
        });
        tokenError.classList.remove('show');
        tokenInputs[0].focus();
    }
    
    // Функция переключения между страницами с улучшенной анимацией
    function switchPage(fromPage, toPage) {
        fromPage.classList.add('leaving');
        setTimeout(() => {
            fromPage.classList.remove('active', 'leaving');
            toPage.classList.add('active');
        }, 500);
    }
    
    // Функция показа toast уведомлений
    function showToast(message, type = 'error') {
        toast.textContent = message;
        toast.className = 'toast';
        toast.classList.add(type);
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // Фокус на первое поле токена при загрузке страницы токена
    if (tokenPage.classList.contains('active')) {
        tokenInputs[0].focus();
    }
});