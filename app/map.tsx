import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

export default function MapScreen() {
    const webViewRef = useRef(null);
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [hasPermission, setHasPermission] = useState(null);
    const [markerLocation, setMarkerLocation] = useState(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            setHasPermission(status === 'granted');

            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            try {
                let location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                });
                setLocation(location);
                setMarkerLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                });
            } catch (error) {
                setErrorMsg(`Failed to get location: ${error.message}`);
            }
        })();
    }, []);

    const handleRecenter = () => {
        if (location && webViewRef.current) {
            const script = `
        map.setView([${location.coords.latitude}, ${location.coords.longitude}], 16);
        true;
      `;
            webViewRef.current.postMessage(JSON.stringify({ type: 'recenter' }));
        }
    };

    const handleWebViewMessage = (event) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'markerMoved') {
                setMarkerLocation({
                    latitude: data.latitude,
                    longitude: data.longitude
                });
                console.log('Marker moved to:', data.latitude, data.longitude);
                // You can add your location logging logic here
            }
        } catch (error) {
            console.error('Error parsing WebView message:', error);
        }
    };

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>OpenStreetMap</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; width: 100vw; }
        .location-info {
            position: absolute;
            top: 10px;
            left: 10px;
            background: white;
            padding: 10px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 1000;
            font-family: Arial, sans-serif;
            font-size: 12px;
            max-width: 250px;
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <div class="location-info">
        <div><strong>Current Position:</strong></div>
        <div id="coordinates">Loading...</div>
        <div style="margin-top: 5px; font-size: 10px; color: #666;">
            Drag the red marker to set precise location
        </div>
    </div>
    
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        let map;
        let marker;
        let userLocationMarker;
        
        function initMap(lat, lng) {
            map = L.map('map').setView([lat, lng], 16);
            
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);
            
            // User location marker (blue, non-draggable)
            userLocationMarker = L.marker([lat, lng], {
                icon: L.divIcon({
                    className: 'user-location-marker',
                    html: '<div style="background-color: #2563EB; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                })
            }).addTo(map);
            
            // Draggable marker (red)
            marker = L.marker([lat, lng], {
                draggable: true,
                icon: L.divIcon({
                    className: 'draggable-marker',
                    html: '<div style="background-color: #DC2626; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3); cursor: move;"></div>',
                    iconSize: [25, 25],
                    iconAnchor: [12, 12]
                })
            }).addTo(map);
            
            updateCoordinates(lat, lng);
            
            marker.on('dragend', function(e) {
                const position = e.target.getLatLng();
                updateCoordinates(position.lat, position.lng);
                
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'markerMoved',
                    latitude: position.lat,
                    longitude: position.lng
                }));
            });
        }
        
        function updateCoordinates(lat, lng) {
            document.getElementById('coordinates').innerHTML = 
                'Lat: ' + lat.toFixed(6) + '<br>Lng: ' + lng.toFixed(6);
        }
        
        // Listen for messages from React Native
        document.addEventListener('message', function(event) {
            const data = JSON.parse(event.data);
            if (data.type === 'recenter' && map) {
                map.setView([${location?.coords.latitude || 0}, ${location?.coords.longitude || 0}], 16);
            }
        });
        
        // Initialize map when location is available
        ${location ? `initMap(${location.coords.latitude}, ${location.coords.longitude});` : ''}
    </script>
</body>
</html>`;

    if (hasPermission === false) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'white' }}>
                <View style={{ backgroundColor: '#FEE2E2', padding: 20, borderRadius: 10, width: '100%', maxWidth: 300 }}>
                    <Ionicons name="warning" size={32} color="#DC2626" style={{ marginBottom: 10 }} />
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#DC2626', marginBottom: 10 }}>
                        Location Access Required
                    </Text>
                    <Text style={{ color: '#6B7280', marginBottom: 15 }}>
                        Please enable location access in your device settings to use this app.
                    </Text>
                    <TouchableOpacity
                        style={{ backgroundColor: '#DC2626', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8 }}
                        onPress={() => Location.requestForegroundPermissionsAsync()}
                    >
                        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
                            Grant Permission
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    if (!location) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
                <Text style={{ fontSize: 16, color: '#6B7280' }}>Loading location...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <WebView
                ref={webViewRef}
                source={{ html: htmlContent }}
                style={{ flex: 1 }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                onMessage={handleWebViewMessage}
                onError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.warn('WebView error: ', nativeEvent);
                }}
            />

            {/* Floating Recenter Button */}
            <TouchableOpacity
                style={{
                    position: 'absolute',
                    bottom: 80,
                    right: 20,
                    backgroundColor: 'white',
                    padding: 15,
                    borderRadius: 30,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                }}
                onPress={handleRecenter}
            >
                <Ionicons name="locate" size={24} color="#2563EB" />
            </TouchableOpacity>

            {/* Location Info */}
            {markerLocation && (
                <View style={{
                    position: 'absolute',
                    bottom: 20,
                    left: 20,
                    right: 20,
                    backgroundColor: 'white',
                    padding: 15,
                    borderRadius: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                }}>
                    <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Selected Location:</Text>
                    <Text style={{ fontSize: 12, color: '#6B7280' }}>
                        Lat: {markerLocation.latitude.toFixed(6)}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#6B7280' }}>
                        Lng: {markerLocation.longitude.toFixed(6)}
                    </Text>
                </View>
            )}

            {/* Error Message */}
            {errorMsg && (
                <View style={{
                    position: 'absolute',
                    bottom: 20,
                    left: 20,
                    right: 20,
                    backgroundColor: '#DC2626',
                    padding: 15,
                    borderRadius: 10,
                }}>
                    <Text style={{ color: 'white', textAlign: 'center' }}>{errorMsg}</Text>
                </View>
            )}
        </View>
    );
}
