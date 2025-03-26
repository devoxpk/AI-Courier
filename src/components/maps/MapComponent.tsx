import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapComponentProps {
  courierLocation: {
    lat: number;
    lng: number;
  };
  waypoints: Array<{
    coordinates: {
      lat: number;
      lng: number;
    };
    status: string;
    order: string;
  }>;
  height?: string;
  width?: string;
}

const MapComponent: React.FC<MapComponentProps> = ({
  courierLocation,
  waypoints,
  height = '100%',
  width = '100%',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map if it doesn't exist
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([courierLocation.lat, courierLocation.lng], 13);

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);
    } else {
      // If map already exists, just update the view
      mapInstanceRef.current.setView([courierLocation.lat, courierLocation.lng], 13);
    }

    const map = mapInstanceRef.current;

    // Clear existing markers and routes
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Create custom icons
    const courierIcon = L.icon({
      iconUrl: '/courier-marker.svg',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
      // Use a default icon if the custom one fails to load
      shadowUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    });

    const pendingIcon = L.icon({
      iconUrl: '/pending-marker.svg',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24],
      shadowUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    });

    const completedIcon = L.icon({
      iconUrl: '/completed-marker.svg',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24],
      shadowUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    });

    // Fallback icons in case custom icons fail to load
    const defaultCourierIcon = L.divIcon({
      className: 'courier-marker-icon',
      html: '<div style="background-color: #4F46E5; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const defaultPendingIcon = L.divIcon({
      className: 'pending-marker-icon',
      html: '<div style="background-color: #FBBF24; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white;"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    const defaultCompletedIcon = L.divIcon({
      className: 'completed-marker-icon',
      html: '<div style="background-color: #10B981; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white;"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    // Add courier marker
    const courierMarker = L.marker([courierLocation.lat, courierLocation.lng], {
      icon: defaultCourierIcon,
      zIndexOffset: 1000,
    }).addTo(map);
    courierMarker.bindPopup('<b>Courier Location</b>');

    // Add waypoint markers and create route coordinates
    const routeCoordinates = [{ lat: courierLocation.lat, lng: courierLocation.lng }];
    
    waypoints.forEach((waypoint, index) => {
      const { lat, lng } = waypoint.coordinates;
      routeCoordinates.push({ lat, lng });
      
      const icon = waypoint.status === 'completed' ? defaultCompletedIcon : defaultPendingIcon;
      const marker = L.marker([lat, lng], { icon }).addTo(map);
      marker.bindPopup(`<b>Stop ${index + 1}</b><br>Order: ${waypoint.order}<br>Status: ${waypoint.status}`);
    });

    // Create route polyline
    const routeLine = L.polyline(routeCoordinates, {
      color: '#4F46E5',
      weight: 4,
      opacity: 0.7,
      dashArray: '10, 10',
      lineJoin: 'round',
    }).addTo(map);

    // Fit bounds to show all markers
    if (routeCoordinates.length > 1) {
      map.fitBounds(routeCoordinates.map(coord => [coord.lat, coord.lng]));
    }

    // Cleanup function
    return () => {
      // Don't destroy the map instance, just clean up markers
    };
  }, [courierLocation, waypoints]);

  return (
    <div 
      ref={mapRef} 
      style={{ 
        height: height, 
        width: width,
        borderRadius: '0.5rem',
      }}
    />
  );
};

export default MapComponent;