import React, { useState, useEffect, useRef } from 'react'
import { View, TextInput, FlatList, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import * as Location from 'expo-location'
import { WebView } from 'react-native-webview'

const { height } = Dimensions.get('window')

interface Ambulance { id: string; distance: string; eta: string; fare: string }

const hospitals = [
  'Bhiwandi Civil Hospital',
  'Platinum Hospital, Bhiwandi',
  'Kalyan General Hospital',
  'Thane Civil Hospital',
  'Jupiter Hospital, Thane',
]

const ambulances: Ambulance[] = [
  { id: 'amb1', distance: '1.2 km', eta: '4 mins', fare: '₹350' },
  { id: 'amb2', distance: '2.5 km', eta: '7 mins', fare: '₹400' },
  { id: 'amb3', distance: '3.1 km', eta: '9 mins', fare: '₹450' },
]

export default function HomeScreen({
  onBookingConfirm,
}: {
  onBookingConfirm: (dest: string, coords: { latitude: number; longitude: number }) => void
}) {
  const [destination, setDestination] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedAmbulance, setSelectedAmbulance] = useState<string | null>(null)
  const [location, setLocation] = useState<Location.LocationObject | null>(null)
  const webViewRef = useRef<WebView>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    ; (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') return
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
      setLocation(loc)
    })()
  }, [])

  useEffect(() => {
    if (location && ready && webViewRef.current) {
      webViewRef.current.postMessage(
        JSON.stringify({ type: 'recenterTo', latitude: location.coords.latitude, longitude: location.coords.longitude })
      )
    }
  }, [location, ready])

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{
            html: `
            <!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>html,body,#map{margin:0;padding:0;height:100%;width:100%;}</style>
            <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/>
            <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
            </head><body><div id="map"></div>
            <script>
              const map = L.map('map').setView([19.3, 73.0], 13);
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
              let marker = L.marker([19.3, 73.0], {draggable:true}).addTo(map);
              marker.on('dragend', e => {
                const {lat, lng} = e.target.getLatLng();
                window.ReactNativeWebView.postMessage(JSON.stringify({type:'markerMoved', latitude:lat, longitude:lng}));
              });
              window.addEventListener('message', e => {
                const data = JSON.parse(e.data);
                if (data.type === 'recenterTo') {
                  map.setView([data.latitude, data.longitude], 15);
                  marker.setLatLng([data.latitude, data.longitude]);
                }
              });
            </script></body></html>
          ` }}
          javaScriptEnabled
          domStorageEnabled
          onLoadEnd={() => setReady(true)}
          onMessage={() => { }}
        />
      </View>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Enter hospital destination"
          value={destination}
          onChangeText={setDestination}
          onFocus={() => setShowSuggestions(true)}
        />
        {showSuggestions && (
          <FlatList
            data={hospitals.filter((h) => h.toLowerCase().includes(destination.toLowerCase()))}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setDestination(item)
                  setShowSuggestions(false)
                }}
                style={styles.suggestionItem}
              >
                <Text>{item}</Text>
              </TouchableOpacity>
            )}
            style={styles.suggestionList}
          />
        )}
        <FlatList
          data={ambulances}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedAmbulance(item.id)}
              style={[
                styles.ambulanceItem,
                selectedAmbulance === item.id && styles.ambulanceItemSelected,
              ]}
            >
              <Text style={styles.ambulanceTitle}>Basic</Text>
              <Text style={styles.ambulanceSub}>{item.distance} / {item.eta}</Text>
              <Text style={styles.ambulanceTitle}>{item.fare}</Text>
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!destination || !selectedAmbulance) && styles.confirmButtonDisabled,
          ]}
          disabled={!destination || !selectedAmbulance}
          onPress={() => {
            if (location)
              onBookingConfirm(destination, {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              })
          }}
        >
          <Text style={styles.confirmText}>Confirm Ambulance</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapContainer: { height: height * 0.5, width: '100%' },
  card: { flex: 1, backgroundColor: '#fff', padding: 12, borderTopLeftRadius: 12, borderTopRightRadius: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: -2 }, shadowRadius: 4, elevation: 3 },
  input: { padding: 10, borderRadius: 6, backgroundColor: '#F3F4F6', marginBottom: 6 },
  suggestionList: { maxHeight: 100, backgroundColor: '#fff', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6 },
  suggestionItem: { padding: 8, borderBottomWidth: 1, borderColor: '#E5E7EB' },
  ambulanceItem: { padding: 12, backgroundColor: '#F9FAFB', borderRadius: 6, borderWidth: 1, borderColor: '#D1D5DB', marginRight: 8 },
  ambulanceItemSelected: { borderColor: '#DC2626', backgroundColor: '#FEE2E2' },
  ambulanceTitle: { fontWeight: '600' },
  ambulanceSub: { fontSize: 12, color: '#6B7280' },
  confirmButton: { marginTop: 8, padding: 14, borderRadius: 6, backgroundColor: '#DC2626', alignItems: 'center' },
  confirmButtonDisabled: { backgroundColor: '#9CA3AF' },
  confirmText: { color: '#fff', fontWeight: '600' },
})

