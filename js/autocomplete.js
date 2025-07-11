// AUTOCOMPLETADO PARA BÚSQUEDA DE ÍTEMS

// Esperar a que cargue el DOM y los datos existentes
window.addEventListener('DOMContentLoaded', () => {
    console.log('Autocomplete initializing...');
    
    const input = document.getElementById('searchItemInput');
    const suggestionsBox = document.getElementById('itemSuggestions');
    
    if (!input) {
        console.error('searchItemInput not found');
        return;
    }
    
    if (!suggestionsBox) {
        console.error('itemSuggestions not found');
        return;
    }

    let itemsData = [];

    // Obtener los datos desde el archivo JSON
    fetch('./items_to_creatures.json')
        .then(res => {
            console.log('Autocomplete - Items response status:', res.status);
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            itemsData = data;
            console.log('Autocomplete - Items data loaded:', itemsData.length, 'items');
        })
        .catch(err => {
            console.error('Autocomplete - Error cargando ítems:', err);
            itemsData = []; // Fallback to empty array
        });

    input.addEventListener('input', () => {
        const query = input.value.toLowerCase().trim();
        suggestionsBox.innerHTML = '';
        
        if (query.length < 2) {
            suggestionsBox.style.display = 'none';
            return;
        }

        if (!itemsData || itemsData.length === 0) {
            console.log('No items data available for autocomplete');
            return;
        }

        const matches = itemsData
            .filter(item => item.name && item.name.toLowerCase().includes(query))
            .slice(0, 10);

        console.log('Autocomplete matches:', matches.length);

        if (matches.length === 0) {
            suggestionsBox.style.display = 'none';
            return;
        }

        matches.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item.name;
            li.addEventListener('click', () => {
                input.value = item.name;
                suggestionsBox.innerHTML = '';
                suggestionsBox.style.display = 'none';
                
                // Trigger search
                const searchButton = document.getElementById('searchItemButton');
                if (searchButton) {
                    console.log('Triggering item search from autocomplete');
                    searchButton.click();
                }
            });
            suggestionsBox.appendChild(li);
        });
        
        suggestionsBox.style.display = 'block';
    });

    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !suggestionsBox.contains(e.target)) {
            suggestionsBox.innerHTML = '';
            suggestionsBox.style.display = 'none';
        }
    });

    // Hide suggestions on escape key
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            suggestionsBox.innerHTML = '';
            suggestionsBox.style.display = 'none';
        }
    });
    
    console.log('Autocomplete initialized successfully');
});