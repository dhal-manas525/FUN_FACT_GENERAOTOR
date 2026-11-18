/**
 * FACTVERSE - Discover Something Amazing!
 * Modern Frontend Interaction Controller
 * Pure Vanilla JavaScript (ES6+)
 */

// ============================================================================
// 1. APPLICATION STATE MANAGEMENT
// ============================================================================
const AppState = {
    currentFact: null,
    dailyFact: null,
    activeCategory: 'all',
    categories: [],
    favorites: [],
    seenFactIds: new Set(),
    quizState: {
        currentQuestion: null,
        score: 0,
        streak: 0,
        answered: false
    },
    explore: {
        page: 1,
        limit: 12,
        totalPages: 1,
        searchQuery: '',
        selectedCategory: 'all',
        sortBy: 'newest',
        isLoading: false,
        hasMore: true
    },
    discoveriesCount: 0,
    theme: 'dark',
    speechSynth: window.speechSynthesis || null,
    speechUtterance: null
};

// Knowledge Levels Configuration
const KNOWLEDGE_LEVELS = [
    { threshold: 0, title: "Curious Novice", nextThreshold: 5, icon: "fas fa-seedling" },
    { threshold: 5, title: "Fact Seeker", nextThreshold: 15, icon: "fas fa-compass" },
    { threshold: 15, title: "Cosmic Explorer", nextThreshold: 30, icon: "fas fa-rocket" },
    { threshold: 30, title: "Knowledge Scholar", nextThreshold: 50, icon: "fas fa-book-open" },
    { threshold: 50, title: "Wisdom Sage", nextThreshold: 80, icon: "fas fa-scroll" },
    { threshold: 80, title: "FactVerse Master", nextThreshold: 120, icon: "fas fa-crown" },
    { threshold: 120, title: "Universal Fact Guru", nextThreshold: null, icon: "fas fa-atom" }
];

// Category Theme Colors & Icons Mapping
const CATEGORY_MAP = {
    "Science": { icon: "fas fa-atom", color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.15)" },
    "Space": { icon: "fas fa-rocket", color: "#3B82F6", bg: "rgba(59, 130, 246, 0.15)" },
    "Technology": { icon: "fas fa-laptop-code", color: "#22D3EE", bg: "rgba(34, 211, 238, 0.15)" },
    "Animals": { icon: "fas fa-paw", color: "#10B981", bg: "rgba(16, 185, 129, 0.15)" },
    "Human Body": { icon: "fas fa-brain", color: "#EC4899", bg: "rgba(236, 72, 153, 0.15)" },
    "History": { icon: "fas fa-landmark", color: "#F59E0B", bg: "rgba(245, 158, 11, 0.15)" },
    "Geography": { icon: "fas fa-globe-americas", color: "#06B6D4", bg: "rgba(6, 182, 212, 0.15)" },
    "Nature": { icon: "fas fa-seedling", color: "#84CC16", bg: "rgba(132, 204, 22, 0.15)" },
    "Food": { icon: "fas fa-pizza-slice", color: "#F97316", bg: "rgba(249, 115, 22, 0.15)" },
    "Psychology": { icon: "fas fa-puzzle-piece", color: "#A855F7", bg: "rgba(168, 85, 247, 0.15)" },
    "Sports": { icon: "fas fa-futbol", color: "#EF4444", bg: "rgba(239, 68, 68, 0.15)" },
    "General Knowledge": { icon: "fas fa-lightbulb", color: "#EAB308", bg: "rgba(234, 179, 8, 0.15)" }
};

