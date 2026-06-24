import { useNavigation } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Easing,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

export default function WakeUpScreen() {
    const navigation = useNavigation();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 900,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 900,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const handleSnooze = () => navigation?.goBack();
    const handleOk = () => navigation?.goBack();

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.card,
                    {
                        opacity: fadeAnim,
                        transform: [
                            { translateY: slideAnim },
                            { scale: scaleAnim },
                        ],
                    },
                ]}
            >
                {/* TOP SECTION */}
                <View style={styles.topSection}>
                    <Animated.Text
                        style={[
                            styles.icon,
                            { transform: [{ scale: pulseAnim }] },
                        ]}
                    >
                        ⏰
                    </Animated.Text>

                    <Text style={styles.title}>Good Morning!</Text>
                </View>

                {/* MIDDLE CONTENT */}
                <View style={styles.middleSection}>
                    <Text style={styles.subtitle}>
                        Report Checking
                    </Text>

                    <Text style={styles.description}>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        Voluptas, doloremque. Lorem ipsum dolor sit amet consectetur
                        adipisicing elit. Voluptas, doloremque.{"\n\n"}
                        This area is designed for longer messages, reminders, or alarm notes.
                    </Text>
                </View>

                {/* BOTTOM BUTTONS */}
                <View style={styles.bottomSection}>
                    <TouchableOpacity
                        style={styles.snoozeBtn}
                        onPress={handleSnooze}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.snoozeText}>Snooze</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.okBtn}
                        onPress={handleOk}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.okText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0B1220",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: wp(5),
    },

    card: {
        width: "100%",
        maxWidth: wp(90),
        height: hp(78),

        backgroundColor: "#1E293B",
        borderRadius: wp(6),

        paddingVertical: wp(6),
        paddingHorizontal: wp(5),

        justifyContent: "space-between",
    },

    /* TOP */
    topSection: {
        alignItems: "center",
        justifyContent: "center",
    },

    icon: {
        fontSize: wp(14),
        marginBottom: wp(3),
    },

    title: {
        fontSize: wp(7),
        fontWeight: "800",
        color: "#FFFFFF",
        textAlign: "center",
    },

    /* MIDDLE */
    middleSection: {
        flex: 1,
        marginTop: wp(5),
        alignItems: "center",
        justifyContent: "center",
    },

    subtitle: {
        fontSize: wp(4.5),
        color: "#60A5FA",
        fontWeight: "700",
        marginBottom: wp(3),
        textAlign: "center",
    },

    description: {
        fontSize: wp(3.8),
        color: "#94A3B8",
        textAlign: "center",
        lineHeight: wp(5.5),
        paddingHorizontal: wp(2),
    },

    /* BOTTOM */
    bottomSection: {
        flexDirection: "row",
        width: "100%",
        marginTop: wp(4),
    },

    snoozeBtn: {
        flex: 1,
        marginRight: wp(3),
        paddingVertical: wp(4),
        borderRadius: wp(4),
        backgroundColor: "#334155",
        alignItems: "center",
        justifyContent: "center",
    },
    okBtn: {
        flex: 1,
        marginLeft: wp(3),
        paddingVertical: wp(4),
        borderRadius: wp(4),
        backgroundColor: COLORS.primary || "#3B82F6",
        alignItems: "center",
        justifyContent: "center",
    },

    snoozeText: {
        color: "#CBD5E1",
        fontSize: wp(4),
        fontWeight: "700",
    },

    okText: {
        color: "#FFFFFF",
        fontSize: wp(4),
        fontWeight: "700",
    },
});