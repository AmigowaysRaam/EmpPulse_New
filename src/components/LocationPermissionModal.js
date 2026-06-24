import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Camera } from "expo-camera";
import * as Location from "expo-location";
import React, { useCallback, useState } from "react";
import {
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
export default function LocationPermissionModal({
  onLocationReceived,
}) {
  const [visible, setVisible] = useState(false);

  const requestPermission = async () => {
    try {
      // LOCATION PERMISSION
      const { status: locationStatus } =
        await Location.requestForegroundPermissionsAsync();

      // CAMERA PERMISSION
      const { status: cameraStatus } =
        await Camera.requestCameraPermissionsAsync();

      const locationGranted = locationStatus === "granted";
      const cameraGranted = cameraStatus === "granted";

      // If both permissions are granted
      if (locationGranted && cameraGranted) {
        const location =
          await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });

        onLocationReceived?.({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        setVisible(false);
      } else {
        setVisible(true);
      }
    } catch (error) {
      console.log("Permission Error:", error);
      setVisible(true);
    }
  };
  useFocusEffect(
    useCallback(() => {
      requestPermission();
      return () => {
        // cleanup if needed
      };
    }, [])
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Ionicons name="location-outline" size={70} color="#2563EB" />

          <Text style={styles.title}>
            Permissions Required
          </Text>

          <Text style={styles.message}>
            Please allow location and camera access to continue.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={requestPermission}
          >
            <Text style={styles.buttonText}>
              Grant Permissions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => Linking.openSettings()}>
            <Text style={styles.settingsText}>
              Open Settings
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "88%",
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  title: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: "700",
  },
  message: {
    marginTop: 10,
    textAlign: "center",
    color: "#6B7280",
  },
  button: {
    marginTop: 20,
    width: "100%",
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
  settingsText: {
    marginTop: 15,
    color: "#2563EB",
    fontWeight: "600",
  },
});