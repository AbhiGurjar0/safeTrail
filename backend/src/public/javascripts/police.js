const requests = [
    {
        id: 'TS-A7X9K2M4P',
        name: 'John Doe',
        contact: '+33 612345678',
        emergencyContact: '+33 699876543',
        emergency: 'Medical Assistance',
        location: 'Eiffel Tower, Paris',
        coordinates: '48.8584,2.2945',
        nationality: 'France',
        passport: 'FR12345678',
        email: 'john@example.com',
        hotel: 'Le Meurice, Paris',
        travelDates: '15 Sep – 20 Sep 2025',
        healthInfo: 'No allergies',
        guide: 'Pierre (Driver)',
        lastLocation: 'Eiffel Tower, Paris',
        safetyStatus: 'Active',
        startCity: 'Jaipur',
        startTime: '12 Sep 2025, 10:00 AM',
        endCity: 'Delhi',
        endTime: '12 Sep 2025, 05:00 PM',
        status: 'active'
    },
    {
        id: 'TS-B6Y1L3N50',
        name: 'Jane Smith',
        contact: '+44 7700123456',
        emergencyContact: '+44 7711122233',
        emergency: 'Lost Tourist',
        location: 'Tower Bridge, London',
        coordinates: '51.5055,-0.0754',
        nationality: 'UK',
        passport: 'UK98765432',
        email: 'jane@example.com',
        hotel: 'Hilton London',
        travelDates: '12 Sep – 20 Sep 2025',
        healthInfo: 'Asthma',
        guide: 'Ramesh (Guide)',
        lastLocation: 'Tower Bridge, London',
        safetyStatus: 'Safe',
        startCity: 'London',
        startTime: '12 Sep 2025, 09:00 AM',
        endCity: 'Edinburgh',
        endTime: '12 Sep 2025, 07:00 PM',
        status: 'resolved'
    }
];

const container = document.getElementById('requests-container');
const modalContent = document.getElementById('modalContent');
const tripContent = document.getElementById('tripContent');

function renderRequests() {
    container.innerHTML = '';

    requests.forEach(req => {
        const cardTheme = req.status === 'active' ? 'bg-red-500/10 border-red-300' : 'bg-green-500/10 border-green-300';
        const iconColor = req.status === 'active' ? 'bg-red-500' : 'bg-green-500';
        const tagColor = req.status === 'active' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600';

        const cardHTML = `
      <div class="flex flex-col md:flex-row justify-between p-4 rounded-lg border ${cardTheme} shadow-sm backdrop-filter backdrop-blur-sm">
        <div class="flex flex-col md:flex-row md:items-center md:space-x-6">
          <div class="flex items-center space-x-4">
            <div class="w-10 h-10 rounded-full ${iconColor} flex items-center justify-center text-white">
              <i data-feather="alert-triangle" class="w-5 h-5"></i>
            </div>
            <div class="flex flex-col space-y-1">
              <div class="font-medium text-gray-800">${req.name}</div>
              <div class="text-sm text-gray-600">${req.id}</div>
              <div class="text-sm text-gray-600"><strong>Location:</strong> ${req.location}</div>
              <div class="text-sm text-gray-600"><strong>Emergency:</strong> ${req.emergency}</div>
              <div class="text-sm text-gray-600"><strong>Time:</strong> ${req.time || 'Just now'}</div>
            </div>
          </div>
        </div>
        <div class="flex flex-col md:flex-row md:items-center md:space-x-2 mt-4 md:mt-0">
          <span class="px-3 py-1 text-xs font-semibold rounded-full uppercase ${tagColor}">${req.status}</span>
          <button onclick='viewTourist("${req.id}")' class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mb-1 md:mb-0">View</button>
          ${req.status === 'active'
                ? `<button onclick='resolveTourist("${req.id}")' class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">Resolve</button>`
                : ''}
        </div>
      </div>
    `;
        container.insertAdjacentHTML('beforeend', cardHTML);
    });
    feather.replace();
}

function viewTourist(id, lat,lng) {
    const req = requests.find(r => r.id === id);
    if (!req) return;

    modalContent.innerHTML = `
    <p class="flex items-center gap-2"><i data-feather="user" class="w-4 h-4 text-blue-500"></i> <strong>Name:</strong> ${req.name}</p>
    <p class="flex items-center gap-2"><i data-feather="flag" class="w-4 h-4 text-green-500"></i> <strong>Nationality:</strong> ${req.nationality}</p>
    <p class="flex items-center gap-2"><i data-feather="phone" class="w-4 h-4 text-indigo-500"></i> <strong>Contact:</strong> ${req.contact}</p>
    <p class="flex items-center gap-2"><i data-feather="phone-call" class="w-4 h-4 text-red-500"></i> <strong>Emergency Contact:</strong> ${req.emergencyContact}</p>
    <p class="flex items-center gap-2"><i data-feather="mail" class="w-4 h-4 text-pink-500"></i> <strong>Email:</strong> ${req.email}</p>
    <p class="flex items-center gap-2"><i data-feather="id-card" class="w-4 h-4 text-gray-600"></i> <strong>ID Proof:</strong> ${req.passport}</p>
    <p class="flex items-center gap-2"><i data-feather="heart" class="w-4 h-4 text-red-400"></i> <strong>Health Info:</strong> ${req.healthInfo}</p>
    <p class="flex items-center gap-2"><i data-feather="shield" class="w-4 h-4 text-green-500"></i> <strong>Safety Status:</strong> ${req.safetyStatus}</p>
  `;

    tripContent.innerHTML = `
    <div class="flex flex-col items-center">
      <div class="flex items-center gap-2">
        <i data-feather="map-pin" class="w-5 h-5 text-red-500"></i>
        <span class="text-lg">${req.startCity}</span>
      </div>
      <span class="text-sm text-gray-500">${req.startTime}</span>
    </div>

    <div class="flex items-center w-2/5 relative">
      <div class="border-t-2 border-blue-500 w-full"></div>
    </div>

    <div class="flex flex-col items-center">
      <div class="flex items-center gap-2">
        <i data-feather="map-pin" class="w-5 h-5 text-green-600"></i>
        <span class="text-lg">${req.endCity}</span>
      </div>
      <span class="text-sm text-gray-500">${req.endTime}</span>
    </div>
  `;

    
    mapContainer.innerHTML = `
    <iframe 
      width="100%" 
      height="100%" 
      src="https://maps.google.com/maps?q=${lat.trim()},${lng.trim()}&hl=es;z=14&output=embed" 
      frameborder="0" 
      allowfullscreen
    ></iframe>
  `;

    document.getElementById("touristModal").classList.remove("hidden");
    feather.replace();
}

function closeTouristModal() {
    document.getElementById("touristModal").classList.add("hidden");
}

function resolveTourist(id) {
    const req = requests.find(r => r.id === id);
    if (req) req.status = 'resolved';
    renderRequests();
}

renderRequests();
const socket = io();