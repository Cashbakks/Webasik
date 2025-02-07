let map, service, userLocation, markers = [];

        function initMap() {
            map = new google.maps.Map(document.getElementById("map"), {
                zoom: 13,
                center: { lat: 35.6895, lng: 139.6917 }, // Default: Tokyo
            });
        }

        function searchStores() {
            let city = document.getElementById("cityInput").value;
            if (!city) return alert("Enter a city name!");

            let geocoder = new google.maps.Geocoder();
            geocoder.geocode({ address: city }, (results, status) => {
                if (status === "OK") {
                    let center = results[0].geometry.location;
                    map.setCenter(center);
                    fetchStores(center);
                } else {
                    alert("City not found.");
                }
            });
        }

        function fetchStores(location) {
            let request = { location, radius: 10000, keyword: "shoe store" };
            service = new google.maps.places.PlacesService(map);
            service.nearbySearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    displayStores(results, location);
                }
            });
        }

        function displayStores(stores, center) {
            markers.forEach(m => m.setMap(null));
            markers = [];

            let storeList = document.getElementById("store-list");
            storeList.innerHTML = "";

            stores.forEach(store => {
                let distance = google.maps.geometry.spherical.computeDistanceBetween(store.geometry.location, center);
                let imageUrl = store.photos ? store.photos[0].getUrl({ maxWidth: 100 }) : 'https://via.placeholder.com/60';

                let marker = new google.maps.Marker({
                    map, position: store.geometry.location, title: store.name,
                });

                let infoWindow = new google.maps.InfoWindow({
                    content: `<b>${store.name}</b><br>⭐ ${store.rating || "N/A"}<br>📍 ${(distance / 1000).toFixed(2)} km`
                });

                marker.addListener("mouseover", () => infoWindow.open(map, marker));
                marker.addListener("mouseout", () => infoWindow.close());

                let storeElement = document.createElement("div");
                storeElement.className = "store-item";
                storeElement.innerHTML = `<img class="store-img" src="${imageUrl}"><div class="store-info"><b>${store.name}</b><br>⭐ ${store.rating || "N/A"}<br>📍 ${(distance / 1000).toFixed(2)} km</div>`;
                storeElement.onclick = () => {
                    map.setCenter(store.geometry.location);
                    map.setZoom(15);
                    marker.setAnimation(google.maps.Animation.BOUNCE);
                    setTimeout(() => marker.setAnimation(null), 2000);
                };
                storeList.appendChild(storeElement);
            });
        }

        function useUserLocation() {
            navigator.geolocation.getCurrentPosition(
                pos => fetchStores({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => alert("Geolocation failed.")
            );
        }

        window.onload = initMap;