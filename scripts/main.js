let currentLanguage = 'it';

function toggleLanguage() {
    const btn = document.getElementById('languageBtn');
    const elementsWithData = document.querySelectorAll('[data-en][data-it]');
    if (currentLanguage === 'en') {
        currentLanguage = 'it';
        btn.textContent = 'English';
        document.documentElement.lang = 'it';
        elementsWithData.forEach(el => {
            // Check if the element has a specific no-truncate attribute if needed in future
            if (el.hasAttribute('data-it')) {
                el.innerHTML = el.getAttribute('data-it');
            }
        });
    } else {
        currentLanguage = 'en';
        btn.textContent = 'Italiano';
        document.documentElement.lang = 'en';
        elementsWithData.forEach(el => {
            if (el.hasAttribute('data-en')) {
                el.innerHTML = el.getAttribute('data-en');
            }
        });
    }
    // **MODIFICATION**: Re-apply truncation after language switch
    applyTruncation();
}

/**
 * **NEW FUNCTION**
 * Toggles the visibility of the extra text.
 * @param {HTMLElement} button - The "more/less" button that was clicked.
 */
function toggleMore(button) {
    const parentP = button.parentElement;
    const moreTextSpan = parentP.querySelector('.more-text');

    const isHidden = moreTextSpan.style.display === 'none';
    moreTextSpan.style.display = isHidden ? 'inline' : 'none';

    // Update button text based on current language and state
    if (currentLanguage === 'en') {
        button.textContent = isHidden ? ' less' : '...more';
    } else {
        button.textContent = isHidden ? ' meno' : '...altro';
    }
}


/**
 * **NEW FUNCTION**
 * Finds paragraphs within .flotilla-info and truncates them.
 */
function applyTruncation() {
    const infoParagraphs = document.querySelectorAll('.flotilla-info p');

    infoParagraphs.forEach((p, index) => {
        // Get the full text based on the current language
        const fullText = p.getAttribute(`data-${currentLanguage}`);
        if (!fullText) return;

        let shortText, moreText;

        // Define split points for each paragraph
        if (index === 0) { // First paragraph
             const splitPointEn = " This website’s sole purpose";
             const splitPointIt = " L'unico scopo di questo sito";
             const splitPoint = currentLanguage === 'en' ? splitPointEn : splitPointIt;
             if (fullText.includes(splitPoint)) {
                [shortText, moreText] = fullText.split(splitPoint);
                moreText = splitPoint + moreText; // Add the split point back to the hidden part
             }
        } else if (index === 1) { // Second paragraph
            const splitPointEn = " by gathering resources";
            const splitPointIt = " raccogliendo risorse";
             const splitPoint = currentLanguage === 'en' ? splitPointEn : splitPointIt;
             if (fullText.includes(splitPoint)) {
                [shortText, moreText] = fullText.split(splitPoint);
                moreText = " " + moreText; // Add a space
             }
        }

        // If the text was split, rebuild the paragraph with the "more" button
        if (shortText && moreText) {
            const moreButtonText = currentLanguage === 'en' ? '...more' : '...altro';
            p.innerHTML = `
                ${shortText}
                <span class="more-text" style="display: none;">${moreText}</span>
                <span class="read-more-btn" onclick="toggleMore(this)">${moreButtonText}</span>
            `;
        } else {
            // If no split point was found, just show the full text
            p.innerHTML = fullText;
        }
    });
}

window.addEventListener('DOMContentLoaded', () => {
    // Set initial language to Italian
    currentLanguage = 'it';
    const btn = document.getElementById('languageBtn');
    const elementsWithData = document.querySelectorAll('[data-en][data-it]');
    elementsWithData.forEach(el => {
        if (el.hasAttribute('data-it')) {
            el.innerHTML = el.getAttribute('data-it');
        }
    });
    btn.textContent = 'English';
    document.documentElement.lang = 'it';

    // **MODIFICATION**: Apply truncation on initial page load
    applyTruncation();

    // The rest of your original JS
    document.querySelectorAll('.past-live-section .collapsible-content').forEach(c => c.style.display = 'none');
    document.querySelectorAll('.past-live-section .collapse-arrow').forEach(s => s.textContent = '▼');

    const modal = document.getElementById('fileModal');
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeFileModal();
        }
    });
});

// --- Your other functions (toggleCollapse, openFileModal, closeFileModal) remain unchanged ---

function toggleCollapse(header) {
    const content = header.nextElementSibling;
    const arrow = header.querySelector(".collapse-arrow");
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

function openFileModal(filePath) {
    event.preventDefault();
    const modal = document.getElementById('fileModal');
    const imgElement = document.getElementById('modalImage');
    const pdfElement = document.getElementById('modalPdf');
    const videoElement = document.getElementById('modalVideo');

    const fileExtension = filePath.split('.').pop().toLowerCase();
    
    imgElement.style.display = 'none';
    pdfElement.style.display = 'none';
    videoElement.style.display = 'none';

    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(fileExtension)) {
        imgElement.src = filePath;
        imgElement.style.display = 'block';
    } else if (fileExtension === 'pdf') {
        pdfElement.src = filePath;
        pdfElement.style.display = 'block';
    } else if (fileExtension === 'mp4') {
        videoElement.src = filePath;
        videoElement.style.display = 'block';
    } else {
        console.error('Unsupported file type:', fileExtension);
        return;
    }

    modal.style.display = 'flex';
}

function closeFileModal() {
    const modal = document.getElementById('fileModal');
    const imgElement = document.getElementById('modalImage');
    const pdfElement = document.getElementById('modalPdf');
    const videoElement = document.getElementById('modalVideo');

    modal.style.display = 'none';
    
    imgElement.src = '';
    pdfElement.src = '';
    videoElement.pause();
    videoElement.src = '';
}