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

    // Enhanced harbor data with more details
    const harbors = [
      { 
        name: "Barcelona", 
        position: [41.3851, 2.1734],
        country: "Spain"
      },
      { 
        name: "Genoa", 
        position: [44.4056, 8.9463],
        country: "Italy"
      },
      { 
        name: "Tunis", 
        position: [36.8065, 10.1815],
        country: "Tunisia"
      },
      { 
        name: "Palermo", 
        position: [38.1157, 13.3615],
        country: "Sicily, Italy"
      },
      { 
        name: "Gaza", 
        position: [31.5012, 34.4669],
        country: "Palestine",
        isDestination: true
      }
    ];

    // Enhanced ship data with status and progress
    const ships = [
      { 
        name: "Freedom Flotilla I", 
        homePort: "Barcelona",
        status: "sailing", // preparing, sailing, detained, arrived
        progress: 10, // 0-100%
        emoji: "🚢",
        route: 0
      },
      { 
        name: "Solidarity Ship", 
        homePort: "Genoa",
        status: "sailing",
        progress: 10,
        emoji: "⛵",
        route: 1
      },
      { 
        name: "Hope Vessel", 
        homePort: "Tunis",
        status: "preparing",
        progress: 0,
        emoji: "🛥️",
        route: 2
      },
      { 
        name: "Peace Carrier", 
        homePort: "Palermo",
        status: "preparing",
        progress: 0,
        emoji: "🚤",
        route: 3
      }
    ];

    // Create more realistic routes following shipping lanes
    const createRealisticRoute = (startPort, endPort) => {
      const start = harbors.find(h => h.name === startPort).position;
      const end = harbors.find(h => h.name === endPort).position;
      
      // Create waypoints that follow Mediterranean shipping lanes
      const routes = {
        "Barcelona": [
          [41.3851, 2.1734],   // Barcelona
          [40.5, 3.5],         // Near Balearic Islands
          [38.0, 8.0],         // Sardinia area
          [36.5, 12.0],        // Sicily Strait
          [35.0, 18.0],        // Crete area
          [33.5, 25.0],        // Cyprus area
          [32.5, 30.0],        // Approaching Eastern Med
          [31.5012, 34.4669]   // Gaza
        ],
        "Genoa": [
          [44.4056, 8.9463],   // Genoa
          [42.0, 10.5],        // Corsica area
          [39.5, 13.5],        // Sicily area
          [37.0, 16.0],        // Southern Sicily
          [35.2, 20.0],        // Crete area
          [33.8, 26.0],        // Cyprus area
          [32.2, 31.0],        // Eastern Med approach
          [31.5012, 34.4669]   // Gaza
        ],
        "Tunis": [
          [36.8065, 10.1815],  // Tunis
          [37.0, 12.0],        // Tunisia coast
          [36.8, 14.5],        // Sicily Strait
          [35.5, 18.5],        // Central Med
          [34.0, 23.0],        // Crete area
          [33.0, 27.0],        // Cyprus area
          [32.0, 32.0],        // Eastern Med
          [31.5012, 34.4669]   // Gaza
        ],
        "Palermo": [
          [38.1157, 13.3615],  // Palermo
          [37.5, 15.0],        // Eastern Sicily
          [36.0, 18.0],        // Central Med
          [34.5, 22.0],        // Crete area
          [33.2, 26.5],        // Cyprus area
          [32.0, 31.5],        // Eastern Med approach
          [31.5012, 34.4669]   // Gaza
        ]
      };
      
      return routes[startPort] || [start, end];
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
      const popupContent = `
        <div style="text-align: center; min-width: 120px;">
          <div style="font-size: 18px; margin-bottom: 8px;">${harbor.isDestination ? '🎯' : '⚓'}</div>
          <div style="font-weight: 700; color: #1f2937; margin-bottom: 4px;">${harbor.name}</div>
          <div style="color: #6b7280; font-size: 12px;">${harbor.country}</div>
          ${harbor.isDestination ? '<div style="color: #8b5cf6; font-size: 11px; margin-top: 4px;">Destination Port</div>' : ''}
        </div>
      `;
      marker.bindPopup(popupContent);
    });

    // Function to calculate position along route based on progress
    function calculateProgressPosition(route, progress) {
      if (!route || route.length === 0) return [0, 0];
      if (progress <= 0) return route[0];
      if (progress >= 100) return route[route.length - 1];
      
      const totalSegments = route.length - 1;
      const segmentProgress = (progress / 100) * totalSegments;
      const segmentIndex = Math.floor(segmentProgress);
      const segmentRatio = segmentProgress - segmentIndex;
      
      if (segmentIndex >= totalSegments) return route[route.length - 1];
      
      const start = route[segmentIndex];
      const end = route[segmentIndex + 1];
      
      if (!start || !end) return route[0];
      
      const lat = start[0] + (end[0] - start[0]) * segmentRatio;
      const lng = start[1] + (end[1] - start[1]) * segmentRatio;
      
      return [lat, lng];
    }

    // Function to get status color and styles
    function getStatusStyles(status) {
      const styles = {
        preparing: { color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)', text: 'Preparing to Depart' },
        sailing: { color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.1)', text: 'Currently Sailing' },
        detained: { color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)', text: 'Detained/Blocked' },
        arrived: { color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)', text: 'Mission Complete' }
      };
      return styles[status] || styles.preparing;
    }

    // Add ships and routes
    const shipMarkers = [];
    const routeLines = [];

    ships.forEach((ship, index) => {
      const homeHarbor = harbors.find(h => h.name === ship.homePort);
      const route = createRealisticRoute(ship.homePort, "Gaza");
      
      // Calculate current position based on progress
      const calculatedPos = calculateProgressPosition(route, ship.progress);
      const currentPosition = [parseFloat(calculatedPos[0]), parseFloat(calculatedPos[1])];
      
      // Create route line
      const routeColor = ship.status === 'sailing' ? '#22c55e' : 
                        ship.status === 'detained' ? '#ef4444' : 
                        ship.status === 'arrived' ? '#8b5cf6' : '#94a3b8';
      
      const routeLine = L.polyline(route, {
        color: routeColor,
        weight: 3,
        opacity: ship.status === 'sailing' ? 0.8 : 0.5,
        dashArray: ship.status === 'preparing' ? '10, 10' : null
      }).addTo(map);
      
      // Add progress indicator for sailing ships
      if (ship.status === 'sailing' && ship.progress > 0) {
        const progressRoute = route.slice(0, Math.ceil((ship.progress / 100) * (route.length - 1)) + 1);
        if (progressRoute.length > 1) {
          L.polyline(progressRoute, {
            color: '#22c55e',
            weight: 5,
            opacity: 0.9
          }).addTo(map);
        }
      }
      
      routeLines.push(routeLine);
      
      // Create ship marker
      const statusStyles = getStatusStyles(ship.status);
      const icon = L.divIcon({
        className: `ship-marker ship-${ship.status}`,
        html: ship.emoji,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });
      
      const shipMarker = L.marker(currentPosition, {icon}).addTo(map);
      
      const popupContent = `
        <div class="ship-popup">
          <div class="ship-emoji">${ship.emoji}</div>
          <div class="ship-name">${ship.name}</div>
          <div style="font-size: 12px; color: #6b7280; margin: 4px 0;">From: ${ship.homePort}</div>
          ${ship.progress > 0 ? `<div style="font-size: 12px; color: #6b7280;">Progress: ${ship.progress}%</div>` : ''}
          <div class="ship-status" style="background: ${statusStyles.bgColor}; color: ${statusStyles.color};">
            ${statusStyles.text}
          </div>
        </div>
      `;
      
      shipMarker.bindPopup(popupContent);
      shipMarkers.push(shipMarker);
      
      // Add route popup
      routeLine.bindPopup(`
        <div style="text-align: center;">
          <div style="font-weight: 700; margin-bottom: 4px;">${ship.name} Route</div>
          <div style="font-size: 12px; color: #6b7280;">${ship.homePort} → Gaza</div>
          <div style="font-size: 11px; color: ${statusStyles.color}; margin-top: 4px;">
            ${statusStyles.text}
          </div>
        </div>
      `);
    });

    // Update status panel
    function updateStatusPanel() {
      const grid = document.getElementById('shipStatusGrid');
      grid.innerHTML = ships.map(ship => {
        const styles = getStatusStyles(ship.status);
        return `
          <div class="ship-status">
            <div class="status-dot status-${ship.status}"></div>
            <div class="ship-info">
              <div class="ship-name">${ship.emoji} ${ship.name}</div>
              <div class="ship-progress">
                ${ship.status === 'sailing' ? `${ship.progress}% to Gaza` : 
                  ship.status === 'preparing' ? `At ${ship.homePort}` :
                  ship.status === 'detained' ? 'Movement restricted' :
                  'Mission completed'}
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    // Initialize status panel
    updateStatusPanel();

    // Add click handler to focus on ships
    map.on('popupopen', function(e) {
      // Small delay to ensure popup is fully rendered
      setTimeout(() => {
        map.panTo(e.popup.getLatLng());
      }, 100);
    });

    // Mobile-friendly zoom controls
    if (window.innerWidth <= 768) {
      map.zoomControl.setPosition('bottomright');
    }

    // Add scale control
    L.control.scale({
      position: 'bottomleft',
      metric: true,
      imperial: false
    }).addTo(map);

    // Custom button to fit all ships in view
    const fitBoundsControl = L.control({position: 'topleft'});
    fitBoundsControl.onAdd = function(map) {
      const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
      div.innerHTML = '<a href="#" style="background: white; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; text-decoration: none; color: #333; font-weight: bold;" title="Fit all ships in view">🗺️</a>';
      
      L.DomEvent.on(div, 'click', function(e) {
        L.DomEvent.preventDefault(e);
        const group = new L.featureGroup([...shipMarkers, ...routeLines]);
        map.fitBounds(group.getBounds().pad(0.1));
      });
      
      return div;
    };
    fitBoundsControl.addTo(map);

    // Add last updated timestamp
    const updateTime = new Date().toLocaleString();
    const timestampControl = L.control({position: 'bottomright'});
    timestampControl.onAdd = function(map) {
      const div = L.DomUtil.create('div', 'leaflet-control');
      div.style.background = 'rgba(255, 255, 255, 0.9)';
      div.style.padding = '5px 8px';
      div.style.borderRadius = '6px';
      div.style.fontSize = '11px';
      div.style.color = '#666';
      div.innerHTML = `Last updated: ${updateTime}`;
      return div;
    };
    timestampControl.addTo(map);

    // Enhanced mobile touch handling
    if ('ontouchstart' in window && map.tap) {
      map.tap.disable();
    }