// ============================================================================
// 2. DOM ELEMENT REFERENCES
// ============================================================================
const DOM = {
    // Nav & Theme
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    themeIcon: document.getElementById('themeIcon'),
    hamburgerBtn: document.getElementById('hamburgerBtn'),
    navMenu: document.getElementById('navMenu'),
    mobileNavOverlay: document.getElementById('mobileNavOverlay'),
    navFavCounter: document.getElementById('navFavCounter'),
    shortcutHelpBtn: document.getElementById('shortcutHelpBtn'),

    // Hero Section
    heroStreakBadge: document.getElementById('heroStreakBadge'),
    streakCountText: document.getElementById('streakCountText'),
    heroLevelBadge: document.getElementById('heroLevelBadge'),
    knowledgeLevelTitle: document.getElementById('knowledgeLevelTitle'),
    knowledgeProgressStats: document.getElementById('knowledgeProgressStats'),
    knowledgeProgressFill: document.getElementById('knowledgeProgressFill'),
    heroGenFactBtn: document.getElementById('heroGenFactBtn'),
    heroSurpriseBtn: document.getElementById('heroSurpriseBtn'),
    heroStatFacts: document.getElementById('heroStatFacts'),
    heroStatCategories: document.getElementById('heroStatCategories'),
    heroStatDiscoveries: document.getElementById('heroStatDiscoveries'),

    // Fact Generator
    categoryPillsWrapper: document.getElementById('categoryPillsWrapper'),
    mainFactCard: document.getElementById('mainFactCard'),
    cardCategoryBadge: document.getElementById('cardCategoryBadge'),
    cardCategoryIcon: document.getElementById('cardCategoryIcon'),
    cardCategoryName: document.getElementById('cardCategoryName'),
    cardFactId: document.getElementById('cardFactId'),
    cardFactText: document.getElementById('cardFactText'),
    cardLoadingOverlay: document.getElementById('cardLoadingOverlay'),
    ttsBtn: document.getElementById('ttsBtn'),
    ttsIcon: document.getElementById('ttsIcon'),
    likeFactBtn: document.getElementById('likeFactBtn'),
    likeIcon: document.getElementById('likeIcon'),
    likeBtnLabel: document.getElementById('likeBtnLabel'),
    copyFactBtn: document.getElementById('copyFactBtn'),
    shareFactBtn: document.getElementById('shareFactBtn'),
    generateNextFactBtn: document.getElementById('generateNextFactBtn'),
    cardSurpriseBtn: document.getElementById('cardSurpriseBtn'),

    // Categories
    categoriesGrid: document.getElementById('categoriesGrid'),

    // Daily Fact
    dailyDateFormatted: document.getElementById('dailyDateFormatted'),
    dailyCountdown: document.getElementById('dailyCountdown'),
    countdownH: document.getElementById('countdownH'),
    countdownM: document.getElementById('countdownM'),
    countdownS: document.getElementById('countdownS'),
    dailyCategoryBadge: document.getElementById('dailyCategoryBadge'),
    dailyCatIcon: document.getElementById('dailyCatIcon'),
    dailyCategoryText: document.getElementById('dailyCategoryText'),
    dailyFactText: document.getElementById('dailyFactText'),
    dailyLikeBtn: document.getElementById('dailyLikeBtn'),
    dailyLikeIcon: document.getElementById('dailyLikeIcon'),
    dailyCopyBtn: document.getElementById('dailyCopyBtn'),
    dailyShareBtn: document.getElementById('dailyShareBtn'),
    dailyTtsBtn: document.getElementById('dailyTtsBtn'),

    // Quiz Section
    quizCard: document.getElementById('quizCard'),
    quizCategoryTag: document.getElementById('quizCategoryTag'),
    quizCategoryName: document.getElementById('quizCategoryName'),
    quizScoreVal: document.getElementById('quizScoreVal'),
    quizStreakVal: document.getElementById('quizStreakVal'),
    quizQuestionText: document.getElementById('quizQuestionText'),
    quizOptionsGrid: document.getElementById('quizOptionsGrid'),
    quizExplanationBox: document.getElementById('quizExplanationBox'),
    explanationTitle: document.getElementById('explanationTitle'),
    explanationText: document.getElementById('explanationText'),
    quizHintText: document.getElementById('quizHintText'),
    quizNextBtn: document.getElementById('quizNextBtn'),

    // Explore Section
    exploreSearchInput: document.getElementById('exploreSearchInput'),
    searchClearBtn: document.getElementById('searchClearBtn'),
    exploreCategorySelect: document.getElementById('exploreCategorySelect'),
    exploreSortSelect: document.getElementById('exploreSortSelect'),
    resultsCountText: document.getElementById('resultsCountText'),
    activeFilterBadge: document.getElementById('activeFilterBadge'),
    exploreFactsGrid: document.getElementById('exploreFactsGrid'),
    loadMoreContainer: document.getElementById('loadMoreContainer'),
    loadMoreBtn: document.getElementById('loadMoreBtn'),
    paginationInfo: document.getElementById('paginationInfo'),

    // Favorites Section
    favFilterBar: document.getElementById('favFilterBar'),
    favTotalCountPill: document.getElementById('favTotalCountPill'),
    favoritesGrid: document.getElementById('favoritesGrid'),
    favoritesEmptyState: document.getElementById('favoritesEmptyState'),

    // Statistics Section
    statTotalFacts: document.getElementById('statTotalFacts'),
    statTotalCategories: document.getElementById('statTotalCategories'),
    statTotalFavorites: document.getElementById('statTotalFavorites'),
    statTotalDiscoveries: document.getElementById('statTotalDiscoveries'),

    // Modals & Toasts
    shareModal: document.getElementById('shareModal'),
    closeShareModalBtn: document.getElementById('closeShareModalBtn'),
    sharePreviewCategory: document.getElementById('sharePreviewCategory'),
    sharePreviewText: document.getElementById('sharePreviewText'),
    shareLinkInput: document.getElementById('shareLinkInput'),
    shareCopyLinkBtn: document.getElementById('shareCopyLinkBtn'),
    shareTwitterBtn: document.getElementById('shareTwitterBtn'),
    shareWhatsappBtn: document.getElementById('shareWhatsappBtn'),
    shareTelegramBtn: document.getElementById('shareTelegramBtn'),
    shareLinkedinBtn: document.getElementById('shareLinkedinBtn'),

    shortcutsModal: document.getElementById('shortcutsModal'),
    closeShortcutsModalBtn: document.getElementById('closeShortcutsModalBtn'),
    toastContainer: document.getElementById('toastContainer'),
    backToTopBtn: document.getElementById('backToTopBtn')
};


// ============================================================================
// 3. INITIALIZATION & LIFECYCLE
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initDailyStreak();
    loadCategories();
    loadFavorites();
    loadStatistics();
    generateRandomFact();
    getDailyFact();
    loadQuizQuestion();
    initExplore();
    initEventListeners();
    initDailyCountdown();
});


// ============================================================================
// 4. THEME CONTROLLER (Dark / Light Mode)
// ============================================================================
function initTheme() {
    const savedTheme = localStorage.getItem('factverse_theme') || 'dark';
    setTheme(savedTheme);
}

function setTheme(theme) {
    AppState.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('factverse_theme', theme);

    if (DOM.themeIcon) {
        if (theme === 'light') {
            DOM.themeIcon.className = 'fas fa-sun';
            DOM.themeToggleBtn.setAttribute('title', 'Switch to Dark Mode');
        } else {
            DOM.themeIcon.className = 'fas fa-moon';
            DOM.themeToggleBtn.setAttribute('title', 'Switch to Light Mode');
        }
    }
}

function toggleTheme() {
    const nextTheme = AppState.theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    showToast(`Switched to ${nextTheme === 'light' ? 'Light' : 'Dark'} mode`, 'info', 'fas fa-circle-half-stroke');
}


// ============================================================================
// 5. DAILY DISCOVERY STREAK & KNOWLEDGE LEVEL
// ============================================================================
function initDailyStreak() {
    const streakData = JSON.parse(localStorage.getItem('factverse_streak') || '{}');
    const todayStr = new Date().toISOString().split('T')[0];

    let currentStreak = streakData.streak || 1;
    const lastDiscoveryDate = streakData.lastDate;

    if (lastDiscoveryDate) {
        const lastDate = new Date(lastDiscoveryDate);
        const today = new Date(todayStr);
        const diffTime = Math.abs(today - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            // Consecutive day!
            currentStreak += 1;
            streakData.streak = currentStreak;
            streakData.lastDate = todayStr;
            localStorage.setItem('factverse_streak', JSON.stringify(streakData));
        } else if (diffDays > 1) {
            // Streak broken, reset to 1
            currentStreak = 1;
            streakData.streak = 1;
            streakData.lastDate = todayStr;
            localStorage.setItem('factverse_streak', JSON.stringify(streakData));
        }
    } else {
        streakData.streak = 1;
        streakData.lastDate = todayStr;
        localStorage.setItem('factverse_streak', JSON.stringify(streakData));
    }

    if (DOM.streakCountText) {
        DOM.streakCountText.textContent = `${currentStreak}-Day Streak!`;
    }
}

