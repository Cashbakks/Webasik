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
 // Get popup elements
 const popup = document.getElementById('popup');
 const popupMessage = document.getElementById('popup-message');
 const popupClose = document.getElementById('popup-close');

 // Handle popup close button
 popupClose.addEventListener('click', () => {
     popup.classList.add('hidden');
 });

 // Display popup for errors or success messages
 const urlParams = new URLSearchParams(window.location.search);
 const message = urlParams.get('message');
 const type = urlParams.get('type'); // success or error

 if (message) {
     popupMessage.textContent = message;

     // Add success or error class
     if (type === 'success') {
         popup.classList.add('success-popup');
     } else if (type === 'error') {
         popup.classList.add('error-popup');
     }

     popup.classList.remove('hidden');
 }