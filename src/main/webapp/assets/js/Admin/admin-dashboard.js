document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const contentArea = document.getElementById('content-area');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // If it's logout link, redirect immediately
            if (link.classList.contains('logout')) {
                window.location.href = link.getAttribute('href');
                return;
            }

            // Update active class
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Load new page via AJAX
            const page = link.getAttribute('data-page');
            if (page) {
                fetch(page)
                    .then(response => {
                        if (!response.ok) throw new Error('Page not found');
                        return response.text();
                    })
                    .then(data => {
                        contentArea.innerHTML = data;
                    })
                    .catch(error => {
                        contentArea.innerHTML = '<p>Error loading content: ' + error.message + '</p>';
                        console.error('Error:', error);
                    });
            }
        });
    });

    // Load default tab (User Management) on first load
    const defaultLink = document.querySelector('.nav-link[data-page*="admin-Manage-Users.jsp"]');
    if (defaultLink) defaultLink.click();
});
