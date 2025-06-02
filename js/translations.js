const translations = {
    "es": {
        "title": "Catálogo de Criaturas de Tibia",
        "mainTitle": "Catálogo de Criaturas de Tibia",
        "searchPlaceholder": "Buscar criatura...",
        "searchButton": "Buscar",
        "allRaces": "Todas las razas",
        "sortName": "Ordenar por nombre",
        "sortHealth": "Ordenar por salud (mayor a menor)",
        "sortExp": "Ordenar por experiencia (mayor a menor)",
        "health": "Salud:",
        "experience": "Experiencia:",
        "race": "Raza:",
        "speed": "Velocidad:",
        "summonable": "Invocable:",
        "convinceable": "Convenceable:",
        "immunities": "Inmunidades:",
        "voices": "Frases:",
        "moreDetails": "Ver más detalles",
        "dataSource": "Datos obtenidos de loney-online.com",
        "copyright": "© 2023 Catálogo de Criaturas de Tibia - No afiliado a CipSoft",
        "noImmunities": "Ninguna",
        "noVoices": "No habla"
    },
    "en": {
        "title": "Tibia Creatures Catalog",
        "mainTitle": "Tibia Creatures Catalog",
        "searchPlaceholder": "Search creature...",
        "searchButton": "Search",
        "allRaces": "All races",
        "sortName": "Sort by name",
        "sortHealth": "Sort by health (high to low)",
        "sortExp": "Sort by experience (high to low)",
        "health": "Health:",
        "experience": "Experience:",
        "race": "Race:",
        "speed": "Speed:",
        "summonable": "Summonable:",
        "convinceable": "Convinceable:",
        "immunities": "Immunities:",
        "voices": "Voices:",
        "moreDetails": "See more details",
        "dataSource": "Data obtained from loney-online.com",
        "copyright": "© 2023 Tibia Creatures Catalog - Not affiliated with CipSoft",
        "noImmunities": "None",
        "noVoices": "Doesn't speak"
    }
};

let currentLanguage = localStorage.getItem('preferredLanguage') || 'es';

function setLanguage(lang) {
    currentLanguage = lang;
    document.documentElement.lang = lang;
    localStorage.setItem('preferredLanguage', lang);

    // Traducir elementos con atributo data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });

    // Traducir placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[lang][key]) {
            element.placeholder = translations[lang][key];
        }
    });

    // Disparar evento personalizado para notificar el cambio de idioma
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
}

// Cargar idioma guardado o usar el predeterminado al iniciar
document.addEventListener('DOMContentLoaded', () => {
    setLanguage(currentLanguage);
});