function updateKnowledgeLevel(discoveriesCount) {
    AppState.discoveriesCount = discoveriesCount;

    let activeLevel = KNOWLEDGE_LEVELS[0];
    for (let i = KNOWLEDGE_LEVELS.length - 1; i >= 0; i--) {
        if (discoveriesCount >= KNOWLEDGE_LEVELS[i].threshold) {
            activeLevel = KNOWLEDGE_LEVELS[i];
            break;
        }
    }

    if (DOM.knowledgeLevelTitle) {
        DOM.knowledgeLevelTitle.textContent = activeLevel.title;
    }

    if (activeLevel.nextThreshold) {
        const span = activeLevel.nextThreshold - activeLevel.threshold;
        const progress = discoveriesCount - activeLevel.threshold;
        const pct = Math.min(100, Math.max(0, Math.round((progress / span) * 100)));

        if (DOM.knowledgeProgressFill) DOM.knowledgeProgressFill.style.width = `${pct}%`;
        if (DOM.knowledgeProgressStats) {
            DOM.knowledgeProgressStats.textContent = `${discoveriesCount} / ${activeLevel.nextThreshold} Discoveries to Rank Up`;
        }
    } else {
        if (DOM.knowledgeProgressFill) DOM.knowledgeProgressFill.style.width = '100%';
        if (DOM.knowledgeProgressStats) {
            DOM.knowledgeProgressStats.textContent = `Maximum Rank Achieved (${discoveriesCount} Discoveries)`;
        }
    }
}


// ============================================================================
// 6. MAIN FACT GENERATION (Zero Reload & Non-Repetitive)
// ============================================================================
async function generateRandomFact(category = null) {
    if (category) {
        AppState.activeCategory = category;
    }

    showCardLoading(true);

    try {
        const catParam = AppState.activeCategory !== 'all' ? `category=${encodeURIComponent(AppState.activeCategory)}` : '';
        const excludeList = Array.from(AppState.seenFactIds).slice(-40).join(',');
        const excludeParam = excludeList ? `exclude=${excludeList}` : '';

        const queryParams = [catParam, excludeParam].filter(Boolean).join('&');
        const url = `/api/facts/random${queryParams ? '?' + queryParams : ''}`;

        const res = await fetch(url);
        const data = await res.json();

        if (data.success && data.data) {
            const fact = data.data;

            // Track seen to avoid immediate repetition
            AppState.seenFactIds.add(fact.id);
            renderMainFactCard(fact);

            // Record discovery in backend
            recordDiscovery(fact.id);
        } else {
            // In case exclusions exhausted the category, clear seen list and retry once
            AppState.seenFactIds.clear();
            const fallbackRes = await fetch(`/api/facts/random${catParam ? '?' + catParam : ''}`);
            const fallbackData = await fallbackRes.json();
            if (fallbackData.success && fallbackData.data) {
                renderMainFactCard(fallbackData.data);
                recordDiscovery(fallbackData.data.id);
            }
        }
    } catch (err) {
        console.error('Failed to generate fact:', err);
        showToast('Unable to connect to FactVerse server. Please try again.', 'error', 'fas fa-triangle-exclamation');
    } finally {
        showCardLoading(false);
    }
}

function generateCategoryFact(category) {
    AppState.activeCategory = category;
    updateActiveCategoryPill(category);
    generateRandomFact(category);

    // Smooth scroll to generator
    const genSection = document.getElementById('generator');
    if (genSection) {
        genSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function surpriseMe() {
    if (AppState.categories && AppState.categories.length > 0) {
        const randomCat = AppState.categories[Math.floor(Math.random() * AppState.categories.length)].name;
        showToast(`Surprise category chosen: ${randomCat}! 🎲`, 'milestone', 'fas fa-wand-magic-sparkles');
        generateCategoryFact(randomCat);
    } else {
        generateRandomFact();
    }
}

function renderMainFactCard(fact) {
    AppState.currentFact = fact;
    const meta = CATEGORY_MAP[fact.category] || { icon: "fas fa-tag", color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.15)" };

    // Update Category Badge
    if (DOM.cardCategoryName) DOM.cardCategoryName.textContent = fact.category;
    if (DOM.cardCategoryIcon) DOM.cardCategoryIcon.className = meta.icon;
    if (DOM.cardCategoryBadge) {
        DOM.cardCategoryBadge.style.color = meta.color;
        DOM.cardCategoryBadge.style.borderColor = meta.color;
        DOM.cardCategoryBadge.style.backgroundColor = meta.bg;
    }

    // Update Fact Content
    if (DOM.cardFactId) DOM.cardFactId.textContent = `Fact #${fact.id}`;
    if (DOM.cardFactText) DOM.cardFactText.textContent = fact.fact_text;

    // Update Favorite State
    const isFav = isFactFavorited(fact.id);
    updateLikeButtonUI(isFav);

    // Stop speaking if speech was running
    stopSpeech();

    // Trigger Pop Animation
    if (DOM.mainFactCard) {
        DOM.mainFactCard.classList.remove('card-animated');
        void DOM.mainFactCard.offsetWidth; // Trigger reflow
        DOM.mainFactCard.classList.add('card-animated');
    }
}

function showCardLoading(isLoading) {
    if (DOM.cardLoadingOverlay) {
        if (isLoading) {
            DOM.cardLoadingOverlay.classList.add('active');
        } else {
            DOM.cardLoadingOverlay.classList.remove('active');
        }
    }
}

function updateActiveCategoryPill(categoryName) {
    const pills = document.querySelectorAll('.cat-pill');
    pills.forEach(pill => {
        const pillCat = pill.getAttribute('data-category');
        if (pillCat.toLowerCase() === categoryName.toLowerCase()) {
            pill.classList.add('active');
            pill.setAttribute('aria-selected', 'true');
            pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
            pill.classList.remove('active');
            pill.setAttribute('aria-selected', 'false');
        }
    });
}


// ============================================================================
// 7. FAVORITES CONTROLLER (Add / Remove / Sync)
// ============================================================================
async function loadFavorites(filterCategory = 'all') {
    try {
        const url = filterCategory !== 'all' ? `/api/favorites?category=${encodeURIComponent(filterCategory)}` : '/api/favorites';
        const res = await fetch(url);
        const data = await res.json();

        if (data.success) {
            AppState.favorites = data.data;
            renderFavoritesGrid(AppState.favorites);
            updateNavFavoritesBadge();

            // Sync current fact like button state
            if (AppState.currentFact) {
                updateLikeButtonUI(isFactFavorited(AppState.currentFact.id));
            }
            if (AppState.dailyFact) {
                updateDailyLikeButtonUI(isFactFavorited(AppState.dailyFact.id));
            }
        }
    } catch (err) {
        console.error('Failed to load favorites:', err);
    }
}

function isFactFavorited(factId) {
    return AppState.favorites.some(fav => fav.id === factId);
}

async function addFavorite(factId) {
    try {
        const res = await fetch('/api/favorites', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fact_id: factId })
        });
        const data = await res.json();

        if (data.success) {
            showToast('Fact added to your personal favorites! ❤️', 'success', 'fas fa-heart');
            await loadFavorites();
            loadStatistics();
        } else {
            showToast(data.error || 'Could not save favorite', 'error', 'fas fa-circle-exclamation');
        }
    } catch (err) {
        console.error('Failed to add favorite:', err);
        showToast('Network error while saving favorite', 'error', 'fas fa-triangle-exclamation');
    }
}

