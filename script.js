document.addEventListener('DOMContentLoaded', async function () {
    const profileMenu = document.getElementById('profile-menu');
    const signupLink = document.getElementById('signupLink');
    const loginLink = document.getElementById('loginLink');
    const logoutLink = document.getElementById('logoutLink');
    const profilePic = document.getElementById('profile-pic');
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');

    // Handle signup form submission
    if (signupForm) {
        signupForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            try {
                const response = await fetch('/auth/signup', { // Add '/auth' prefix
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password }),
                });

                if (response.ok) {
                    localStorage.setItem('userLoggedIn', 'true');
                    window.location.href = 'index.html'; // Redirect after successful signup
                } else {
                    const errorData = await response.json();
                    alert('Signup failed: ' + (errorData.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error during signup:', error);
                alert('An error occurred. Please try again later.');
            }
        });
    }

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            try {
                const response = await fetch('/auth/login', { // Add '/auth' prefix
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                const result = await response.json();

                if (response.ok) {
                    localStorage.setItem('userLoggedIn', 'true');
                    window.location.href = result.redirectTo; // Redirect after successful login
                } else {
                    alert(result.message || 'Login failed');
                }
            } catch (error) {
                console.error('Error during login:', error);
                alert('An error occurred. Please try again later.');
            }
        });
    }

    // Check user login status
    const userLoggedIn = localStorage.getItem('userLoggedIn') === 'true';

    if (userLoggedIn) {
        try {
            const response = await fetch('/api/user');
            if (response.ok) {
                const data = await response.json();

                if (data.user) {
                    if (profileMenu) profileMenu.style.display = 'inline';
                    if (signupLink) signupLink.style.display = 'none';
                    if (loginLink) loginLink.style.display = 'none';
                    if (logoutLink) logoutLink.style.display = 'inline';

                    if (profilePic && data.user.profilePicture) {
                        profilePic.src = data.user.profilePicture;
                        profilePic.style.display = 'block';
                    }
                } else {
                    handleLogoutUI();
                }
            } else {
                console.warn('Failed to fetch user data');
                handleLogoutUI();
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            handleLogoutUI();
        }
    } else {
        handleLogoutUI();
    }

    // Handle logout
    if (logoutLink) {
        logoutLink.addEventListener('click', function () {
            localStorage.removeItem('userLoggedIn');
            handleLogoutUI();
            window.location.href = 'index.html';
        });
    }

    // Helper function to handle logout UI
    function handleLogoutUI() {
        if (profileMenu) profileMenu.style.display = 'none';
        if (signupLink) signupLink.style.display = 'inline';
        if (loginLink) loginLink.style.display = 'inline';
        if (logoutLink) logoutLink.style.display = 'none';
        if (profilePic) profilePic.style.display = 'none';
    }
});
