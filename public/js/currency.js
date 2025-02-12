document.getElementById('convertCurrency').addEventListener('click', function() {
    // Using EJS syntax to inject the total price directly from the server-side
    const totalAmount = parseFloat('<%= basket.totalPrice.toFixed(2) %>'); // Ensures this is part of the EJS file
    const currency = document.getElementById('conversionCurrency').value;

    fetch(`/basket/convert-currency?baseCurrency=USD&targetCurrency=${currency}&amount=${totalAmount}`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        if(data.success) {
            document.getElementById('convertedTotal').textContent = `Converted Total: ${data.convertedAmount.toFixed(2)} ${currency}`;
        } else {
            document.getElementById('convertedTotal').textContent = 'Conversion error: ' + data.message;
        }
    })
    .catch(error => {
        console.error('Error converting currency:', error);
        document.getElementById('convertedTotal').textContent = 'Error performing conversion.';
    });
});