async function removeFavorite(factId) {
    try {
        const res = await fetch(`/api/favorites/${factId}`, {
            method: 'DELETE'
        });
        const data = await res.json();

        if (data.success) {
            showToast('Fact removed from favorites.', 'info', 'fas fa-trash-can');
            await loadFavorites();
            loadStatistics();
        } else {
            showToast(data.error || 'Could not remove favorite', 'error', 'fas fa-circle-exclamation');
        }
    } catch (err) {
        console.error('Failed to remove favorite:', err);
    }
}

async function toggleCurrentFactFavorite() {
    if (!AppState.currentFact) return;
    const factId = AppState.currentFact.id;

    if (isFactFavorited(factId)) {
        await removeFavorite(factId);
    } else {
        await addFavorite(factId);
    }
}

function updateLikeButtonUI(isFavorited) {
    if (DOM.likeFactBtn && DOM.likeIcon && DOM.likeBtnLabel) {
        if (isFavorited) {
            DOM.likeFactBtn.classList.add('favorited');
            DOM.likeIcon.className = 'fas fa-heart text-danger';
            DOM.likeBtnLabel.textContent = 'Favorited';
        } else {
            DOM.likeFactBtn.classList.remove('favorited');
            DOM.likeIcon.className = 'far fa-heart';
            DOM.likeBtnLabel.textContent = 'Like';
        }
    }
}

function updateDailyLikeButtonUI(isFavorited) {
    if (DOM.dailyLikeBtn && DOM.dailyLikeIcon) {
        if (isFavorited) {
            DOM.dailyLikeBtn.classList.add('favorited');
            DOM.dailyLikeIcon.className = 'fas fa-heart text-danger';
            DOM.dailyLikeBtn.innerHTML = '<i class="fas fa-heart text-danger"></i> Favorited';
        } else {
            DOM.dailyLikeBtn.classList.remove('favorited');
            DOM.dailyLikeIcon.className = 'far fa-heart';
            DOM.dailyLikeBtn.innerHTML = '<i class="far fa-heart"></i> Like';
        }
    }
}

function updateNavFavoritesBadge() {
    const count = AppState.favorites.length;
    if (DOM.navFavCounter) DOM.navFavCounter.textContent = count;
    if (DOM.favTotalCountPill) DOM.favTotalCountPill.textContent = count;
}

function renderFavoritesGrid(favoritesList) {
    if (!DOM.favoritesGrid) return;
    DOM.favoritesGrid.innerHTML = '';

    if (!favoritesList || favoritesList.length === 0) {
        if (DOM.favoritesEmptyState) DOM.favoritesEmptyState.style.display = 'block';
        return;
    }

    if (DOM.favoritesEmptyState) DOM.favoritesEmptyState.style.display = 'none';

    favoritesList.forEach(fact => {
        const meta = CATEGORY_MAP[fact.category] || { icon: "fas fa-tag", color: "#8B5CF6" };

        const card = document.createElement('div');
        card.className = 'favorite-card glass-card';
        card.innerHTML = `
            <div class="explore-card-top">
                <span class="explore-cat-pill" style="color: ${meta.color}; border-color: ${meta.color}">
                    <i class="${meta.icon}"></i> ${fact.category}
                </span>
                <span class="explore-fact-id">#${fact.id}</span>
            </div>
            <p class="explore-fact-text">"${fact.fact_text}"</p>
            <div class="explore-card-actions">
                <button type="button" class="btn-card-mini" title="Listen" onclick="speakText('${escapeSingleQuotes(fact.fact_text)}')">
                    <i class="fas fa-volume-high"></i>
                </button>
                <button type="button" class="btn-card-mini" title="Copy" onclick="copyFactText('${escapeSingleQuotes(fact.fact_text)}')">
                    <i class="far fa-copy"></i>
                </button>
                <button type="button" class="btn-card-mini" title="Share" onclick="openShareModal('${escapeSingleQuotes(fact.fact_text)}', '${fact.category}')">
                    <i class="fas fa-share-nodes"></i>
                </button>
                <button type="button" class="btn-card-mini text-danger" title="Remove from favorites" onclick="removeFavorite(${fact.id})">
                    <i class="fas fa-trash-can"></i>
                </button>
            </div>
        `;
        DOM.favoritesGrid.appendChild(card);
    });
}


// ============================================================================
// 8. CATEGORIES LOADER & QUICK PILLS
// ============================================================================
async function loadCategories() {
    try {
        const res = await fetch('/api/categories');
        const data = await res.json();

        if (data.success && data.data) {
            AppState.categories = data.data;
            renderCategoriesGrid(AppState.categories);
            renderCategoryPills(AppState.categories);
            populateExploreCategorySelect(AppState.categories);
            renderFavoritesCategoryPills(AppState.categories);
        }
    } catch (err) {
        console.error('Failed to load categories:', err);
    }
}

function renderCategoryPills(categories) {
    if (!DOM.categoryPillsWrapper) return;

    // Start with "All Categories" pill
    DOM.categoryPillsWrapper.innerHTML = `
        <button type="button" class="cat-pill ${AppState.activeCategory === 'all' ? 'active' : ''}" data-category="all" role="tab" aria-selected="${AppState.activeCategory === 'all'}">
            <i class="fas fa-asterisk"></i> All Categories
        </button>
    `;

    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `cat-pill ${AppState.activeCategory.toLowerCase() === cat.name.toLowerCase() ? 'active' : ''}`;
        btn.setAttribute('data-category', cat.name);
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-selected', AppState.activeCategory.toLowerCase() === cat.name.toLowerCase());
        btn.innerHTML = `<i class="${cat.icon}"></i> ${cat.name}`;

        btn.addEventListener('click', () => {
            updateActiveCategoryPill(cat.name);
            AppState.activeCategory = cat.name;
            generateRandomFact(cat.name);
        });

        DOM.categoryPillsWrapper.appendChild(btn);
    });

    // Add click event to "All" pill
    const allPill = DOM.categoryPillsWrapper.querySelector('[data-category="all"]');
    if (allPill) {
        allPill.addEventListener('click', () => {
            updateActiveCategoryPill('all');
            AppState.activeCategory = 'all';
            generateRandomFact('all');
        });
    }
}

