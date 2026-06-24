import { useNavigation } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
    FlatList,
    KeyboardAvoidingView, Modal, Platform, RefreshControl, StyleSheet,
    Text, TouchableOpacity, View
} from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { useToast } from "../../constants/ToastContext";
import CommonHeader from "./CommonHeader";
import ReminderModal from "./ReminderModal";

export default function Remainder() {
    const navigation = useNavigation();
    const { showToast } = useToast();

    const [tab, setTab] = useState("upcoming");
    const [modalVisible, setModalVisible] = useState(false);
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // ✅ NEW: track expanded descriptions
    const [expandedIds, setExpandedIds] = useState({});

    const [reminders, setReminders] = useState([
        {
            id: "1",
            title: "Doctor Appointment",
            description: "Visit doctor at 6 PM.",
            time: Date.now() + 1000000,
            completed: false,
        },
        {
            id: "2",
            title: "Meeting",
            description: "Project meeting at 10 AM. Agenda includes sprint planning, task review, and backlog discussion.",
            time: Date.now() - 1000000,
            completed: false,
        },
    ]);

    // Filter list
    const filteredData = useMemo(() => {
        return reminders.filter((i) =>
            tab === "upcoming" ? !i.completed : i.completed
        );
    }, [tab, reminders]);

    // Add reminder
    const addReminder = (item) => {
        setReminders((prev) => [
            {
                ...item,
                id: Date.now().toString(),
                completed: false,
            },
            ...prev,
        ]);
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 800);
    }, []);

    const askComplete = (item) => {
        setSelectedItem(item);
        setConfirmVisible(true);
    };

    const markComplete = () => {
        setReminders((prev) =>
            prev.map((r) =>
                r.id === selectedItem?.id
                    ? { ...r, completed: true }
                    : r
            )
        );
        setConfirmVisible(false);
        setSelectedItem(null);
        showToast("Marked Successfully", "success");
    };

    // ✅ NEW: toggle expand
    const toggleExpand = (id) => {
        setExpandedIds((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    // Render item
    const renderItem = ({ item }) => {
        const isExpanded = expandedIds[item.id];

        return (
            <View style={styles.card}>
                <Text numberOfLines={1} style={styles.title}>
                    {item.title}
                </Text>

                {/* ✅ DESCRIPTION WITH 3-LINE LIMIT */}
                <Text numberOfLines={isExpanded ? undefined : 3}>
                    {item.description}
                </Text>

                {/* ✅ SHOW MORE / LESS */}
                {item.description?.length > 80 && (
                    <TouchableOpacity onPress={() => toggleExpand(item.id)}>
                        <Text style={{ color: COLORS.primary || "#007AFF", marginTop: 5 }}>
                            {isExpanded ? "Show less" : "Show more"}
                        </Text>
                    </TouchableOpacity>
                )}

                <Text>{new Date(item.time).toLocaleString()}</Text>

                {!item.completed ? (
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
                            onPress={() => setTab(t)}
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
                    data={filteredData}
                    keyExtractor={(item) => item.id}
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