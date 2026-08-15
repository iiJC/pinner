import React, { useEffect, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  Image,
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
  reference_image_path: string | null;
  location_status: "unknown" | "approximate" | "likely" | "confirmed";
  found: boolean;
};

type Collection = {
  id: number;
  name: string;
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

const getStatusLabel = (status: Scene["location_status"]) => {
  switch (status) {
    case "approximate":
      return "🟡 Approximate";

    case "likely":
      return "🟠 Likely";

    case "confirmed":
      return "🟢 Confirmed";

    default:
      return "⚪ Unknown";
  }
};

export default function CollectionScreen() {
  const { id } = useLocalSearchParams<{
    id?: string;
  }>();

  const [collection, setCollection] = useState<Collection | null>(null);

  const [scenes, setScenes] = useState<Scene[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    fetchCollection();
  }, [id]);

  const fetchCollection = async () => {
    setLoading(true);

    const { data: collectionData, error: collectionError } = await supabase
      .from("collections")
      .select("id, name")
      .eq("id", id)
      .single();

    if (collectionError) {
      console.log("Error loading collection:", collectionError);

      setLoading(false);
      return;
    }

    const { data: sceneData, error: sceneError } = await supabase
      .from("scenes")
      .select(
        `
        id,
        title,
        episode,
        timestamp_text,
        reference_image_path,
        location_status,
        found
      `
      )
      .eq("collection_id", id)
      .order("sort_order", {
        ascending: true
      });

    if (sceneError) {
      console.log("Error loading scenes:", sceneError);
    }

    setCollection(collectionData as Collection);

    setScenes((sceneData ?? []) as Scene[]);

    setLoading(false);
  };

  if (!id) {
    return (
      <View style={styles.center}>
        <Text>No collection selected.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.loadingText}>Loading collection...</Text>
      </View>
    );
  }

  if (!collection) {
    return (
      <View style={styles.center}>
        <Text>Collection could not be loaded.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{collection.name}</Text>

        <Text style={styles.sceneCount}>
          {scenes.length} {scenes.length === 1 ? "scene" : "scenes"}
        </Text>
      </View>

      <FlatList
        data={scenes}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No scenes yet</Text>

            <Text style={styles.emptyText}>
              Add screenshots to start researching this collection.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const imageUrl = getSceneImageUrl(item.reference_image_path);

          return (
            <Pressable
              style={styles.card}
onPress={() =>
  router.push({
    pathname: "/scene",
    params: {
      id: String(scene.id),
    },
  })
}
              }
            >
              {imageUrl ? (
                <Image
                  source={{
                    uri: imageUrl
                  }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text>No image</Text>
                </View>
              )}

              <View style={styles.cardContent}>
                <Text style={styles.sceneTitle} numberOfLines={1}>
                  {item.title || "Untitled Scene"}
                </Text>

                {(item.episode || item.timestamp_text) && (
                  <Text style={styles.metadata}>
                    {item.episode ? `Ep ${item.episode}` : ""}

                    {item.episode && item.timestamp_text ? " • " : ""}

                    {item.timestamp_text ?? ""}
                  </Text>
                )}

                <Text style={styles.status}>
                  {item.found
                    ? "✅ Found"
                    : getStatusLabel(item.location_status)}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />

      <Pressable
        style={styles.addButton}
        onPress={() =>
          router.push({
            pathname: "/add-scene",
            params: {
              collectionId: collection.id.toString()
            }
          })
        }
      >
        <Text style={styles.addButtonText}>+ Scene</Text>
      </Pressable>
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
    alignItems: "center",
    padding: 24
  },

  loadingText: {
    marginTop: 10
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12
  },

  title: {
    fontSize: 28,
    fontWeight: "bold"
  },

  sceneCount: {
    marginTop: 4,
    opacity: 0.6
  },

  list: {
    padding: 12,
    paddingBottom: 100
  },

  row: {
    gap: 12
  },

  card: {
    flex: 1,
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f5f5f5"
  },

  image: {
    width: "100%",
    aspectRatio: 1.45
  },

  imagePlaceholder: {
    width: "100%",
    aspectRatio: 1.45,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eee"
  },

  cardContent: {
    padding: 10
  },

  sceneTitle: {
    fontSize: 15,
    fontWeight: "700"
  },

  metadata: {
    marginTop: 3,
    fontSize: 12,
    opacity: 0.6
  },

  status: {
    marginTop: 7,
    fontSize: 13,
    fontWeight: "600"
  },

  empty: {
    padding: 40,
    alignItems: "center"
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700"
  },

  emptyText: {
    marginTop: 8,
    opacity: 0.6,
    textAlign: "center"
  },

  addButton: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#222",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 26
  },

  addButtonText: {
    color: "white",
    fontWeight: "700"
  }
});