function renderCategoriesGrid(categories) {
    if (!DOM.categoriesGrid) return;
    DOM.categoriesGrid.innerHTML = '';

    categories.forEach(cat => {
        const card = document.createElement('div');
        card.className = 'category-card';
        card.style.setProperty('--cat-accent', cat.color);
        card.style.setProperty('--cat-bg', cat.badge_bg);

        card.innerHTML = `
            <div class="cat-top">
                <div class="cat-icon-wrap">
                    <i class="${cat.icon}"></i>
                </div>
                <span class="cat-count-badge">${cat.count} Facts</span>
            </div>
            <div>
                <h3 class="cat-name">${cat.name} ${cat.emoji}</h3>
                <p class="cat-desc">${cat.description}</p>
            </div>
            <div class="cat-footer">
                <span>Explore Category</span>
                <i class="fas fa-arrow-right"></i>
            </div>
        `;

        card.addEventListener('click', () => {
            generateCategoryFact(cat.name);
        });

        DOM.categoriesGrid.appendChild(card);
    });
}

function renderFavoritesCategoryPills(categories) {
    if (!DOM.favFilterBar) return;
    DOM.favFilterBar.innerHTML = `
        <button type="button" class="fav-filter-pill active" data-cat="all">
            All Saved (<span id="favTotalCountPill">${AppState.favorites.length}</span>)
        </button>
    `;

    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'fav-filter-pill';
        btn.setAttribute('data-cat', cat.name);
        btn.textContent = cat.name;

        btn.addEventListener('click', () => {
            document.querySelectorAll('.fav-filter-pill').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadFavorites(cat.name);
        });

        DOM.favFilterBar.appendChild(btn);
    });

    const allBtn = DOM.favFilterBar.querySelector('[data-cat="all"]');
    if (allBtn) {
        allBtn.addEventListener('click', () => {
            document.querySelectorAll('.fav-filter-pill').forEach(b => b.classList.remove('active'));
            allBtn.classList.add('active');
            loadFavorites('all');
        });
    }
}


// ============================================================================
// 9. DAILY FACT SECTION & COUNTDOWN TIMER
// ============================================================================
async function getDailyFact() {
    try {
        const res = await fetch('/api/facts/daily');
        const data = await res.json();

        if (data.success && data.data) {
            AppState.dailyFact = data.data;
            renderDailyFact(data.data);
        }
    } catch (err) {
        console.error('Failed to get daily fact:', err);
    }
}

function renderDailyFact(fact) {
    if (DOM.dailyFactText) DOM.dailyFactText.textContent = fact.fact_text;
    if (DOM.dailyCategoryText) DOM.dailyCategoryText.textContent = fact.category;

    const meta = CATEGORY_MAP[fact.category] || { icon: "fas fa-atom" };
    if (DOM.dailyCatIcon) DOM.dailyCatIcon.className = meta.icon;

    if (DOM.dailyDateFormatted && fact.date) {
        const d = new Date(fact.date + 'T00:00:00');
        const options = { month: 'long', day: 'numeric', year: 'numeric' };
        DOM.dailyDateFormatted.textContent = d.toLocaleDateString('en-US', options);
    }

    updateDailyLikeButtonUI(isFactFavorited(fact.id));
}

function initDailyCountdown() {
    function updateCountdown() {
        const now = new Date();
        const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const diffMs = tomorrow - now;

        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        if (DOM.countdownH) DOM.countdownH.textContent = String(hours).padStart(2, '0');
        if (DOM.countdownM) DOM.countdownM.textContent = String(minutes).padStart(2, '0');
        if (DOM.countdownS) DOM.countdownS.textContent = String(seconds).padStart(2, '0');
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}


// ============================================================================
// 10. FACT QUIZ MODE CONTROLLER
// ============================================================================
async function loadQuizQuestion() {
    AppState.quizState.answered = false;

    if (DOM.quizExplanationBox) DOM.quizExplanationBox.style.display = 'none';
    if (DOM.quizNextBtn) DOM.quizNextBtn.style.display = 'none';
    if (DOM.quizHintText) {
        DOM.quizHintText.style.display = 'inline-block';
        DOM.quizHintText.innerHTML = '<i class="fas fa-hand-pointer"></i> Select an option to see the truth!';
    }

    try {
        const res = await fetch('/api/quiz');
        const data = await res.json();

        if (data.success && data.data) {
            AppState.quizState.currentQuestion = data.data;
            renderQuizCard(data.data);
        }
    } catch (err) {
        console.error('Failed to load quiz question:', err);
    }
}

function renderQuizCard(question) {
    if (DOM.quizQuestionText) DOM.quizQuestionText.textContent = question.question;
    if (DOM.quizCategoryName) DOM.quizCategoryName.textContent = question.category || 'Trivia';

    if (DOM.quizOptionsGrid) {
        DOM.quizOptionsGrid.innerHTML = '';
        question.options.forEach((optText, index) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'quiz-option-btn';
            btn.innerHTML = `
                <span>${optText}</span>
                <i class="far fa-circle" id="quizCheckIcon_${index}"></i>
            `;
            btn.addEventListener('click', () => handleQuizAnswer(index, btn));
            DOM.quizOptionsGrid.appendChild(btn);
        });
    }
}

function handleQuizAnswer(selectedIndex, clickedBtn) {
    if (AppState.quizState.answered) return;
    AppState.quizState.answered = true;

    const q = AppState.quizState.currentQuestion;
    const isCorrect = selectedIndex === q.correct_index;

    const optionButtons = DOM.quizOptionsGrid.querySelectorAll('.quiz-option-btn');
    optionButtons.forEach((btn, idx) => {
        btn.disabled = true;
        const icon = btn.querySelector('i');

        if (idx === q.correct_index) {
            btn.classList.add('correct');
            if (icon) icon.className = 'fas fa-circle-check';
        } else if (idx === selectedIndex && !isCorrect) {
            btn.classList.add('incorrect');
            if (icon) icon.className = 'fas fa-circle-xmark';
        }
    });

    if (isCorrect) {
        AppState.quizState.score += 10;
        AppState.quizState.streak += 1;
        showToast('Spot on! You nailed the truth! 🎯', 'success', 'fas fa-award');

        if (DOM.explanationTitle) {
            DOM.explanationTitle.className = 'explanation-title correct';
            DOM.explanationTitle.innerHTML = '<i class="fas fa-circle-check"></i> Correct!';
        }
    } else {
        AppState.quizState.streak = 0;
        showToast('Not quite! But now you learned something new! 💡', 'info', 'fas fa-lightbulb');

        if (DOM.explanationTitle) {
            DOM.explanationTitle.className = 'explanation-title wrong';
            DOM.explanationTitle.innerHTML = '<i class="fas fa-circle-xmark"></i> Incorrect';
        }
    }

    if (DOM.quizScoreVal) DOM.quizScoreVal.textContent = AppState.quizState.score;
    if (DOM.quizStreakVal) DOM.quizStreakVal.textContent = AppState.quizState.streak;

    if (DOM.explanationText) DOM.explanationText.textContent = q.explanation;
    if (DOM.quizExplanationBox) DOM.quizExplanationBox.style.display = 'block';
    if (DOM.quizNextBtn) DOM.quizNextBtn.style.display = 'inline-flex';
    if (DOM.quizHintText) DOM.quizHintText.style.display = 'none';
}


