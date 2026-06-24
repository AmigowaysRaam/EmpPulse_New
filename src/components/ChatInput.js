import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import React, { useRef, useState } from "react";
import {
    Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

const ChatInputBar = ({ inputText, setInputText, onSend, messageInputRef }) => {

    const [showAttach, setShowAttach] = useState(false);
    const [recording, setRecording] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordTime, setRecordTime] = useState(0);
    const [audioUri, setAudioUri] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const timerRef = useRef(null);
    const soundRef = useRef(null);
    const isTyping = inputText?.trim()?.length > 0;
    const processFile = async (uri) => {
        const newPath =
            FileSystem.documentDirectory + uri.split("/").pop();

        await FileSystem.copyAsync({
            from: uri,
            to: newPath,
        });
        return newPath;
    };
    const openCamera = async () => {
        try {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
                alert("Camera permission required");
                return;
            }
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.7,
            });

            if (!result.canceled) {
                const uri = result.assets[0].uri;

                onSend?.({
                    type: "image",
                    uri,
                });
            }

            setShowAttach(false);
        } catch (e) {
            console.log(e);
        }
    };
    const openGallery = async () => {
        try {
            const permission =
                await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permission.granted) {
                alert("Gallery permission required");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                quality: 0.7,
            });

            if (!result.canceled) {
                const uri = result.assets[0].uri;

                onSend?.({
                    type: "image",
                    uri,
                });
            }

            setShowAttach(false);
        } catch (e) {
            console.log(e);
        }
    };
    const startRecording = async () => {
        try {
            const perm = await Audio.requestPermissionsAsync();
            if (!perm.granted) {
                return Alert.alert("Mic permission required");
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            setRecording(recording);
            setIsRecording(true);
            setRecordTime(0);

            timerRef.current = setInterval(() => {
                setRecordTime((t) => t + 1);
            }, 1000);
        } catch (e) {
            console.log(e);
        }
    };

    const stopRecording = async () => {
        try {
            setIsRecording(false);
            clearInterval(timerRef.current);

            if (!recording) return;

            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();

            const saved = await processFile(uri);

            setAudioUri(saved);
            setRecording(null);
        } catch (e) {
            console.log(e);
        }
    };

    // ---------------- PLAY AUDIO ----------------
    const togglePlay = async () => {
        try {
            if (!audioUri) return;

            if (soundRef.current) {
                const status = await soundRef.current.getStatusAsync();
                if (status.isPlaying) {
                    await soundRef.current.pauseAsync();
                    setIsPlaying(false);
                    return;
                }
            }

            if (soundRef.current) {
                await soundRef.current.unloadAsync();
                soundRef.current = null;
            }

            const { sound } = await Audio.Sound.createAsync({ uri: audioUri });

            soundRef.current = sound;
            setIsPlaying(true);

            sound.setOnPlaybackStatusUpdate((status) => {
                if (!status.isLoaded) return;
                if (status.didJustFinish) setIsPlaying(false);
            });

            await sound.playAsync();
        } catch (e) {
            console.log(e);
        }
    };

    // ---------------- SEND AUDIO ----------------
    const sendAudio = () => {
        if (!audioUri) return;

        onSend?.({
            type: "audio",
            uri: audioUri,
        });

        setAudioUri(null);
        setRecordTime(0);
        setIsPlaying(false);
    };

    // ---------------- REMOVE AUDIO ----------------
    const removeAudio = async () => {
        setAudioUri(null);
        setRecordTime(0);
        setIsPlaying(false);

        if (soundRef.current) {
            await soundRef.current.unloadAsync();
            soundRef.current = null;
        }
    };

    const formatTime = (sec) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    };

    return (
        <View style={styles.wrapper}>
            <Modal
                visible={showAttach}
                transparent
                animationType="fade"
                onRequestClose={() => setShowAttach(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowAttach(false)}
                >
                    <View style={styles.attachMenu}>
                        <TouchableOpacity
                            style={styles.attachItem}
                            onPress={openGallery}
                        >
                            <Ionicons name="image" size={wp(9)} />
                            <Text>Gallery</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.attachItem}
                            onPress={openCamera}
                        >
                            <Ionicons name="camera" size={wp(9)} />
                            <Text>Camera</Text>
                        </TouchableOpacity>
                        {/* 
    <TouchableOpacity
        style={styles.attachItem}
        onPress={openDocument}
    >
        <Ionicons name="document" size={wp(9)} />
        <Text>Document</Text>
    </TouchableOpacity> */}
                    </View>
                </TouchableOpacity>
            </Modal>
            {audioUri && (
                <View style={styles.previewBox}>
                    <TouchableOpacity onPress={togglePlay}>
                        <Ionicons
                            name={isPlaying ? "pause" : "play"}
                            size={wp(8)}
                            color={COLORS.primary}
                        />
                    </TouchableOpacity>

                    <Text style={styles.previewText}>
                        Voice message • {formatTime(recordTime)}
                    </Text>
                    <TouchableOpacity onPress={removeAudio}>
                        <Ionicons name="trash" size={wp(8)} color="red" style={{
                            marginHorizontal: hp(2)
                        }} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={sendAudio}>
                        <Ionicons name="send" size={wp(7)} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>
            )}
            {isRecording && (
                <View style={styles.recordBar}>
                    <View style={styles.redDot} />
                    <Text style={styles.recordText}>
                        Recording... {formatTime(recordTime)}
                    </Text>
                </View>
            )}
            <View style={styles.row}>
                <TouchableOpacity
                    onPress={() => setShowAttach(true)}
                    style={styles.iconBtn}
                >
                    <Ionicons name="add" size={26} />
                </TouchableOpacity>
                <TextInput
                    ref={messageInputRef}   // ✅ THIS IS THE KEY
                    style={styles.input}
                    placeholder="Enter message here..."
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                    placeholderTextColor={'#555'}
                />

                {isTyping ? (
                    <TouchableOpacity onPress={onSend} style={styles.sendBtn}>
                        <Ionicons name="send" size={18} color="#fff" />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPressIn={startRecording}
                        onPressOut={stopRecording}
                        style={styles.iconBtn}
                    >
                        <Ionicons
                            name={isRecording ? "radio-button-on" : "mic"}
                            size={22}
                            color={isRecording ? "red" : "#111"}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

export default ChatInputBar;

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderColor: "#eee",
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
        padding: wp(2),
    },

    input: {
        flex: 1,
        backgroundColor: "#F4F5F7",
        borderRadius: wp(6),
        paddingHorizontal: wp(4),
        maxHeight: hp(10),
    },

    iconBtn: {
        width: wp(10),
        height: wp(10),
        justifyContent: "center",
        alignItems: "center",
    },

    sendBtn: {
        backgroundColor: COLORS.primary,
        width: wp(9),
        height: wp(9),
        borderRadius: wp(4.5),
        justifyContent: "center",
        alignItems: "center",
    },

    previewBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f4f4f4",
        padding: wp(2),
        borderRadius: 10,
        margin: wp(2),
    },

    previewText: {
        flex: 1,
        marginLeft: 10,
    },

    recordBar: {
        flexDirection: "row",
        alignItems: "center",
        padding: wp(2),
        backgroundColor: "#fff5f5",
    },

    redDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "red",
        marginRight: 8,
    },

    recordText: {
        color: "red",
        fontWeight: "600",
    },

    // MODAL
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "flex-end",
    },

    attachMenu: {
        backgroundColor: "#fff",
        padding: wp(10),
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        flexDirection: "row",
        justifyContent: "space-around",
    },

    attachItem: {
        alignItems: "center",
        gap: 5,
    },
});