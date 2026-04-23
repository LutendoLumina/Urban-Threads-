// theme.js

window.onload = function() {
    // 1. Select the elements
    const themeBtn = document.getElementById('theme-toggle');
    const themeText = document.getElementById('theme-text');
    const themeIcon = document.getElementById('theme-icon');

    // Safety check: Only run the code if the button is actually on this specific page
    if (themeBtn) {
        
        // 2. Check for a saved preference
        const savedTheme = localStorage.getItem('urban-threads-theme');

        if (savedTheme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
            if(themeText) themeText.innerText = "Dark Mode";
            if(themeIcon) themeIcon.innerText = "☀️";
        }

        // 3. Listen for clicks
        themeBtn.addEventListener('click', () => {
            let currentTheme = document.documentElement.getAttribute('data-theme');

            if (currentTheme === 'light') {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('urban-threads-theme', 'dark');
                if(themeText) themeText.innerText = "Light Mode";
                if(themeIcon) themeIcon.innerText = "🌙";
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('urban-threads-theme', 'light');
                if(themeText) themeText.innerText = "Dark Mode";
                if(themeIcon) themeIcon.innerText = "☀️";
            }
        });
    }
};