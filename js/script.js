document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const creaturesContainer = document.getElementById('creaturesContainer');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const raceFilter = document.getElementById('raceFilter');
    const sortFilter = document.getElementById('sortFilter');
    const modal = document.getElementById('creatureModal');
    const langEsBtn = document.getElementById('langEs');
    const langEnBtn = document.getElementById('langEn');

    let creaturesData = [];
    let currentLanguage = 'es';

    // Cargar datos del JSON
    fetch('creatures.json')
        .then(response => response.json())
        .then(data => {
            creaturesData = data;
            displayCreatures(data);
            updateLanguageButtons();
        })
        .catch(error => console.error('Error loading creatures data:', error));

    // Mostrar criaturas en la cuadrícula
    function displayCreatures(creatures) {
        creaturesContainer.innerHTML = '';

        creatures.forEach(creature => {
            const creatureCard = document.createElement('div');
            creatureCard.className = 'creature-card';

            const creatureImageName = getCreatureImageName(creature.name);
            const creatureImagePath = `images/creatures/${creatureImageName}`;

            creatureCard.innerHTML = `
                <img src="${creatureImagePath}" alt="${creature.name}" class="creature-image" 
                     onerror="this.src='images/default_creature.gif';this.onerror=null;">
                <h3 class="creature-name">${creature.name}</h3>
                <div class="creature-stats">
                    <span class="creature-stat">❤️ ${creature.health}</span>
                    <span class="creature-stat">⭐ ${creature.experience}</span>
                </div>
                <p class="creature-race">${translations[currentLanguage]['race']} ${creature.race}</p>
            `;

            creatureCard.addEventListener('click', () => openModal(creature));
            creaturesContainer.appendChild(creatureCard);
        });
    }

    // Abrir modal con detalles de la criatura
    function openModal(creature) {
        const modalContent = document.querySelector('.modal-content');
        modalContent.innerHTML = `
            <span class="close">&times;</span>
            <h2 id="modalTitle">${creature.name}</h2>
            <div class="modal-body">
                <div class="modal-left">
                    <p><strong data-i18n="health">Salud:</strong> <span id="modalHealth">${creature.health}</span></p>
                    <p><strong data-i18n="experience">Experiencia:</strong> <span id="modalExp">${creature.experience}</span></p>
                    <p><strong data-i18n="race">Raza:</strong> <span id="modalRace">${creature.race}</span></p>
                    <p><strong data-i18n="speed">Velocidad:</strong> <span id="modalSpeed">${creature.speed_like}</span></p>
                    <p><strong data-i18n="summonable">Invocable:</strong> <span id="modalSummonable">${creature.summonable}</span></p>
                    <p><strong data-i18n="convinceable">Convenceable:</strong> <span id="modalConvinceable">${creature.convinceable}</span></p>
                </div>
                <div class="modal-right">
                    <h3 data-i18n="immunities">Inmunidades:</h3>
                    <ul id="modalImmunities"></ul>
                    <h3 data-i18n="voices">Frases:</h3>
                    <ul id="modalVoices"></ul>
                </div>
            </div>
            <div class="modal-items">
                <h3 data-i18n="droppedItems">Items que suelta:</h3>
                <div class="items-grid" id="modalItems"></div>
            </div>
        `;

        // Agregar imagen de la criatura
        const creatureImageName = getCreatureImageName(creature.name);
        const creatureImage = document.createElement('img');
        creatureImage.src = `images/creatures/${creatureImageName}`;
        creatureImage.alt = creature.name;
        creatureImage.className = 'modal-creature-image';
        creatureImage.onerror = function() {
            this.src = 'images/default_creature.gif';
            this.onerror = null;
        };
        modalContent.insertBefore(creatureImage, document.getElementById('modalTitle'));

        // Mostrar items
        const itemsContainer = document.getElementById('modalItems');
        if (creature.items && creature.items.length > 0) {
            creature.items.forEach(itemUrl => {
                const itemName = getItemImageName(itemUrl);
                const itemImage = document.createElement('img');
                itemImage.src = `images/items/${itemName}`;
                itemImage.alt = itemName.replace('.gif', '');
                itemImage.className = 'modal-item-image';
                itemImage.onerror = function() {
                    this.src = 'images/default_item.gif';
                    this.onerror = null;
                };
                itemsContainer.appendChild(itemImage);
            });
        } else {
            itemsContainer.innerHTML = `<p>${translations[currentLanguage]['noItems']}</p>`;
        }

        // Configurar inmunidades y voces
        setupList('modalImmunities', creature.immunities, 'noImmunities');
        setupList('modalVoices', creature.voices, 'noVoices');

        // Mostrar modal
        modal.style.display = 'block';

        // Configurar evento para cerrar modal
        document.querySelector('.close').addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // Funciones auxiliares
    function getCreatureImageName(creatureName) {
        return creatureName.toLowerCase().replace(/\s+/g, '_') + '.gif';
    }

    function getItemImageName(itemUrl) {
        return decodeURIComponent(itemUrl.split('/').pop());
    }

    function setupList(elementId, items, noItemsTranslationKey) {
        const listElement = document.getElementById(elementId);
        listElement.innerHTML = '';

        if (items && items.length > 0) {
            items.forEach(item => {
                const li = document.createElement('li');
                li.textContent = elementId === 'modalVoices' ? `"${item}"` : item;
                listElement.appendChild(li);
            });
        } else {
            listElement.innerHTML = `<li>${translations[currentLanguage][noItemsTranslationKey]}</li>`;
        }
    }

    // Funcionalidad de búsqueda y filtrado
    function filterCreatures() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedRace = raceFilter.value;
        const sortBy = sortFilter.value;

        let filtered = creaturesData;

        // Filtrar por término de búsqueda
        if (searchTerm) {
            filtered = filtered.filter(creature =>
                creature.name.toLowerCase().includes(searchTerm)
            );
        }

        // Filtrar por raza
        if (selectedRace) {
            filtered = filtered.filter(creature =>
                creature.race === selectedRace
            );
        }

        // Ordenar
        if (sortBy === 'name') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'health') {
            filtered.sort((a, b) => parseInt(b.health) - parseInt(a.health));
        } else if (sortBy === 'experience') {
            filtered.sort((a, b) => parseInt(b.experience) - parseInt(a.experience));
        }

        displayCreatures(filtered);
    }

    // Event listeners para filtros
    searchButton.addEventListener('click', filterCreatures);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') filterCreatures();
    });
    raceFilter.addEventListener('change', filterCreatures);
    sortFilter.addEventListener('change', filterCreatures);

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Manejo de idiomas
    function updateLanguageButtons() {
        langEsBtn.classList.toggle('active', currentLanguage === 'es');
        langEnBtn.classList.toggle('active', currentLanguage === 'en');
    }

    function setLanguage(lang) {
        currentLanguage = lang;
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
        applyTranslations();
        filterCreatures();
    }

    function applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[currentLanguage][key]) {
                element.textContent = translations[currentLanguage][key];
            }
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (translations[currentLanguage][key]) {
                element.setAttribute('placeholder', translations[currentLanguage][key]);
            }
        });
    }

    // Configurar botones de idioma
    langEsBtn.addEventListener('click', () => setLanguage('es'));
    langEnBtn.addEventListener('click', () => setLanguage('en'));

    // Evento para cambios de idioma
    document.addEventListener('languageChanged', (e) => {
        currentLanguage = e.detail;
        updateLanguageButtons();
        applyTranslations();
    });

    // Inicializar
    updateLanguageButtons();
    applyTranslations();
});