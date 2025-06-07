try {
    // Crear canvas
    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(scaledViewport.width);
    canvas.height = Math.floor(scaledViewport.height);

    // Renderizar la miniatura
    const context = canvas.getContext('2d');
    await page.render({
        canvasContext: context,
        viewport: scaledViewport
    }).promise;

    // Aplicar modo oscuro si está activado
    if (this.isDarkMode) {
        context.filter = 'invert(100%) hue-rotate(180deg)';
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Añadir al contenedor
    container.prepend(canvas);

    // Añadir evento de clic
    container.addEventListener('click', () => {
        this.goToPage(pageNum);
    });
} catch (error) {
    console.warn(`Error generating thumbnail for page ${pageNum}:`, error);
    container.innerHTML += '<div class="thumbnail-error">Error</div>';
}


// Ensure this method is part of a class or object
class PDFViewer {
    // Other methods and properties...

    updateZoomLevel() {
        this.dom.zoomLevel.textContent = `${Math.round(this.scale * 100)}%`;
    }

    // Other methods and properties...


/**
* Establece un nuevo nivel de zoom
* @param {number} newScale - Nueva escala
* @param {boolean} force - Forzar renderizado aunque la escala no cambie
*/
async setZoom(newScale, force = false) {
    const oldScale = this.scale;
    this.scale = Math.max(0.1, Math.min(5, newScale));

    if ((this.scale !== oldScale || force) && this.currentPage) {
        // Conservar la posición de desplazamiento relativa
        const viewer = this.dom.viewer;
        const scrollFraction = {
            x: viewer.scrollLeft / viewer.scrollWidth,
            y: viewer.scrollTop / viewer.scrollHeight
        };

        // Limpiar la vista actual si cambiamos la escala
        if (this.options.renderOnlyVisible) {
            // Si solo renderizamos las páginas visibles, solo limpiamos cuando cambia la escala
            if (this.scale !== oldScale) {
                // Limpiar caché relacionada con la escala anterior
                for (const [key] of this.pageCache.entries()) {
                    if (key.includes(`_${oldScale}_`)) {
                        this.pageCache.delete(key);
                    }
                }
            }

            // Renderizar páginas visibles con la nueva escala
            await this.renderPage(this.pageNum, true);

            // Re-renderizar otras páginas visibles
            for (const pageNum of this.visiblePages) {
                if (pageNum !== this.pageNum) {
                    this.renderPage(pageNum, true, true);
                }
            }
        } else {
            // Si renderizamos todas las páginas, necesitamos re-renderizarlas todas
            await this.renderPage(this.pageNum, true);

            // Re-renderizar el resto de páginas ya mostradas
            const pageContainers = this.dom.viewer.querySelectorAll('.pdf-page-container');
            for (const container of pageContainers) {
                const pageNum = parseInt(container.dataset.pageNumber);
                if (pageNum !== this.pageNum) {
                    this.renderPage(pageNum, true, true);
                }
            }
        }

        // Restaurar la posición de desplazamiento relativa
        setTimeout(() => {
            viewer.scrollLeft = viewer.scrollWidth * scrollFraction.x;
            viewer.scrollTop = viewer.scrollHeight * scrollFraction.y;
        }, 50);

        this.updateZoomLevel();
    }
}

/**
* Ajusta el PDF al ancho del visor
*/
async fitToWidth() {
    try {
        if (!this.currentPage) return;

        const viewport = this.currentPage.getViewport({ scale: 1.0, rotation: this.rotation || 0 });
        const containerWidth = this.dom.viewer.clientWidth - 40;
        await this.setZoom(containerWidth / viewport.width, true);

        this.dom.viewer.classList.add('fit-width');
        this.dom.viewer.classList.remove('fit-height');
    } catch (error) {
        console.error('Error ajustando al ancho:', error);
    }
}

/**
* Ajusta el PDF a la altura del visor
*/
async fitToHeight() {
    try {
        if (!this.currentPage) return;

        const viewport = this.currentPage.getViewport({ scale: 1.0, rotation: this.rotation || 0 });
        const containerHeight = this.dom.viewer.clientHeight - 40;
        await this.setZoom(containerHeight / viewport.height, true);

        this.dom.viewer.classList.add('fit-height');
        this.dom.viewer.classList.remove('fit-width');
    } catch (error) {
        console.error('Error ajustando a la altura:', error);
    }
}

/**
* Rota las páginas del PDF
*/
async rotatePage() {
    if (!this.currentPage) return;

    // Rotar 90 grados en sentido horario
    const rotation = (this.rotation || 0) + 90 % 360;

    // Guardar la posición de desplazamiento relativa
    const viewer = this.dom.viewer;
    const scrollFraction = {
        x: viewer.scrollLeft / viewer.scrollWidth,
        y: viewer.scrollTop / viewer.scrollHeight
    };

    // Limpiar caché
    if (this.options.enableCache) {
        this.pageCache.clear();
    }

    // Re-renderizar la página actual
    await this.renderPage(this.pageNum, false);

    // Restaurar la posición de desplazamiento relativa
    setTimeout(() => {
        viewer.scrollLeft = viewer.scrollWidth * scrollFraction.x;
        viewer.scrollTop = viewer.scrollHeight * scrollFraction.y;
    }, 50);
}

/**
* Alterna el modo oscuro
*/
toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    const isDarkMode = !this.isDarkMode;
    // Aplicar clase al contenedor principal
    this.dom.container.classList.toggle('dark-mode', this.isDarkMode);

    // Cambiar icono del botón
    this.dom.darkModeButton.textContent = this.isDarkMode ? '☀' : '☾';
    this.dom.darkModeButton.title = this.isDarkMode ? 'Modo claro' : 'Modo oscuro';

    // Re-renderizar páginas para aplicar el filtro de inversión
    if (this.options.enableCache) {
        this.pageCache.clear();
    }

    // Re-renderizar la página actual
    this.renderPage(this.pageNum, true);

    // Re-renderizar otras páginas visibles
    if (this.options.renderOnlyVisible) {
        for (const pageNum of this.visiblePages) {
            if (pageNum !== this.pageNum) {
                this.renderPage(pageNum, true, true);
            }
        }
    }
}

/**
* Alterna la pantalla completa
*/
async toggleFullscreen() {
    try {
        if (!document.fullscreenElement) {
            // Guardar la escala actual
            this.lastNormalScale = this.scale;

            // Entrar en pantalla completa
            await this.dom.container.requestFullscreen();
            this.dom.container.classList.add('fullscreen');
            this.dom.fullscreenButton.textContent = '⛶';
            this.dom.fullscreenButton.title = 'Salir de pantalla completa';

            // Calcular y aplicar la escala óptima para pantalla completa
            const fullscreenScale = await this.calculateFullscreenScale();
            await this.setZoom(fullscreenScale, true);
        } else {
            // Salir de pantalla completa
            await document.exitFullscreen();
        }
    } catch (error) {
        console.error('Error al alternar pantalla completa:', error);
        this.showNotification('Error al alternar pantalla completa', 'error');
    }
}

/**
* Calcula la escala óptima para pantalla completa
*/
async calculateFullscreenScale() {
    if (!this.currentPage) return this.scale;

    const viewport = this.currentPage.getViewport({ scale: 1.0, rotation: this.rotation || 0 });
    const containerWidth = window.innerWidth - 80;
    const containerHeight = window.innerHeight - 100;

    // Calcular escalas para ajuste a ancho y alto
    const scaleWidth = containerWidth / viewport.width;
    const scaleHeight = containerHeight / viewport.height;

    // Usar la escala menor para asegurar que el PDF quepa completo
    return Math.min(scaleWidth, scaleHeight);
}

/**
* Maneja cambios en el estado de pantalla completa
*/
async handleFullscreenChange() {
    if (!document.fullscreenElement) {
        this.dom.container.classList.remove('fullscreen');
        this.dom.fullscreenButton.textContent = '⛶';
        this.dom.fullscreenButton.title = 'Pantalla completa';

        // Restaurar la escala anterior al salir de pantalla completa
        await this.setZoom(this.lastNormalScale, true);
    }
}

/**
* Maneja los cambios de tamaño de ventana
*/
handleResize = debounce(async () => {
    try {
        // Si estamos en pantalla completa, ajustar la escala
        if (document.fullscreenElement) {
            const fullscreenScale = await this.calculateFullscreenScale();
            await this.setZoom(fullscreenScale, true);
        } else if (this.dom.viewer.classList.contains('fit-width')) {
            // Si estamos en modo ajustar al ancho, recalcular el zoom
            await this.fitToWidth();
        } else if (this.dom.viewer.classList.contains('fit-height')) {
            // Si estamos en modo ajustar a la altura, recalcular el zoom
            await this.fitToHeight();
        }
    } catch (error) {
        console.error('Error al manejar el cambio de tamaño:', error);
    }
}, 200);

/**
* Configura el botón de descarga del PDF
* @param {string} pdfFile - URL del archivo PDF
*/
configureDownloadButton(pdfFile) {
    if (pdfFile) {
        this.dom.downloadButton.style.display = 'inline-block';
        this.dom.downloadButton.href = pdfFile;
        this.dom.downloadButton.download = pdfFile.split('/').pop();
    } else {
        this.dom.downloadButton.style.display = 'none';
    }
}

/**
* Busca texto en el documento
* @param {string} text - Texto a buscar
*/
async search(text) {
    if (!text.trim() || !this.pdfDoc) {
        this.clearSearch();
        return;
    }

    try {
        this.showNotification('Buscando...', 'info');
        this.isSearching = true;
        this.searchResults = [];
        this.currentSearchIndex = -1;

        // Limpiar resultados anteriores
        this.dom.searchResults.innerHTML = '';

        // Eliminar resaltados previos
        const highlights = document.querySelectorAll('.search-highlight');
        highlights.forEach(h => h.classList.remove('search-highlight', 'current-match'));

        // Buscar en todas las páginas
        for (let i = 1; i <= this.pdfDoc.numPages; i++) {
            const page = await this.pdfDoc.getPage(i);
            const textContent = await page.getTextContent();
            const textItems = textContent.items;

            let lastMatch = null;
            let matchCount = 0;

            // Buscar coincidencias en los items de texto
            for (let j = 0; j < textItems.length; j++) {
                const item = textItems[j];
                const itemText = item.str;

                // Ignorar items vacíos
                if (!itemText.trim()) continue;

                // Buscar el texto (insensible a mayúsculas/minúsculas)
                const lowerItemText = itemText.toLowerCase();
                const lowerSearchText = text.toLowerCase();

                if (lowerItemText.includes(lowerSearchText)) {
                    matchCount++;

                    // Guardar la posición del resultado
                    const match = {
                        pageNum: i,
                        text: itemText,
                        itemIndex: j,
                        transform: item.transform
                    };

                    this.searchResults.push(match);

                    // Crear elemento para el resultado en el panel de búsqueda
                    const resultItem = document.createElement('div');
                    resultItem.className = 'search-result-item';
                    resultItem.textContent = `Página ${i}: ${this.truncateText(itemText, 40)}`;
                    resultItem.dataset.resultIndex = this.searchResults.length - 1;

                    resultItem.addEventListener('click', () => {
                        this.goToSearchResult(parseInt(resultItem.dataset.resultIndex));
                    });

                    this.dom.searchResults.appendChild(resultItem);

                    // Resaltar texto en la página si ya está renderizada
                    this.highlightSearchResult(match);

                    lastMatch = match;
                }
            }

            // Añadir resumen de coincidencias por página
            if (matchCount > 0) {
                const pageSummary = document.createElement('div');
                pageSummary.className = 'search-page-summary';
                pageSummary.textContent = `${matchCount} resultado(s) en página ${i}`;
                pageSummary.addEventListener('click', () => {
                    this.goToPage(i);
                    // Resaltar el primer resultado en esta página
                    const firstPageResultIndex = this.searchResults.findIndex(r => r.pageNum === i);
                    if (firstPageResultIndex >= 0) {
                        this.goToSearchResult(firstPageResultIndex);
                    }
                });

                // Insertar al principio de los resultados de esta página
                const firstResultOfPage = this.dom.searchResults.querySelector(`.search-result-item[data-result-index="${this.searchResults.length - matchCount}"]`);
                if (firstResultOfPage) {
                    this.dom.searchResults.insertBefore(pageSummary, firstResultOfPage);
                } else {
                    this.dom.searchResults.appendChild(pageSummary);
                }
            }
        }

        // Mostrar mensaje si no hay resultados
        if (this.searchResults.length === 0) {
            this.dom.searchResults.innerHTML = '<div class="no-search-results">No se encontraron resultados</div>';
            this.showNotification(`No se encontraron resultados para "${text}"`, 'info', 3000);
        } else {
            // Ir al primer resultado
            this.goToSearchResult(0);
            this.showNotification(`${this.searchResults.length} resultados encontrados`, 'success', 3000);
        }

        this.isSearching = false;
    } catch (error) {
        console.error('Error searching text:', error);
        this.showNotification('Error en la búsqueda: ' + error.message, 'error');
        this.isSearching = false;
    }
}

/**
* Trunca un texto a una longitud máxima
*/
truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
* Resalta un resultado de búsqueda en la página
*/
highlightSearchResult(match) {
    const pageContainer = document.getElementById(`page-container-${match.pageNum}`);
    if (!pageContainer) return;

    const textLayer = pageContainer.querySelector('.textLayer');
    if (!textLayer) return;

    // Buscar el span correspondiente al item de texto
    const textItems = textLayer.querySelectorAll('span');
    if (match.itemIndex < textItems.length) {
        const span = textItems[match.itemIndex];
        span.classList.add('search-highlight');

        // Guardar referencia al elemento para poder resaltarlo como activo más tarde
        match.element = span;
    }
}

/**
* Va a un resultado específico de la búsqueda
* @param {number} index - Índice del resultado
*/
async goToSearchResult(index) {
    if (index < 0 || index >= this.searchResults.length) return;

    // Actualizar índice actual
    this.currentSearchIndex = index;

    const match = this.searchResults[index];

    // Ir a la página del resultado
    await this.goToPage(match.pageNum);

    // Resaltar el resultado activo
    this.highlightActiveSearchResult();

    // Hacer scroll para mostrar el resultado
    if (match.element) {
        match.element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }

    // Actualizar visualización en la lista de resultados
    const resultItems = this.dom.searchResults.querySelectorAll('.search-result-item');
    resultItems.forEach(item => item.classList.remove('active'));

    const activeItem = this.dom.searchResults.querySelector(`.search-result-item[data-result-index="${index}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
        activeItem.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }
}

/**
* Resalta el resultado de búsqueda activo
*/
highlightActiveSearchResult() {
    // Quitar resaltado activo anterior
    const currentHighlights = document.querySelectorAll('.current-match');
    currentHighlights.forEach(h => h.classList.remove('current-match'));

    // Agregar resaltado activo al resultado actual
    if (this.currentSearchIndex >= 0 && this.searchResults[this.currentSearchIndex]) {
        const match = this.searchResults[this.currentSearchIndex];
        if (match.element) {
            match.element.classList.add('current-match');
        }
    }
}

/**
* Limpia los resultados de búsqueda
*/
clearSearch() {
    this.searchResults = [];
    this.currentSearchIndex = -1;
    this.dom.searchResults.innerHTML = '';

    // Quitar resaltados
    const highlights = document.querySelectorAll('.search-highlight');
    highlights.forEach(h => h.classList.remove('search-highlight', 'current-match'));
}

/**
* Va a la página anterior
*/
goToPrevPage() {
    if (this.pageNum > 1) {
        this.goToPage(this.pageNum - 1);
    }
}

/**
* Va a la página siguiente
*/
goToNextPage() {
    if (this.pdfDoc && this.pageNum < this.pdfDoc.numPages) {
        this.goToPage(this.pageNum + 1);
    }
}

/**
* Va a una página específica
* @param {number} num - Número de página
*/
async goToPage(num) {
    if (!this.pdfDoc || typeof num !== 'number' || num < 1 || num > this.pdfDoc.numPages) {
        console.warn('Número de página inválido:', num);
        return;
    }

    try {
        // Actualizar número de página en la barra de herramientas
        this.dom.pageNumInput.value = num;

        // Buscar si la página ya está renderizada
        let pageContainer = document.getElementById(`page-container-${num}`);

        if (pageContainer) {
            // Si la página ya está renderizada, hacer scroll hasta ella
            pageContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            this.pageNum = num;
        } else {
            // Si la página no está renderizada, renderizarla
            await this.renderPage(num);

            // Buscar el contenedor ahora que debería existir
            pageContainer = document.getElementById(`page-container-${num}`);
            if (pageContainer) {
                pageContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }

        // Actualizar el estado de los botones de navegación
        this.updateNavigationButtons();
    } catch (error) {
        console.error('Error al ir a la página:', error);
    }
}

/**
* Actualiza el estado de los botones de navegación
*/
updateNavigationButtons() {
    // Deshabilitar/habilitar botones según la página actual
    this.dom.prevButton.disabled = this.pageNum <= 1;
    this.dom.nextButton.disabled = !this.pdfDoc || this.pageNum >= this.pdfDoc.numPages;
}

/**
* Inicia el arrastre (panning)
*/
startPanning(e) {
    // Solo iniciar el arrastre con el botón izquierdo del ratón
    if (e.button !== 0) return;

    this.isPanning = true;
    this.dom.viewer.style.cursor = 'grabbing';
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.initialX = this.dom.viewer.scrollLeft;
    this.initialY = this.dom.viewer.scrollTop;

    // Prevenir selección de texto durante el arrastre
    e.preventDefault();
}

/**
* Realiza el arrastre (panning)
*/
pan(e) {
    if (!this.isPanning) return;

    e.preventDefault();
    const x = e.clientX;
    const y = e.clientY;
    const dx = x - this.startX;
    const dy = y - this.startY;

    this.dom.viewer.scrollLeft = this.initialX - dx;
    this.dom.viewer.scrollTop = this.initialY - dy;
}

/**
* Detiene el arrastre (panning)
*/
stopPanning() {
    this.isPanning = false;
    this.dom.viewer.style.cursor = 'grab';
}

/**
* Maneja el zoom con la rueda del ratón
*/
handleWheelZoom(e) {
    // Solo hacer zoom si se presiona la tecla Ctrl
    if (e.ctrlKey) {
        e.preventDefault();

        // Determinar dirección y factor de zoom
        const delta = e.deltaY > 0 ? 0.9 : 1.1;

        // Calcular posición del cursor en el visor
        const rect = this.dom.viewer.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        // Calcular posición relativa del cursor
        const viewerWidth = this.dom.viewer.clientWidth;
        const viewerHeight = this.dom.viewer.clientHeight;
        const relativeX = offsetX / viewerWidth;
        const relativeY = offsetY / viewerHeight;

        // Aplicar zoom
        this.zoomAtPoint(delta, relativeX, relativeY);
    }
}

/**
* Aplica zoom en un punto específico
*/
async zoomAtPoint(factor, relativeX, relativeY) {
    // Guardar posición de scroll actual
    const scrollLeft = this.dom.viewer.scrollLeft;
    const scrollTop = this.dom.viewer.scrollTop;

    // Calcular nueva escala
    const oldScale = this.scale;
    const newScale = Math.max(0.1, Math.min(5, oldScale * factor));

    // Si la escala no cambia, no hacer nada
    if (newScale === oldScale) return;

    // Aplicar nueva escala
    this.scale = newScale;

    // Re-renderizar con la nueva escala
    await this.renderPage(this.pageNum, true);

    // Actualizar el nivel de zoom mostrado
    this.updateZoomLevel();

    // Calcular nueva posición de scroll basada en el punto de zoom
    setTimeout(() => {
        const newWidth = this.dom.viewer.scrollWidth;
        const newHeight = this.dom.viewer.scrollHeight;

        const newScrollLeft = (newWidth * relativeX) - (relativeX * this.dom.viewer.clientWidth);
        const newScrollTop = (newHeight * relativeY) - (relativeY * this.dom.viewer.clientHeight);

        this.dom.viewer.scrollLeft = newScrollLeft;
        this.dom.viewer.scrollTop = newScrollTop;
    }, 50);
}

/**
* Maneja el inicio de interacción táctil
*/
handleTouchStart(e) {
    if (e.touches.length === 2) {
        // Prevenir acciones predeterminadas durante el pinch-zoom
        e.preventDefault();

        // Calcular la distancia inicial entre los dos dedos
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        this.initialPinchDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );

        // Punto central del zoom (entre los dos dedos)
        const rect = this.dom.viewer.getBoundingClientRect();
        const centerX = (touch1.clientX + touch2.clientX) / 2 - rect.left;
        const centerY = (touch1.clientY + touch2.clientY) / 2 - rect.top;

        // Posición relativa del centro de zoom
        this.pinchZoomX = centerX / this.dom.viewer.clientWidth;
        this.pinchZoomY = centerY / this.dom.viewer.clientHeight;

        this.lastScale = this.scale;
        this.isZooming = true;
    } else if (e.touches.length === 1) {
        // Pan con un dedo
        this.isPanning = true;
        const touch = e.touches[0];
        this.startX = touch.clientX;
        this.startY = touch.clientY;
        this.initialX = this.dom.viewer.scrollLeft;
        this.initialY = this.dom.viewer.scrollTop;
    }
}

/**
* Maneja el movimiento táctil
*/
handleTouchMove(e) {
    // Zoom con dos dedos
    if (e.touches.length === 2 && this.isZooming && this.initialPinchDistance !== null) {
        e.preventDefault();

        // Limitar la frecuencia de actualización para mejor rendimiento
        const now = performance.now();
        if (now - this.lastTouchMoveTime < 16) return; // ~60fps
        this.lastTouchMoveTime = now;

        // Calcular la nueva distancia entre los dedos
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
        );

        // Calcular el factor de zoom basado en el cambio de distancia
        const scaleFactor = currentDistance / this.initialPinchDistance;
        const newScale = this.lastScale * scaleFactor;

        // Limitar el zoom para evitar valores extremos
        const clampedScale = Math.max(0.1, Math.min(5, newScale));

        // Usar requestAnimationFrame para una animación más suave
        if (this.touchZoomTimeout) {
            cancelAnimationFrame(this.touchZoomTimeout);
        }

        this.touchZoomTimeout = requestAnimationFrame(() => {
            // Aplicar zoom centrado en el punto entre los dos dedos
            this.zoomAtPoint(clampedScale / this.scale, this.pinchZoomX, this.pinchZoomY);
        });
    }
    // Pan con un dedo
    else if (e.touches.length === 1 && this.isPanning) {
        const touch = e.touches[0];
        const x = touch.clientX;
        const y = touch.clientY;
        const dx = x - this.startX;
        const dy = y - this.startY;

        this.dom.viewer.scrollLeft = this.initialX - dx;
        this.dom.viewer.scrollTop = this.initialY - dy;
    }
}

/**
* Maneja el fin de la interacción táctil
*/
handleTouchEnd() {
    this.initialPinchDistance = null;
    this.lastScale = null;
    this.isZooming = false;
    this.isPanning = false;

    if (this.touchZoomTimeout) {
        cancelAnimationFrame(this.touchZoomTimeout);
        this.touchZoomTimeout = null;
    }
}

/**
* Maneja la navegación por teclado
*/
handleKeyboardNavigation(e) {
    // No capturar eventos si un input tiene el foco
    if (document.activeElement.tagName === 'INPUT' && e.key !== 'Escape') {
        return;
    }

    if (e.key === 'ArrowLeft' || e.code === 'PageUp') {
        if (!e.ctrlKey) this.goToPrevPage();
    } else if (e.key === 'ArrowRight' || e.code === 'PageDown') {
        if (!e.ctrlKey) this.goToNextPage();
    } else if (e.key === 'Home') {
        this.goToPage(1);
    } else if (e.key === 'End') {
        if (this.pdfDoc) this.goToPage(this.pdfDoc.numPages);
    } else if (e.key === '+' && e.ctrlKey) {
        e.preventDefault();
        this.setZoom(this.scale * 1.1);
    } else if (e.key === '-' && e.ctrlKey) {
        e.preventDefault();
        this.setZoom(this.scale / 1.1);
    } else if (e.key === '0' && e.ctrlKey) {
        e.preventDefault();
        this.setZoom(1.0);
    } else if (e.key === 'f' && e.ctrlKey) {
        e.preventDefault();
        this.toggleFullscreen();
    } else if (e.key === 'Escape') {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    }
}

/**
   * Muestra un panel específico del sidebar
   * @param {string} panelId - ID del panel a mostrar
   */
showPanel(panelId) {
    // Ocultar todos los paneles
    const panels = this.dom.container.querySelectorAll('.sidebar-panel');
    panels.forEach(panel => panel.classList.remove('active'));

    // Desactivar todos los botones del sidebar
    const buttons = this.dom.container.querySelectorAll('.sidebar-button');
    buttons.forEach(button => button.classList.remove('active'));

    // Mostrar el panel solicitado
    const targetPanel = document.getElementById(panelId);
    if (targetPanel) {
        targetPanel.classList.add('active');

        // Activar el botón correspondiente
        const button = this.dom.container.querySelector(`.sidebar-button[data-panel="${panelId}"]`);
        if (button) {
            button.classList.add('active');
        }

        // Expandir sidebar si estaba colapsado
        if (!this.dom.sidebar.classList.contains('expanded')) {
            this.toggleSidebar();
        }
    }
}

/**
 * Alterna la visibilidad del sidebar
 */
toggleSidebar() {
    this.dom.sidebar.classList.toggle('expanded');
    this.dom.toggleSidebarButton.textContent = this.dom.sidebar.classList.contains('expanded') ? '◀' : '▶';
    this.dom.toggleSidebarButton.title = this.dom.sidebar.classList.contains('expanded') ? 'Ocultar panel lateral' : 'Mostrar panel lateral';
}

/**
 * Muestra una notificación al usuario
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación (info, success, error)
 * @param {number} duration - Duración en milisegundos
 */
showNotification(message, type = 'info', duration = 2000) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `pdf-notification ${type}`;
    notification.textContent = message;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');

    // Añadir al DOM
    this.dom.container.appendChild(notification);

    // Mostrar con animación
    setTimeout(() => notification.classList.add('visible'), 10);

    // Eliminar después de la duración
    setTimeout(() => {
        notification.classList.remove('visible');
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

/**
 * Destruye la instancia del visor y libera recursos
 */
destroy() {
    // Limpiar event listeners
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('keydown', this.handleKeyboardNavigation);

    // Limpiar cache
    this.pageCache.clear();

    // Liberar recursos del PDF
    if (this.pdfDoc) {
        // No hay un método específico para destruir un documento PDF en pdf.js
        // pero podemos eliminar las referencias
        this.pdfDoc = null;
        this.currentPage = null;
    }

    // Limpiar DOM
    this.dom.container.innerHTML = '';

    // Eliminar clases añadidas al contenedor
    this.dom.container.classList.remove('pdf-viewer-container', 'dark-mode', 'fullscreen');

    // Indicar que el visor ha sido destruido
    this.isDestroyed = true;

    console.log('PDF Viewer destroyed');
}
}

// Fin del script

