import React, { useEffect, useState } from "react";

import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

import { useLocalSearchParams } from "expo-router";

import { supabase } from "../lib/supabase";

type MapLocation = {
  id: number;
  title: string;
  description: string | null;
  latitude: number;
  longitude: number;
  image_url: string | null;

  collections: {
    name: string;
  }[];
};

export default function LocationScreen() {
  const params = useLocalSearchParams<{
    id?: string;
  }>();

  const id = params.id;

  const [location, setLocation] = useState<MapLocation | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Location screen opened");
    console.log("Received ID:", id);

    if (!id) {
      setLoading(false);
      return;
    }

    fetchLocation(id);
  }, [id]);

  const fetchLocation = async (locationId: string) => {
    console.log("Fetching location:", locationId);

    const { data, error } = await supabase
      .from("locations")
      .select(
        `
        id,
        title,
        description,
        latitude,
        longitude,
        image_url,
        collections (
          name
        )
      `
      )
      .eq("id", locationId)
      .single();

    if (error) {
      console.log("Error loading location:", error);
    } else {
      console.log("Location loaded:", data);

      setLocation(data as MapLocation);
    }

    setLoading(false);
  };

  const openGoogleMaps = () => {
    if (!location) {
      return;
    }

    const url = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;

    Linking.openURL(url);
  };

  if (!id) {
    return (
      <View style={styles.center}>
        <Text>No location ID was provided.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading location...</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.center}>
        <Text>Location could not be loaded.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {location.image_url ? (
        <Image
          source={{
            uri: location.image_url
          }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text>No image yet</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title}>{location.title}</Text>

        {location.collections?.[0]?.name && (
          <Text style={styles.collection}>{location.collections[0].name}</Text>
        )}

        <Text style={styles.description}>
          {location.description ?? "No description"}
        </Text>

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

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  image: {
    width: "100%",
    height: 280
  },

  imagePlaceholder: {
    width: "100%",
    height: 280,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center"
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
