
const shoes = [
    { name: "Air Force Hanni", description: "Nike's 1st Lifestyle Air Max returns with a vibrant color gradient.", imageUrl: "/images/hanni.png", price: "$240.00" },
    { name: "Air Force Haerin", description: "Light and comfy with a sleek design.", imageUrl: "/images/haerin.png", price: "$200.00" },
    { name: "Air Force Daniel", description: "Perfect for the sporty touch in your everyday outfit.", imageUrl: "/images/daniel.png", price: "$180.00" },
    { name: "Air Force Hyien", description: "Stylish yet practical, ideal for all seasons.", imageUrl: "/images/hyein.png", price: "$220.00" },
    { name: "Air Force Minji", description: "Elegant design with exceptional comfort.", imageUrl: "/images/minji.png", price: "$210.00" }
];
 
let currentCenterIndex = 0;
let autoRotateInterval;

window.onload = function() {
    updateCarousel(currentCenterIndex);
    startAutoRotate();
};

function startAutoRotate() {
    if (autoRotateInterval) clearInterval(autoRotateInterval);
    autoRotateInterval = setInterval(() => {
        rotateNext();
    }, 5000);
}

function rotateNext() {
    currentCenterIndex = (currentCenterIndex + 1) % shoes.length;
    updateCarousel(currentCenterIndex);
}

function updateCarousel(centerIndex) {
    const selector = document.getElementById('shoeSelector');
    selector.innerHTML = '';

    for (let i = -1; i <= 1; i++) { // Limit display to three shoes
        let index = (centerIndex + i + shoes.length) % shoes.length;
        let shoe = shoes[index];
        let img = document.createElement('img');
        img.src = shoe.imageUrl;
        img.alt = shoe.name;
        img.className = 'shoe-image ' + (i === 0 ? 'center' : 'side');
        img.onclick = () => {
            clearInterval(autoRotateInterval);
            updateCarousel(index);
            startAutoRotate();
        };
        selector.appendChild(img);
    }

    updateShoe(shoes[centerIndex]);
}


function updateShoe(shoe) {
    const shoeDisplay = document.getElementById('main-shoe-image');
    
    // Remove the class to reset the animation
    shoeDisplay.classList.remove('shoe-image-active');

    // Change the image source
    shoeDisplay.src = shoe.imageUrl;

    // Delay slightly before re-adding the class to re-trigger the animation
    setTimeout(() => {
        shoeDisplay.classList.add('shoe-image-active');
    }, 10); // Short delay ensures CSS re-applies the animation

    // Update text information
    document.getElementById('shoe-name').textContent = shoe.name;
    document.getElementById('shoe-description').textContent = shoe.description;
    document.getElementById('shoe-price').textContent = shoe.price;
}

