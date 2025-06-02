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
    let currentLanguage = localStorage.getItem('preferredLanguage') || 'es';

    // Cargar datos del JSON
    fetch('creatures.json')
        .then(response => response.json())
        .then(data => {
            creaturesData = data;
            displayCreatures(data);
            updateLanguageButtons();
        })
        .catch(error => console.error('Error loading creatures data:', error));

    // Mostrar criaturas en lista
    function displayCreatures(creatures) {
        creaturesContainer.innerHTML = '';

        creatures.forEach(creature => {
            const creatureRow = document.createElement('div');
            creatureRow.className = 'creature-row';

            const creatureImageName = getCreatureImageName(creature.name);
            const creatureImagePath = `images/creatures/${creatureImageName}`;

            creatureRow.innerHTML = `
            <div class="creature-image-container">
                <img src="${creatureImagePath}" alt="${creature.name}" class="creature-image"
                     onerror="this.src='images/creatures/default_item.png';this.onerror=null;">
            </div>
            <div class="creature-info">
                <h3 class="creature-name">${creature.name}</h3>
                <div class="creature-meta">
                    <span class="creature-race">${creature.race}</span>
                    <div class="creature-stats">
                        <span class="creature-stat">❤️ ${creature.health}</span>
                        <span class="creature-stat">⭐ ${creature.experience}</span>
                    </div>
                </div>
            </div>
        `;

            creatureRow.addEventListener('click', () => openModal(creature));
            creaturesContainer.appendChild(creatureRow);
        });
    }


    // Abrir modal con detalles de la criatura
    function openModal(creature) {
        document.getElementById('modalTitle').textContent = creature.name;
        document.getElementById('modalHealth').textContent = creature.health;
        document.getElementById('modalExp').textContent = creature.experience;
        document.getElementById('modalRace').textContent = creature.race;
        document.getElementById('modalSpeed').textContent = creature.speed_like;
        document.getElementById('modalSummonable').textContent = creature.summonable;
        document.getElementById('modalConvinceable').textContent = creature.convinceable;

        // Configurar imagen de la criatura
        const creatureImageName = getCreatureImageName(creature.name);
        const modalImage = document.querySelector('.modal-creature-image');
        modalImage.src = `images/creatures/${creatureImageName}`;
        modalImage.alt = creature.name;

// Si no encuentra la imagen, usa una por defecto
        modalImage.onerror = function () {
            this.src = 'images/creatures/default_item.png';
            this.onerror = null; // evita bucle si la imagen por defecto tampoco carga
        };

        // Configurar items
        const itemsContainer = document.getElementById('modalItems');
        itemsContainer.innerHTML = '';

        if (creature.items && creature.items.length > 0) {
            creature.items.forEach(itemUrl => {
                const itemName = getItemImageName(itemUrl);
                const itemImage = document.createElement('img');
                itemImage.src = `images/items/${itemName}`;
                itemImage.alt = itemName.replace('.gif', '');
                itemImage.className = 'modal-item-image';
                itemImage.onerror = function() {
                    this.src = 'images/default_item.png';
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

        // Aplicar traducciones
        translateModalContent();

        // Mostrar modal
        modal.style.display = 'block';
    }
    function closeModal() {
        document.getElementById('creatureModal').style.display = 'none';
    }
    // Funciones auxiliares
    function getCreatureImageName(creatureName) {
        return creatureName.toLowerCase().replace(/\s+/g, '_') + '.gif';
    }

    function getItemImageName(itemId) {
        return itemId + '.gif';
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

    function translateModalContent() {
        // Traducir etiquetas
        const fields = ['Speed', 'Summonable', 'Convinceable'];
        fields.forEach(field => {
            const element = document.querySelector(`[data-i18n="modal${field}"]`);
            if (element && translations[currentLanguage][`modal${field}`]) {
                element.textContent = translations[currentLanguage][`modal${field}`];
            }
        });

        // Traducir secciones
        const sections = ['details', 'immunities', 'voices', 'droppedItems'];
        sections.forEach(section => {
            const element = document.querySelector(`[data-i18n="${section}"]`);
            if (element && translations[currentLanguage][section]) {
                element.textContent = translations[currentLanguage][section];
            }
        });
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
                creature.name.toLowerCase().includes(searchTerm))
        }

        // Filtrar por raza
        if (selectedRace) {
            filtered = filtered.filter(creature =>
                creature.race === selectedRace)
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
        document.documentElement.lang = lang;
        localStorage.setItem('preferredLanguage', lang);
        applyTranslations();
        filterCreatures();

        // Disparar evento personalizado
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
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

        // Opciones de select
        document.querySelectorAll('select option').forEach(option => {
            const key = option.getAttribute('data-i18n');
            if (key && translations[currentLanguage][key]) {
                option.textContent = translations[currentLanguage][key];
            }
        });
    }

    // Configurar botones de idioma
    langEsBtn.addEventListener('click', () => setLanguage('es'));
    langEnBtn.addEventListener('click', () => setLanguage('en'));

    // Inicializar
    updateLanguageButtons();
    applyTranslations();
});