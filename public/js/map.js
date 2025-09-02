let map, service, markers = [], userMarker = null, infoWindow = null;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 35.6895, lng: 139.6917 }, // Default: Tokyo
        zoom: 13,
    });
}

function searchStores() {
    const city = document.getElementById("cityInput").value.trim();
    if (!city) {
        alert("Please enter a city name!");
        return;
    }

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: city }, (results, status) => {
        if (status === "OK") {
            const center = results[0].geometry.location;
            map.setCenter(center);
            fetchStores(center);
        } else {
            alert("City not found. Please try again.");
        }
    });
}

function fetchStores(location) {
    const radius = parseInt(document.getElementById("distanceFilter").value) * 1000;
    const request = {
        location,
        radius,
        keyword: "shoe store",
    };

    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            displayStores(results, location);
        } else {
            alert("No shoe stores found in the specified area.");
        }
    });
}

function displayStores(stores, userLocation) {
    // Clear previous markers
    markers.forEach(marker => marker.setMap(null));
    markers = [];

    const storeList = document.getElementById("store-list");
    storeList.innerHTML = "";

    const minRating = parseFloat(document.getElementById("ratingFilter").value);

    stores.forEach(store => {
        const distance = google.maps.geometry.spherical.computeDistanceBetween(
            store.geometry.location,
            userLocation
        );
        const imageUrl = store.photos ? store.photos[0].getUrl({ maxWidth: 100 }) : 'https://via.placeholder.com/60';

        if (store.rating >= minRating) {
            const marker = new google.maps.Marker({
                position: store.geometry.location,
                map: map,
                title: store.name,
            });
            markers.push(marker);

            const contentString = `
                <div style="text-align: center;">
                    <img src="${imageUrl}" style="width: 100px; height: 100px; border-radius: 5px; margin-bottom: 10px;">
                    <br><b>${store.name}</b>
                    <br>⭐ ${store.rating || "N/A"}
                    <br>📍 ${(distance / 1000).toFixed(2)} km
                </div>
            `;

            const storeInfoWindow = new google.maps.InfoWindow({
                content: contentString,
            });

            marker.addListener("click", () => {
                if (infoWindow) {
                    infoWindow.close();
                }
                storeInfoWindow.open(map, marker);
                infoWindow = storeInfoWindow;
                map.setCenter(marker.getPosition());
                map.setZoom(15);
            });

            const storeElement = document.createElement("div");
            storeElement.className = "store-item";
            storeElement.innerHTML = `
                <img class="store-img" src="${imageUrl}" alt="Store">
                <div class="store-info">
                    <strong>${store.name}</strong><br>
                    ⭐ ${store.rating || "N/A"}<br>
                    📍 ${(distance / 1000).toFixed(2)} km
                </div>
            `;
            storeElement.onclick = () => {
                google.maps.event.trigger(marker, "click");
            };

            storeList.appendChild(storeElement);
        }
    });

    if (storeList.innerHTML === "") {
        storeList.innerHTML = "<p>No stores match the selected filters.</p>";
    }
}

function useUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                if (userMarker) {
                    userMarker.setMap(null); // Remove previous user marker
                }

                userMarker = new google.maps.Marker({
                    position: userLocation,
                    map: map,
                    title: "Your Location",
                    icon: {
                        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                    },
                });

                map.setCenter(userLocation);
                fetchStores(userLocation);
            },
            () => alert("Unable to retrieve your location.")
        );
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}

window.onload = initMap;
