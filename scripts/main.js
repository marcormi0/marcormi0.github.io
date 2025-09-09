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

    // Onload: close the "past-live-section" collapsible by default
    window.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.past-live-section .collapsible-content').forEach(c => c.style.display = 'none');
        document.querySelectorAll('.past-live-section .collapse-arrow').forEach(s => s.textContent = '▼');
    });


    /**
     * Opens a modal window to display an image or a PDF file.
     * @param {string} filePath - The path to the image or PDF file.
     */
    function openFileModal(filePath) {
        event.preventDefault(); 
        const modal = document.getElementById('fileModal');
        const imgElement = document.getElementById('modalImage');
        const pdfElement = document.getElementById('modalPdf');
        // Get the new video element
        const videoElement = document.getElementById('modalVideo'); 

        const fileExtension = filePath.split('.').pop().toLowerCase();
        
        // Hide all elements first
        imgElement.style.display = 'none';
        pdfElement.style.display = 'none';
        videoElement.style.display = 'none';

        if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(fileExtension)) {
            imgElement.src = filePath;
            imgElement.style.display = 'block';
        } else if (fileExtension === 'pdf') {
            pdfElement.src = filePath;
            pdfElement.style.display = 'block';
        } else if (fileExtension === 'mp4') { // Add this 'else if' block
            videoElement.src = filePath;
            videoElement.style.display = 'block';
        } else {
            console.error('Unsupported file type:', fileExtension);
            return;
        }

        modal.style.display = 'flex';
    }

    /**
     * Closes the file viewer modal.
     */
    function closeFileModal() {
        const modal = document.getElementById('fileModal');
        const imgElement = document.getElementById('modalImage');
        const pdfElement = document.getElementById('modalPdf');
        // Get the new video element
        const videoElement = document.getElementById('modalVideo');

        modal.style.display = 'none';
        
        // Clear src and stop content
        imgElement.src = '';
        pdfElement.src = '';
        videoElement.pause(); // Stop the video
        videoElement.src = ''; // Clear the source
    }

    // Add event listeners when the page content is loaded
    window.addEventListener('DOMContentLoaded', () => {
        // Add listener to close the modal when clicking on the overlay
        const modal = document.getElementById('fileModal');
        modal.addEventListener('click', (event) => {
            // Close only if the click is on the overlay itself, not the content inside
            if (event.target === modal) {
                closeFileModal();
            }
        });
    });

    // Re-initialize truncation when language is toggled
    const originalToggleLanguage = toggleLanguage;
    toggleLanguage = function() {
        originalToggleLanguage.apply(this, arguments);
        // We need a small delay to allow the DOM to update with the new language
    };
