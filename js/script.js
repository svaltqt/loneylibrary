document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    
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

    // Verificar que los elementos existen
    if (!creaturesContainer) {
        console.error('creaturesContainer not found');
        return;
    }

    let creaturesData = [];
    let itemsData = [];
    let currentLanguage = localStorage.getItem('preferredLanguage') || 'es';

    // Mostrar mensaje de carga
    creaturesContainer.innerHTML = '<div class="no-results">Cargando criaturas...</div>';

    // Cargar datos del JSON de criaturas e items
    console.log('Loading data files...');
    
    Promise.all([
        fetch('./creatures.json')
            .then(res => {
                console.log('Creatures response status:', res.status);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .catch(err => {
                console.error('Error loading creatures.json:', err);
                return [];
            }),
        fetch('./items_to_creatures.json')
            .then(res => {
                console.log('Items response status:', res.status);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .catch(err => {
                console.error('Error loading items_to_creatures.json:', err);
                return [];
            })
    ])
    .then(([creatures, items]) => {
        console.log('Data loaded:', creatures.length, 'creatures,', items.length, 'items');
        creaturesData = creatures;
        itemsData = items;
        
        if (creaturesData.length === 0) {
            creaturesContainer.innerHTML = '<div class="no-results">No se pudieron cargar las criaturas. Verifica que el archivo creatures.json existe.</div>';
        } else {
            displayCreatures(creaturesData);
        }
        
        updateLanguageButtons();
        populateRaceFilter();
    })
    .catch(error => {
        console.error('Error loading data:', error);
        creaturesContainer.innerHTML = '<div class="no-results">Error cargando datos. Verifica que los archivos JSON existen.</div>';
    });

    // Poblar filtro de razas
    function populateRaceFilter() {
        if (!raceFilter || creaturesData.length === 0) return;
        
        const races = [...new Set(creaturesData.map(creature => creature.race))].sort();
        
        // Limpiar opciones existentes excepto la primera
        while (raceFilter.children.length > 1) {
            raceFilter.removeChild(raceFilter.lastChild);
        }
        
        races.forEach(race => {
            if (race) {
                const option = document.createElement('option');
                option.value = race;
                option.textContent = race;
                raceFilter.appendChild(option);
            }
        });
    }

    // Mostrar criaturas en lista
    function displayCreatures(creatures) {
        if (!creaturesContainer) return;
        
        creaturesContainer.innerHTML = '';

        if (!creatures || creatures.length === 0) {
            creaturesContainer.innerHTML = `
                <div class="no-results">${translations[currentLanguage]?.noCreaturesDropping || 'No se encontraron criaturas'}</div>
            `;
            return;
        }

        creatures.forEach(creature => {
            const creatureRow = createCreatureRow(creature);
            creaturesContainer.appendChild(creatureRow);
        });
        
        console.log('Displayed', creatures.length, 'creatures');
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
                    <span class="creature-race">${creature.race || 'Unknown'}</span>
                    <div class="creature-stats">
                        <span class="creature-stat">❤️ ${creature.health || 0}</span>
                        <span class="creature-stat">⭐ ${creature.experience || 0}</span>
                    </div>
                </div>
            </div>
        `;

        creatureRow.addEventListener('click', () => openModal(creature));
        return creatureRow;
    }

    // Buscar ítems y mostrar criaturas que los dropean
    function searchItems() {
        const searchTerm = searchItemInput?.value?.toLowerCase()?.trim();
        console.log('Searching items for:', searchTerm);
        
        if (!searchTerm) {
            displayCreatures(creaturesData);
            return;
        }

        if (!itemsData || itemsData.length === 0) {
            creaturesContainer.innerHTML = '<div class="no-results">No se pudieron cargar los datos de items</div>';
            return;
        }

        const filteredItems = itemsData.filter(item =>
            item.name && item.name.toLowerCase().includes(searchTerm)
        );

        console.log('Found items:', filteredItems.length);

        creaturesContainer.innerHTML = '';

        if (filteredItems.length === 0) {
            creaturesContainer.innerHTML = `
                <div class="no-results">${translations[currentLanguage]?.noCreaturesDropping || 'No se encontraron items con ese nombre'}</div>
            `;
            return;
        }

        filteredItems.forEach(item => {
            const itemSection = document.createElement('div');
            itemSection.className = 'item-section';

            const itemTitle = document.createElement('h2');
            itemTitle.className = 'item-title';
            itemTitle.textContent = `${item.name} (${translations[currentLanguage]?.creaturesDropping || 'Criaturas que dropean:'})`;

            itemSection.appendChild(itemTitle);

            const creaturesDropping = creaturesData.filter(creature =>
                item.dropped_by && item.dropped_by.includes(creature.name)
            );

            console.log('Creatures dropping', item.name, ':', creaturesDropping.length);

            if (creaturesDropping.length === 0) {
                const noCreatures = document.createElement('div');
                noCreatures.className = 'no-results';
                noCreatures.textContent = translations[currentLanguage]?.noCreaturesDropping || 'Ninguna criatura dropea este ítem';
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
        console.log('Opening modal for:', creature.name);
        
        const modalTitle = document.getElementById('modalTitle');
        const modalHealth = document.getElementById('modalHealth');
        const modalExp = document.getElementById('modalExp');
        const modalRace = document.getElementById('modalRace');
        const modalSpeed = document.getElementById('modalSpeed');
        const modalSummonable = document.getElementById('modalSummonable');
        const modalConvinceable = document.getElementById('modalConvinceable');

        if (modalTitle) modalTitle.textContent = creature.name;
        if (modalHealth) modalHealth.textContent = creature.health || 0;
        if (modalExp) modalExp.textContent = creature.experience || 0;
        if (modalRace) modalRace.textContent = creature.race || 'Unknown';
        if (modalSpeed) modalSpeed.textContent = creature.speed_like || 'N/A';
        if (modalSummonable) modalSummonable.textContent = creature.summonable || 'No';
        if (modalConvinceable) modalConvinceable.textContent = creature.convinceable || 'No';

        const creatureImageName = getCreatureImageName(creature.name);
        const modalImage = document.querySelector('.modal-creature-image');
        if (modalImage) {
            modalImage.src = `images/creatures/${creatureImageName}`;
            modalImage.alt = creature.name;
            modalImage.onerror = function() {
                this.src = 'images/creatures/default_item.png';
                this.onerror = null;
            };
        }

        const itemsContainer = document.getElementById('modalItems');
        if (itemsContainer) {
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
                itemsContainer.innerHTML = `<div class="no-results">${translations[currentLanguage]?.noItems || 'No suelta items'}</div>`;
            }
        }

        setupList('modalImmunities', creature.immunities, 'noImmunities');
        setupList('modalVoices', creature.voices, 'noVoices');
        translateModalContent();
        
        if (modal) {
            modal.style.display = 'block';
        }
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
        if (!listElement) return;
        
        listElement.innerHTML = '';

        if (items && items.length > 0) {
            items.forEach(item => {
                const li = document.createElement('li');
                li.textContent = elementId === 'modalVoices' ? `"${item}"` : item;
                li.style.padding = 'var(--space-sm) 0';
                li.style.borderBottom = '1px solid var(--border-primary)';
                li.style.color = 'var(--text-primary)';
                listElement.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = translations[currentLanguage]?.[noItemsTranslationKey] || 'Ninguno';
            li.style.padding = 'var(--space-sm) 0';
            li.style.color = 'var(--text-secondary)';
            li.style.fontStyle = 'italic';
            listElement.appendChild(li);
        }
    }

    function translateModalContent() {
        const fields = ['Speed', 'Summonable', 'Convinceable'];
        fields.forEach(field => {
            const element = document.querySelector(`[data-i18n="modal${field}"]`);
            if (element && translations[currentLanguage]?.[`modal${field}`]) {
                element.textContent = translations[currentLanguage][`modal${field}`];
            }
        });

        const sections = ['details', 'immunities', 'voices', 'droppedItems'];
        sections.forEach(section => {
            const element = document.querySelector(`[data-i18n="${section}"]`);
            if (element && translations[currentLanguage]?.[section]) {
                element.textContent = translations[currentLanguage][section];
            }
        });
    }

    // Funcionalidad de búsqueda y filtrado de criaturas
    function filterCreatures() {
        const searchTerm = searchInput?.value?.toLowerCase() || '';
        const selectedRace = raceFilter?.value || '';
        const sortBy = sortFilter?.value || 'name';

        console.log('Filtering creatures:', { searchTerm, selectedRace, sortBy });

        let filtered = [...creaturesData];

        if (searchTerm) {
            filtered = filtered.filter(creature =>
                creature.name && creature.name.toLowerCase().includes(searchTerm)
            );
        }

        if (selectedRace) {
            filtered = filtered.filter(creature =>
                creature.race === selectedRace
            );
        }

        if (sortBy === 'name') {
            filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        } else if (sortBy === 'health') {
            filtered.sort((a, b) => parseInt(b.health || 0) - parseInt(a.health || 0));
        } else if (sortBy === 'experience') {
            filtered.sort((a, b) => parseInt(b.experience || 0) - parseInt(a.experience || 0));
        }

        console.log('Filtered results:', filtered.length);
        displayCreatures(filtered);
    }

    // Event listeners
    if (searchButton) {
        searchButton.addEventListener('click', filterCreatures);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                filterCreatures();
            }
        });
        searchInput.addEventListener('input', filterCreatures);
    }
    
    if (searchItemButton) {
        searchItemButton.addEventListener('click', searchItems);
    }
    
    if (searchItemInput) {
        searchItemInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                searchItems();
            }
        });
    }
    
    if (raceFilter) {
        raceFilter.addEventListener('change', filterCreatures);
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', filterCreatures);
    }

    // Cerrar modal
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (modal) modal.style.display = 'none';
        });
    }

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Manejo de idiomas
    function updateLanguageButtons() {
        if (langEsBtn && langEnBtn) {
            langEsBtn.classList.toggle('active', currentLanguage === 'es');
            langEnBtn.classList.toggle('active', currentLanguage === 'en');
        }
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
        if (!translations[currentLanguage]) return;

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
    if (langEsBtn) {
        langEsBtn.addEventListener('click', () => setLanguage('es'));
    }
    
    if (langEnBtn) {
        langEnBtn.addEventListener('click', () => setLanguage('en'));
    }

    // Inicializar
    updateLanguageButtons();
    applyTranslations();
});