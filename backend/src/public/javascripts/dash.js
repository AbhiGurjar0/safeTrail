// let map = null;
// let userLocationMarker = null;

// --- Trip Toggling ---
function tripsToggle(button, sectionId) {
    document.getElementById("AllTrips").style.display = "none";
    document.getElementById("Upcoming").style.display = "none";
    document.getElementById("Completed").style.display = "none";
    document.getElementById(sectionId).style.display = "grid";

    const buttons = button.parentElement.querySelectorAll("button");
    buttons.forEach((btn) => {
        btn.classList.remove("bg-blue-500", "text-white", "shadow");
        btn.classList.add("text-gray-700");
    });
    button.classList.add("bg-blue-500", "text-white", "shadow");
}

// --- Form Helpers ---
function closeForm() {
    document.getElementById("journeyForm").style.display = "none";
}
function adjustPassengers(change) {
    const input = document.getElementById("passengers");
    let current = parseInt(input.value) + change;
    if (current < 1) current = 1;
    input.value = current;
}

// --- Emergency SOS ---
async function emergencyService() {
    if (!navigator.geolocation) {
        return alert("Geolocation is not supported by this browser.");
    }
    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            const payload = {
                touristId: "<%= user._id %>",
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
            };
            try {
                const response = await fetch("/emergencySos", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ payload }),
                });
                if (!response.ok)
                    throw new Error("Server responded with an error");
                alert(
                    "Emergency services have been notified. Help is on the way!"
                );
            } catch (error) {
                console.error("Error:", error);
                alert("Failed to notify emergency services. Please try again.");
            }
        },
        () => {
            alert(
                "Failed to get your location. Please enable location services."
            );
        }
    );
}


// --- Trip Management API Calls ---
function startTrip(element, id) {
    fetch("/startTrip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId: id }),
    })
        .then((res) => {
            if (!res.ok) throw new Error("Failed to start trip");
            return res.json();
        })
        .then((data) => {

            console.log("Trip started:", data);
            // Update UI
            document.getElementById(`tripStatus${id}`).textContent =
                "in-progress";

            // NEW: More robust way to update the button and its event handler
            element.classList.remove(
                "start-trip-btn",
                "bg-green-600",
                "hover:bg-green-700"
            );
            element.classList.add("bg-red-600", "hover:bg-red-700");
            element.innerHTML = `<i class="fas fa-stop mr-1"></i> End Trip`;
            tripStarted(data.tripDetails);

        })
        .catch((err) => alert("You have already a trip in progress"));
}

function endTrip(element, tripId) {
    fetch("/endTrip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId }),
    })
        .then((res) => {
            if (!res.ok) throw new Error("Failed to end trip");
            return res.json();
        })
        .then((data) => {
            console.log("Trip ended:", data);
            // Update UI
            document.getElementById(`tripStatus${tripId}`).textContent =
                "completed";

            // NEW: More robust way to update the button and its event handler
            element.classList.remove("bg-red-600", "hover:bg-red-700");
            element.classList.add("bg-gray-500", "cursor-not-allowed");
            element.innerHTML = `<i class="fas fa-check mr-1"></i> Completed`;
            element.onclick = null; // Remove the click handler as it's completed
            element.disabled = true; // Disable the button
            let tripDetails = localStorage.setItem("activeTrip", "");
            tripStarted(tripDetails)
        })
        .catch((err) => console.error("Error ending trip:", err));
}

// function endTrip(element, tripId) {


//     let tripStatus = document.getElementById(`tripStatus${tripId}`);
//     tripStatus.innerHTML = '';
//     tripStatus.innerHTML = 'Completed'

//     element.innerHTML = '';
//     element.innerHTML = `
//      <i class="fas fa-play"></i>
//         completed
//      `
//     element.removeAttribute("onclick")
//     // backend call
//     fetch('/endTrip', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ tripId })
//     })
//         .then(r => r.json())
//         .then(data => console.log('Trip ended:', data))
//         .catch(err => console.error('Error ending trip:', err));
// }



