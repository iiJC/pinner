import React, { useCallback, useState } from "react";

import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { router, useFocusEffect } from "expo-router";

import MapView, { Marker } from "react-native-maps";

import { supabase } from "../lib/supabase";

type MapLocation = {
  id: number;
  title: string;
  description: string | null;
  latitude: number;
  longitude: number;
  image_url: string | null;
  collection_id?: number | null;

  collections:
    | {
        name: string;
      }
    | {
        name: string;
      }[]
    | null;
};

const getCollectionName = (collections: MapLocation["collections"]) => {
  if (!collections) {
    return null;
  }

  if (Array.isArray(collections)) {
    return collections[0]?.name ?? null;
  }

  return collections.name;
};

export default function App() {
  const [locations, setLocations] = useState<MapLocation[]>([]);

  const [loading, setLoading] = useState(true);

  const [selectedCollection, setSelectedCollection] = useState("All");

  // Runs every time this screen comes back into focus.
  // This means newly-added locations appear automatically.
  useFocusEffect(
    useCallback(() => {
      fetchLocations();
    }, [])
  );

  const fetchLocations = async () => {
    console.log("Refreshing locations...");

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
      console.log("Locations loaded:", data);

      setLocations((data ?? []) as MapLocation[]);
    }

    setLoading(false);
  };

  // Build collection filter buttons from
  // the locations returned by Supabase.
  const collections = [
    "All",
    ...Array.from(
      new Set(
        locations
          .map((location) => getCollectionName(location.collections))
          .filter((name): name is string => Boolean(name))
      )
    )
  ];

  const filteredLocations =
    selectedCollection === "All"
      ? locations
      : locations.filter(
          (location) =>
            getCollectionName(location.collections) === selectedCollection
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

      {/* Collection filters */}
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

      {/* Add Location button */}
      <Pressable
        style={styles.addButton}
        onPress={() => router.push("/add-location")}
      >
        <Text style={styles.addButtonText}>+</Text>
      </Pressable>
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
  },

  addButton: {
    position: "absolute",
    right: 20,
    bottom: 40,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center"
  },

  addButtonText: {
    color: "white",
    fontSize: 32,
    lineHeight: 34
  }
});
