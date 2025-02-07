// Check if we're on the profile page
if (document.getElementById('profile-page')) {
    console.log('Profile page script loaded.');

    const form = document.getElementById('profile-form');
    const usernameInput = document.getElementById('profile-username');
    const passwordInput = document.getElementById('profile-password');

    // Example: Log form submission
    form.addEventListener('submit', (e) => {
        console.log('Profile form submitted.');
        console.log('New Username:', usernameInput.value);
        console.log('New Password:', passwordInput.value);
    });
}
// Attach event listeners to all forms
document.querySelectorAll('.action-form').forEach(form => {
    form.addEventListener('submit', function (e) {
        e.preventDefault(); // Prevent the default form submission

        // Show the notification
        const message = this.querySelector('button').getAttribute('data-message');
        const notification = document.getElementById('notification');
        const notificationMessage = document.getElementById('notification-message');

        notificationMessage.textContent = message;
        notification.classList.remove('hidden');

        // Submit the form after a delay
        setTimeout(() => {
            notification.classList.add('hidden'); // Hide the notification
            this.submit(); // Submit the form
        }, 2000); // 2 seconds delay
    });
});