// let socket = io();
// socket.on("alert", ({ message }) => {
//   alert(`Safety Alert: ${message}`);
// });



// Center map on current position
const currentLat = 26.825511139750535;
const currentLng = 75.86511835620566;

let map = L.map('map').setView([currentLat, currentLng], 14);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);
function currentLocation(lat, lon) {
    const circle = L.circleMarker([lat, lon], {
        radius: 10,
        color: "green",
        fillColor: "green",
        fillOpacity: 0.6
    }).addTo(map);

    // Blinking effect
    let visible = true;
    setInterval(() => {
        circle.setStyle({
            fillOpacity: visible ? 0.2 : 0.6
        });
        visible = !visible;
    }, 500);
}
currentLocation(26.825, 75.856);
async function tripStarted(tripDetails) {
    // Save trip details to localStorage for persistence
    localStorage.setItem("activeTrip", JSON.stringify(tripDetails));

    await renderTrip(tripDetails);
}
async function renderTrip(tripDetails) {

    // ensure globals for easy cleanup on endTrip
    if (!window.tripStartMarker) window.tripStartMarker = null;
    if (!window.tripEndMarker) window.tripEndMarker = null;
    if (!window.tripRouteLine) window.tripRouteLine = null;
    const coords1 = await coOrdinates(`${tripDetails.startLocation}`);
    const coords2 = await coOrdinates(`${tripDetails.endLocation}`);

    if (!coords1 || !coords2) {
        console.error('Could not resolve trip coordinates', coords1, coords2);
        return;
    }

    const startPoint = [coords1.lat, coords1.lon];
    const endPoint = [coords2.lat, coords2.lon];

    // remove any previous trip layers first
    if (window.tripStartMarker) {
        map.removeLayer(window.tripStartMarker);
        window.tripStartMarker = null;
    }
    if (window.tripEndMarker) {
        map.removeLayer(window.tripEndMarker);
        window.tripEndMarker = null;
    }
    if (window.tripRouteLine) {
        map.removeLayer(window.tripRouteLine);
        window.tripRouteLine = null;
    }

    // add new trip layers and keep references for removal later
    window.tripStartMarker = L.marker(startPoint, { title: 'Trip Start' })
        .addTo(map)
        .bindPopup('Trip Start');

    window.tripEndMarker = L.marker(endPoint, { title: 'Trip End' })
        .addTo(map)
        .bindPopup('Trip End');

    window.tripRouteLine = L.polyline([startPoint, endPoint], { color: 'blue' })
        .addTo(map);

    // optionally fit map to the route
    try {
        map.fitBounds(L.latLngBounds([startPoint, endPoint]), { padding: [50, 50] });
    } catch (e) {
        // ignore fit errors
    }


}
async function coOrdinates(city) {
    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`);
        const data = await res.json();
        if (!data || data.length === 0) return null;
        const { lat, lon } = data[0];
        return { lat: parseFloat(lat), lon: parseFloat(lon) };
    } catch (err) {
        console.error('Geocode error:', err);
        return null;
    }
}

window.addEventListener("load", async () => {
    const activeTrip = localStorage.getItem("activeTrip");
    if (activeTrip) {
        const tripDetails = JSON.parse(activeTrip);
        await renderTrip(tripDetails);
        console.log(tripDetails.startLocation)
    }
});


// function endTrip(element, tripId) {
//     fetch("/endTrip", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ tripId }),
//     })
//         .then((res) => {
//             if (!res.ok) throw new Error("Failed to end trip");
//             return res.json();
//         })
//         .then((data) => {
//             console.log("Trip ended:", data);
//             // Update UI
//             document.getElementById(`tripStatus${tripId}`).textContent =
//                 "completed";

//             // NEW: More robust way to update the button and its event handler
//             element.classList.remove("bg-red-600", "hover:bg-red-700");
//             element.classList.add("bg-gray-500", "cursor-not-allowed");
//             element.innerHTML = `<i class="fas fa-check mr-1"></i> Completed`;
//             element.onclick = null; // Remove the click handler as it's completed
//             element.disabled = true; // Disable the button
//             let tripDetails = localStorage.setItem("activeTrip", "");
//             tripStarted(tripDetails)
//         })
//         .catch((err) => console.error("Error ending trip:", err));
// }

// --- Safety Settings ---
async function updateLocationSetting(clickedButton, settingValue) {
    const buttons = document.querySelectorAll(
        "#locationSharingButtons button"
    );
    buttons.forEach((button) => {
        button.classList.remove("bg-blue-600", "text-white");
        button.classList.add("bg-gray-200", "text-gray-700");
    });

    clickedButton.classList.remove("bg-gray-200", "text-gray-700");
    clickedButton.classList.add("bg-blue-600", "text-white");

    if (userLocationMarker) {
        if (settingValue === "off") {
            map.removeLayer(userLocationMarker);
        } else {
            // This was the line with the typo. It is now corrected.
            if (!map.hasLayer(userLocationMarker)) {
                userLocationMarker.addTo(map);
            }
        }
    }

    try {
        const response = await fetch("/user/settings/location", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: "<%= user._id %>",
                locationSharing: settingValue,
            }),
        });
        if (!response.ok) throw new Error("Failed to save setting");
        const result = await response.json();
        console.log("Setting saved:", result);
    } catch (error) {
        console.error("Error saving setting:", error);
    }
}

// --- Leaflet Map Initialization ---
// document.addEventListener("DOMContentLoaded", function () {
// const currentPoint = turf.point([currentLng, currentLat]);
// map = L.map("map").setView([26.9124, 75.7873], 13);
// L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//     maxZoom: 19,
//     attribution: "© OpenStreetMap",
// }).addTo(map);

// if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(async (pos) => {
//         const currentPos = [pos.coords.latitude, pos.coords.longitude];
//         L.circleMarker(currentPos, {
//             radius: 8,
//             color: 'red',
//             fillColor: 'green',
//             fillOpacity: 0.7
//         }).addTo(map)
//             .bindPopup('Current Position');
//     });

// }
const restrictedZones = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": { "name": "Restricted Zone", "severity": 8 },
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [76.86411835620566, 26.824511139750535],
                        [76.86611835620567, 26.824511139750535],
                        [76.86611835620567, 26.826511139750536],
                        [76.86411835620566, 26.826511139750536],
                        [76.86411835620566, 26.824511139750535]
                    ]
                ]

            }
        }
    ]
};

L.geoJSON(restrictedZones, {
    style: { color: 'blue', fillColor: '#ff4d4d', fillOpacity: 0.35 }
}).addTo(map);
const currentPoint = turf.point([currentLng, currentLat]);


const inside = turf.booleanPointInPolygon(currentPoint, restrictedZones.features[0]);

if (inside) {
    alert("⚠️ You are inside a restricted area!");
} else {
    console.log("✅ Safe zone");
}


async function getWeather(city) {
    const apiKey = 'fab1287105dc652116091b8007a1638a';
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
    const data = await res.json();
    console.log(data);
    let rainLevel = data.rain && data.rain["1h"] ? data.rain["1h"] : 0;
    let text = "";
    if (rainLevel === 0) {
        text = "🌤 No recent rain. Weather is clear.";
    } else if (rainLevel < 2.5) {
        text = `🌧 Light rain: ${rainLevel} mm in last 1h.`;
    } else if (rainLevel < 7.6) {
        text = `🌧🌧 Moderate rain: ${rainLevel} mm in last 1h. Carry an umbrella.`;
    } else {
        text = `🌧🌧🌧 Heavy rain alert! ${rainLevel} mm in last 1h. Stay safe.`;
    }




    return {
        city: data.name,
        country: data.sys.country,
        temperature: Math.floor(data.main.temp),
        humidity: data.main.humidity,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        windSpeed: (data.wind.speed * (5 / 18)).toFixed(2),
        windDirection: data.wind.deg,
        pressure: data.main.pressure,
        visibility: (data.visibility / 1000),
        dateTime: new Date(data.dt * 1000).toLocaleString(),
        rainChance: data.rain && data.rain["1h"] ? `${data.rain["1h"]} mm (last 1h)` : "No recent rain"
    }
}

// weights
const weights = { zone: 30, route: 20, inactivity: 20, time: 15, anomaly: 15 };

async function calculateSafetyScore(userLocation, userRoute, geoFences, lastActiveTime) {
    let score = 100;
    console.log("started")
    // async function getWeatherScore(data) {
    //     let res = await fetch('/ai/genai/score', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ data }),
    //     });
    //     res = await res.json();
    //     return res;
    // }

    // try {
    //     const weatherData = await getWeather("jaipur");
    //     let data = await getWeatherScore(weatherData);
    //     data = data.reply.replace(/```json/g, "").replace(/```/g, "").trim();
    //     let parsed = JSON.parse(data);

    //     console.log(parsed);
    //     console.log("Weather risk:", parsed["Risk_score"]);

    //     score -= parsed["Risk_score"];
    // } catch (err) {
    //     console.error("Weather error:", err);
    // }

    // Inactivity check
    const now = new Date();
    if ((now - lastActiveTime) / 60000 > 30) score -= 15;

    // Time-based risk (IST)
    const hour = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
        hour: "numeric",
        hour12: false
    });
    if (hour >= 23 || hour <= 4) score -= 10;

    return Math.max(0, score);
}

// Example usage
calculateSafetyScore(" ", " ", " ", new Date(Date.now() - 40 * 60000)) // inactive > 30min
    .then(score => {
        console.log("Final Safety Score:", score);
        document.getElementById("safetyScoreDisplay").textContent = `${score}%`;
    });

// // Geolocation
// if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition((pos) => {
//         const userPos = [pos.coords.latitude, pos.coords.longitude];
//         map.setView(userPos, 13);
//         userLocationMarker = L.marker(userPos)
//             .addTo(map)
//             .bindPopup("Your current location");
//     });
// }

// });

// function for emergency contact
// --- Emergency Contact Functions ---
function openContactModal() {
    document.getElementById("addContactModal").classList.remove("hidden");
}

function closeContactModal() {
    document.getElementById("addContactModal").classList.add("hidden");
}

function renderContact(contact) {
    const list = document.getElementById("emergencyContactsList");
    if (!list) return; // Failsafe if the list element isn't found

    const contactEl = document.createElement("div");
    contactEl.className =
        "flex items-center justify-between bg-gray-100 rounded-md px-4 py-2 text-gray-700 text-sm";

    // Create the text part of the contact
    const textPart = document.createElement("span");
    textPart.textContent = `${contact.name} (${contact.number})`;

    // Create the call button
    const callButton = document.createElement("a"); // Changed to an anchor tag for calling
    callButton.href = `tel:${contact.number}`;
    callButton.setAttribute("aria-label", `Call ${contact.name}`);
    callButton.className = "text-gray-400 hover:text-gray-600";
    callButton.innerHTML = `
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.272 1.09l-2.09 1.68a12.042 12.042 0 005.516 5.516l1.68-2.09a1 1 0 011.09-.272l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.163 21 3 14.837 3 7V5z" />
                  </svg>
                  `;

    contactEl.appendChild(textPart);
    contactEl.appendChild(callButton);
    list.appendChild(contactEl);
}

// Add an event listener for the new form
const contactForm = document.getElementById("addContactForm");
if (contactForm) {
    contactForm.addEventListener("submit", async function (event) {
        event.preventDefault(); // Stop the form from reloading the page

        const name = document.getElementById("contactName").value;
        const number = document.getElementById("contactNumber").value;

        if (!name || !number) {
            return alert("Please enter both a name and a number.");
        }

        try {
            const response = await fetch("/user/contacts/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, number }),
            });

            if (!response.ok) throw new Error("Failed to save contact");

            const newContact = await response.json();

            renderContact(newContact); // Add the new contact to the sidebar list
            closeContactModal(); // Close the pop-up
            this.reset(); // Clear the form fields
        } catch (error) {
            console.error("Error saving contact:", error);
            alert("Could not save contact. Please try again.");
        }
    });
}


// async function getWeather(city) {
//     const apiKey = 'fab1287105dc652116091b8007a1638a';
//     const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);

//     const data = await res.json();
//     console.log(data);
//     let rainLevel = data.rain && data.rain["1h"] ? data.rain["1h"] : 0;
//     let text = "";
//     if (rainLevel === 0) {
//         text = "🌤 No recent rain. Weather is clear.";
//     } else if (rainLevel < 2.5) {
//         text = `🌧 Light rain: ${rainLevel} mm in last 1h.`;
//     } else if (rainLevel < 7.6) {
//         text = `🌧🌧 Moderate rain: ${rainLevel} mm in last 1h. Carry an umbrella.`;
//     } else {
//         text = `🌧🌧🌧 Heavy rain alert! ${rainLevel} mm in last 1h. Stay safe.`;
//     }
//     return {
//         city: data.name,
//         country: data.sys.country,
//         temperature: Math.floor(data.main.temp),
//         humidity: data.main.humidity,
//         description: data.weather[0].description,
//         icon: data.weather[0].icon,
//         windSpeed: (data.wind.speed * (5 / 18)).toFixed(2),
//         windDirection: data.wind.deg,
//         pressure: data.main.pressure,
//         visibility: (data.visibility / 1000),
//         dateTime: new Date(data.dt * 1000).toLocaleString(),
//         rainChance: data.rain && data.rain["1h"] ? `${data.rain["1h"]} mm (last 1h)` : "No recent rain"


//     }
// // }

// async function main() {
//     try {
//         const weatherData = await getWeather("jaipur");
//         let data = await getWeatherScore(weatherData);
//         data = data.reply;
//         data = data.replace(/```json/g, "").replace(/```/g, "").trim();
//         let parsed = JSON.parse(data);
//         console.log(parsed)
//         console.log(parsed["Risk_score"]);
//         // score -= parsed["Risk_score"];
//     } catch (err) {
//         console.error(err);
//     }

// }


// main();


// restricted area alerts  system

// const restrictedZones = {
//     "type": "FeatureCollection",
//     "features": [
//         {
//             "type": "Feature",
//             "properties": { "name": "Restricted Zone", "severity": 8 },
//             "geometry": {
//                 "type": "Polygon",
//                 "coordinates": [
//                     [
//                         [77.592, 12.971],
//                         [77.595, 12.971],
//                         [77.595, 12.973],
//                         [77.592, 12.973],
//                         [77.592, 12.971]
//                     ]
//                 ]
//             }
//         }
//     ]
// };

// const restrictedLayer = L.geoJSON(restrictedZones, {
//     style: {
//         color: 'blue',
//         fillColor: '#ff4d4d',
//         fillOpacity: 0.5
//     }
// }).addTo(map);

// map.fitBounds(restrictedLayer.getBounds());


// function isInsideRestrictedZone(lat, lng) {
//     console.log("hi")
//     const point = turf.point([lng, lat]); // GeoJSON: [lng, lat]
//     return restrictedZones.features.some(zone =>
//         turf.booleanPointInPolygon(point, zone)
//     );
// } if (isInsideRestrictedZone(12.973, 77.595)) {
//     console.log("hi");
//     // alert("⚠️ Warning: You are inside a restricted zone!");
//     // window.userMarker.setStyle({ color: "red", fillColor: "red" });
// } else {
//     // window.userMarker.setStyle({ color: "green", fillColor: "lime" });
// }


