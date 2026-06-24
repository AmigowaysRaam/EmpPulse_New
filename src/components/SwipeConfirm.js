import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import {
    GestureHandlerRootView,
    Swipeable,
} from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const THEME = {
    success: {
        primary: "#16A34A",
        secondary: "#DCFCE7",
        icon: "check-circle",
    },
    error: {
        primary: "#DC2626",
        secondary: "#FEE2E2",
        icon: "alert-circle",
    },
    warning: {
        primary: "#D97706",
        secondary: "#FEF3C7",
        icon: "alert",
    },
    info: {
        primary: "#2563EB",
        secondary: "#DBEAFE",
        icon: "information",
    },
};

const SwipeConfirm = ({
    title = "Swipe Right To Continue",
    confirmMessage = "Are you sure?",
    type = "info",
    onConfirm,
}) => {
    const [visible, setVisible] = useState(false);

    const swipeRef = useRef(null);
    const arrowAnim = useRef(
        new Animated.Value(0)
    ).current;

    const colors = THEME[type] || THEME.info;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(arrowAnim, {
                    toValue: 15,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.timing(arrowAnim, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const handleConfirm = () => {
        setVisible(false);
        swipeRef.current?.close();

        if (onConfirm) {
            onConfirm();
        }
    };

    const handleCancel = () => {
        setVisible(false);
        swipeRef.current?.close();
    };


    return (
        <>
            <GestureHandlerRootView>
                <View
                    style={[
                        styles.swipeWrapper,
                        {
                            borderColor: colors.primary,
                        },
                    ]}
                >
                    <Animated.View
                        style={[
                            styles.arrowContainer,
                            {
                                transform: [
                                    {
                                        translateX: arrowAnim,
                                    },
                                ],
                            },
                        ]}
                    >
                        <Icon
                            name="chevron-right"
                            size={22}
                            color={'#fff'}
                        />
                        <Icon
                            name="chevron-right"
                            size={22}
                            color={'#fff'}

                        />
                        <Icon
                            name="chevron-right"
                            size={22} color={'#fff'}

                        />
                    </Animated.View>
                    <Swipeable
                        ref={swipeRef}
                        // renderLeftActions={
                        //   renderLeftActions
                        // }
                        onSwipeableLeftOpen={() =>
                            setVisible(true)
                        }
                        overshootLeft={false}
                    >
                        <View
                            style={[
                                styles.swipeButton,
                                {
                                    backgroundColor:
                                        colors.primary,
                                },
                            ]}
                        >
                            <Icon
                                name="arrow-right-bold-circle"
                                size={24}
                                color="#FFF"
                            />

                            <Text style={styles.swipeText}>
                                {title}
                            </Text>
                        </View>
                    </Swipeable>
                </View>
            </GestureHandlerRootView>

            <Modal
                transparent
                visible={visible}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View
                            style={[
                                styles.iconCircle,
                                {
                                    backgroundColor:
                                        colors.secondary,
                                },
                            ]}
                        >
                            <Icon
                                name={colors.icon}
                                size={42}
                                color={colors.primary}
                            />
                        </View>

                        <Text style={styles.modalTitle}>
                            Confirmation
                        </Text>

                        <Text style={styles.modalMessage}>
                            {confirmMessage}
                        </Text>

                        <View style={styles.buttonRow}>
                            <Pressable
                                style={styles.cancelBtn}
                                onPress={handleCancel}
                            >
                                <Text
                                    style={styles.cancelText}
                                >
                                    Cancel
                                </Text>
                            </Pressable>

                            <Pressable
                                style={[
                                    styles.confirmBtn,
                                    {
                                        backgroundColor:
                                            colors.primary,
                                    },
                                ]}
                                onPress={handleConfirm}
                            >
                                <Text
                                    style={styles.confirmText}
                                >
                                    Confirm
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};

export default SwipeConfirm;

const styles = StyleSheet.create({
    swipeWrapper: {
        borderWidth: 2,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "#FFF",
    },

    arrowContainer: {
        position: "absolute",
        left: 20,
        top: "50%",
        flexDirection: "row",
        zIndex: 10,
        marginTop: -11,
    },

    swipeButton: {
        height: 62,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
    },

    swipeText: {
        color: "#FFF",
        fontSize: 15,
        fontWeight: "700",
        marginLeft: 10,
    },

    actionContainer: {
        width: 120,
        justifyContent: "center",
        alignItems: "center",
    },

    actionText: {
        color: "#FFF",
        fontWeight: "700",
        marginTop: 4,
    },

    modalOverlay: {
        flex: 1,
        backgroundColor:
            "rgba(0,0,0,0.45)",
        justifyContent: "center",
        alignItems: "center",
    },

    modalCard: {
        width: "85%",
        backgroundColor: "#FFF",
        borderRadius: 20,
        padding: 24,
        alignItems: "center",
    },

    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
    },

    modalTitle: {
        marginTop: 15,
        fontSize: 20,
        fontWeight: "700",
    },

    modalMessage: {
        marginTop: 10,
        textAlign: "center",
        color: "#64748B",
        fontSize: 15,
    },

    buttonRow: {
        flexDirection: "row",
        marginTop: 25,
        width: "100%",
    },

    cancelBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#CBD5E1",
        borderRadius: 12,
        paddingVertical: 12,
        marginRight: 8,
        alignItems: "center",
    },

    confirmBtn: {
        flex: 1,
        borderRadius: 12,
        paddingVertical: 12,
        marginLeft: 8,
        alignItems: "center",
    },

    cancelText: {
        color: "#475569",
        fontWeight: "600",
    },

    confirmText: {
        color: "#FFF",
        fontWeight: "700",
    },
});