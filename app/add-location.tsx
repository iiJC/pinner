import React, { useEffect, useState } from "react";

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import { router } from "expo-router";

import { supabase } from "../lib/supabase";

type Collection = {
  id: number;
  name: string;
};

export default function AddLocationScreen() {
  const [title, setTitle] = useState("");

  const [description, setDescription] = useState("");

  const [latitude, setLatitude] = useState("");

  const [longitude, setLongitude] = useState("");

  const [collections, setCollections] = useState<Collection[]>([]);

  const [selectedCollectionId, setSelectedCollectionId] = useState<
    number | null
  >(null);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    console.log("Loading collections...");

    const { data, error } = await supabase
      .from("collections")
      .select("id, name")
      .order("name");

    if (error) {
      console.log("Error loading collections:", error);

      return;
    }

    console.log("Collections loaded:", data);

    setCollections(data ?? []);
  };

  const saveLocation = async () => {
    // Check title
    if (!title.trim()) {
      Alert.alert("Missing title", "Please enter a title.");

      return;
    }

    // Convert coordinate text into numbers
    const parsedLatitude = Number(latitude);

    const parsedLongitude = Number(longitude);

    // Check coordinates
    if (Number.isNaN(parsedLatitude) || Number.isNaN(parsedLongitude)) {
      Alert.alert(
        "Invalid coordinates",
        "Please enter valid latitude and longitude values."
      );

      return;
    }

    // Make sure coordinates are possible
    if (parsedLatitude < -90 || parsedLatitude > 90) {
      Alert.alert("Invalid latitude", "Latitude must be between -90 and 90.");

      return;
    }

    if (parsedLongitude < -180 || parsedLongitude > 180) {
      Alert.alert(
        "Invalid longitude",
        "Longitude must be between -180 and 180."
      );

      return;
    }

    setSaving(true);

    console.log("Attempting to create location...");

    const { data, error } = await supabase
      .from("locations")
      .insert({
        title: title.trim(),

        description: description.trim() || null,

        latitude: parsedLatitude,

        longitude: parsedLongitude,

        collection_id: selectedCollectionId,

        image_url: null
      })
      .select();

    setSaving(false);

    if (error) {
      console.log("Error saving location:", error);

      Alert.alert("Could not save location", error.message);

      return;
    }

    console.log("Location successfully created:", data);

    // Return to the map.
    // useFocusEffect in index.tsx will
    // automatically fetch the new locations.
    router.back();
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>Add Location</Text>

      {/* Title */}

      <Text style={styles.label}>Title</Text>

      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Tokyo Station"
      />

      {/* Description */}

      <Text style={styles.label}>Description</Text>

      <TextInput
        style={[styles.input, styles.descriptionInput]}
        value={description}
        onChangeText={setDescription}
        placeholder="What is special about this place?"
        multiline
      />

      {/* Latitude */}

      <Text style={styles.label}>Latitude</Text>

      <TextInput
        style={styles.input}
        value={latitude}
        onChangeText={setLatitude}
        placeholder="35.681236"
        keyboardType="numbers-and-punctuation"
      />

      {/* Longitude */}

      <Text style={styles.label}>Longitude</Text>

      <TextInput
        style={styles.input}
        value={longitude}
        onChangeText={setLongitude}
        placeholder="139.767125"
        keyboardType="numbers-and-punctuation"
      />

      {/* Collection */}

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

      {/* Save */}

      <Pressable
        style={[styles.saveButton, saving && styles.disabledButton]}
        onPress={saveLocation}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? "Saving..." : "Save Location"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "white",
    flexGrow: 1
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

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 18
  },

  descriptionInput: {
    minHeight: 100,
    textAlignVertical: "top"
  },

  collections: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 30
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
    fontWeight: "600",
    fontSize: 16
  }
});
