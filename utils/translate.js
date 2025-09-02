const { TranslationServiceClient } = require('@google-cloud/translate');
const projectId = 'crypto-coral-449108-u9'; // Your Google Cloud project ID
const apiKey = 'AIzaSyAnhx2Y2HJ60L7AhYeqvH2zQXgKnDg-8FM'; // The API Key you generated
const translate = new TranslationServiceClient({ key: apiKey });

async function translateText(text, targetLanguage) {
    try {
        const [response] = await translate.translateText({
            parent: `projects/${projectId}/locations/global`,
            contents: [text],
            targetLanguageCode: targetLanguage,
            mimeType: 'text/html',
        });
        return response.translations[0].translatedText;
    } catch (error) {
        console.error("Error translating text:", error);
        throw error;
    }
}

module.exports = translateText;
