// State
let comics = [];
let currentIndex = 0;
let isInitialLoad = true;

// DOM Elements
const comicTitle = document.getElementById('comic-title');
const comicDate = document.getElementById('comic-date');
const comicPanels = document.getElementById('comic-panels');
const comicDescription = document.getElementById('comic-description');
const currentIndexSpan = document.getElementById('current-index');
const totalCountSpan = document.getElementById('total-count');
const btnFirst = document.getElementById('btn-first');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const btnLast = document.getElementById('btn-last');
const comicsGrid = document.getElementById('comics-grid');

/**
 * Load comics from JSON file
 */
async function loadComics() {
    try {
        const response = await fetch('comics.json?v=2');
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
        populateBanner();

        // Stay at top on initial page load
        isInitialLoad = false;
        window.scrollTo(0, 0);

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
            return;
        }
    }
}

/**
 * Update the URL hash
 */
function updateHash() {
    if (comics[currentIndex]) {
        if (isInitialLoad) {
            history.replaceState(null, '', `#comic-${comics[currentIndex].id}`);
        } else {
            window.location.hash = `comic-${comics[currentIndex].id}`;
        }
    }
}

/**
 * Get panel URLs for a comic
 */
function getPanelUrls(comic) {
    if (comic.panels && comic.panels.length > 0) {
        return comic.panels;
    }
    if (comic.coverUrl) {
        return [comic.coverUrl];
    }
    if (comic.filename) {
        return [`comics/${comic.filename}`];
    }
    return ['placeholder.svg'];
}

/**
 * Display the current comic with all panels visible
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

    // Build all panels
    const panels = getPanelUrls(comic);
    comicPanels.innerHTML = '';

    // Set layout class based on panel count
    comicPanels.className = 'comic-panels panels-' + panels.length;

    panels.forEach((url, i) => {
        const img = document.createElement('img');
        img.src = url;
        img.alt = `${comic.title} - Panel ${i + 1}`;
        img.className = 'panel-img';
        img.onerror = function() { this.src = 'placeholder.svg'; };
        comicPanels.appendChild(img);
    });

    currentIndexSpan.textContent = currentIndex + 1;

    // Update comic navigation button states
    btnFirst.disabled = currentIndex === 0;
    btnPrev.disabled = currentIndex === 0;
    btnNext.disabled = currentIndex === comics.length - 1;
    btnLast.disabled = currentIndex === comics.length - 1;

    // Update hash
    updateHash();
}

/**
 * Show placeholder when no comics available
 */
function showPlaceholder() {
    comicTitle.textContent = 'No comics available';
    comicDate.textContent = '-';
    comicDescription.textContent = 'Comics are coming soon!';
    comicPanels.innerHTML = '<img src="placeholder.svg" alt="No comic" class="panel-img">';
    comicPanels.className = 'comic-panels panels-1';
    totalCountSpan.textContent = '0';
    currentIndexSpan.textContent = '0';
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
        img.onerror = function() { this.src = 'placeholder.svg'; };

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
 * Populate the latest comics banner (3 most recent)
 */
function populateBanner() {
    const bannerCards = document.getElementById('latest-banner-cards');
    if (!bannerCards || comics.length === 0) return;

    bannerCards.innerHTML = '';

    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const latest = comics.slice(-3);

    latest.forEach(comic => {
        const d = new Date(comic.date + 'T00:00:00');
        const dayName = days[d.getDay()];
        const monthDay = (d.getMonth() + 1) + '/' + d.getDate();

        const card = document.createElement('a');
        card.href = '#comic-' + comic.id;
        card.className = 'latest-banner-card';
        card.onclick = function(e) {
            e.preventDefault();
            goToComic(comic.id);
        };

        const img = document.createElement('img');
        img.src = comic.coverUrl || (comic.panels && comic.panels[0]) || 'placeholder.svg';
        img.alt = comic.title;
        img.loading = 'eager';

        const dateOverlay = document.createElement('div');
        dateOverlay.className = 'latest-banner-date';
        dateOverlay.innerHTML = '<span class="latest-banner-day">' + dayName + '</span>' +
            '<span class="latest-banner-monthday">' + monthDay + '</span>';

        const titleOverlay = document.createElement('div');
        titleOverlay.className = 'latest-banner-title';
        titleOverlay.textContent = comic.title;

        card.appendChild(img);
        card.appendChild(dateOverlay);
        card.appendChild(titleOverlay);

        bannerCards.appendChild(card);
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

    // Handle hash changes (back/forward buttons)
    window.addEventListener('hashchange', () => {
        loadFromHash();
        updateDisplay();
        scrollToComic();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { goToPrev(); }
        if (e.key === 'ArrowRight') { goToNext(); }
    });
}

/**
 * Initialize the app
 */
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadComics();
});
