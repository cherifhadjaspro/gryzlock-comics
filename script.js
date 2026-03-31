// State
let comics = [];
let currentIndex = 0;
let currentPanel = 0;

// DOM Elements
const comicTitle = document.getElementById('comic-title');
const comicDate = document.getElementById('comic-date');
const comicImage = document.getElementById('comic-image');
const comicDescription = document.getElementById('comic-description');
const currentIndexSpan = document.getElementById('current-index');
const totalCountSpan = document.getElementById('total-count');
const btnFirst = document.getElementById('btn-first');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const btnLast = document.getElementById('btn-last');
const comicsGrid = document.getElementById('comics-grid');

// Panel navigation elements
const panelNav = document.getElementById('panel-nav');
const panelInfo = document.getElementById('panel-info');
const btnPanelPrev = document.getElementById('btn-panel-prev');
const btnPanelNext = document.getElementById('btn-panel-next');

/**
 * Load comics from JSON file
 */
async function loadComics() {
    try {
        const response = await fetch('comics.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        comics = await response.json();

        if (!comics || comics.length === 0) {
            console.error('No comics loaded');
            showPlaceholder();
            return;
        }

        totalCountSpan.textContent = comics.length;

        // Load from hash if available
        loadFromHash();

        // If no hash was set, show the latest comic
        if (currentIndex === 0 && !window.location.hash) {
            currentIndex = comics.length - 1;
        }

        updateDisplay();
        populateGrid();
    } catch (error) {
        console.error('Error loading comics:', error);
        showPlaceholder();
    }
}

/**
 * Load comic from URL hash
 */
function loadFromHash() {
    const hash = window.location.hash.slice(1);
    if (hash.startsWith('comic-')) {
        const id = parseInt(hash.split('-')[1], 10);
        const index = comics.findIndex(c => c.id === id);
        if (index !== -1) {
            currentIndex = index;
            currentPanel = 0;
            return;
        }
    }
}

/**
 * Update the URL hash
 */
function updateHash() {
    if (comics[currentIndex]) {
        window.location.hash = `comic-${comics[currentIndex].id}`;
    }
}

/**
 * Get the image URL for the current comic and panel
 */
function getImageUrl(comic, panelIndex) {
    // New format: use panels array with Imgur URLs
    if (comic.panels && comic.panels.length > 0) {
        return comic.panels[panelIndex] || comic.panels[0];
    }
    // Fallback: use coverUrl
    if (comic.coverUrl) {
        return comic.coverUrl;
    }
    // Legacy format: use filename from comics/ folder
    if (comic.filename) {
        return `comics/${comic.filename}`;
    }
    return 'placeholder.svg';
}

/**
 * Display the current comic
 */
function updateDisplay() {
    if (!comics || comics.length === 0) {
        showPlaceholder();
        return;
    }

    const comic = comics[currentIndex];

    comicTitle.textContent = comic.title;
    comicDate.textContent = formatDate(comic.date);
    comicDescription.textContent = comic.description || 'A funny comic by Gryzlock';

    // Load the comic image
    const imgUrl = getImageUrl(comic, currentPanel);
    comicImage.src = imgUrl;
    comicImage.onerror = function() {
        this.src = 'placeholder.svg';
    };

    currentIndexSpan.textContent = currentIndex + 1;

    // Update comic navigation button states
    btnFirst.disabled = currentIndex === 0;
    btnPrev.disabled = currentIndex === 0;
    btnNext.disabled = currentIndex === comics.length - 1;
    btnLast.disabled = currentIndex === comics.length - 1;

    // Update panel navigation
    updatePanelNav(comic);

    // Update hash
    updateHash();
}

/**
 * Update panel navigation UI
 */
function updatePanelNav(comic) {
    const totalPanels = comic.panels ? comic.panels.length : 1;

    if (totalPanels <= 1) {
        // Single panel comic — hide panel nav
        if (panelNav) panelNav.style.display = 'none';
        return;
    }

    // Multi-panel comic — show panel nav
    if (panelNav) panelNav.style.display = 'flex';
    if (panelInfo) panelInfo.textContent = `Panel ${currentPanel + 1} / ${totalPanels}`;
    if (btnPanelPrev) btnPanelPrev.disabled = currentPanel === 0;
    if (btnPanelNext) btnPanelNext.disabled = currentPanel === totalPanels - 1;
}

/**
 * Navigate to previous panel
 */
function prevPanel() {
    if (currentPanel > 0) {
        currentPanel--;
        updateDisplay();
    }
}

/**
 * Navigate to next panel
 */
function nextPanel() {
    const comic = comics[currentIndex];
    const totalPanels = comic.panels ? comic.panels.length : 1;
    if (currentPanel < totalPanels - 1) {
        currentPanel++;
        updateDisplay();
    }
}

/**
 * Show placeholder when no comics available
 */
function showPlaceholder() {
    comicTitle.textContent = 'No comics available';
    comicDate.textContent = '-';
    comicDescription.textContent = 'Comics are coming soon!';
    comicImage.src = 'placeholder.svg';
    totalCountSpan.textContent = '0';
    currentIndexSpan.textContent = '0';
    if (panelNav) panelNav.style.display = 'none';
}

/**
 * Format date
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', options);
}

/**
 * Navigate to first comic
 */
function goToFirst() {
    if (comics.length > 0) {
        currentIndex = 0;
        currentPanel = 0;
        updateDisplay();
        scrollToComic();
    }
}

/**
 * Navigate to previous comic
 */
function goToPrev() {
    if (currentIndex > 0) {
        currentIndex--;
        currentPanel = 0;
        updateDisplay();
        scrollToComic();
    }
}

/**
 * Navigate to next comic
 */
function goToNext() {
    if (currentIndex < comics.length - 1) {
        currentIndex++;
        currentPanel = 0;
        updateDisplay();
        scrollToComic();
    }
}

/**
 * Navigate to last comic
 */
function goToLast() {
    if (comics.length > 0) {
        currentIndex = comics.length - 1;
        currentPanel = 0;
        updateDisplay();
        scrollToComic();
    }
}

/**
 * Navigate to specific comic by ID
 */
function goToComic(id) {
    const index = comics.findIndex(c => c.id === id);
    if (index !== -1) {
        currentIndex = index;
        currentPanel = 0;
        updateDisplay();
        scrollToComic();
    }
}

/**
 * Scroll to comic viewer
 */
function scrollToComic() {
    document.querySelector('.comic-viewer').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Populate the recent comics grid
 */
function populateGrid() {
    if (!comicsGrid) return;

    comicsGrid.innerHTML = '';

    // Show last 8 comics in reverse order (newest first)
    const recentComics = comics.slice().reverse().slice(0, 8);

    recentComics.forEach(comic => {
        const card = document.createElement('a');
        card.href = `#comic-${comic.id}`;
        card.className = 'comic-card';
        card.onclick = (e) => {
            e.preventDefault();
            goToComic(comic.id);
        };

        const imageWrapper = document.createElement('div');
        imageWrapper.className = 'comic-card-image';

        const img = document.createElement('img');
        // Use coverUrl or first panel for thumbnail
        img.src = comic.coverUrl || (comic.panels && comic.panels[0]) || `comics/${comic.filename}`;
        img.alt = comic.title;
        img.loading = 'lazy';
        img.onerror = function() {
            this.src = 'placeholder.svg';
        };
        imageWrapper.appendChild(img);

        const info = document.createElement('div');
        info.className = 'comic-card-info';

        const title = document.createElement('div');
        title.className = 'comic-card-title';
        title.textContent = comic.title;

        const date = document.createElement('div');
        date.className = 'comic-card-date';
        date.textContent = formatDate(comic.date);

        // Show panel count badge if multi-panel
        if (comic.panelCount && comic.panelCount > 1) {
            const badge = document.createElement('span');
            badge.className = 'panel-badge';
            badge.textContent = `${comic.panelCount} panels`;
            info.appendChild(badge);
        }

        info.appendChild(title);
        info.appendChild(date);

        card.appendChild(imageWrapper);
        card.appendChild(info);

        comicsGrid.appendChild(card);
    });
}

/**
 * Event listeners
 */
function setupEventListeners() {
    btnFirst.addEventListener('click', goToFirst);
    btnPrev.addEventListener('click', goToPrev);
    btnNext.addEventListener('click', goToNext);
    btnLast.addEventListener('click', goToLast);

    // Panel navigation
    if (btnPanelPrev) btnPanelPrev.addEventListener('click', prevPanel);
    if (btnPanelNext) btnPanelNext.addEventListener('click', nextPanel);

    // Handle hash changes (back/forward buttons)
    window.addEventListener('hashchange', () => {
        loadFromHash();
        updateDisplay();
        scrollToComic();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        const comic = comics[currentIndex];
        const totalPanels = comic?.panels ? comic.panels.length : 1;

        if (e.key === 'ArrowLeft') {
            // If multi-panel and not at first panel, go to prev panel
            if (totalPanels > 1 && currentPanel > 0) {
                prevPanel();
            } else {
                goToPrev();
            }
        }
        if (e.key === 'ArrowRight') {
            // If multi-panel and not at last panel, go to next panel
            if (totalPanels > 1 && currentPanel < totalPanels - 1) {
                nextPanel();
            } else {
                goToNext();
            }
        }
    });
}

/**
 * Initialize the app
 */
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadComics();
});
