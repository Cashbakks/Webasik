document.getElementById('translateButton').addEventListener('click', function() {
    const translateElement = document.getElementById("google_translate_element");
    if (translateElement.style.display === "none") {
        translateElement.style.display = "block";  // Show the translate widget
        googleTranslateElementInit();  // Initialize Google Translate
    } else {
        translateElement.style.display = "none";  // Hide the translate widget
    }
});

// Initialize Google Translate Element
function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'en',  // Default language of the page
        includedLanguages: 'en,es,fr,de,it,pt,ru', // Languages you want to support
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE
    }, 'google_translate_element');
}