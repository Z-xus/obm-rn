import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

// Mock data for ambulances - will be initialized with actual coordinates
const MOCK_AMBULANCES = [
  {
    id: '1',
    type: 'Basic Life Support',
    eta: '5 mins',
    latitude: 0,
    longitude: 0,
  },
  {
    id: '2',
    type: 'Advanced Life Support',
    eta: '8 mins',
    latitude: 0,
    longitude: 0,
  },
  {
    id: '3',
    type: 'Neonatal Ambulance',
    eta: '12 mins',
    latitude: 0,
    longitude: 0,
  },
];

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [selectedAmbulance, setSelectedAmbulance] = useState<string | null>(null);
  const [ambulances, setAmbulances] = useState(MOCK_AMBULANCES);

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

        // Update ambulance locations relative to user's position
        const updatedAmbulances = MOCK_AMBULANCES.map((ambulance, index) => ({
          ...ambulance,
          latitude: location.coords.latitude + (index * 0.002),
          longitude: location.coords.longitude + (index * 0.002),
        }));
        setAmbulances(updatedAmbulances);
      } catch (error) {
        setErrorMsg(`Failed to get location. Please try agian ${error}`);
      }
    })();
  }, []);

  const handleRecenter = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  if (hasPermission === false) {
    return (
      <View className="flex-1 items-center justify-center p-4 bg-white">
        <View className="bg-red-50 p-6 rounded-xl w-full max-w-sm">
          <Ionicons name="warning" size={32} color="#DC2626" className="mb-4" />
          <Text className="text-lg font-bold text-red-600 mb-2">Location Access Required</Text>
          <Text className="text-gray-600 mb-4">
            Please enable location access in your device settings to use this app.
          </Text>
          <TouchableOpacity
            className="bg-red-600 py-3 px-4 rounded-lg"
            onPress={() => Location.requestForegroundPermissionsAsync()}
          >
            <Text className="text-white text-center font-semibold">Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Map View */}
      <View className="flex-1">
        {location && (
          <MapView
            ref={mapRef}
            className="w-full h-full"
            provider={undefined}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {/* User Location Marker */}
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
            >
              <View className="bg-primary p-2 rounded-full">
                <View className="w-4 h-4 bg-white rounded-full" />
              </View>
            </Marker>

            {/* Ambulance Markers */}
            {ambulances.map((ambulance) => (
              <Marker
                key={ambulance.id}
                coordinate={{
                  latitude: ambulance.latitude,
                  longitude: ambulance.longitude,
                }}
              >
                <View className="bg-accent p-2 rounded-lg">
                  <Ionicons name="medical" size={24} color="white" />
                </View>
              </Marker>
            ))}
          </MapView>
        )}

        {/* Floating Recenter Button */}
        <TouchableOpacity
          className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg"
          onPress={handleRecenter}
        >
          <Ionicons name="locate" size={24} color="#2563EB" />
        </TouchableOpacity>
      </View>

      {/* Top Search Box */}
      <View className="absolute top-4 left-4 right-4">
        <View className="bg-white rounded-xl shadow-lg p-4 flex-row items-center">
          <Ionicons name="search" size={20} color="#6B7280" />
          <Text className="ml-2 text-gray-500">Enter destination (Coming Soon)</Text>
        </View>
      </View>

      {/* Bottom Card */}
      <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg p-4 max-h-[50%]">
        <Text className="text-lg font-bold mb-4">Available Ambulances</Text>
        <ScrollView className="flex-1">
          {ambulances.map((ambulance) => (
            <TouchableOpacity
              key={ambulance.id}
              className={`p-4 rounded-xl mb-2 border ${
                selectedAmbulance === ambulance.id
                  ? 'border-primary bg-red-50'
                  : 'border-gray-200 bg-white'
              }`}
              onPress={() => setSelectedAmbulance(ambulance.id)}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons
                    name="medical"
                    size={24}
                    color={selectedAmbulance === ambulance.id ? '#DC2626' : '#2563EB'}
                  />
                  <View className="ml-3">
                    <Text className="font-semibold">{ambulance.type}</Text>
                    <Text className="text-gray-500">ETA: {ambulance.eta}</Text>
                  </View>
                </View>
                {selectedAmbulance === ambulance.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#DC2626" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Confirm Button */}
        <TouchableOpacity
          className={`mt-4 py-4 rounded-xl ${
            selectedAmbulance ? 'bg-primary' : 'bg-gray-300'
          }`}
          disabled={!selectedAmbulance}
        >
          <Text className="text-white text-center font-semibold text-lg">
            Confirm Ambulance
          </Text>
        </TouchableOpacity>
      </View>

      {/* Error Message */}
      {errorMsg && (
        <View className="absolute bottom-4 left-4 right-4 bg-red-600 p-4 rounded-xl">
          <Text className="text-white text-center">{errorMsg}</Text>
        </View>
      )}
    </View>
  );
}
