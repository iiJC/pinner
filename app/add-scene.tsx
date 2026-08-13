import React, { useEffect, useState } from "react";

import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";

import { supabase } from "../lib/supabase";

type Collection = {
  id: number;
  name: string;
};

export default function AddSceneScreen() {
  const [collections, setCollections] = useState<Collection[]>([]);

  const [selectedCollectionId, setSelectedCollectionId] = useState<
    number | null
  >(null);

  const [title, setTitle] = useState("");
  const [episode, setEpisode] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [notes, setNotes] = useState("");

  const [imageUri, setImageUri] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  const params = useLocalSearchParams<{
    collectionId?: string;
  }>();

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    if (params.collectionId) {
      setSelectedCollectionId(Number(params.collectionId));
    }
  }, [params.collectionId]);

  const fetchCollections = async () => {
    const { data, error } = await supabase
      .from("collections")
      .select("id, name")
      .order("name");

    if (error) {
      console.log("Error loading collections:", error);
      return;
    }

    setCollections(data ?? []);
  };

  const chooseScreenshot = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 1
    });

    if (result.canceled) {
      return;
    }

    const selectedImage = result.assets[0];

    console.log("Selected screenshot:", selectedImage.uri);

    setImageUri(selectedImage.uri);
  };

  const uploadScreenshot = async (uri: string) => {
    const response = await fetch(uri);

    const arrayBuffer = await response.arrayBuffer();

    const extension = uri.split(".").pop()?.toLowerCase() || "jpg";

    const fileName = `scene-${Date.now()}.${extension}`;

    const filePath = `screenshots/${fileName}`;

    console.log("Uploading screenshot:", filePath);

    const { error } = await supabase.storage
      .from("scene-images")
      .upload(filePath, arrayBuffer, {
        contentType: extension === "png" ? "image/png" : "image/jpeg"
      });

    if (error) {
      throw error;
    }

    return filePath;
  };

  const saveScene = async () => {
    if (!selectedCollectionId) {
      Alert.alert(
        "Choose a collection",
        "This scene needs to belong to a collection."
      );

      return;
    }

    if (!imageUri) {
      Alert.alert(
        "Choose a screenshot",
        "Please select the anime screenshot you want to find."
      );

      return;
    }

    try {
      setSaving(true);

      // 1. Upload screenshot
      const imagePath = await uploadScreenshot(imageUri);

      console.log("Screenshot uploaded:", imagePath);

      // 2. Create scene
      const { data, error } = await supabase
        .from("scenes")
        .insert({
          collection_id: selectedCollectionId,

          title: title.trim() || null,

          episode: episode.trim() || null,

          timestamp_text: timestamp.trim() || null,

          notes: notes.trim() || null,

          reference_image_path: imagePath,

          location_id: null,

          location_status: "unknown",

          found: false
        })
        .select();

      if (error) {
        throw error;
      }

      console.log("Scene successfully created:", data);

      router.back();
    } catch (error: any) {
      console.log("Error creating scene:", error);

      Alert.alert(
        "Could not create scene",
        error?.message ?? "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>Add Scene</Text>

      <Text style={styles.label}>Collection</Text>

      <View style={styles.collections}>
        {collections.map((collection) => {
          const selected = selectedCollectionId === collection.id;

          return (
            <Pressable
              key={collection.id}
              style={[
                styles.collectionButton,
                selected && styles.selectedCollectionButton
              ]}
              onPress={() => setSelectedCollectionId(collection.id)}
            >
              <Text
                style={[
                  styles.collectionText,
                  selected && styles.selectedCollectionText
                ]}
              >
                {collection.name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>Screenshot</Text>

      <Pressable style={styles.imagePicker} onPress={chooseScreenshot}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.preview}
            resizeMode="contain"
          />
        ) : (
          <Text style={styles.imagePickerText}>+ Choose Screenshot</Text>
        )}
      </Pressable>

      {imageUri && (
        <Pressable onPress={chooseScreenshot}>
          <Text style={styles.changeImage}>Choose different screenshot</Text>
        </Pressable>
      )}

      <Text style={styles.label}>Title</Text>

      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Pedestrian bridge"
      />

      <Text style={styles.label}>Episode</Text>

      <TextInput
        style={styles.input}
        value={episode}
        onChangeText={setEpisode}
        placeholder="3"
      />

      <Text style={styles.label}>Timestamp</Text>

      <TextInput
        style={styles.input}
        value={timestamp}
        onChangeText={setTimestamp}
        placeholder="14:32"
      />

      <Text style={styles.label}>Research notes</Text>

      <TextInput
        style={[styles.input, styles.notesInput]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Possibly around Yotsuya..."
        multiline
      />

      <View style={styles.locationBox}>
        <Text style={styles.locationTitle}>Location</Text>

        <Text style={styles.locationStatus}>⚪ Unknown</Text>

        <Text style={styles.locationHelp}>
          That's okay — we'll research and attach a location later.
        </Text>
      </View>

      <Pressable
        style={[styles.saveButton, saving && styles.disabledButton]}
        onPress={saveScene}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? "Saving Scene..." : "Save Scene"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: "white"
  },

  heading: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8
  },

  collections: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24
  },

  collectionButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10
  },

  selectedCollectionButton: {
    backgroundColor: "#222"
  },

  collectionText: {
    color: "#222"
  },

  selectedCollectionText: {
    color: "white"
  },

  imagePicker: {
    height: 220,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 8
  },

  imagePickerText: {
    fontSize: 16,
    fontWeight: "600"
  },

  preview: {
    width: "100%",
    height: "100%"
  },

  changeImage: {
    marginBottom: 24,
    fontWeight: "600",
    textDecorationLine: "underline"
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 18
  },

  notesInput: {
    minHeight: 100,
    textAlignVertical: "top"
  },

  locationBox: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f5f5f5",
    marginBottom: 30
  },

  locationTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8
  },

  locationStatus: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 6
  },

  locationHelp: {
    opacity: 0.6
  },

  saveButton: {
    backgroundColor: "#222",
    padding: 16,
    borderRadius: 10,
    alignItems: "center"
  },

  disabledButton: {
    opacity: 0.5
  },

  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600"
  }
});
