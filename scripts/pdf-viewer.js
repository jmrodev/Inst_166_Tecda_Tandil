const pdfjsLib = window['pdfjs-dist/build/pdf']

// Cargar PDF desde URL o parámetro
document.addEventListener('DOMContentLoaded', function () {
    let pdfDoc = null
    let pageNum = 1
    let scale = 1.0
    let isPanning = false
    let startX, startY, initialX, initialY
    let currentPage = null
    let lastNormalScale = 1.0 // Guardar la escala antes de pantalla completa
    let initialPinchDistance = null // Para el zoom con gestos
    let lastScale = null // Para el zoom con gestos
    let lastTouchMoveTime = 0 // Para limitar la frecuencia de actualización
    let touchZoomTimeout = null // Para debounce del zoom

    const viewer = document.getElementById('pdf-viewer')
    const pageNumInput = document.getElementById('page-num')
    const pageCount = document.getElementById('page-count')
    const container = document.getElementById('pdf-container')
    const fullscreenButton = document.getElementById('fullscreen')
    const zoomIn = document.getElementById('zoom-in')
    const zoomOut = document.getElementById('zoom-out')
    const zoomLevel = document.getElementById('zoom-level')
    const fitWidth = document.getElementById('fit-width')
    const fitHeight = document.getElementById('fit-height')

    async function loadPDF(url) {
        try {
            // Mostrar mensaje de carga
            viewer.innerHTML = 'Cargando PDF...'

            const loadingTask = pdfjsLib.getDocument({
                url: url,
                cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
                cMapPacked: true,
            })

            pdfDoc = await loadingTask.promise
            pageCount.textContent = pdfDoc.numPages
            renderPage(1)
        } catch (error) {
            console.error('Error loading PDF:', error)
            viewer.innerHTML = 'Error al cargar el PDF: ' + error.message
        }
    }

    async function renderPage(num, keepScale = true) {
        try {
            const page = await pdfDoc.getPage(num)
            currentPage = page
            const canvas = document.createElement('canvas')
            const context = canvas.getContext('2d')

            // Si es la primera página o no queremos mantener la escala, calculamos la escala inicial
            if (!keepScale || scale === 1.0) {
                const viewport = page.getViewport({ scale: 1.0 })
                const containerWidth = viewer.clientWidth - 40
                scale = containerWidth / viewport.width
            }

            const viewport = page.getViewport({ scale })

            // Configurar el canvas con las dimensiones correctas
            canvas.width = Math.floor(viewport.width)
            canvas.height = Math.floor(viewport.height)

            viewer.innerHTML = ''
            viewer.appendChild(canvas)

            // Renderizar con antialiasing
            context.imageSmoothingEnabled = true
            context.imageSmoothingQuality = 'high'

            await page.render({
                canvasContext: context,
                viewport: viewport,
            }).promise

            pageNum = num
            pageNumInput.value = num
            updateZoomLevel()
        } catch (error) {
            console.error('Error rendering page:', error)
            viewer.innerHTML = 'Error al renderizar la página: ' + error.message
        }
    }

    function updateZoomLevel() {
        zoomLevel.textContent = `${Math.round(scale * 100)}%`
    }

    // Zoom controls
    async function setZoom(newScale, force = false) {
        const oldScale = scale
        scale = Math.max(0.1, Math.min(5, newScale))

        if ((scale !== oldScale || force) && currentPage) {
            await renderPage(pageNum, true)
        }
    }

    // Función para calcular el zoom óptimo en pantalla completa
    async function calculateFullscreenScale() {
        if (!currentPage) return scale

        const viewport = currentPage.getViewport({ scale: 1.0 })
        const containerWidth = window.innerWidth - 80 // Más padding para pantalla completa
        const containerHeight = window.innerHeight - 100 // Considerar la barra de controles

        // Calcular escalas para ajuste a ancho y alto
        const scaleWidth = containerWidth / viewport.width
        const scaleHeight = containerHeight / viewport.height

        // Usar la escala menor para asegurar que el PDF quepa completo
        return Math.min(scaleWidth, scaleHeight)
    }

    zoomIn.addEventListener('click', () => setZoom(scale * 1.2))
    zoomOut.addEventListener('click', () => setZoom(scale / 1.2))

    // Mouse wheel zoom
    viewer.addEventListener('wheel', (e) => {
        if (e.ctrlKey) {
            e.preventDefault()
            const delta = e.deltaY > 0 ? 0.9 : 1.1
            setZoom(scale * delta)
        }
    })

    // Fit controls
    fitWidth.addEventListener('click', async () => {
        if (!currentPage) return
        const viewport = currentPage.getViewport({ scale: 1.0 })
        const containerWidth = viewer.clientWidth - 40
        await setZoom(containerWidth / viewport.width)
        viewer.classList.add('fit-width')
        viewer.classList.remove('fit-height')
    })

    fitHeight.addEventListener('click', async () => {
        if (!currentPage) return
        const viewport = currentPage.getViewport({ scale: 1.0 })
        const containerHeight = viewer.clientHeight - 40
        await setZoom(containerHeight / viewport.height)
        viewer.classList.add('fit-height')
        viewer.classList.remove('fit-width')
    })

    // Pan functionality
    viewer.addEventListener('mousedown', (e) => {
        isPanning = true
        viewer.style.cursor = 'grabbing'
        startX = e.clientX - viewer.offsetLeft
        startY = e.clientY - viewer.offsetTop
        initialX = viewer.scrollLeft
        initialY = viewer.scrollTop
    })

    viewer.addEventListener('mousemove', (e) => {
        if (!isPanning) return
        e.preventDefault()
        const x = e.clientX - viewer.offsetLeft
        const y = e.clientY - viewer.offsetTop
        const dx = x - startX
        const dy = y - startY
        viewer.scrollLeft = initialX - dx
        viewer.scrollTop = initialY - dy
    })

    viewer.addEventListener('mouseup', () => {
        isPanning = false
        viewer.style.cursor = 'grab'
    })

    viewer.addEventListener('mouseleave', () => {
        isPanning = false
        viewer.style.cursor = 'grab'
    })

    // Touch zoom functionality
    viewer.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault()
            // Calcular la distancia inicial entre los dos dedos
            const touch1 = e.touches[0]
            const touch2 = e.touches[1]
            initialPinchDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            )
            lastScale = scale
            lastTouchMoveTime = performance.now()
        }
    })

    viewer.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2 && initialPinchDistance !== null) {
            e.preventDefault()

            // Limitar la frecuencia de actualización para mejorar el rendimiento
            const now = performance.now()
            if (now - lastTouchMoveTime < 16) { // ~60fps
                return
            }
            lastTouchMoveTime = now

            // Calcular la nueva distancia entre los dedos
            const touch1 = e.touches[0]
            const touch2 = e.touches[1]
            const currentDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
            )

            // Calcular el factor de zoom basado en el cambio de distancia
            const scaleFactor = currentDistance / initialPinchDistance
            const newScale = lastScale * scaleFactor

            // Limitar el zoom para evitar valores extremos
            const clampedScale = Math.max(0.1, Math.min(5, newScale))

            // Usar requestAnimationFrame para una animación más suave
            if (touchZoomTimeout) {
                cancelAnimationFrame(touchZoomTimeout)
            }
            touchZoomTimeout = requestAnimationFrame(() => {
                setZoom(clampedScale)
            })
        }
    })

    viewer.addEventListener('touchend', (e) => {
        initialPinchDistance = null
        lastScale = null
        if (touchZoomTimeout) {
            cancelAnimationFrame(touchZoomTimeout)
            touchZoomTimeout = null
        }
    })

    viewer.addEventListener('touchcancel', (e) => {
        initialPinchDistance = null
        lastScale = null
        if (touchZoomTimeout) {
            cancelAnimationFrame(touchZoomTimeout)
            touchZoomTimeout = null
        }
    })

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
            if (pageNum > 1) renderPage(pageNum - 1)
        } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
            if (pageNum < pdfDoc.numPages) renderPage(pageNum + 1)
        } else if (e.key === '+' && e.ctrlKey) {
            e.preventDefault()
            setZoom(scale * 1.1)
        } else if (e.key === '-' && e.ctrlKey) {
            e.preventDefault()
            setZoom(scale / 1.1)
        }
    })

    // Navigation controls
    document.getElementById('prev').addEventListener('click', () => {
        if (pageNum > 1) renderPage(pageNum - 1)
    })

    document.getElementById('next').addEventListener('click', () => {
        if (pageNum < pdfDoc.numPages) renderPage(pageNum + 1)
    })

    pageNumInput.addEventListener('change', () => {
        const num = parseInt(pageNumInput.value)
        if (num >= 1 && num <= pdfDoc.numPages) {
            renderPage(num)
        }
    })

    // Fullscreen functionality
    async function toggleFullscreen() {
        if (!document.fullscreenElement) {
            lastNormalScale = scale // Guardar la escala actual
            container.requestFullscreen().catch(err => {
                console.error(`Error al intentar entrar en pantalla completa: ${err.message}`)
            })
            container.classList.add('fullscreen')
            fullscreenButton.textContent = 'Salir de pantalla completa'

            // Calcular y aplicar la escala óptima para pantalla completa
            const fullscreenScale = await calculateFullscreenScale()
            await setZoom(fullscreenScale, true)
        } else {
            document.exitFullscreen()
            container.classList.remove('fullscreen')
            fullscreenButton.textContent = 'Pantalla completa'
            // Restaurar la escala anterior
            await setZoom(lastNormalScale, true)
        }
    }

    // Evento para el botón de pantalla completa
    fullscreenButton.addEventListener('click', toggleFullscreen)

    // Manejar cambios de tamaño en pantalla completa
    window.addEventListener('resize', async () => {
        if (document.fullscreenElement) {
            const fullscreenScale = await calculateFullscreenScale()
            await setZoom(fullscreenScale, true)
        }
    })

    document.addEventListener('fullscreenchange', async () => {
        if (!document.fullscreenElement) {
            container.classList.remove('fullscreen')
            fullscreenButton.textContent = 'Pantalla completa'
            // Restaurar la escala anterior al salir de pantalla completa
            await setZoom(lastNormalScale, true)
        }
    })

    // Iniciar carga del PDF si hay uno especificado
    const urlParams = new URLSearchParams(window.location.search)
    const pdfFile = urlParams.get('file')
    if (pdfFile) {
        console.log('Cargando PDF:', pdfFile)
        loadPDF(pdfFile)
    } else {
        viewer.innerHTML = 'No se ha especificado un archivo PDF para cargar'
    }
}) 