import { useNavigation } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    FlatList, KeyboardAvoidingView, Modal, Platform, RefreshControl, StyleSheet, Text, TouchableOpacity, View
} from "react-native";
import { useSelector } from "react-redux";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { useToast } from "../../constants/ToastContext";
import CommonHeader from "./CommonHeader";
import ReminderModal from "./ReminderModal";
import { fetchData } from "./api/Api";

export default function Remainder() {
    
    const navigation = useNavigation();
    const { showToast } = useToast();
    const [tab, setTab] = useState("upcoming");
    const [modalVisible, setModalVisible] = useState(false);
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedIds, setExpandedIds] = useState({});
    const [reminders, setReminders] = useState([]);
 
    useEffect(() => {
    if (profileDetails?.id) {
        fetchReminders(tab);
    }
}, [tab, profileDetails]);

const filteredData = useMemo(() => {
  return reminders.filter((item) => {
    if (tab === "upcoming") {
      return item.status === "active";
    }
    return item.status === "completed";
  });
}, [tab, reminders]);

    const formatTime = (timestamp) => {
            const date = new Date(timestamp);
            const hours = String(date.getHours()).padStart(2, "0");
            const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
};

  const profileDetails = useSelector(
    (state) => state?.auth?.profileDetails?.data
  );

