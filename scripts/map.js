document.addEventListener('DOMContentLoaded', function() {

    // Initialize map centered on Mediterranean
    const mapCenter = [36.0, 15.0]; 
    const mapZoom = 5;

    const map = L.map('map', {
      center: mapCenter,
      zoom: mapZoom,
      minZoom: 4,
      maxZoom: 15,
      zoomSnap: 0.5,
      zoomDelta: 1,
      maxBounds: [
        [28.0, -8.0], // Southwest corner
        [48.0, 38.0]  // Northeast corner
      ],
      maxBoundsViscosity: 0.8
    });

    // Enhanced OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Harbor data
    const harbors = [
      { name: "Barcelona", position: [41.3851, 2.1734], country: "Spain" },
      { name: "Genoa", position: [44.4056, 8.9463], country: "Italy" },
      { name: "Tunis", position: [36.8065, 10.1815], country: "Tunisia" },
      { name: "Palermo", position: [38.1157, 13.3615], country: "Sicily, Italy" },
      { name: "Gaza", position: [31.5012, 34.4669], country: "Palestine", isDestination: true }
    ];

    // Ship data
    const ships = [
      { name: "Freedom Flotilla I", homePort: "Barcelona", status: "sailing", progress: 30, emoji: "🚢" },
      { name: "Solidarity Ship", homePort: "Genoa", status: "sailing", progress: 30, emoji: "⛵" },
      { name: "Hope Vessel", homePort: "Tunis", status: "preparing", progress: 0, emoji: "🛥️" },
      { name: "Peace Carrier", homePort: "Palermo", status: "preparing", progress: 0, emoji: "🚤" }
    ];

    // Create realistic routes
    const createRealisticRoute = (startPortName) => {
      const startHarbor = harbors.find(h => h.name === startPortName);
      const endHarbor = harbors.find(h => h.name === "Gaza");
      
      // Safety check in case harbors are not found
      if (!startHarbor || !endHarbor) {
          return [[0,0], [0,0]]; // Return a default non-drawable route
      }
      
      const start = startHarbor.position;
      const end = endHarbor.position;
      
      const routes = {
        "Barcelona": [[41.3851, 2.1734], [40.5, 3.5], [38.0, 8.0], [36.5, 12.0], [35.0, 18.0], [33.5, 25.0], [32.5, 30.0], [31.5012, 34.4669]],
        "Genoa": [[44.4056, 8.9463], [42.0, 10.5], [39.5, 13.5], [37.0, 16.0], [35.2, 20.0], [33.8, 26.0], [32.2, 31.0], [31.5012, 34.4669]],
        "Tunis": [[36.8065, 10.1815], [37.0, 12.0], [36.8, 14.5], [35.5, 18.5], [34.0, 23.0], [33.0, 27.0], [32.0, 32.0], [31.5012, 34.4669]],
        "Palermo": [[38.1157, 13.3615], [37.5, 15.0], [36.0, 18.0], [34.5, 22.0], [33.2, 26.5], [32.0, 31.5], [31.5012, 34.4669]]
      };
      
      return routes[startPortName] || [start, end];
    };

    // Add harbor markers
    harbors.forEach(harbor => {
      const icon = L.divIcon({
        className: 'harbor-marker',
        html: harbor.isDestination ? '🎯' : '⚓',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
      
      const marker = L.marker(harbor.position, {icon}).addTo(map);
      marker.bindPopup(`
        <div class="harbor-popup">
          <div class="icon">${harbor.isDestination ? '🎯' : '⚓'}</div>
          <div class="name">${harbor.name}</div>
          <div class="country">${harbor.country}</div>
          ${harbor.isDestination ? '<div class="destination">Destination Port</div>' : ''}
        </div>
      `);
    });

    // Calculate position along a route
    function calculateProgressPosition(route, progress) {
      if (!route || route.length < 2) return [0, 0];
      if (progress <= 0) return route[0];
      if (progress >= 100) return route[route.length - 1];
      
      const totalSegments = route.length - 1;
      const segmentProgress = (progress / 100) * totalSegments;
      const segmentIndex = Math.floor(segmentProgress);
      const segmentRatio = segmentProgress - segmentIndex;
      
      const start = route[segmentIndex];
      const end = route[segmentIndex + 1];
      
      const lat = start[0] + (end[0] - start[0]) * segmentRatio;
      const lng = start[1] + (end[1] - start[1]) * segmentRatio;
      
      return [lat, lng];
    }
    
    // Configuration for ship statuses
    const statusConfig = {
      preparing: { color: '#f59e0b', label: 'Preparing to Depart' },
      sailing:   { color: '#22c55e', label: 'Currently Sailing' },
      detained:  { color: '#ef4444', label: 'Detained/Blocked' },
      arrived:   { color: '#8b5cf6', label: 'Mission Complete' }
    };

    function getStatusStyles(status) {
      return statusConfig[status] || statusConfig.preparing;
    }

    // Add ship markers and route lines
    const shipMarkers = [];
    const routeLines = [];

    // REFINED: Removed unused 'index' parameter from the forEach loop.
    ships.forEach(ship => {
      // REFINED: Removed unused 'homeHarbor' variable.
      const route = createRealisticRoute(ship.homePort);
      
      const calculatedPos = calculateProgressPosition(route, ship.progress);
      // REFINED: Removed redundant parseFloat calls.
      const currentPosition = [calculatedPos[0], calculatedPos[1]];
      
      const statusStyles = getStatusStyles(ship.status);
      
      const routeLine = L.polyline(route, {
        color: statusStyles.color,
        weight: 3,
        opacity: ship.status === 'sailing' ? 0.8 : 0.5,
        dashArray: ship.status === 'preparing' ? '10, 10' : null
      }).addTo(map);
      
      if (ship.status === 'sailing' && ship.progress > 0) {
        // Calculate the number of points in the route to represent the progress
        const progressPointIndex = Math.ceil((ship.progress / 100) * (route.length - 1));
        const progressRoute = route.slice(0, progressPointIndex + 1);
        if (progressRoute.length > 1) {
          L.polyline(progressRoute, {
            color: '#22c55e',
            weight: 5,
            opacity: 0.9
          }).addTo(map);
        }
      }
      
      routeLines.push(routeLine);
      
      const icon = L.divIcon({
        className: `ship-marker ship-${ship.status}`,
        html: ship.emoji,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });
      
      const shipMarker = L.marker(currentPosition, {icon}).addTo(map);
      
      shipMarker.bindPopup(`
        <div class="ship-popup">
          <div class="ship-emoji">${ship.emoji}</div>
          <div class="ship-name">${ship.name}</div>
          <div style="font-size: 12px; color: #6b7280; margin: 4px 0;">From: ${ship.homePort}</div>
          ${ship.progress > 0 ? `<div style="font-size: 12px; color: #6b7280;">Progress: ${ship.progress}%</div>` : ''}
          <div class="ship-status" style="background: ${statusStyles.color}; color: white;">
            ${statusStyles.label}
          </div>
        </div>
      `);
      shipMarkers.push(shipMarker);
      
      routeLine.bindPopup(`
        <div style="text-align: center;">
          <div style="font-weight: 700; margin-bottom: 4px;">${ship.name} Route</div>
          <div style="font-size: 12px; color: #6b7280;">${ship.homePort} → Gaza</div>
          <div style="font-size: 11px; color: ${statusStyles.color}; margin-top: 4px;">
            ${statusStyles.label}
          </div>
        </div>
      `);
    });

    // Update status panel
    function updateStatusPanel() {
      const grid = document.getElementById('shipStatusGrid');
      grid.innerHTML = ships.map(ship => `
        <div class="ship-status">
          <div class="status-dot status-${ship.status}"></div>
          <div class="ship-info">
            <div class="ship-name">${ship.emoji} ${ship.name}</div>
            <div class="ship-progress">
              ${ship.status === 'sailing' ? `${ship.progress}% to Gaza` : 
                ship.status === 'preparing' ? `At ${ship.homePort}` :
                ship.status === 'detained' ? 'Movement restricted' : 'Mission completed'}
            </div>
          </div>
        </div>
      `).join('');
    }
    updateStatusPanel();

    // Map interaction handlers
    map.on('popupopen', function(e) {
      setTimeout(() => map.panTo(e.popup.getLatLng()), 100);
    });

    L.control.scale({ position: 'bottomleft', metric: true, imperial: false }).addTo(map);

    // Button handlers
    const fitBoundsBtn = document.getElementById('fitBoundsBtn');
    if (fitBoundsBtn) {
      fitBoundsBtn.addEventListener('click', () => {
        const group = new L.featureGroup([...shipMarkers, ...routeLines]);
        map.fitBounds(group.getBounds().pad(0.1));
      });
    }

    const togglePanelBtn = document.getElementById('toggleControlPanel');
    const controlPanel = document.getElementById('controlPanel');
    if (togglePanelBtn && controlPanel) {
      togglePanelBtn.addEventListener('click', () => {
        controlPanel.classList.toggle('collapsed');
      });
    }
});