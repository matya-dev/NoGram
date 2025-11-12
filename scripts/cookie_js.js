// Функции для работы с cookies
class CookieManager {
    // Установка cookie
    static setCookie(name, value, days = 30) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
        console.log('Cookie set:', name, value);
    }

    // Получение cookie
    static getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                const value = c.substring(nameEQ.length, c.length);
                console.log('Cookie found:', name, value);
                return value;
            }
        }
        console.log('Cookie not found:', name);
        return null;
    }

    // Удаление cookie
    static deleteCookie(name) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }

    // Проверка авторизации
    static isAuthenticated() {
        const auth = this.getCookie('nogram_auth');
        return auth === 'true';
    }

    // Сохранение данных пользователя
    static saveUserData(phoneNumber, username) {
        this.setCookie('nogram_auth', 'true');
        this.setCookie('nogram_phone', phoneNumber);
        this.setCookie('nogram_username', username);
        this.setCookie('nogram_login_time', new Date().toISOString());
        console.log('User data saved:', { phoneNumber, username });
    }

    // Получение данных пользователя
    static getUserData() {
        return {
            isAuthenticated: this.isAuthenticated(),
            phone: this.getCookie('nogram_phone'),
            username: this.getCookie('nogram_username'),
            loginTime: this.getCookie('nogram_login_time')
        };
    }

    // Выход из системы
    static logout() {
        this.deleteCookie('nogram_auth');
        this.deleteCookie('nogram_phone');
        this.deleteCookie('nogram_username');
        this.deleteCookie('nogram_login_time');
        window.location.href = '../index.html';
    }
}

// Проверка авторизации при загрузке
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== AUTH CHECK ===');
    console.log('Current URL:', window.location.href);
    console.log('Pathname:', window.location.pathname);
    console.log('Is authenticated:', CookieManager.isAuthenticated());
    
    const currentPath = window.location.pathname;
    
    // Если на странице регистрации и уже авторизован - редирект в чаты
    if (currentPath.includes('index.html') || currentPath === '/' || currentPath === '') {
        console.log('On index page');
        if (CookieManager.isAuthenticated()) {
            console.log('Already authenticated, redirecting to chats');
            window.location.href = 'chats/chats.html';
        }
    }
    
    // Если на странице чатов и не авторизован - редирект на регистрацию
    if (currentPath.includes('chats.html')) {
        console.log('On chats page');
        if (!CookieManager.isAuthenticated()) {
            console.log('Not authenticated, redirecting to index');
            window.location.href = '../index.html';
        } else {
            console.log('Auth successful, staying on chats');
        }
    }
    
    console.log('=== AUTH CHECK COMPLETE ===');
});