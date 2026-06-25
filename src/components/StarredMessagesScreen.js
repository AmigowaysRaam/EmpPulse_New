import React from "react";
import {
    FlatList, StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { hp, wp } from "../../app/resources/dimensions";
import CommonHeader from "./CommonHeader";
const StarredMessagesScreen = () => {
    const starredMessages = [
        {
            id: "1",
            name: "John Smith",
            message: "Hey, don’t forget the meeting tomorrow at 10 AM.",
            time: "10:45 AM",
        },
        {
            id: "2",
            name: "Sarah",
            message: "I’ve sent you the files. Check your email.",
            time: "Yesterday",
        },
        {
            id: "3",
            name: "Team Group",
            message: "Project deadline is next Monday.",
            time: "Mon",
        },
    ];

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.item}>
            <View style={styles.iconBox}>
                <Ionicons name="star" size={18} color="#FFD700" />
            </View>

            <View style={styles.content}>
                <View style={styles.row}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.time}>{item.time}</Text>
                </View>

                <Text style={styles.message} numberOfLines={2}>
                    {item.message}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <CommonHeader title="Starred Messages" />

            {starredMessages.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="star-outline" size={60} color="#ccc" />
                    <Text style={styles.emptyText}>No starred messages yet</Text>
                </View>
            ) : (
                <FlatList
                    data={starredMessages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

export default StarredMessagesScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F0F2F5", }, list: { padding: wp(4), }, item: {
        flexDirection: "row",
        backgroundColor: "#fff", padding: wp(4), borderRadius: wp(3), marginBottom: hp(1.2),
        alignItems: "flex-start",
    }, iconBox: {
        width: wp(8), height: wp(8), borderRadius: wp(4), backgroundColor: "#FFF8E1", justifyContent: "center",
        alignItems: "center", marginRight: wp(3),
    }, content: {
        flex: 1,
    }, row: {
        flexDirection: "row", justifyContent: "space-between", marginBottom: 2,
    }, name: {
        fontSize: wp(4), fontWeight: "600", color: "#111B21",
    }, time: { fontSize: wp(3), color: "#667781", }, message: {
        fontSize: wp(3.6), color: "#667781", marginTop: 2,
    },
    emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", },
    emptyText: { marginTop: hp(1), fontSize: wp(4), color: "#999", },
});