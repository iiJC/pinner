import React, { useState } from "react";
import { StyleSheet, View, Pressable, Text } from "react-native";

import MapView, { Marker } from "react-native-maps";
import { router } from "expo-router";

import { locations } from "../data/locations";

export default function App() {
  // This stores which collection the user currently selected.
  const [selectedCollection, setSelectedCollection] = useState("All");

  // This decides which markers should actually appear.
  const filteredLocations =
    selectedCollection === "All"
      ? locations
      : locations.filter(
          (location) => location.collection === selectedCollection
        );

  return (
    <View style={styles.container}>
      {/* MAP */}
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

      {/* FILTER BUTTONS */}
      <View style={styles.filterContainer}>
        <Pressable
          style={[
            styles.filterButton,
            selectedCollection === "All" && styles.selectedFilterButton
          ]}
          onPress={() => setSelectedCollection("All")}
        >
          <Text
            style={[
              styles.filterText,
              selectedCollection === "All" && styles.selectedFilterText
            ]}
          >
            All
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.filterButton,
            selectedCollection === "Tokyo Movie Locations" &&
              styles.selectedFilterButton
          ]}
          onPress={() => setSelectedCollection("Tokyo Movie Locations")}
        >
          <Text
            style={[
              styles.filterText,
              selectedCollection === "Tokyo Movie Locations" &&
                styles.selectedFilterText
            ]}
          >
            Movie Locations
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.filterButton,
            selectedCollection === "Tokyo Landmarks" &&
              styles.selectedFilterButton
          ]}
          onPress={() => setSelectedCollection("Tokyo Landmarks")}
        >
          <Text
            style={[
              styles.filterText,
              selectedCollection === "Tokyo Landmarks" &&
                styles.selectedFilterText
            ]}
          >
            Landmarks
          </Text>
        </Pressable>
      </View>
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

  filterContainer: {
    position: "absolute",
    top: 60,
    left: 10,
    right: 10,
    zIndex: 10,

    flexDirection: "row",
    gap: 8
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
