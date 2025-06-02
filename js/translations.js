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
        "noVoices": "No habla",
        // Nuevas traducciones para el modal
        "modalHealth": "Salud",
        "modalExp": "Experiencia",
        "modalRace": "Raza",
        "modalSpeed": "Velocidad",
        "modalSummonable": "Invocable",
        "modalConvinceable": "Convenceable",
        "droppedItems": "Items que suelta",
        "noItems": "No suelta items"
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
        "noVoices": "Doesn't speak",
        // New translations for modal
        "modalHealth": "Health",
        "modalExp": "Experience",
        "modalRace": "Race",
        "modalSpeed": "Speed",
        "modalSummonable": "Summonable",
        "modalConvinceable": "Convinceable",
        "droppedItems": "Dropped items",
        "noItems": "No items dropped"
    }
};

let currentLanguage = localStorage.getItem('preferredLanguage') || 'es';

function setLanguage(lang) {
    currentLanguage = lang;
    document.documentElement.lang = lang;
    localStorage.setItem('preferredLanguage', lang);
    applyTranslations();

    // Si el modal está abierto, retraducir su contenido
    const modal = document.getElementById('creatureModal');
    if (modal && modal.style.display === 'block') {
        translateModalContent();
    }
}

function applyTranslations() {
    // Elementos estáticos
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[currentLanguage][key]) {
            element.textContent = translations[currentLanguage][key];
        }
    });

    // Placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[currentLanguage][key]) {
            element.setAttribute('placeholder', translations[currentLanguage][key]);
        }
    });
}

function translateModalContent() {
    // Traducir etiquetas de los campos del modal
    const fields = ['Health', 'Exp', 'Race', 'Speed', 'Summonable', 'Convinceable'];
    fields.forEach(field => {
        const element = document.getElementById(`modal${field}`);
        if (element) {
            const label = element.previousElementSibling;
            if (label && label.tagName === 'STRONG' && translations[currentLanguage][`modal${field}`]) {
                label.textContent = translations[currentLanguage][`modal${field}`] + ":";
            }
        }
    });

    // Traducir secciones del modal
    const sections = ['immunities', 'voices', 'droppedItems'];
    sections.forEach(section => {
        const element = document.querySelector(`[data-i18n="${section}"]`);
        if (element && translations[currentLanguage][section]) {
            element.textContent = translations[currentLanguage][section];
        }
    });

    // Traducir mensaje "no items" si existe
    const noItemsElements = document.querySelectorAll('.modal-items p');
    noItemsElements.forEach(element => {
        if (translations[currentLanguage]['noItems']) {
            element.textContent = translations[currentLanguage]['noItems'];
        }
    });
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    setLanguage(currentLanguage);

    // Escuchar cambios de idioma para retraducir el modal si está abierto
    document.addEventListener('languageChanged', () => {
        const modal = document.getElementById('creatureModal');
        if (modal && modal.style.display === 'block') {
            translateModalContent();
        }
    });
});