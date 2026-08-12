import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Pinner",
          headerShown: false
        }}
      />

      <Stack.Screen
        name="location"
        options={{
          title: "Location",
          headerBackTitle: "Map"
        }}
      />
    </Stack>
  );
}