// ============================================================================
// 11. EXPLORE FACTS (Search, Filter, Pagination)
// ============================================================================
function initExplore() {
    let debounceTimer = null;

    if (DOM.exploreSearchInput) {
        DOM.exploreSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (DOM.searchClearBtn) DOM.searchClearBtn.style.display = query ? 'block' : 'none';

            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                AppState.explore.searchQuery = query;
                AppState.explore.page = 1;
                loadExploreFacts(true);
            }, 300);
        });
    }

    if (DOM.searchClearBtn) {
        DOM.searchClearBtn.addEventListener('click', () => {
            DOM.exploreSearchInput.value = '';
            DOM.searchClearBtn.style.display = 'none';
            AppState.explore.searchQuery = '';
            AppState.explore.page = 1;
            loadExploreFacts(true);
        });
    }

    if (DOM.exploreCategorySelect) {
        DOM.exploreCategorySelect.addEventListener('change', (e) => {
            AppState.explore.selectedCategory = e.target.value;
            AppState.explore.page = 1;
            loadExploreFacts(true);
        });
    }

    if (DOM.exploreSortSelect) {
        DOM.exploreSortSelect.addEventListener('change', (e) => {
            AppState.explore.sortBy = e.target.value;
            AppState.explore.page = 1;
            loadExploreFacts(true);
        });
    }

    if (DOM.loadMoreBtn) {
        DOM.loadMoreBtn.addEventListener('click', () => {
            if (AppState.explore.page < AppState.explore.totalPages && !AppState.explore.isLoading) {
                AppState.explore.page += 1;
                loadExploreFacts(false);
            }
        });
    }

    loadExploreFacts(true);
}

function populateExploreCategorySelect(categories) {
    if (!DOM.exploreCategorySelect) return;
    DOM.exploreCategorySelect.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.name;
        opt.textContent = `${cat.name} (${cat.count})`;
        DOM.exploreCategorySelect.appendChild(opt);
    });
}

async function loadExploreFacts(resetGrid = false) {
    if (AppState.explore.isLoading) return;
    AppState.explore.isLoading = true;

    if (resetGrid && DOM.exploreFactsGrid) {
        DOM.exploreFactsGrid.innerHTML = `
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
            <div class="skeleton-card"></div>
        `;
    }

    try {
        const queryParams = new URLSearchParams({
            page: AppState.explore.page,
            limit: AppState.explore.limit,
            sort: AppState.explore.sortBy
        });

        if (AppState.explore.selectedCategory && AppState.explore.selectedCategory !== 'all') {
            queryParams.append('category', AppState.explore.selectedCategory);
        }

        if (AppState.explore.searchQuery) {
            queryParams.append('search', AppState.explore.searchQuery);
        }

        const res = await fetch(`/api/facts?${queryParams.toString()}`);
        const data = await res.json();

        if (data.success) {
            const { facts, pagination } = data;
            AppState.explore.totalPages = pagination.total_pages;

            if (resetGrid && DOM.exploreFactsGrid) {
                DOM.exploreFactsGrid.innerHTML = '';
            }

            renderExploreCards(facts);

            if (DOM.resultsCountText) {
                DOM.resultsCountText.textContent = `Showing ${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total} facts`;
            }

            if (DOM.paginationInfo) {
                DOM.paginationInfo.textContent = `Page ${pagination.page} of ${pagination.total_pages}`;
            }

            if (DOM.loadMoreBtn) {
                DOM.loadMoreBtn.style.display = pagination.has_next ? 'inline-flex' : 'none';
            }
        }
    } catch (err) {
        console.error('Failed to load explore facts:', err);
    } finally {
        AppState.explore.isLoading = false;
    }
}

function renderExploreCards(facts) {
    if (!DOM.exploreFactsGrid) return;

    if (facts.length === 0 && AppState.explore.page === 1) {
        DOM.exploreFactsGrid.innerHTML = `
            <div class="empty-state-box text-center" style="grid-column: 1 / -1;">
                <i class="fas fa-magnifying-glass fa-2x" style="color: var(--accent); margin-bottom: 12px;"></i>
                <h3>No Matching Facts Found</h3>
                <p>Try searching for different keywords or clearing the category filter.</p>
            </div>
        `;
        return;
    }

    facts.forEach(fact => {
        const meta = CATEGORY_MAP[fact.category] || { icon: "fas fa-tag", color: "#8B5CF6" };
        const isFav = isFactFavorited(fact.id);

        const card = document.createElement('div');
        card.className = 'explore-fact-card';
        card.innerHTML = `
            <div class="explore-card-top">
                <span class="explore-cat-pill" style="color: ${meta.color}; border-color: ${meta.color}">
                    <i class="${meta.icon}"></i> ${fact.category}
                </span>
                <span class="explore-fact-id">#${fact.id}</span>
            </div>
            <p class="explore-fact-text">"${fact.fact_text}"</p>
            <div class="explore-card-actions">
                <button type="button" class="btn-card-mini" title="Listen" onclick="speakText('${escapeSingleQuotes(fact.fact_text)}')">
                    <i class="fas fa-volume-high"></i>
                </button>
                <button type="button" class="btn-card-mini ${isFav ? 'favorited' : ''}" title="${isFav ? 'Remove Favorite' : 'Save Favorite'}" id="exploreFavBtn_${fact.id}" onclick="handleExploreFavoriteToggle(${fact.id})">
                    <i class="${isFav ? 'fas fa-heart text-danger' : 'far fa-heart'}"></i>
                </button>
                <button type="button" class="btn-card-mini" title="Copy to clipboard" onclick="copyFactText('${escapeSingleQuotes(fact.fact_text)}')">
                    <i class="far fa-copy"></i>
                </button>
                <button type="button" class="btn-card-mini" title="Share fact" onclick="openShareModal('${escapeSingleQuotes(fact.fact_text)}', '${fact.category}')">
                    <i class="fas fa-share-nodes"></i>
                </button>
            </div>
        `;
        DOM.exploreFactsGrid.appendChild(card);
    });
}

