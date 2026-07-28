document.addEventListener('DOMContentLoaded', function() {
  var urlParams = new URLSearchParams(window.location.search);
  var filePath = urlParams.get('file');

  if (!filePath) {
    showError('No file specified for viewing');
    return;
  }

  var fileInfo = document.getElementById('ppt-breadcrumb');
  fileInfo.textContent = '\u{1F4CA} ' + filePath.split('/').pop();

  var downloadBtn = document.getElementById('download-btn');
  downloadBtn.addEventListener('click', function() {
    window.location.href = filePath;
  });

  loadPresentation(filePath);
});

async function loadPresentation(filePath) {
  var loading = document.getElementById('ppt-loading');
  var errorEl = document.getElementById('ppt-error');

  loading.style.display = 'block';

  try {
    var response = await fetch(filePath);
    if (!response.ok) {
      throw new Error('Failed to load the presentation file');
    }
    var arrayBuffer = await response.arrayBuffer();

    var slides = await parsePPTX(arrayBuffer);

    loading.style.display = 'none';

    if (!slides || slides.length === 0) {
      showError('No slides found in the presentation');
      return;
    }

    renderSlides(slides);
    setupNavigation(slides.length);
  } catch (error) {
    loading.style.display = 'none';
    showError('Error loading presentation: ' + error.message);
  }
}

function parsePPTX(arrayBuffer) {
  return new Promise(function(resolve, reject) {
    try {
      if (typeof PptxJS === 'undefined') {
        reject(new Error('PPTX parser library not loaded'));
        return;
      }
      var pptx = new PptxJS();
      pptx.load(arrayBuffer, function(slides) {
        resolve(slides);
      }, function(error) {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
}

function renderSlides(slides) {
  var container = document.getElementById('ppt-slide-container');
  container.innerHTML = '';

  for (var i = 0; i < slides.length; i++) {
    var slideDiv = document.createElement('div');
    slideDiv.className = 'ppt-slide';
    slideDiv.dataset.index = i;

    if (slides[i].svg) {
      slideDiv.innerHTML = slides[i].svg;
    } else if (slides[i].images && slides[i].images.length) {
      for (var j = 0; j < slides[i].images.length; j++) {
        var imgEl = document.createElement('img');
        imgEl.src = 'data:image/png;base64,' + slides[i].images[j];
        imgEl.alt = 'Slide ' + (i + 1);
        slideDiv.appendChild(imgEl);
      }
    } else {
      var fallback = document.createElement('p');
      fallback.textContent = 'Slide ' + (i + 1);
      slideDiv.appendChild(fallback);
    }

    container.appendChild(slideDiv);
  }

  showSlide(0);
}

var currentSlide = 0;
var totalSlides = 0;

function showSlide(index) {
  var slides = document.querySelectorAll('.ppt-slide');
  if (index < 0 || index >= slides.length) return;

  for (var i = 0; i < slides.length; i++) {
    slides[i].style.display = i === index ? 'block' : 'none';
  }

  currentSlide = index;
  document.getElementById('slide-num').textContent = index + 1;
}

function setupNavigation(total) {
  totalSlides = total;
  document.getElementById('slide-count').textContent = total;

  document.getElementById('prev').addEventListener('click', function() {
    if (currentSlide > 0) showSlide(currentSlide - 1);
  });

  document.getElementById('next').addEventListener('click', function() {
    if (currentSlide < totalSlides - 1) showSlide(currentSlide + 1);
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') {
      if (currentSlide > 0) showSlide(currentSlide - 1);
    } else if (e.key === 'ArrowRight') {
      if (currentSlide < totalSlides - 1) showSlide(currentSlide + 1);
    }
  });

  var container = document.getElementById('ppt-container');
  var fullscreenBtn = document.getElementById('fullscreen');

  fullscreenBtn.addEventListener('click', function() {
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(function(err) {
        console.error('Fullscreen error:', err.message);
      });
    } else {
      document.exitFullscreen();
    }
  });

  document.addEventListener('fullscreenchange', function() {
    if (!document.fullscreenElement) {
      container.classList.remove('fullscreen');
    } else {
      container.classList.add('fullscreen');
    }
  });
}

function showError(message) {
  var loading = document.getElementById('ppt-loading');
  var errorEl = document.getElementById('ppt-error');
  loading.style.display = 'none';
  errorEl.textContent = message;
  errorEl.style.display = 'block';
}