const fetchReminders = async (type = "upcoming") => {
    try {
        setRefreshing(true);
        const body = {
            employeeId: profileDetails?.id,
            page: 1,
            limit: 100,
            search: "",
            type: type,
        };

        console.log("Reminder Request", body);

        const response = await fetchData(
            "reminders-list",
            "POST",
            body
        );

        if (response?.success) {
            const reminderData = response.reminders.map((item) => ({
                id: item._id,
                title: item.title,
                description: item.description,
                date: item.date,
                time: item.time,
                scheduledAt: item.scheduledAt,
                status: item.status,
            }));
            setReminders(reminderData);
        } else {
            setReminders([]);
        }
    } catch (error) {
        console.log("Error fetching reminders:", error);
        setReminders([]);
    } finally {
        setRefreshing(false);
        setModalVisible(false);
        setConfirmVisible(false);
    }
};

    const onRefresh = useCallback(() => {
             fetchReminders(tab);
    }, []);
    const askComplete = (item) => {
        setSelectedItem(item);
        setConfirmVisible(true);
    };
    const markComplete = async () => {

     try {
    const response = await fetchData("reminders-update-status", "POST", {
      employeeId: profileDetails?.id,
      id: selectedItem?.id,
      status: "inactive",
    });
    // console.log(response);
    if (response?.success) {
        showToast("Marked Successfully", "success");
        fetchReminders(tab);
    }
  } catch (error) {
    console.log(error);
  } finally {
     setConfirmVisible(false);
        setSelectedItem(null);
  }
    };
    // ✅ NEW: toggle expand
    const toggleExpand = (id) => {
        setExpandedIds((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

const addReminder = async (item) => {
  try {
    const response = await fetchData("reminders-create", "POST", {
      employeeId: profileDetails?.id,
      title: item.title,
      description: item.description,
      date: item.date,
      time: formatTime(item.time),
    });
    // console.log(response);
    if (response?.success) {
      showToast("Reminder Added", "success");
      fetchReminders(tab);
    }
  } catch (error) {
    console.log(error);
  } finally {
    setRefreshing(false);
  }
};
    // Render item
    const renderItem = ({ item }) => {
        const isExpanded = expandedIds[item.id];

        return (
            <View style={styles.card}>
                <Text numberOfLines={1} style={styles.title}>
                    {item.title}
                </Text>
                <Text numberOfLines={isExpanded ? undefined : 3}>
                    {item.description}
                </Text>
                {item.description?.length > 80 && (
                    <TouchableOpacity onPress={() => toggleExpand(item.id)}>
                        <Text style={{ color: COLORS.primary || "#007AFF", marginTop: 5 }}>
                            {isExpanded ? "Show less" : "Show more"}
                        </Text>
                    </TouchableOpacity>
                )}
                    <Text style={{ marginTop: 5, color: "#666" }}>
                    {item.date} {item.time}
            </Text>
                {tab === "upcoming"? (
                    <TouchableOpacity
                        style={styles.completeBtn}
                        onPress={() => askComplete(item)}
                    >
                        <Text style={{ color: "#fff" }}>
                            Mark as Complete
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <Text style={styles.doneText}>✔ Completed</Text>
                )}
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <View style={styles.container}>
                <CommonHeader
                    title="Reminder Manager"
                    showBackButton
                    onBackPress={() => navigation?.goBack()}
                />
                <View style={styles.tabContainer}>
                    {["upcoming", "past"].map((t) => (
                        <TouchableOpacity
                            key={t}
                         onPress={() => {
    setTab(t);
}}
                            style={[
                                styles.tab,
                                tab === t && styles.activeTab,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    tab === t && { color: "#fff" },
                                ]}
                            >
                                {t.toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <FlatList
                    data={reminders}
                    keyExtractor={(item) => item.id.toString()}                
                   renderItem={renderItem}
                    contentContainerStyle={{
                        padding: wp(4),
                        paddingBottom: 100,
                        flexGrow: 1,
                    }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[COLORS.primary || "#007AFF"]}
                        />
                    }
                    ListEmptyComponent={
                        <Text style={[styles.emptyText, {
                            alignSelf: "center", marginTop: hp(15), color: "#666",
                        }]}>
                            No reminders
                        </Text>
                    }
                />

                {/* FAB */}
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={{ color: "#fff", fontSize: wp(6) }}>
                        +
                    </Text>
                </TouchableOpacity>

                <ReminderModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    onSave={(item) => {
                        addReminder(item);
                        setModalVisible(false);
                    }}
                />

                <Modal transparent visible={confirmVisible} animationType="fade">
                    <View style={styles.overlay}>
                        <View style={styles.modalBox}>
                            <Text style={styles.modalTitle}>
                                Mark as completed?
                            </Text>

                            <Text style={{ marginBottom: 15 }}>
                                {selectedItem?.title}
                            </Text>

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.modalBtn, { backgroundColor: "#aaa" }]}
                                    onPress={() => setConfirmVisible(false)}
                                >
                                    <Text style={{ color: "#fff" }}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.modalBtn, { backgroundColor: "green" }]}
                                    onPress={markComplete}
                                >
                                    <Text style={{ color: "#fff" }}>Confirm</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F5F6FA" },
    tabContainer: {
        flexDirection: "row", margin: wp(4),
        backgroundColor: "#E9ECEF", borderRadius: wp(3), padding: wp(1),
    },
    tab: {
        flex: 1, padding: wp(3), alignItems: "center",
        borderRadius: wp(2),
    },
    activeTab: {
        backgroundColor: COLORS.primary || "#007AFF",
    },
    tabText: {
        fontWeight: "600", color: "#333", fontSize: wp(3.5),
    },
    fab: {
        position: "absolute", bottom: 20, right: 20,
        backgroundColor: COLORS.primary || "#007AFF",
        width: 55, height: 55, borderRadius: 30,
        alignItems: "center", justifyContent: "center",
        elevation: 5,
    },
    card: {
        backgroundColor: "#fff", padding: wp(4),
        borderRadius: wp(3), marginBottom: wp(3), elevation: 2,
    },
    title: { fontSize: wp(4), fontWeight: "700" },
    completeBtn: {
        marginTop: 10,
        backgroundColor: "green", padding: 8,
        borderRadius: 6, alignItems: "center",
    },
    doneText: {
        marginTop: 10, color: "green", fontWeight: "700",
    },
    overlay: {
        flex: 1, backgroundColor: "rgba(0,0,0,0.8)",
        justifyContent: "center", alignItems: "center",
    },
    modalBox: {
        width: "80%", backgroundColor: "#fff", padding: 20,
        borderRadius: 10,
    },
    modalTitle: {
        fontSize: 18, fontWeight: "700",
        marginBottom: 10,
    },
    modalActions: {
        flexDirection: "row", justifyContent: "space-between",
    },
    modalBtn: {
        flex: 1, marginHorizontal: 5, padding: 10,
        alignItems: "center", borderRadius: 6,
    },
});