async function handleExploreFavoriteToggle(factId) {
    if (isFactFavorited(factId)) {
        await removeFavorite(factId);
    } else {
        await addFavorite(factId);
    }

    // Update heart icon in explore grid
    const btn = document.getElementById(`exploreFavBtn_${factId}`);
    if (btn) {
        const nowFav = isFactFavorited(factId);
        btn.className = `btn-card-mini ${nowFav ? 'favorited' : ''}`;
        btn.innerHTML = `<i class="${nowFav ? 'fas fa-heart text-danger' : 'far fa-heart'}"></i>`;
    }
}


// ============================================================================
// 12. DYNAMIC APPLICATION STATISTICS
// ============================================================================
async function loadStatistics() {
    try {
        const res = await fetch('/api/stats');
        const data = await res.json();

        if (data.success && data.data) {
            const s = data.data;

            // Animate Numbers
            animateValue(DOM.statTotalFacts, 0, s.total_facts, 1200);
            animateValue(DOM.statTotalCategories, 0, s.total_categories, 1200);
            animateValue(DOM.statTotalFavorites, 0, s.total_favorites, 1200);
            animateValue(DOM.statTotalDiscoveries, 0, s.total_discoveries, 1200);

            // Update Hero Statistics
            if (DOM.heroStatFacts) DOM.heroStatFacts.textContent = `${s.total_facts}+`;
            if (DOM.heroStatCategories) DOM.heroStatCategories.textContent = s.total_categories;
            if (DOM.heroStatDiscoveries) DOM.heroStatDiscoveries.textContent = s.total_discoveries;

            // Update Knowledge Level
            updateKnowledgeLevel(s.total_discoveries);
        }
    } catch (err) {
        console.error('Failed to load statistics:', err);
    }
}

async function recordDiscovery(factId) {
    try {
        const res = await fetch('/api/discoveries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fact_id: factId })
        });
        const data = await res.json();
        if (data.success && data.total_discoveries) {
            updateKnowledgeLevel(data.total_discoveries);
            if (DOM.heroStatDiscoveries) DOM.heroStatDiscoveries.textContent = data.total_discoveries;
            if (DOM.statTotalDiscoveries) DOM.statTotalDiscoveries.textContent = data.total_discoveries;
        }
    } catch (err) {
        // Silently fail for discovery logging
    }
}

function animateValue(elem, start, end, duration) {
    if (!elem) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        elem.textContent = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            elem.textContent = end;
        }
    };
    window.requestAnimationFrame(step);
}


// ============================================================================
// 13. UTILITIES: COPY, SHARE, TTS (SPEECH)
// ============================================================================
function copyFactText(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Fact copied to clipboard! 📋', 'success', 'fas fa-copy');
        }).catch(() => fallbackCopy(text));
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
        showToast('Fact copied to clipboard! 📋', 'success', 'fas fa-copy');
    } catch (err) {
        showToast('Failed to copy fact', 'error', 'fas fa-circle-exclamation');
    }
    document.body.removeChild(textArea);
}

function speakText(text) {
    if (!('speechSynthesis' in window)) {
        showToast('Text-to-Speech is not supported in this browser.', 'warning', 'fas fa-volume-xmark');
        return;
    }

    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        if (DOM.ttsBtn) DOM.ttsBtn.classList.remove('speaking');
        return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
        if (DOM.ttsBtn) DOM.ttsBtn.classList.add('speaking');
    };

    utterance.onend = () => {
        if (DOM.ttsBtn) DOM.ttsBtn.classList.remove('speaking');
    };

    utterance.onerror = () => {
        if (DOM.ttsBtn) DOM.ttsBtn.classList.remove('speaking');
    };

    window.speechSynthesis.speak(utterance);
}

function stopSpeech() {
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        if (DOM.ttsBtn) DOM.ttsBtn.classList.remove('speaking');
    }
}

function openShareModal(factText, categoryName) {
    // If Web Share API is supported on mobile, offer native share
    if (navigator.share && /Android|iPhone|iPad/i.test(navigator.userAgent)) {
        navigator.share({
            title: `FactVerse - ${categoryName} Fact`,
            text: `"${factText}" — via FactVerse! Discover something amazing:`,
            url: window.location.href
        }).catch(() => {
            // Fallback to modal dialog
            displayShareModal(factText, categoryName);
        });
    } else {
        displayShareModal(factText, categoryName);
    }
}

