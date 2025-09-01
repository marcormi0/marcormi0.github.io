    let currentLanguage = 'it';

    function toggleLanguage() {
        const btn = document.getElementById('languageBtn');
        const elementsWithData = document.querySelectorAll('[data-en][data-it]');
        if (currentLanguage === 'en') {
            currentLanguage = 'it';
            btn.textContent = 'English';
            document.documentElement.lang = 'it';
            elementsWithData.forEach(el => el.innerHTML = el.getAttribute('data-it'));
        } else {
            currentLanguage = 'en';
            btn.textContent = 'Italiano';
            document.documentElement.lang = 'en';
            elementsWithData.forEach(el => el.innerHTML = el.getAttribute('data-en'));
        }
    }

    window.addEventListener('DOMContentLoaded', () => {
        const btn = document.getElementById('languageBtn');
        const elementsWithData = document.querySelectorAll('[data-en][data-it]');
        elementsWithData.forEach(el => el.innerHTML = el.getAttribute('data-it'));
        btn.textContent = 'English';
        document.documentElement.lang = 'it';
    });

    function toggleCollapse(header) {
        var content = header.nextElementSibling;
        var arrow = header.querySelector(".collapse-arrow");
        if (content.style.display === "none" || content.style.display === "") {
            content.style.display = "block";
            header.parentElement.classList.remove("collapsed");
            if (arrow) arrow.textContent = "▲";
        } else {
            content.style.display = "none";
            header.parentElement.classList.add("collapsed");
            if (arrow) arrow.textContent = "▼";
        }
    }

    // Onload: close the "past-live-section" collapsible by default
    window.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.past-live-section .collapsible-content').forEach(c => c.style.display = 'none');
        document.querySelectorAll('.past-live-section .collapse-arrow').forEach(s => s.textContent = '▼');
    });
