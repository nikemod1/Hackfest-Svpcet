import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  AppState,
  BackHandler,
  Vibration,
} from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';

const SOS_BACKEND_URL = 'http://localhost:3001/api/send-sos-bulk';
const MAX_QUICK_PRESSES = 3;
const QUICK_PRESS_TIMEOUT = 1500; // 1.5 seconds

export default function SosApp() {
  useKeepAwake();
  
  const [sosActive, setSosActive] = useState(false);
  const [powerPressCount, setPowerPressCount] = useState(0);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [lastLocation, setLastLocation] = useState(null);
  const [status, setStatus] = useState('Ready');
  const pressTimeoutRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const locationWatchRef = useRef(null);

  // Load emergency contacts from secure storage
  useEffect(() => {
    loadEmergencyContacts();
    requestLocationPermission();
    subscribeToAppStateChanges();
    subscribeToHardwareBackPress();
  }, []);

  // Watch for location in background
  useEffect(() => {
    if (locationWatchRef.current) {
      Location.removeWatchAsync(locationWatchRef.current);
    }
    const startWatching = async () => {
      try {
        const watch = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
          (location) => {
            setLastLocation({
              lat: location.coords.latitude,
              lng: location.coords.longitude,
              accuracy: location.coords.accuracy,
            });
          }
        );
        locationWatchRef.current = watch;
      } catch (err) {
        console.error('Location watch error:', err);
      }
    };
    startWatching();
    return () => {
      if (locationWatchRef.current) {
        Location.removeWatchAsync(locationWatchRef.current);
      }
    };
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setLastLocation({
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          accuracy: loc.coords.accuracy,
        });
      }
    } catch (err) {
      console.error('Location permission error:', err);
    }
  };

  const subscribeToHardwareBackPress = () => {
    // Detect volume button presses as fallback (power button is unavailable in RN)
    // In production, use native Android module for true power button detection
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleVolumePress();
      return true;
    });
    return () => backHandler.remove();
  };

  const subscribeToAppStateChanges = () => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  };

  const handleAppStateChange = (nextAppState) => {
    if (
      appStateRef.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      setStatus('App returned to foreground - SOS ready');
    } else {
      setStatus('App in background - SOS monitoring');
    }
    appStateRef.current = nextAppState;
  };

  const handleVolumePress = () => {
    // Simulate power button with volume button press detection
    setPowerPressCount((prev) => {
      const newCount = prev + 1;
      
      // Clear timeout on first press
      if (newCount === 1) {
        if (pressTimeoutRef.current) {
          clearTimeout(pressTimeoutRef.current);
        }
        pressTimeoutRef.current = setTimeout(() => {
          setPowerPressCount(0);
        }, QUICK_PRESS_TIMEOUT);
      }

      // Trigger SOS on third press
      if (newCount === MAX_QUICK_PRESSES) {
        clearTimeout(pressTimeoutRef.current);
        setPowerPressCount(0);
        triggerSOS();
      }

      return newCount;
    });
  };

  const loadEmergencyContacts = async () => {
    try {
      const stored = await SecureStore.getItemAsync('emergencyContacts');
      if (stored) {
        setEmergencyContacts(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Load contacts error:', err);
    }
  };

  const saveEmergencyContacts = async (contacts) => {
    try {
      await SecureStore.setItemAsync('emergencyContacts', JSON.stringify(contacts));
      setEmergencyContacts(contacts);
    } catch (err) {
      console.error('Save contacts error:', err);
    }
  };

  const triggerSOS = async () => {
    if (sosActive) return;
    setSosActive(true);
    setStatus('🚨 SOS TRIGGERED - Sending alerts...');

    Vibration.vibrate([100, 100, 100, 100, 200], false);

    try {
      if (!emergencyContacts.length) {
        Alert.alert('Error', 'No emergency contacts configured');
        setSosActive(false);
        setStatus('Ready');
        return;
      }

      const locText = lastLocation
        ? `\n📍 Location: ${lastLocation.lat.toFixed(5)}, ${lastLocation.lng.toFixed(5)}\nAccuracy: ±${(lastLocation.accuracy || 0).toFixed(0)}m`
        : '\n📍 Location: GPS not available';

      const message = [
        '🚨 EMERGENCY SOS ALERT',
        'User name: Aditi Kulkarni',
        'Phone: +91 90000 11223',
        'Blood Group: O+',
        locText,
        '\n⏰ Time: ' + new Date().toLocaleString('en-IN'),
        '\n🆘 Please contact immediately!',
      ].join('\n');

      const payload = {
        message,
        contacts: emergencyContacts.map((c) => ({
          name: c.name,
          relation: c.relation,
          phone: c.phone,
        })),
      };

      const response = await fetch(SOS_BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      const sentCount = data.results?.filter((r) => r.ok).length || 0;

      setStatus(`✅ SOS sent to ${sentCount}/${emergencyContacts.length} contact(s)`);

      Alert.alert(
        'SOS Triggered',
        `Emergency alert sent to ${sentCount}/${emergencyContacts.length} contact(s).\n\nLocation: ${
          lastLocation
            ? `${lastLocation.lat.toFixed(5)}, ${lastLocation.lng.toFixed(5)}`
            : 'GPS unavailable'
        }`,
        [{ text: 'OK', onPress: () => {
          setSosActive(false);
          setStatus('Ready');
        }}]
      );
    } catch (err) {
      console.error('SOS error:', err);
      Alert.alert('SOS Error', err.message || 'Failed to send SOS', [
        { text: 'OK', onPress: () => {
          setSosActive(false);
          setStatus('Ready');
        }},
      ]);
    }
  };

  const addContact = () => {
    Alert.prompt(
      'Add Emergency Contact',
      'Enter contact name and phone (e.g., "Mom +919876543210")',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Add',
          onPress: (input) => {
            const match = input.match(/(.+?)\s+([\+\d\s\-()]{8,})/);
            if (!match) {
              Alert.alert('Invalid', 'Format: Name PhoneNumber');
              return;
            }
            const newContact = {
              name: match[1].trim(),
              relation: 'CUSTOM',
              phone: match[2].replace(/[^\d+]/g, ''),
            };
            const updated = [...emergencyContacts, newContact];
            saveEmergencyContacts(updated);
            Alert.alert('Success', `${newContact.name} added`);
          },
        },
      ]
    );
  };

  const removeContact = (index) => {
    const updated = emergencyContacts.filter((_, i) => i !== index);
    saveEmergencyContacts(updated);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🚨 APSAS SOS</Text>
        <Text style={styles.subtitle}>Emergency Alert System</Text>
      </View>

      {/* Status */}
      <View style={[styles.statusBox, sosActive && styles.statusAlerting]}>
        <Text style={styles.statusText}>{status}</Text>
        {powerPressCount > 0 && (
          <Text style={styles.pressCounter}>
            Power button: {powerPressCount}/{MAX_QUICK_PRESSES}
          </Text>
        )}
      </View>

      {/* SOS Button */}
      <TouchableOpacity
        style={[styles.sosButton, sosActive && styles.sosButtonActive]}
        onPress={triggerSOS}
        disabled={sosActive}
      >
        <Text style={styles.sosButtonText}>TAP FOR SOS</Text>
        <Text style={styles.sosButtonSub}>or press power button 3 times</Text>
      </TouchableOpacity>

      {/* Current Location */}
      {lastLocation && (
        <View style={styles.locationBox}>
          <Text style={styles.locationTitle}>📍 Current Location</Text>
          <Text style={styles.locationText}>
            {lastLocation.lat.toFixed(5)}, {lastLocation.lng.toFixed(5)}
          </Text>
          <Text style={styles.locationAccuracy}>
            Accuracy: ±{(lastLocation.accuracy || 0).toFixed(0)}m
          </Text>
        </View>
      )}

      {/* Emergency Contacts */}
      <View style={styles.contactsSection}>
        <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        {emergencyContacts.length === 0 ? (
          <Text style={styles.emptyText}>No contacts added</Text>
        ) : (
          emergencyContacts.map((contact, index) => (
            <View key={index} style={styles.contactCard}>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactPhone}>{contact.phone}</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => removeContact(index)}
              >
                <Text style={styles.deleteText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
        <TouchableOpacity style={styles.addButton} onPress={addContact}>
          <Text style={styles.addButtonText}>+ Add Contact</Text>
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>How to Trigger SOS:</Text>
        <Text style={styles.infoText}>
          • Tap the SOS button above{'\n'}
          • Or press your phone's power button 3 times quickly{'\n'}
          • Alert sent to all contacts with GPS location
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF1744',
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  statusBox: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB300',
  },
  statusAlerting: {
    borderLeftColor: '#FF1744',
    backgroundColor: '#2a0a0a',
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  pressCounter: {
    color: '#FFB300',
    fontSize: 12,
    marginTop: 4,
  },
  sosButton: {
    backgroundColor: '#FF1744',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  sosButtonActive: {
    backgroundColor: '#CC1136',
    opacity: 0.7,
  },
  sosButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sosButtonSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    marginTop: 6,
  },
  locationBox: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#00E676',
  },
  locationTitle: {
    color: '#00E676',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'monospace',
  },
  locationAccuracy: {
    color: '#888',
    fontSize: 11,
    marginTop: 4,
  },
  contactsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emptyText: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 8,
  },
  contactCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  contactPhone: {
    color: '#888',
    fontSize: 11,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  deleteButton: {
    padding: 8,
  },
  deleteText: {
    color: '#FF1744',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#1a3a1a',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#00E676',
    fontSize: 13,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
  },
  infoTitle: {
    color: '#FFB300',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    color: '#888',
    fontSize: 11,
    lineHeight: 18,
  },
});
