import React, { useEffect, useState, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native'
import { WebView } from 'react-native-webview'
import * as Location from 'expo-location'
import { Ionicons } from '@expo/vector-icons'
import * as FileSystem from 'expo-file-system'
import { Asset } from 'expo-asset'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function MapScreen({
  onLocationSelected,
}: {
  onLocationSelected: (coords: { latitude: number; longitude: number }) => void
}) {
  const webViewRef = useRef<WebView>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [location, setLocation] = useState<Location.LocationObject | null>(null)
  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null)
  const [html, setHtml] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    ; (async () => {
      const asset = Asset.fromModule(require('../assets/map.html'))
      await asset.downloadAsync()
      const uri = asset.localUri || asset.uri
      setHtml(await FileSystem.readAsStringAsync(uri))
    })()
  }, [])

  useEffect(() => {
    ; (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      setHasPermission(status === 'granted')
      if (status !== 'granted') return
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
      setLocation(loc)
      setMarker({ latitude: loc.coords.latitude, longitude: loc.coords.longitude })
    })()
  }, [])

  useEffect(() => {
    if (location && ready && webViewRef.current) {
      webViewRef.current.postMessage(
        JSON.stringify({ type: 'recenterTo', latitude: location.coords.latitude, longitude: location.coords.longitude })
      )
    }
  }, [location, ready])

  const onMsg = (e: any) => {
    const data = JSON.parse(e.nativeEvent.data)
    if (data.type === 'markerMoved') setMarker({ latitude: data.latitude, longitude: data.longitude })
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.center}>
        <View style={styles.box}>
          <Ionicons name="warning" size={32} color="#DC2626" />
          <Text style={styles.title}>Location Required</Text>
          <TouchableOpacity style={styles.btn} onPress={() => Linking.openSettings()}>
            <Text style={styles.btnText}>Open Settings</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  if (!location || !html) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.flex}>
      <WebView
        ref={webViewRef}
        source={{ html }}
        style={styles.flex}
        javaScriptEnabled
        domStorageEnabled
        onMessage={onMsg}
        onLoadEnd={() => setReady(true)}
      />
      <TouchableOpacity style={styles.confirm} onPress={() => marker && onLocationSelected(marker)}>
        <Text style={styles.confirmText}>Confirm Location</Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  box: { padding: 24, backgroundColor: '#FEE2E2', borderRadius: 8, alignItems: 'center' },
  title: { fontWeight: '600', marginVertical: 8, color: '#DC2626' },
  btn: { backgroundColor: '#DC2626', padding: 12, borderRadius: 6 },
  btnText: { color: '#fff', fontWeight: '600' },
  confirm: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#DC2626', padding: 16, borderRadius: 8, alignItems: 'center' },
  confirmText: { color: '#fff', fontWeight: '600' },
})
