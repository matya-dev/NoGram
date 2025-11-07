document.addEventListener('DOMContentLoaded', function() {
    console.log('Registration page script loaded');

    // Элементы страницы телефона
    const phoneInput = document.getElementById('phoneInput');
    const continueBtn = document.getElementById('continueBtn');
    const tokenLoginBtn = document.getElementById('tokenLoginBtn');
    const phonePage = document.querySelector('.phone-page');
    
    // Элементы страницы кода
    const codePage = document.querySelector('.code-page');
    const backToPhoneFromCodeBtn = document.getElementById('backToPhoneFromCodeBtn');
    const codeMessage = document.getElementById('codeMessage');
    const codeInputs = document.querySelectorAll('.code-digit');
    const codeError = document.getElementById('codeError');
    const resendBtn = document.getElementById('resendBtn');
    const progressFill = document.getElementById('progressFill');
    const timer = document.getElementById('timer');
    
    // Элементы страницы токена
    const backToPhoneBtn = document.getElementById('backToPhoneBtn');
    const tokenPage = document.querySelector('.token-page');
    const tokenError = document.getElementById('tokenError');
    const tokenInputs = document.querySelectorAll('.token-digit');
    
    // Toast уведомления
    const toast = document.getElementById('toast');
    
    // Правильные коды
    const CORRECT_TOKEN = '111';
    const CORRECT_CODE = '77777';
    
    let currentToken = '';
    let currentCode = '';
    let countdown;
    let currentPhoneNumber = '';

    // Автоматическое форматирование номера телефона
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
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
        
        if (cleanPhoneNumber.length === 12) {
            currentPhoneNumber = phoneInput.value;
            codeMessage.textContent = `Мы отправили SMS с кодом на номер +7 ${phoneInput.value}`;
            switchPage(phonePage, codePage);
            startCountdown();
            codeInputs[0].focus();
        } else {
            showToast('Пожалуйста, введите корректный номер телефона', 'error');
        }
    });
    
    // Переключение на страницу ввода токена
    tokenLoginBtn.addEventListener('click', function() {
        switchPage(phonePage, tokenPage);
        tokenInputs[0].focus();
    });
    
    // Возврат на страницу ввода телефона
    backToPhoneBtn.addEventListener('click', function() {
        switchPage(tokenPage, phonePage);
        resetTokenInputs();
    });
    
    backToPhoneFromCodeBtn.addEventListener('click', function() {
        switchPage(codePage, phonePage);
        resetCodeInputs();
        stopCountdown();
    });
    
    // Обработчики для полей ввода токена
    tokenInputs.forEach((input, index) => {
        input.addEventListener('input', function(e) {
            const value = e.target.value;
            
            if (value.length === 1 && /[0-9]/.test(value)) {
                currentToken += value;
                input.classList.add('correct');
                
                if (index < tokenInputs.length - 1) {
                    tokenInputs[index + 1].focus();
                }
                
                if (currentToken.length === 3) {
                    setTimeout(() => checkToken(), 300);
                }
            } else if (value.length === 0) {
                currentToken = currentToken.slice(0, -1);
                input.classList.remove('correct');
            }
        });
    });
    
    // Обработчики для полей ввода кода
    codeInputs.forEach((input, index) => {
        input.addEventListener('input', function(e) {
            const value = e.target.value;
            
            if (value.length === 1 && /[0-9]/.test(value)) {
                currentCode += value;
                input.classList.add('correct');
                
                if (index < codeInputs.length - 1) {
                    codeInputs[index + 1].focus();
                }
                
                if (currentCode.length === 5) {
                    setTimeout(() => checkCode(), 300);
                }
            } else if (value.length === 0) {
                currentCode = currentCode.slice(0, -1);
                input.classList.remove('correct');
            }
        });
    });
    
    // Функция проверки токена
    function checkToken() {
        if (currentToken === CORRECT_TOKEN) {
            showToast('Успешный вход по токену!', 'success');
            completeRegistration();
        } else {
            tokenError.classList.add('show');
            tokenInputs.forEach(input => {
                input.classList.remove('correct');
                input.classList.add('incorrect');
            });
            showToast('Неверный токен', 'error');
            
            setTimeout(() => {
                resetTokenInputs();
            }, 1500);
        }
    }
    
    // Функция проверки кода
    function checkCode() {
        if (currentCode === CORRECT_CODE) {
            showToast('Код подтвержден!', 'success');
            codeInputs.forEach(input => {
                input.classList.add('success-animation');
            });
            setTimeout(() => {
                completeRegistration();
            }, 1000);
        } else {
            codeError.classList.add('show');
            codeInputs.forEach(input => {
                input.classList.remove('correct');
                input.classList.add('incorrect');
            });
            showToast('Неверный код', 'error');
            
            setTimeout(() => {
                resetCodeInputs();
            }, 1500);
        }
    }
    
    // Функция завершения регистрации
    function completeRegistration() {
        console.log('Completing registration for:', currentPhoneNumber);
        
        // Сохраняем данные в cookies
        CookieManager.saveUserData(currentPhoneNumber);
        
        showToast('Регистрация успешна! Перенаправление...', 'success');
        
        // Перенаправляем на страницу чатов через 2 секунды
        setTimeout(() => {
            console.log('Redirecting to chats...');
            window.location.href = 'chats/chats.html';
        }, 2000);
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
    
    // Функция сброса полей ввода кода
    function resetCodeInputs() {
        currentCode = '';
        codeInputs.forEach(input => {
            input.value = '';
            input.classList.remove('correct', 'incorrect', 'success-animation');
        });
        codeError.classList.remove('show');
        codeInputs[0].focus();
    }
    
    // Таймер обратного отсчета
    function startCountdown() {
        let timeLeft = 60;
        progressFill.classList.add('animate');
        
        countdown = setInterval(() => {
            timeLeft--;
            timer.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                stopCountdown();
                resendBtn.disabled = false;
                resendBtn.textContent = 'Отправить код повторно';
            }
        }, 1000);
    }
    
    function stopCountdown() {
        clearInterval(countdown);
        progressFill.classList.remove('animate');
    }
    
    // Обработчик для повторной отправки кода
    resendBtn.addEventListener('click', function() {
        if (!resendBtn.disabled) {
            showToast('Код отправлен повторно', 'success');
            resetCodeInputs();
            resendBtn.disabled = true;
            timer.textContent = '60';
            startCountdown();
        }
    });
    
    // Функция переключения между страницами
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
});