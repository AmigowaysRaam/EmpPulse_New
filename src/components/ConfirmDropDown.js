import React, { useEffect, useState } from "react";
import {
    Animated,
    Easing,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

export default function ConfirmDropDown({
    title = "",
    data = [],
    onSelect,
    selectedItem = null,
    renderItemStyle = {},
    textStyle = {},
    isVisible = false,
    onClose,
    animationDuration = 200,
}) {
    const [fadeAnim] = useState(new Animated.Value(0));

    const [confirmVisible, setConfirmVisible] = useState(false);
    const [selectedConfirmItem, setSelectedConfirmItem] = useState(null);

    useEffect(() => {
        if (isVisible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: animationDuration,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: animationDuration,
                easing: Easing.in(Easing.ease),
                useNativeDriver: true,
            }).start();
        }
    }, [isVisible]);

    const handleSelect = (item) => {
        // Show confirmation modal only if item has message
        if (item?.message) {
            setSelectedConfirmItem(item);
            setConfirmVisible(true);
            return;
        }

        if (onSelect) onSelect(item);
        if (onClose) onClose();
    };

    const onConfirm = () => {
        if (onSelect && selectedConfirmItem) {
            onSelect(selectedConfirmItem);
        }

        setConfirmVisible(false);
        setSelectedConfirmItem(null);

        if (onClose) onClose();
    };

    const onCancelConfirm = () => {
        setConfirmVisible(false);
        setSelectedConfirmItem(null);
    };

    const onCloseN = () => {
        if (onClose) onClose();
    };

    const isSelected = (item) =>
        selectedItem?.value?.key === item.key;

    return (
        <>
            {/* Main Dropdown Modal */}
            <Modal
                transparent
                visible={isVisible}
                animationType="none"
                onRequestClose={onCloseN}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={onCloseN}
                >
                    <Animated.View
                        style={[
                            styles.modalContent,
                            { opacity: fadeAnim }
                        ]}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.title}>
                                {/* {JSON.stringify(selectedItem?.value)} */}
                                {title}
                            </Text>
                            <Pressable
                                onPress={onClose}
                                style={styles.closeButton}
                            >
                                <Text style={styles.closeText}>
                                    ✕
                                </Text>
                            </Pressable>
                        </View>

                        <FlatList
                            data={data}
                            keyExtractor={(item, index) =>
                                index.toString()
                            }
                            renderItem={({ item }) => (
                                <Pressable
                                    style={[
                                        styles.item,
                                        renderItemStyle,
                                        isSelected(item) &&
                                        styles.itemSelected,
                                    ]}
                                    onPress={() =>
                                        handleSelect(item)
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.itemText,
                                            textStyle,
                                            isSelected(item) && {
                                                fontWeight: "700",
                                                color: COLORS.primary,
                                            },
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                </Pressable>
                            )}
                            contentContainerStyle={{
                                paddingVertical: hp(1),
                            }}
                        />
                    </Animated.View>
                </TouchableOpacity>
            </Modal>
            {/* Confirmation Modal */}
            <Modal
                transparent
                visible={confirmVisible}
                animationType="fade"
                onRequestClose={onCancelConfirm}
            >
                <View style={styles.confirmOverlay}>
                    <View style={styles.confirmContainer}>
                        <Text style={styles.confirmTitle}>
                            Confirmation
                        </Text>
                        <Text style={styles.confirmMessage}>
                            {selectedConfirmItem?.message}
                        </Text>
                        <View style={styles.confirmActions}>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={onCancelConfirm}
                            >
                                <Text style={styles.cancelText}>
                                    Cancel
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.confirmBtn}
                                onPress={onConfirm}
                            >
                                <Text style={styles.confirmText}>
                                    Confirm
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}
const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
    },

    modalContent: {
        backgroundColor: "#fff",
        borderRadius: wp(2),
        maxHeight: hp(60),
        width: wp(95),
        alignSelf: "center",
        paddingVertical: hp(1),
        elevation: 5,
        position: "absolute",
        bottom: hp(4),
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: wp(4),
        paddingVertical: hp(1),
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },

    title: {
        fontSize: wp(4.7),
        fontFamily: "Poppins_600SemiBold",
        color: COLORS?.primary,
    },

    closeButton: {
        backgroundColor: COLORS?.primary + "20",
        borderRadius: wp(4),
        paddingVertical: wp(1),
        paddingHorizontal: wp(2.2),
    },

    closeText: {
        fontSize: wp(5),
        fontWeight: "700",
        color: COLORS?.primary,
    },

    item: {
        paddingVertical: hp(1.5),
        paddingHorizontal: wp(4),
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },

    itemSelected: {
        backgroundColor: COLORS.primary + "20",
    },

    itemText: {
        fontSize: wp(4),
        fontFamily: "Poppins_600SemiBold",
    },

    // Confirmation Modal Styles

    confirmOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },

    confirmContainer: {
        width: wp(85),
        backgroundColor: "#fff",
        borderRadius: wp(3),
        padding: wp(5),
        elevation: 10,
    },

    confirmTitle: {
        fontSize: wp(4.5),
        fontFamily: "Poppins_600SemiBold",
        color: COLORS.primary,
        marginBottom: hp(1),
    },

    confirmMessage: {
        fontSize: wp(3.8),
        color: "#444",
        marginBottom: hp(2),
        lineHeight: hp(3),
    },

    confirmActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
    },

    cancelBtn: {
        paddingHorizontal: wp(4),
        paddingVertical: hp(1),
        marginRight: wp(2),
    },

    confirmBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: wp(4),
        paddingVertical: hp(1),
        borderRadius: wp(2),
    },

    cancelText: {
        color: "#666",
        fontFamily: "Poppins_600SemiBold",
    },

    confirmText: {
        color: "#fff",
        fontFamily: "Poppins_600SemiBold",
    },
});