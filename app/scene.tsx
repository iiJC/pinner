import React, { useEffect, useState } from "react";

import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";

import { router, useLocalSearchParams } from "expo-router";

import { supabase } from "../lib/supabase";

type Scene = {
  id: number;
  title: string | null;
  episode: string | null;
  timestamp_text: string | null;
  notes: string | null;

  reference_image_path: string | null;

  latitude: number | null;
  longitude: number | null;

  location_status: "unknown" | "approximate" | "likely" | "confirmed";

  found: boolean;

  collections:
    | {
        name: string;
      }
    | {
        name: string;
      }[]
    | null;
};

const getCollectionName = (collections: Scene["collections"]) => {
  if (!collections) {
    return null;
  }

  if (Array.isArray(collections)) {
    return collections[0]?.name ?? null;
  }

  return collections.name;
};

const getSceneImageUrl = (imagePath: string | null) => {
  if (!imagePath) {
    return null;
  }

  const { data } = supabase.storage
    .from("scene-images")
    .getPublicUrl(imagePath);

  return data.publicUrl;
};

export default function SceneScreen() {
  const { id } = useLocalSearchParams<{
    id?: string;
  }>();

  const [scene, setScene] = useState<Scene | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    fetchScene(id);
  }, [id]);

  const fetchScene = async (sceneId: string) => {
    const { data, error } = await supabase
      .from("scenes")
      .select(
        `
        id,
        title,
        episode,
        timestamp_text,
        notes,
        reference_image_path,
        latitude,
        longitude,
        location_status,
        found,
        collections (
          name
        )
      `
      )
      .eq("id", sceneId)
      .single();

    if (error) {
      console.log("Error loading scene:", error);
    } else {
      setScene(data as Scene);
    }

    setLoading(false);
  };

  if (!id) {
    return (
      <View style={styles.center}>
        <Text>No scene selected.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading scene...</Text>
      </View>
    );
  }

  if (!scene) {
    return (
      <View style={styles.center}>
        <Text>Scene could not be loaded.</Text>
      </View>
    );
  }

  const imageUrl = getSceneImageUrl(scene.reference_image_path);

  const hasLocation = scene.latitude !== null && scene.longitude !== null;

  const openGoogleMaps = () => {
    if (!hasLocation) {
      return;
    }

    const url = `https://www.google.com/maps/search/?api=1&query=${scene.latitude},${scene.longitude}`;

    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text>No screenshot</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title}>{scene.title || "Untitled Scene"}</Text>

        {getCollectionName(scene.collections) && (
          <Text style={styles.collection}>
            {getCollectionName(scene.collections)}
          </Text>
        )}

        {(scene.episode || scene.timestamp_text) && (
          <Text style={styles.metadata}>
            {scene.episode ? `Episode ${scene.episode}` : ""}

            {scene.episode && scene.timestamp_text ? " • " : ""}

            {scene.timestamp_text ?? ""}
          </Text>
        )}

        <Text style={styles.notes}>
          {scene.notes || "No research notes yet."}
        </Text>

        <View style={styles.locationBox}>
          <Text style={styles.locationTitle}>Location</Text>

          {hasLocation ? (
            <>
              <Text>
                {scene.latitude}, {scene.longitude}
              </Text>

              <Text style={styles.status}>{scene.location_status}</Text>
            </>
          ) : (
            <Text style={styles.status}>⚪ Unknown</Text>
          )}
        </View>

        {hasLocation ? (
          <Pressable style={styles.button} onPress={openGoogleMaps}>
            <Text style={styles.buttonText}>Open in Google Maps</Text>
          </Pressable>
        ) : (
          <Pressable
            style={styles.button}
            onPress={() =>
              router.push({
                pathname: "/set-scene-location",
                params: {
                  id: String(scene.id)
                }
              })
            }
          >
            <Text style={styles.buttonText}>Set Approximate Location</Text>
          </Pressable>
        )}
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
    height: 300,
    backgroundColor: "#111"
  },

  imagePlaceholder: {
    width: "100%",
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eee"
  },

  content: {
    padding: 24
  },

  title: {
    fontSize: 28,
    fontWeight: "bold"
  },

  collection: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "600",
    opacity: 0.6
  },

  metadata: {
    marginTop: 8,
    opacity: 0.6
  },

  notes: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 24
  },

  locationBox: {
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    marginBottom: 20
  },

  locationTitle: {
    fontWeight: "700",
    marginBottom: 8
  },

  status: {
    marginTop: 6,
    textTransform: "capitalize"
  },

  button: {
    backgroundColor: "#222",
    padding: 16,
    borderRadius: 10,
    alignItems: "center"
  },

  buttonText: {
    color: "white",
    fontWeight: "700"
  }
});
