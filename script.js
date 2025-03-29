document.addEventListener('DOMContentLoaded', () => {
    loadHeader();
    loadFooter();
    loadSubjects();
    handleNavigation();
});

function loadHeader() {
    const header = document.getElementById('header');
    header.innerHTML = `
        <nav>
            <a href="#" data-route="home">Home</a>
            <a href="#" data-route="about">About</a>
        </nav>
    `;
}

function loadFooter() {
    const footer = document.getElementById('footer');
    footer.innerHTML = `
        <p>&copy; 2023 Vanilla JS SPA</p>
    `;
}

function handleNavigation() {
    document.body.addEventListener('click', (event) => {
        if (event.target.tagName === 'A' && event.target.dataset.route) {
            event.preventDefault();
            const route = event.target.dataset.route;
            navigateTo(route);
        }
    });
}

function navigateTo(route) {
    const mainContent = document.getElementById('main-content');
    if (route === 'home') {
        mainContent.innerHTML = `
            <h1>Home</h1>
            <div id="app"></div>
        `;
        loadSubjects();
    } else if (route === 'about') {
        mainContent.innerHTML = `
            <h1>About</h1>
            <p>This is a simple SPA built with Vanilla JS.</p>
        `;
    }
}

async function loadSubjects() {
    try {
        const response = await fetch('files.json');
        const subjects = await response.json();

        const app = document.getElementById('app');
        app.innerHTML = ''; // Clear previous content
        Object.keys(subjects).forEach((subject) => {
            const link = document.createElement('a');
            link.href = `subjects/${subject}/index.html`;
            link.textContent = subject;
            link.style.display = 'block';
            app.appendChild(link);
        });
    } catch (error) {
        console.error('Error loading subjects:', error);
    }
}
