// AUTOCOMPLETADO PARA BÚSQUEDA DE ÍTEMS

// Esperar a que cargue el DOM y los datos existentes
window.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('searchItemInput');
  const suggestionsBox = document.createElement('ul');
  suggestionsBox.id = 'itemSuggestions';
  suggestionsBox.classList.add('suggestions-list');
  input.parentElement.appendChild(suggestionsBox);

  let itemsData = [];

  // Obtener los datos desde el script principal (ya cargados)
  fetch('items_to_creatures.json')
    .then(res => res.json())
    .then(data => itemsData = data)
    .catch(err => console.error('Error cargando ítems:', err));

  input.addEventListener('input', () => {
    const query = input.value.toLowerCase().trim();
    suggestionsBox.innerHTML = '';
    if (query.length < 2) return;

    const matches = itemsData.filter(item => item.name.toLowerCase().includes(query)).slice(0, 10);

    matches.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item.name;
      li.addEventListener('click', () => {
        input.value = item.name;
        suggestionsBox.innerHTML = '';
        document.getElementById('searchItemButton').click();
      });
      suggestionsBox.appendChild(li);
    });
  });

  document.addEventListener('click', (e) => {
    if (!suggestionsBox.contains(e.target) && e.target !== input) {
      suggestionsBox.innerHTML = '';
    }
  });
});
