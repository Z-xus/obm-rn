import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MapScreen() {
    const webViewRef = useRef<WebView>(null);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [markerLocation, setMarkerLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [webViewReady, setWebViewReady] = useState(false);

    const [htmlContent, setHtmlContent] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const asset = Asset.fromModule(require('../assets/map.html'));
            await asset.downloadAsync(); // ensure it's downloaded
            const fileUri = asset.localUri || asset.uri;
            const html = await FileSystem.readAsStringAsync(fileUri);
            setHtmlContent(html);
        })();
    }, []);

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
            } catch (error: any) {
                setErrorMsg(`Failed to get location: ${error.message}`);
            }
        })();
    }, []);

    useEffect(() => {
        if (location && webViewRef.current && webViewReady) {
            webViewRef.current.postMessage(JSON.stringify({
                type: 'recenterTo',
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            }));
        }
    }, [location, webViewReady]);

    const handleRecenter = () => {
        if (location && webViewRef.current) {
            webViewRef.current?.postMessage(JSON.stringify({ type: 'recenter' }));
        }
    };

    const handleWebViewMessage = (event: WebViewMessageEvent) => {
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

    if (hasPermission === false) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: 'white' }}>
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
            </SafeAreaView>
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
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            {htmlContent && (
                <WebView
                    ref={webViewRef}
                    source={{ html: htmlContent }}
                    style={{ flex: 1 }}
                    javaScriptEnabled
                    domStorageEnabled
                    onMessage={handleWebViewMessage}
                    onLoadEnd={() => setWebViewReady(true)}
                    onError={(e) => {
                        const { nativeEvent } = e;
                        console.warn('WebView error: ', nativeEvent);
                    }}
                />
            )}


            {/* Floating Recenter Button */}
            <TouchableOpacity
                style={{
                    position: 'absolute',
                    bottom: 120,
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
        </SafeAreaView>
    );
}
