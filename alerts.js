class AlertList {
  constructor(containerId, onAlertClick) {
    this.container = document.getElementById(containerId);
    this.onAlertClick = onAlertClick;
  }

  createAlertElement(alert) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert-item';
    alertDiv.onclick = () => this.onAlertClick(alert);

    const title = document.createElement('h3');
    title.className = 'alert-title';
    title.textContent = alert.properties.title;

    const timeInfo = document.createElement('div');
    timeInfo.className = 'alert-info';
    timeInfo.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
      <span>${new Date(alert.properties.time).toLocaleString()}</span>
    `;

    const locationInfo = document.createElement('div');
    locationInfo.className = 'alert-info';
    locationInfo.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
      <span>${alert.properties.place}</span>
    `;

    alertDiv.appendChild(title);
    alertDiv.appendChild(timeInfo);
    alertDiv.appendChild(locationInfo);

    if (alert.properties.tsunami === 1) {
      const tsunamiWarning = document.createElement('div');
      tsunamiWarning.className = 'tsunami-warning';
      tsunamiWarning.textContent = 'Tsunami Warning';
      alertDiv.appendChild(tsunamiWarning);
    }

    return alertDiv;
  }

  updateAlerts(alerts) {
    const content = document.getElementById('alertsContent');
    content.innerHTML = '';
    alerts.forEach(alert => {
      content.appendChild(this.createAlertElement(alert));
    });
  }
}

const mockHelpCenters = [
  {
    id: '1',
    name: 'Central Emergency Hospital',
    position: { lat: 37.7749, lng: -122.4194 },
    address: '123 Emergency St, San Francisco, CA',
    phone: '+1 (555) 123-4567',
    type: 'hospital'
  }
];

class App {
  constructor() {
    this.earthquakes = [];
    this.mapManager = new MapManager();
    this.alertList = new AlertList('alertsContent', this.handleItemClick.bind(this));
    this.searchForm = document.getElementById('searchForm');
    this.modal = document.getElementById('modal');
    this.errorContainer = document.getElementById('errorContainer');

    this.initialize();
  }

  initialize() {
    this.mapManager.initialize('map', this.handleItemClick.bind(this));

    this.searchForm.addEventListener('submit', this.handleSearch.bind(this));
    document.querySelector('.close-button')?.addEventListener('click', () => this.closeModal());


    this.fetchEarthquakes();
    setInterval(() => this.fetchEarthquakes(), 300000); // Update every 5 minutes
  }

  async fetchEarthquakes(region = '') {
    try {
      const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson');
      if (!response.ok) throw new Error('Failed to fetch earthquake data');
      
      const data = await response.json();
      this.earthquakes = data.features.filter(eq => {
        if (!region) return true;
        return eq.properties.place.toLowerCase().includes(region.toLowerCase());
      });

      this.updateUI();
      this.hideError();
    } catch (error) {
      this.showError(error.message);
    }
  }

  updateUI() {
    this.mapManager.updateMarkers(this.earthquakes, mockHelpCenters);
    this.alertList.updateAlerts(this.earthquakes);
  }

  handleSearch(event) {
    event.preventDefault();
    const searchInput = document.getElementById('searchInput');
    this.fetchEarthquakes(searchInput.value);
  }

  handleItemClick(item) {
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalInfo');

    if (isEarthquake(item)) {
      modalTitle.textContent = item.properties.title;
      modalContent.innerHTML = `
        <div class="modal-info">
          <p><strong>Location:</strong> ${item.properties.place}</p>
          <p><strong>Magnitude:</strong> ${item.properties.mag}</p>
          <p><strong>Time:</strong> ${new Date(item.properties.time).toLocaleString()}</p>
          ${item.properties.tsunami === 1 ? '<p class="tsunami-warning">Tsunami Warning Active</p>' : ''}
          <p><a href="${item.properties.url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">More information</a></p>
        </div>
      `;
    } else if (isHelpCenter(item)) {
      modalTitle.textContent = item.name;
      modalContent.innerHTML = `
        <div class="modal-info">
          <p><strong>Address:</strong> ${item.address}</p>
          <p><strong>Phone:</strong> ${item.phone}</p>
          <p><strong>Type:</strong> ${item.type}</p>
        </div>
      `;
    }

    this.showModal();
  }

  showModal() {
    this.modal.classList.remove('hidden');
  }

  closeModal() {
    this.modal.classList.add('hidden');
  }

  showError(message) {
    this.errorContainer.textContent = message;
    this.errorContainer.classList.remove('hidden');
  }

  hideError() {
    this.errorContainer.classList.add('hidden');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});

