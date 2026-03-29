import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useState } from 'react';
import SosApp from './SosApp';

export default function App() {
  const [view, setView] = useState('home'); // 'home' or 'sos'

  if (view === 'sos') {
    return <SosApp />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>APSAS</Text>
          <Text style={styles.subtitle}>Safety & Emergency Response</Text>
        </View>

        {/* Main Options */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => setView('sos')}
        >
          <Text style={styles.buttonEmoji}>🚨</Text>
          <Text style={styles.buttonTitle}>Emergency SOS</Text>
          <Text style={styles.buttonDesc}>Triple power button or tap for instant alerts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => {}}
        >
          <Text style={styles.buttonEmoji}>🗺️</Text>
          <Text style={styles.buttonTitle}>Safety Map</Text>
          <Text style={styles.buttonDesc}>View crime zones and safe routes (Web)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => {}}
        >
          <Text style={styles.buttonEmoji}>📋</Text>
          <Text style={styles.buttonTitle}>Report Crime</Text>
          <Text style={styles.buttonDesc}>Report incidents in your area (Web)</Text>
        </TouchableOpacity>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featureList}>
            <Text style={styles.feature}>✅ Triple power button SOS trigger</Text>
            <Text style={styles.feature}>✅ Automatic GPS location sharing</Text>
            <Text style={styles.feature}>✅ Emergency contact management</Text>
            <Text style={styles.feature}>✅ Real-time SMS alerts</Text>
            <Text style={styles.feature}>✅ Background monitoring</Text>
            <Text style={styles.feature}>✅ Integrated sms-server backend</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>About</Text>
          <Text style={styles.infoText}>
            APSAS (Advanced Personal Safety Alert System) provides integrated safety features for Nagpur. This mobile app focuses on emergency SOS alerts with location sharing to your pre-configured emergency contacts.
          </Text>
          <Text style={styles.infoText}>
            The complete web dashboard with maps, routing, and reporting is available at: http://localhost:8000/project.html
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>APSAS v1.0.0</Text>
          <Text style={styles.footerText}>Emergency Safety System</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginVertical: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF1744',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#FF1744',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#1a2a1a',
    borderLeftWidth: 4,
    borderLeftColor: '#00E676',
  },
  buttonEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  buttonDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginTop: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  featureList: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
  },
  feature: {
    color: '#00E676',
    fontSize: 13,
    lineHeight: 24,
  },
  infoBox: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB300',
  },
  infoTitle: {
    color: '#FFB300',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    color: '#888',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  footerText: {
    color: '#666',
    fontSize: 11,
  },
});
