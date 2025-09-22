import {
  queryUsageStats,
  showUsageAccessSettings,
} from "@justdice/react-native-usage-stats";
import React, { useEffect, useRef, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const motivationalQuotes = [
  "Disconnect to reconnect.",
  "Your mind deserves a break.",
  "Be present, not just online.",
  "Small steps, big changes.",
];

const timerPresets = [10, 15, 20]; 

export default function HomeScreen() {
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef<number | null>(null);
  const [screenTime, setScreenTime] = useState<number>(0);

  useEffect(() => {
    const fetchScreenTime = async () => {
      if (Platform.OS !== "android") return;
      const now = Date.now();
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      try {
        const stats = await queryUsageStats(startOfDay.getTime(), now, 4);
        const totalTime = stats.reduce(
          (sum: number, app: any) => sum + (app.totalTimeInForeground || 0),
          0
        );
        setScreenTime(totalTime);
      } catch (e) {
        setScreenTime(0);
      }
    };
    fetchScreenTime();
  }, []);

  const formatScreenTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const totalDetoxTime = "2h 30m";
  const streak = 5; // days
  const quote =
    motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  const handlePresetSelect = (minutes: number) => setSelectedTime(minutes);

  const handleStartTimer = () => {
    if (!selectedTime) return;
    setTimerActive(true);
    setSecondsLeft(selectedTime * 60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Unscroll</Text>
          <Text style={styles.headerSubtitle}>Detox Social Media</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {Platform.OS === "android"
                  ? formatScreenTime(screenTime)
                  : "--:--"}
              </Text>
              <Text style={styles.statLabel}>Screen Time</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalDetoxTime}</Text>
              <Text style={styles.statLabel}>Detox Time</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>{streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>

          <View style={styles.quoteCard}>
            <Text style={styles.quoteIcon}>💭</Text>
            <Text style={styles.quoteText}>{quote}</Text>
          </View>

          <View style={styles.timerCard}>
            <Text style={styles.sectionTitle}>Focus Timer</Text>

            <View style={styles.presetContainer}>
              {timerPresets.map((min) => (
                <TouchableOpacity
                  key={min}
                  style={[
                    styles.presetButton,
                    selectedTime === min && styles.presetButtonSelected,
                  ]}
                  onPress={() => handlePresetSelect(min)}
                  disabled={timerActive}
                >
                  <Text
                    style={[
                      styles.presetText,
                      selectedTime === min && styles.presetTextSelected,
                    ]}
                  >
                    {min} min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {timerActive ? (
              <View style={styles.activeTimer}>
                <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
                <Text style={styles.timerLabel}>remaining</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.startButton,
                  (!selectedTime || timerActive) && styles.startButtonDisabled,
                ]}
                onPress={handleStartTimer}
                disabled={!selectedTime || timerActive}
              >
                <Text style={styles.startButtonText}>Start Focus Session</Text>
              </TouchableOpacity>
            )}
          </View>

          {Platform.OS === "android" && (
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => showUsageAccessSettings("com.unscroll")}
            >
              <Text style={styles.settingsButtonText}>Grant Usage Access</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 6,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3B82F6",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  quoteCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  quoteIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  quoteText: {
    fontSize: 15,
    fontStyle: "italic",
    color: "#475569",
    flex: 1,
  },
  timerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  presetContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  presetButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    marginHorizontal: 6,
  },
  presetButtonSelected: {
    backgroundColor: "#3B82F6",
  },
  presetText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  presetTextSelected: {
    color: "#FFFFFF",
  },
  startButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  startButtonDisabled: {
    backgroundColor: "#CBD5E1",
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  activeTimer: {
    alignItems: "center",
    paddingVertical: 10,
  },
  timerText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#3B82F6",
    letterSpacing: 1,
  },
  timerLabel: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
  settingsButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
  },
  settingsButtonText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "500",
  },
});
