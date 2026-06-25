import React, { useRef, useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const AttendanceGroupScreen = () => {
    const flatListRef = useRef();

    // 🏢 GROUP
    const group = {
        name: "Office Attendance Group",
    };

    // 👤 CURRENT USER
    const currentUser = {
        id: "u1",
        name: "Arun",
    };

    // 📋 ATTENDANCE FEED (CHAT STYLE DATA)
    const [logs, setLogs] = useState([
        {
            id: "1",
            userId: "u2",
            name: "Ravi",
            type: "IN",
            time: "09:10 AM",
            status: "Working",
        },
        {
            id: "2",
            userId: "u3",
            name: "Kumar",
            type: "OUT",
            time: "06:00 PM",
            status: "Completed",
        },
    ]);

    // 🟢 CHECK IN
    const checkIn = () => {
        const newLog = {
            id: Date.now().toString(),
            userId: currentUser.id,
            name: currentUser.name,
            type: "IN",
            time: new Date().toLocaleTimeString(),
            status: "Working",
        };

        setLogs(prev => [...prev, newLog]);

        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    // 🔴 CHECK OUT
    const checkOut = () => {
        const newLog = {
            id: Date.now().toString(),
            userId: currentUser.id,
            name: currentUser.name,
            type: "OUT",
            time: new Date().toLocaleTimeString(),
            status: "Completed",
        };

        setLogs(prev => [...prev, newLog]);

        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    // 🎯 CHAT BUBBLE RENDER
    const renderItem = ({ item }) => {
        const isMe = item.userId === currentUser.id;

        return (
            <View
                style={[
                    styles.messageRow,
                    isMe ? styles.right : styles.left,
                ]}
            >
                <View
                    style={[
                        styles.bubble,
                        isMe ? styles.myBubble : styles.otherBubble,
                    ]}
                >
                    <Text style={styles.name}>{item.name}</Text>

                    <Text style={styles.text}>
                        {item.type === "IN" ? "🟢 Checked In" : "🔴 Checked Out"}
                    </Text>

                    <Text style={styles.time}>{item.time}</Text>

                    <Text
                        style={[
                            styles.status,
                            {
                                color:
                                    item.status === "Working"
                                        ? "#f39c12"
                                        : "#2ecc71",
                            },
                        ]}
                    >
                        {item.status}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>

            {/* HEADER */}
            <View style={styles.header}>
                <Text style={styles.title}>{group.name}</Text>
            </View>

            {/* ATTENDANCE CHAT LIST */}
            <FlatList
                ref={flatListRef}
                data={logs}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 12 }}
            />

            {/* ACTION BAR (LIKE CHAT INPUT AREA) */}
            <View style={styles.bottomBar}>
                <TouchableOpacity onPress={checkIn} style={styles.inBtn}>
                    <Text style={styles.btnText}>CHECK IN</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={checkOut} style={styles.outBtn}>
                    <Text style={styles.btnText}>CHECK OUT</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
};

export default AttendanceGroupScreen;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#EAF2F8",
    },

    header: {
        padding: 15,
        backgroundColor: "#fff",
        elevation: 3,
    },

    title: {
        fontSize: 18,
        fontWeight: "700",
    },

    messageRow: {
        marginVertical: 6,
        flexDirection: "row",
    },

    left: {
        justifyContent: "flex-start",
    },

    right: {
        justifyContent: "flex-end",
    },

    bubble: {
        maxWidth: "75%",
        padding: 12,
        borderRadius: 12,
    },

    myBubble: {
        backgroundColor: "#DCF8C6",
        alignSelf: "flex-end",
    },

    otherBubble: {
        backgroundColor: "#fff",
    },

    name: {
        fontWeight: "700",
        fontSize: 13,
        marginBottom: 4,
    },

    text: {
        fontSize: 14,
        marginBottom: 4,
    },

    time: {
        fontSize: 11,
        color: "#666",
    },

    status: {
        fontSize: 12,
        fontWeight: "600",
        marginTop: 3,
    },

    bottomBar: {
        flexDirection: "row",
        padding: 10,
        backgroundColor: "#fff",
        borderTopWidth: 0.5,
        borderColor: "#ddd",
    },

    inBtn: {
        flex: 1,
        backgroundColor: "green",
        padding: 12,
        marginRight: 5,
        borderRadius: 8,
        alignItems: "center",
    },

    outBtn: {
        flex: 1,
        backgroundColor: "red",
        padding: 12,
        marginLeft: 5,
        borderRadius: 8,
        alignItems: "center",
    },

    btnText: {
        color: "#fff",
        fontWeight: "700",
    },
});