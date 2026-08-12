import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { router } from "expo-router";
import MapView, { Marker } from "react-native-maps";

import { supabase } from "../lib/supabase";

type MapLocation = {
  id: number;
  title: string;
  description: string | null;
  latitude: number;
  longitude: number;
  image_url: string | null;
  collection_id: number | null;
  collections: {
    name: string;
  }[];
};

export default function App() {
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState("All");

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    const { data, error } = await supabase.from("locations").select(`
        id,
        title,
        description,
        latitude,
        longitude,
        image_url,
        collection_id,
        collections (
          name
        )
      `);

    if (error) {
      console.log("Error loading locations:", error);
    } else {
      setLocations((data ?? []) as MapLocation[]);
    }

    setLoading(false);
  };

  const collections = [
    "All",
    ...Array.from(
      new Set(
        locations
          .map((location) => location.collections?.[0]?.name)
          .filter((name): name is string => Boolean(name))
      )
    )
  ];

  const filteredLocations =
    selectedCollection === "All"
      ? locations
      : locations.filter(
          (location) => location.collections?.[0]?.name === selectedCollection
        );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading locations...</Text>
      </View>
    );
  }

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
            onPress={() => {
              console.log("Opening location:", location.id);

              router.push({
                pathname: "/location",
                params: {
                  id: String(location.id)
                }
              });
            }}
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

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
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
