import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { Audio } from "expo-av";
import React, {
    useCallback, useEffect, useRef, useState,
} from "react";
import {
    ActivityIndicator, Image, Modal, StyleSheet, Text,
    TouchableOpacity, View
} from "react-native";
import { Camera, CameraType } from "react-native-camera-kit";
import { COLORS } from "../../app/resources/colors";
import { wp } from "../../app/resources/dimensions";
import { useToast } from "../../constants/ToastContext";
import AttHeader from "./AttendacneLogin";
import LocationPermissionModal from "./LocationPermissionModal";

export default function AttendanceLogin() {
    const cameraRef = useRef(null);
    const attendanceLock = useRef(false);
    const [faces, setFaces] = useState([]);
    const [faceDetected, setFaceDetected] = useState(false);
    const [attendanceMarked, setAttendanceMarked] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [location, setLocation] = useState(null);
    const [countdown, setCountdown] = useState(null);
    const [attendanceData, setAttendanceData] = useState(null);
    const [showSuccessCard, setShowSuccessCard] = useState(false);
    const countdownRef = useRef(null);
    const { showToast } = useToast();
    const isFocused = useIsFocused();


    const playAudio = async (type = "success") => {
        try {
            const source =
                type === "success"
                    ? require("../../assets/loginSuccess.mp3")
                    : require("../../assets/loginFailed.mp3");
            const { sound } = await Audio.Sound.createAsync(source);
            console.log("Audio loaded");
            await sound.playAsync();
            console.log("Audio playing");
        } catch (error) {
            console.log("Audio Error:", error);
        }
    };
    const stopAllProcesses = useCallback(() => {
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }

        attendanceLock.current = false;

        setFaces([]);
        setFaceDetected(false);
        setCountdown(null);
        setUploading(false);
    }, []);
    const resetAttendance = () => {
        attendanceLock.current = false;
        setAttendanceMarked(false);
        setUploading(false);
        setFaces([]);
        setFaceDetected(false);
        setCountdown(null);
        setAttendanceData(null);
        setShowSuccessCard(false);
    };

    const startAttendanceProcess = useCallback(() => {

        if (!isFocused) {
            return;
        }

        if (
            attendanceLock.current ||
            attendanceMarked ||
            uploading ||
            countdownRef.current
        ) {
            return;
        }

        let count = 3;

        setCountdown(count);

        countdownRef.current = setInterval(() => {

            if (!isFocused) {
                clearInterval(countdownRef.current);
                countdownRef.current = null;
                setCountdown(null);
                return;
            }

            count--;

            if (count > 0) {
                setCountdown(count);
            } else {
                clearInterval(countdownRef.current);
                countdownRef.current = null;
                setCountdown(null);
                captureAndUpload();
            }
        }, 1000);

    }, [
        attendanceMarked,
        uploading,
        isFocused,
    ]);


    useEffect(() => {
        const setupAudio = async () => {
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                shouldDuckAndroid: true,
            });
        };

        setupAudio();
    }, []);

    const captureAndUpload = async () => {
        if (!isFocused) {
            return;
        }
        if (
            attendanceLock.current ||
            attendanceMarked ||
            uploading
        ) {
            return;
        }

        if (!cameraRef.current) {
            return;
        }
        try {
            attendanceLock.current = true;
            setUploading(true);
            const image = await cameraRef.current.capture({
                quality: 0.1, // 0.0 - 1.0
            });
            console.log('Original:', image.size);
            console.log("Captured Image:", image);
            const formData = new FormData();
            formData.append("faceImage", {
                uri: image.uri,
                name: "attendance.jpg",
                type: "image/jpeg",
            });
            console.log("Captured Image:", image);
            console.log("Image Size (bytes):", image.size);
            console.log("Image Size (KB):", (image.size / 1024).toFixed(2));
            console.log("Image Size (MB):", (image.size / (1024 * 1024)).toFixed(2));
            if (location) {
                formData.append(
                    "latitude",
                    String(location.latitude)
                );
                formData.append(
                    "longitude",
                    String(location.longitude)
                );
            }
            const response = await fetch(
                "https://amigoways.org/api/?url=face-attendance-mark",
                {
                    method: "POST",
                    body: formData,
                    headers: {
                        Accept: "application/json",
                    },
                }
            );
            const result = await response.json();
            console.log("Attendance Response:", result);
            if (result?.success) {
                await playAudio("success");
                // console.log("Attendance Result:", result);
                setAttendanceMarked(true);
                showToast?.(
                    result?.message ||
                    "Attendance marked successfully", 'success'
                );
                setAttendanceData({
                    name: result.employee?.name,
                    employeeId: result.employee?.employeeId,
                    photo: result.employee?.employeeImage,
                    message: result.message,
                    loginTime: result?.loginDate,
                    action: result.action,
                    confidence: result.confidence,
                });
                setShowSuccessCard(true);
                setTimeout(() => {
                    resetAttendance();
                }, 2500);

            } else {
                await playAudio("failed");
                attendanceLock.current = false;
                showToast?.(
                    result?.message ||
                    "Failed to mark attendance",
                    'error'
                );
            }
        } catch (error) {
            await playAudio("failed");
            console.log("Attendance Error:", error);
            attendanceLock.current = false;
            showToast?.(
                "Something went wrong while marking attendance", 'error'
            );
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        return () => {
            if (countdownRef.current) {
                clearInterval(countdownRef.current);
            }
        };
    }, []);


    const onFaceDetected = useCallback(
        (event) => {

            if (!isFocused) {
                return;
            }

            const detectedFaces =
                event?.nativeEvent?.faces || [];

            setFaces(detectedFaces);

            const hasFace =
                detectedFaces.length > 0;

            setFaceDetected(hasFace);

            if (
                hasFace &&
                !attendanceMarked &&
                !attendanceLock.current &&
                !uploading &&
                !countdownRef.current
            ) {
                startAttendanceProcess();
            }

            if (
                !hasFace &&
                countdownRef.current
            ) {
                clearInterval(
                    countdownRef.current
                );

                countdownRef.current = null;

                setCountdown(null);
            }
        },
        [
            isFocused,
            attendanceMarked,
            uploading,
            startAttendanceProcess,
        ]
    );

    return (
        <View style={styles.container}>
            <AttHeader
                title="Attendance Login"
                showBackButton={false}
            />
            {/* <Text>{JSON.stringify(location)}</Text> */}
            {
                isFocused && (
                    <Camera
                        key={isFocused ? "focused" : "blurred"}
                        ref={cameraRef}
                        cameraType={CameraType.Front}
                        style={styles.camera}
                        faceDetectionEnabled={true}
                        faceDetectionThrottleMs={500}
                        onFaceDetected={onFaceDetected}
                        onFaceDetectionInstallStatus={(event) => {
                            console.log(
                                "Face Detection Status:",
                                event?.nativeEvent?.state
                            );
                        }}
                    />
                )
            }

            <View style={styles.statusContainer}>
                {countdown !== null ? (
                    <>
                        <Text
                            style={{
                                fontSize: wp(20),
                                fontWeight: "bold",
                                color: COLORS?.primary
                            }}
                        >
                            {countdown}
                        </Text>
                        <Text style={styles.processingText}>
                            Capturing attendance in...
                        </Text>
                    </>
                ) : uploading ? (
                    <>
                        <ActivityIndicator size="small" />
                        <Text style={styles.processingText}>
                            Verifying Face...
                        </Text>
                    </>
                ) : attendanceMarked ? (
                    <Text
                        style={[
                            styles.statusText,
                            { color: "green" },
                        ]}
                    >
                        Attendance Marked Successfully
                    </Text>
                ) : (
                    <Text
                        style={[
                            styles.statusText,
                            {
                                color: faceDetected
                                    ? "green"
                                    : "red",
                            },
                        ]}
                    >
                        {faceDetected
                            ? `Face Detected (${faces.length})`
                            : "No Face Detected"}
                    </Text>
                )}
            </View>
            <Modal
                visible={showSuccessCard}
                transparent
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.successCard}>
                        <Ionicons
                            name="checkmark-circle"
                            size={80}
                            color="#16A34A"
                        />
                        {
                            attendanceData?.photo && (
                                <Image source={{ uri: attendanceData?.photo }} style={styles.employeeImage} />
                            )
                        }
                        <Text style={styles.successHeading}>
                            Attendance Success
                        </Text>

                        <Text style={styles.employeeName}>
                            {attendanceData?.name}
                        </Text>

                        <Text style={styles.employeeId}>
                            Employee ID: {attendanceData?.employeeId}
                        </Text>

                        <View style={styles.divider} />

                        <Text style={styles.successMessage}>
                            {attendanceData?.message}
                        </Text>

                        <TouchableOpacity
                            style={styles.okButton}
                            onPress={() => {
                                setShowSuccessCard(false);
                                setAttendanceData(null);
                                setAttendanceMarked(false);
                                attendanceLock.current = false;
                                setFaces([]);
                                setFaceDetected(false);
                                setCountdown(null);
                            }}
                        >
                            <Text style={styles.okButtonText}>
                                OK
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <LocationPermissionModal
                onLocationReceived={(coords) => {
                    console.log("Location:", coords);
                    setLocation(coords);
                }}
            />
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    modalOverlay: {
        flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "center", alignItems: "center",
    }, successCard: {
        width: "88%", backgroundColor: "#fff", borderRadius: 24, padding: 24, alignItems: "center", elevation: 12,
    }, successHeading: {
        marginTop: 10, fontSize: 22, fontWeight: "700", color: "#111827",
    }, employeeImage: {
        width: wp(15), height: wp(15), borderRadius: 55,
        marginTop: 18, borderWidth: 3, borderColor: "#16A34A",
    }, employeeName: {
        marginTop: 12, fontSize: 22, fontWeight: "700", color: "#111827",
        textTransform: "capitalize",
    }, employeeId: { marginTop: 4, fontSize: 15, color: "#6B7280", }, divider: {
        width: "100%", height: 1, backgroundColor: "#E5E7EB", marginVertical: 18,
    }, successMessage: {
        fontSize: 16, fontWeight: "700", color: "#16A34A", textAlign: "center",
    }, infoLabel: { marginTop: 16, fontSize: 14, color: "#6B7280", }, dateText: {
        marginTop: 6, fontSize: 16, color: "#374151",
    }, timeText: { marginTop: 4, fontSize: 22, fontWeight: "700", color: "#111827", }, okButton: {
        marginTop: 24, backgroundColor: "#2563EB", width: "100%", paddingVertical: 14,
        borderRadius: 14, alignItems: "center",
    }, okButtonText: { color: "#fff", fontSize: 16, fontWeight: "700", },
    camera: { flex: 1, }, statusContainer: {
        position: "absolute", top: 80, alignSelf: "center", backgroundColor: "#FFF",
        paddingHorizontal: 16, paddingVertical: 12, borderRadiu: 12, elevation: 4,
        alignItems: "center",
    }, statusText: {
        fontSize: 16, fontWeight: "600",
    }, processingText: {
        marginTop: 8, fontSize: 14, fontWeight: "500",
    },
});