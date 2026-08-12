import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
  Image
} from "react-native";

import { useLocalSearchParams } from "expo-router";
import { locations } from "../data/locations";

export default function LocationScreen() {
  const { id } = useLocalSearchParams();

  const location = locations.find((item) => item.id === id);

  if (!location) {
    return (
      <View style={styles.container}>
        <Text>Location not found.</Text>
      </View>
    );
  }

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;

    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <Image source={location.image} style={styles.image} resizeMode="cover" />

      <View style={styles.content}>
        <Text style={styles.title}>{location.title}</Text>

        <Text style={styles.collection}>{location.collection}</Text>

        <Text style={styles.description}>{location.description}</Text>

        <Text style={styles.coordinates}>
          {location.latitude}, {location.longitude}
        </Text>

        <Pressable style={styles.button} onPress={openGoogleMaps}>
          <Text style={styles.buttonText}>Open in Google Maps</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },

  image: {
    width: "100%",
    height: 280
  },

  content: {
    padding: 24
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12
  },

  collection: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    opacity: 0.6
  },

  description: {
    fontSize: 17,
    marginBottom: 20
  },

  coordinates: {
    fontSize: 14,
    marginBottom: 30
  },

  button: {
    backgroundColor: "#222",
    padding: 16,
    borderRadius: 10,
    alignItems: "center"
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600"
  }
});
