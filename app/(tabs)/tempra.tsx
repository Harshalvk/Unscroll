import UsageStats, { EventType, showUsageAccessSettings, checkForPermission } from "@justdice/react-native-usage-stats";
import { Audio } from "expo-av";
import React, { useEffect, useState } from "react";
import { Button, Modal, Platform, StyleSheet, Text, View } from "react-native";

const SOCIAL_APPS = [
  "com.instagram.android",
  "com.twitter.android",
  "com.snapchat.android",
  "com.facebook.katana",
];

export default function DetoxApp() {
  const [hasPermission, setHasPermission] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  // Load calm sound
  useEffect(() => {
    let loadedSound: Audio.Sound | null = null;

    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("./assets/calm.mp3") // adjust relative path
        );
        loadedSound = sound;
        setSound(sound);
      } catch (e) {
        console.log("Sound load error:", e);
      }
    };

    loadSound();

    return () => {
      if (loadedSound) loadedSound.unloadAsync();
    };
  }, []);

  // Check or request permission
  const checkPermission = async () => {
    if (Platform.OS !== "android") return;

    const granted = await checkForPermission();
    setHasPermission(granted);
    if (!granted) {
      showUsageAccessSettings("android.settings.USAGE_ACCESS_SETTINGS");
    }
  };

  useEffect(() => {
    checkPermission();
  }, []);

  // Detect social apps
  const detectApps = async () => {
    if (!hasPermission) return;

    const now = Date.now();
    const tenSecondsAgo = now - 10000;

    try {
      const events = await UsageStats.queryEvents(tenSecondsAgo, now);

      events.forEach(async (event) => {
        if (
          event.eventType === EventType.ACTIVITY_RESUMED &&
          SOCIAL_APPS.includes(event.packageName)
        ) {
          setModalVisible(true); // show modal
          if (sound) {
            await sound.replayAsync();
          }
        }
      });
    } catch (e) {
      console.log("UsageStats error:", e);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      detectApps();
    }, 5000);

    return () => clearInterval(interval);
  }, [hasPermission, sound]);

  return (
    <View style={styles.container}>
      {hasPermission ? (
        <Text>✅ Permission Granted. Monitoring social apps...</Text>
      ) : (
        <Button title="Grant Usage Access" onPress={checkPermission} />
      )}

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modal}>
          <Text style={styles.modalText}>
            🚨 Take a Break! You just opened a social app.
          </Text>
          <Button title="Close" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalText: {
    fontSize: 22,
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
});