function displayShareModal(factText, categoryName) {
    if (DOM.sharePreviewText) DOM.sharePreviewText.textContent = `"${factText}"`;
    if (DOM.sharePreviewCategory) DOM.sharePreviewCategory.textContent = categoryName;

    const shareUrl = window.location.origin;
    const shareMessage = encodeURIComponent(`"${factText}" — Discover more mind-blowing facts at FACTVERSE: ${shareUrl}`);

    if (DOM.shareLinkInput) DOM.shareLinkInput.value = `${window.location.origin}/?fact=${encodeURIComponent(factText.substring(0, 30))}`;
    if (DOM.shareTwitterBtn) DOM.shareTwitterBtn.href = `https://twitter.com/intent/tweet?text=${shareMessage}`;
    if (DOM.shareWhatsappBtn) DOM.shareWhatsappBtn.href = `https://api.whatsapp.com/send?text=${shareMessage}`;
    if (DOM.shareTelegramBtn) DOM.shareTelegramBtn.href = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('"' + factText + '"')}`;
    if (DOM.shareLinkedinBtn) DOM.shareLinkedinBtn.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

    if (DOM.shareModal) {
        DOM.shareModal.classList.add('active');
        DOM.shareModal.setAttribute('aria-hidden', 'false');
    }
}

function closeShareModal() {
    if (DOM.shareModal) {
        DOM.shareModal.classList.remove('active');
        DOM.shareModal.setAttribute('aria-hidden', 'true');
    }
}

function openShortcutsModal() {
    if (DOM.shortcutsModal) {
        DOM.shortcutsModal.classList.add('active');
        DOM.shortcutsModal.setAttribute('aria-hidden', 'false');
    }
}

function closeShortcutsModal() {
    if (DOM.shortcutsModal) {
        DOM.shortcutsModal.classList.remove('active');
        DOM.shortcutsModal.setAttribute('aria-hidden', 'true');
    }
}

function showToast(message, type = 'info', iconClass = 'fas fa-info-circle') {
    if (!DOM.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="${iconClass}"></i>
        <span>${message}</span>
    `;

    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function escapeSingleQuotes(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

function selectCategoryFromFooter(categoryName) {
    generateCategoryFact(categoryName);
}


// ============================================================================
// 14. EVENT LISTENERS SETUP
// ============================================================================
function initEventListeners() {
    // Theme Switcher
    if (DOM.themeToggleBtn) {
        DOM.themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Keyboard Shortcuts Button
    if (DOM.shortcutHelpBtn) {
        DOM.shortcutHelpBtn.addEventListener('click', openShortcutsModal);
    }
    if (DOM.closeShortcutsModalBtn) {
        DOM.closeShortcutsModalBtn.addEventListener('click', closeShortcutsModal);
    }

    // Hamburger Mobile Navigation
    if (DOM.hamburgerBtn && DOM.navMenu && DOM.mobileNavOverlay) {
        DOM.hamburgerBtn.addEventListener('click', () => {
            const isOpen = DOM.navMenu.classList.toggle('active');
            DOM.mobileNavOverlay.classList.toggle('active');
            DOM.hamburgerBtn.classList.toggle('active');
            DOM.hamburgerBtn.setAttribute('aria-expanded', isOpen);
        });

        DOM.mobileNavOverlay.addEventListener('click', closeMobileNav);

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', closeMobileNav);
        });
    }

    function closeMobileNav() {
        if (DOM.navMenu) DOM.navMenu.classList.remove('active');
        if (DOM.mobileNavOverlay) DOM.mobileNavOverlay.classList.remove('active');
        if (DOM.hamburgerBtn) {
            DOM.hamburgerBtn.classList.remove('active');
            DOM.hamburgerBtn.setAttribute('aria-expanded', 'false');
        }
    }

    // Navbar Scroll Shadow
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (navbar) {
            if (window.scrollY > 40) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });

    // Hero Section Actions
    if (DOM.heroGenFactBtn) {
        DOM.heroGenFactBtn.addEventListener('click', () => {
            const gen = document.getElementById('generator');
            if (gen) gen.scrollIntoView({ behavior: 'smooth', block: 'start' });
            generateRandomFact();
        });
    }

    if (DOM.heroSurpriseBtn) {
        DOM.heroSurpriseBtn.addEventListener('click', surpriseMe);
    }

    // Main Fact Card Controls
    if (DOM.generateNextFactBtn) {
        DOM.generateNextFactBtn.addEventListener('click', () => generateRandomFact());
    }

    if (DOM.cardSurpriseBtn) {
        DOM.cardSurpriseBtn.addEventListener('click', surpriseMe);
    }

    if (DOM.likeFactBtn) {
        DOM.likeFactBtn.addEventListener('click', toggleCurrentFactFavorite);
    }

    if (DOM.copyFactBtn) {
        DOM.copyFactBtn.addEventListener('click', () => {
            if (AppState.currentFact) {
                copyFactText(AppState.currentFact.fact_text);
            }
        });
    }

    if (DOM.shareFactBtn) {
        DOM.shareFactBtn.addEventListener('click', () => {
            if (AppState.currentFact) {
                openShareModal(AppState.currentFact.fact_text, AppState.currentFact.category);
            }
        });
    }

    if (DOM.ttsBtn) {
        DOM.ttsBtn.addEventListener('click', () => {
            if (AppState.currentFact) {
                speakText(AppState.currentFact.fact_text);
            }
        });
    }

    // Daily Fact Controls
    if (DOM.dailyLikeBtn) {
        DOM.dailyLikeBtn.addEventListener('click', async () => {
            if (!AppState.dailyFact) return;
            const factId = AppState.dailyFact.id;
            if (isFactFavorited(factId)) {
                await removeFavorite(factId);
            } else {
                await addFavorite(factId);
            }
            updateDailyLikeButtonUI(isFactFavorited(factId));
        });
    }

    if (DOM.dailyCopyBtn) {
        DOM.dailyCopyBtn.addEventListener('click', () => {
            if (AppState.dailyFact) {
                copyFactText(AppState.dailyFact.fact_text);
            }
        });
    }

    if (DOM.dailyShareBtn) {
        DOM.dailyShareBtn.addEventListener('click', () => {
            if (AppState.dailyFact) {
                openShareModal(AppState.dailyFact.fact_text, AppState.dailyFact.category);
            }
        });
    }

    if (DOM.dailyTtsBtn) {
        DOM.dailyTtsBtn.addEventListener('click', () => {
            if (AppState.dailyFact) {
                speakText(AppState.dailyFact.fact_text);
            }
        });
    }

    // Quiz Controls
    if (DOM.quizNextBtn) {
        DOM.quizNextBtn.addEventListener('click', loadQuizQuestion);
    }

    // Share Modal Controls
    if (DOM.closeShareModalBtn) {
        DOM.closeShareModalBtn.addEventListener('click', closeShareModal);
    }

    if (DOM.shareCopyLinkBtn) {
        DOM.shareCopyLinkBtn.addEventListener('click', () => {
            if (DOM.shareLinkInput) {
                copyFactText(DOM.shareLinkInput.value);
            }
        });
    }

    // Back to top button
    if (DOM.backToTopBtn) {
        DOM.backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Modal background click to close
    window.addEventListener('click', (e) => {
        if (e.target === DOM.shareModal) closeShareModal();
        if (e.target === DOM.shortcutsModal) closeShortcutsModal();
    });

    // Keyboard Shortcuts: Space, S, L, C, V, Escape
    window.addEventListener('keydown', (e) => {
        // Prevent triggering while user is typing in search bar or input field
        const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
            return;
        }

        if (e.code === 'Space') {
            e.preventDefault();
            generateRandomFact();
        } else if (e.key === 's' || e.key === 'S') {
            e.preventDefault();
            surpriseMe();
        } else if (e.key === 'l' || e.key === 'L') {
            e.preventDefault();
            toggleCurrentFactFavorite();
        } else if (e.key === 'c' || e.key === 'C') {
            e.preventDefault();
            if (AppState.currentFact) copyFactText(AppState.currentFact.fact_text);
        } else if (e.key === 'v' || e.key === 'V') {
            e.preventDefault();
            if (AppState.currentFact) speakText(AppState.currentFact.fact_text);
        } else if (e.key === 'Escape') {
            closeShareModal();
            closeShortcutsModal();
            closeMobileNav();
        }
    });
}
