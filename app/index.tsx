import React, { useState } from "react";

import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { router } from "expo-router";
import MapView, { Marker } from "react-native-maps";

import { locations } from "../data/locations";

export default function App() {
  const [selectedCollection, setSelectedCollection] = useState("All");

  const collections = [
    "All",
    ...Array.from(new Set(locations.map((location) => location.collection)))
  ];

  const filteredLocations =
    selectedCollection === "All"
      ? locations
      : locations.filter(
          (location) => location.collection === selectedCollection
        );

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 35.6762,
          longitude: 139.7503,
          latitudeDelta: 0.15,
          longitudeDelta: 0.15
        }}
      >
        {filteredLocations.map((location) => (
          <Marker
            key={location.id}
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude
            }}
            onPress={() =>
              router.push({
                pathname: "/location",
                params: {
                  id: location.id
                }
              })
            }
          />
        ))}
      </MapView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        {collections.map((collection) => (
          <Pressable
            key={collection}
            style={[
              styles.filterButton,
              selectedCollection === collection && styles.selectedFilterButton
            ]}
            onPress={() => setSelectedCollection(collection)}
          >
            <Text
              style={[
                styles.filterText,
                selectedCollection === collection && styles.selectedFilterText
              ]}
            >
              {collection}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },

  map: {
    width: "100%",
    height: "100%"
  },

  filterScroll: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    zIndex: 10
  },

  filterContainer: {
    paddingHorizontal: 10,
    gap: 8,
    alignItems: "center"
  },

  filterButton: {
    backgroundColor: "white",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20
  },

  selectedFilterButton: {
    backgroundColor: "#222"
  },

  filterText: {
    color: "#222",
    fontWeight: "600"
  },

  selectedFilterText: {
    color: "white"
  }
});
