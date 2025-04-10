function showFile(fileName) {
  fetch(fileName)
    .then((response) => {
      if (!response.ok) {
        throw new Error('No se pudo cargar el archivo.')
      }
      return response.text()
    })
    .then((text) => {
      document.getElementById('file-content').textContent = text
      document.getElementById('file-viewer').style.display = 'block'
      document.getElementById('overlay').style.display = 'block'
    })
    .catch((error) => {
      alert(error.message)
    })
}

function closeViewer() {
  document.getElementById('file-viewer').style.display = 'none'
  document.getElementById('overlay').style.display = 'none'
  document.getElementById('file-content').textContent = ''
}

// Funciones para mostrar calendarios en modal
function showCalendar(calendarId) {
  // Ocultar todos los contenidos de calendario en el modal
  document.querySelectorAll('.calendar-content').forEach(cal => {
    cal.style.display = 'none';
  });

  // Mostrar el calendario solicitado
  const calendarElement = document.getElementById(calendarId);
  if (calendarElement) {
    // Clonar el calendario para mostrarlo en el modal
    const calendarClone = calendarElement.cloneNode(true);

    // Asegurarse de que el clon sea visible
    calendarClone.style.display = 'block';

    // Preparar el contenido del modal
    const modalContent = document.getElementById('modal-content');
    modalContent.innerHTML = '';
    modalContent.appendChild(calendarClone);

    // Establecer el título del modal
    const modalTitle = document.getElementById('modal-title');
    modalTitle.textContent = calendarId.includes('primero') ?
      'Horario Primer Año' : 'Horario Segundo Año';

    // Mostrar el modal
    document.getElementById('calendar-modal').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';

    // Resaltar botón activo
    document.querySelectorAll('.calendar-button').forEach(btn => {
      if (btn.getAttribute('onclick').includes(calendarId)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
}

function closeCalendarModal() {
  document.getElementById('calendar-modal').style.display = 'none';
  document.getElementById('overlay').style.display = 'none';
  document.querySelectorAll('.calendar-button').forEach(btn => {
    btn.classList.remove('active');
  });
}