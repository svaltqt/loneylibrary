document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const creaturesContainer = document.getElementById('creaturesContainer');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchItemInput = document.getElementById('searchItemInput');
    const searchItemButton = document.getElementById('searchItemButton');
    const raceFilter = document.getElementById('raceFilter');
    const sortFilter = document.getElementById('sortFilter');
    const modal = document.getElementById('creatureModal');
    const langEsBtn = document.getElementById('langEs');
    const langEnBtn = document.getElementById('langEn');

    let creaturesData = [];
    let itemsData = [];
    let currentLanguage = localStorage.getItem('preferredLanguage') || 'es';

    // Cargar datos del JSON de criaturas e items
    Promise.all([
        fetch('creatures.json').then(res => res.json()),
        fetch('items_to_creatures.json').then(res => res.json())
    ])
        .then(([creatures, items]) => {
            creaturesData = creatures;
            itemsData = items;
            displayCreatures(creaturesData);
            updateLanguageButtons();
        })
        .catch(error => console.error('Error loading data:', error));

    // Mostrar criaturas en lista
    function displayCreatures(creatures) {
        creaturesContainer.innerHTML = '';

        creatures.forEach(creature => {
            const creatureRow = createCreatureRow(creature);
            creaturesContainer.appendChild(creatureRow);
        });
    }

    // Crear fila de criatura (reutilizable)
    function createCreatureRow(creature) {
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
        return creatureRow;
    }

    // Buscar ítems y mostrar criaturas que los dropean
    function searchItems() {
        const searchTerm = searchItemInput.value.toLowerCase().trim();
        if (!searchTerm) {
            displayCreatures(creaturesData); // Si está vacío, muestra todas las criaturas
            return;
        }

        const filteredItems = itemsData.filter(item =>
            item.name.toLowerCase().includes(searchTerm)
        );

        creaturesContainer.innerHTML = '';

        if (filteredItems.length === 0) {
            creaturesContainer.innerHTML = `
                <p class="no-results">${translations[currentLanguage]['noCreaturesDropping']}</p>
            `;
            return;
        }

        filteredItems.forEach(item => {
            const itemSection = document.createElement('div');
            itemSection.className = 'item-section';

            const itemTitle = document.createElement('h2');
            itemTitle.className = 'item-title';
            itemTitle.textContent = `${item.name} (${translations[currentLanguage]['creaturesDropping']})`;

            itemSection.appendChild(itemTitle);

            const creaturesDropping = creaturesData.filter(creature =>
                item.dropped_by.includes(creature.name)
            );

            if (creaturesDropping.length === 0) {
                const noCreatures = document.createElement('p');
                noCreatures.textContent = translations[currentLanguage]['noCreaturesDropping'];
                itemSection.appendChild(noCreatures);
            } else {
                creaturesDropping.forEach(creature => {
                    const creatureRow = createCreatureRow(creature);
                    itemSection.appendChild(creatureRow);
                });
            }

            creaturesContainer.appendChild(itemSection);
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

        const creatureImageName = getCreatureImageName(creature.name);
        const modalImage = document.querySelector('.modal-creature-image');
        modalImage.src = `images/creatures/${creatureImageName}`;
        modalImage.alt = creature.name;
        modalImage.onerror = function() {
            this.src = 'images/creatures/default_item.png';
            this.onerror = null;
        };

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

        setupList('modalImmunities', creature.immunities, 'noImmunities');
        setupList('modalVoices', creature.voices, 'noVoices');
        translateModalContent();
        modal.style.display = 'block';
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
        const fields = ['Speed', 'Summonable', 'Convinceable'];
        fields.forEach(field => {
            const element = document.querySelector(`[data-i18n="modal${field}"]`);
            if (element && translations[currentLanguage][`modal${field}`]) {
                element.textContent = translations[currentLanguage][`modal${field}`];
            }
        });

        const sections = ['details', 'immunities', 'voices', 'droppedItems'];
        sections.forEach(section => {
            const element = document.querySelector(`[data-i18n="${section}"]`);
            if (element && translations[currentLanguage][section]) {
                element.textContent = translations[currentLanguage][section];
            }
        });
    }

    // Funcionalidad de búsqueda y filtrado de criaturas
    function filterCreatures() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedRace = raceFilter.value;
        const sortBy = sortFilter.value;

        let filtered = creaturesData;

        if (searchTerm) {
            filtered = filtered.filter(creature =>
                creature.name.toLowerCase().includes(searchTerm))
        }

        if (selectedRace) {
            filtered = filtered.filter(creature =>
                creature.race === selectedRace)
        }

        if (sortBy === 'name') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'health') {
            filtered.sort((a, b) => parseInt(b.health) - parseInt(a.health));
        } else if (sortBy === 'experience') {
            filtered.sort((a, b) => parseInt(b.experience) - parseInt(a.experience));
        }

        displayCreatures(filtered);
    }

    // Event listeners
    searchButton.addEventListener('click', filterCreatures);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') filterCreatures();
    });
    searchItemButton.addEventListener('click', searchItems);
    searchItemInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') searchItems();
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
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
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