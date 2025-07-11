const translations = {
    "es": {
        "title": "Catálogo de Criaturas de Tibia",
        "mainTitle": "Catálogo de Criaturas de Tibia",
        "searchPlaceholder": "Buscar criatura...",
        "searchButton": "Buscar",
        "allRaces": "Todas las razas",
        "sortName": "Ordenar por nombre",
        "sortHealth": "Ordenar por salud",
        "sortExp": "Ordenar por experiencia",
        "details": "Detalles",
        "health": "Salud",
        "experience": "Experiencia",
        "race": "Raza",
        "modalSpeed": "Velocidad:",
        "modalSummonable": "Invocable:",
        "modalConvinceable": "Convenceable:",
        "immunities": "Inmunidades",
        "voices": "Frases",
        "droppedItems": "Items que suelta",
        "dataSource": "Datos obtenidos de loney-online.com",
        "copyright": "© 2023 Catálogo de Criaturas de Tibia - No afiliado a CipSoft",
        "noImmunities": "Ninguna",
        "noVoices": "No habla",
        "noItems": "No suelta items",
        "searchItemPlaceholder": "Buscar ítem...",
        "searchItemButton": "Buscar ítem",
        "creaturesDropping": "Criaturas que dropean:",
        "noCreaturesDropping": "Ninguna criatura dropea este ítem"
    },
    "en": {
        "title": "Tibia Creatures Catalog",
        "mainTitle": "Tibia Creatures Catalog",
        "searchPlaceholder": "Search creature...",
        "searchButton": "Search",
        "allRaces": "All races",
        "sortName": "Sort by name",
        "sortHealth": "Sort by health",
        "sortExp": "Sort by experience",
        "details": "Details",
        "health": "Health",
        "experience": "Experience",
        "race": "Race",
        "modalSpeed": "Speed:",
        "modalSummonable": "Summonable:",
        "modalConvinceable": "Convinceable:",
        "immunities": "Immunities",
        "voices": "Voices",
        "droppedItems": "Dropped items",
        "dataSource": "Data obtained from loney-online.com",
        "copyright": "© 2023 Tibia Creatures Catalog - Not affiliated with CipSoft",
        "noImmunities": "None",
        "noVoices": "Doesn't speak",
        "noItems": "No items dropped",
        "searchItemPlaceholder": "Search item...",
        "searchItemButton": "Search item",
        "creaturesDropping": "Creatures dropping:",
        "noCreaturesDropping": "No creatures drop this item"
    }
};

// Initialize current language from localStorage or default to Spanish
let currentLanguage = localStorage.getItem('preferredLanguage') || 'es';

function setLanguage(lang) {
    currentLanguage = lang;
    document.documentElement.lang = lang;
    localStorage.setItem('preferredLanguage', lang);
    applyTranslations();

    // Dispatch custom event for other scripts to listen to
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
}

function applyTranslations() {
    if (!translations[currentLanguage]) {
        console.warn(`Translations not found for language: ${currentLanguage}`);
        return;
    }

    // Static elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[currentLanguage][key]) {
            element.textContent = translations[currentLanguage][key];
        }
    });

    // Placeholder attributes
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[currentLanguage][key]) {
            element.setAttribute('placeholder', translations[currentLanguage][key]);
        }
    });

    // Select options
    document.querySelectorAll('select option[data-i18n]').forEach(option => {
        const key = option.getAttribute('data-i18n');
        if (translations[currentLanguage][key]) {
            option.textContent = translations[currentLanguage][key];
        }
    });
}

// Initialize translations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { translations, currentLanguage, setLanguage, applyTranslations };
}