class MapManager {
  constructor() {
    this.map = null;
    this.markers = [];
    this.onMarkerClick = null;
  }

  initialize(elementId, onMarkerClick) {
    this.onMarkerClick = onMarkerClick;
    this.map = new google.maps.Map(document.getElementById(elementId), {
      center: { lat: 0, lng: 0 },
      zoom: 2,
      styles: [
        {
          featureType: 'all',
          elementType: 'all',
          stylers: [{ saturation: -100 }]
        }
      ]
    });
  }

  clearMarkers() {
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];
  }

  addEarthquakeMarker(earthquake) {
    const [lng, lat] = earthquake.geometry.coordinates;
    const marker = new google.maps.Marker({
      position: { lat, lng },
      map: this.map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: earthquake.properties.mag * 5,
        fillColor: '#ef4444',
        fillOpacity: 0.4,
        strokeWeight: 1
      },
      title: earthquake.properties.title
    });

    marker.addListener('click', () => this.onMarkerClick(earthquake));
    this.markers.push(marker);
  }

  addHelpCenterMarker(center) {
    const marker = new google.maps.Marker({
      position: center.position,
      map: this.map,
      icon: {
        url: `/${center.type}.png`,
        scaledSize: new google.maps.Size(32, 32)
      },
      title: center.name
    });

    marker.addListener('click', () => this.onMarkerClick(center));
    this.markers.push(marker);
  }

  updateMarkers(earthquakes, helpCenters) {
    this.clearMarkers();
    earthquakes.forEach(earthquake => this.addEarthquakeMarker(earthquake));
    helpCenters.forEach(center => this.addHelpCenterMarker(center));
  }
}

const isEarthquake = (data) => {
  return data && 
    typeof data.id === 'string' &&
    data.properties &&
    typeof data.properties.mag === 'number' &&
    typeof data.properties.place === 'string' &&
    typeof data.properties.time === 'number' &&
    typeof data.properties.url === 'string' &&
    typeof data.properties.title === 'string' &&
    (data.properties.alert === null || typeof data.properties.alert === 'string') &&
    typeof data.properties.tsunami === 'number' &&
    typeof data.properties.type === 'string' &&
    data.geometry &&
    Array.isArray(data.geometry.coordinates) &&
    data.geometry.coordinates.length === 3;
};

const isHelpCenter = (data) => {
  return data &&
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    data.position &&
    typeof data.position.lat === 'number' &&
    typeof data.position.lng === 'number' &&
    typeof data.address === 'string' &&
    typeof data.phone === 'string' &&
    ['hospital', 'shelter', 'emergency'].includes(data.type);
};