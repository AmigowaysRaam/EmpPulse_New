import { Audio } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import {
    Image,
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Ionicons from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
// ✅ ADD THIS
import MediaViewerModal from "./MediaView";
const ChatMessageItem = ({
    item,
    selectionMode,
    selectedMessages,
    toggleSelectMessage,
    setSelectedMsg,
    setShowActionModal,
    setReplyTo,
    swipeRefs,
    messageInputRef,
    PROFILE_ID,
}) => {

    const isMe = item.sender == "me";
    const isSelected = selectedMessages.find((m) => m.id === item.id);

    const soundRef = useRef(null);
    const [playingId, setPlayingId] = useState(null);
    const [loadingId, setLoadingId] = useState(null);

    // ✅ ONLY NEW ADDITIONS (SAFE)
    const [viewerVisible, setViewerVisible] = useState(false);
    const [viewerUri, setViewerUri] = useState(null);
    const [viewerType, setViewerType] = useState(null);

    useEffect(() => {
        console.log("react", item.reaction);
        // react {"😂": ["6a3e64ab97ee799659c2c9fa"]}
        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
        };
    }, []);

    const handleAudioPress = async (uri, id) => {
        try {
            if (playingId === id && soundRef.current) {
                await soundRef.current.pauseAsync();
                setPlayingId(null);
                return;
            }

            setLoadingId(id);

            if (soundRef.current) {
                await soundRef.current.unloadAsync();
                soundRef.current = null;
            }

            const { sound } = await Audio.Sound.createAsync(
                { uri },
                { shouldPlay: true }
            );

            soundRef.current = sound;
            setPlayingId(id);
            setLoadingId(null);

            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) {
                    setPlayingId(null);
                }
            });
        } catch (e) {
            console.log("Audio error", e);
            setLoadingId(null);
        }
    };

    const renderRightActions = () => (
        <View style={styles.swipeActionArea}>
            <Text style={styles.swipeHint}>↩</Text>
        </View>
    );

    // ✅ SAFE MEDIA OPEN FUNCTION
    const openMedia = (uri, type) => {
        setViewerUri(uri);
        setViewerType(type);
        setViewerVisible(true);
    };

    return (
        <>
            <MediaViewerModal
                visible={viewerVisible}
                uri={viewerUri}
                type={viewerType}
                onClose={() => setViewerVisible(false)}
            />
            <Swipeable
                ref={(ref) => {
                    if (ref) swipeRefs.current.set(item.id, ref);
                }}
                renderRightActions={renderRightActions}
                renderLeftActions={renderRightActions}
                onSwipeableOpen={() => {
                    setReplyTo(item);
                    setTimeout(() => {
                        messageInputRef.current?.focus();
                    }, 100);
                    swipeRefs.current.get(item.id)?.close();
                }}
            >
                <TouchableOpacity
                    activeOpacity={0.9}
                    onLongPress={() => toggleSelectMessage(item)}
                    onPress={() => {
                        if (selectionMode) {
                            toggleSelectMessage(item);
                            return;
                        }
                        setSelectedMsg(item);
                        setShowActionModal(true);
                    }}
                >
                    <View
                        style={[
                            styles.row,
                            isMe ? styles.right : styles.left,
                            isSelected && {
                                backgroundColor: COLORS.primary + "55",
                                borderRadius: wp(2),
                                paddingVertical: wp(2),
                            },
                        ]}
                    >
                        <View
                            style={[
                                styles.bubble,
                                isMe ? styles.myBubble : styles.theirBubble,
                            ]}
                        >
                            {!!item.text && (
                                <Text style={{ color: isMe ? "#fff" : "#222" }}>
                                    {item.text}
                                </Text>
                            )}
                            {item.attachment && (
                                <>
                                    {item.attachment.type === "image" && (
                                        <TouchableOpacity
                                            activeOpacity={0.9}
                                            onPress={() =>
                                                openMedia(
                                                    item.attachment.url,
                                                    "image"
                                                )
                                            }
                                        >
                                            <Image
                                                source={{
                                                    uri: item.attachment.url,
                                                }}
                                                style={styles.image}
                                                resizeMode="cover"
                                            />
                                        </TouchableOpacity>
                                    )}

                                    {/* AUDIO (UNCHANGED) */}
                                    {item.attachment.type === "audio" && (
                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            onPress={() =>
                                                handleAudioPress(
                                                    item.attachment.url,
                                                    item.id
                                                )
                                            }
                                            style={styles.audioBox}
                                        >
                                            <View style={styles.audioHeader}>
                                                <View style={styles.playBtn}>
                                                    {loadingId === item.id ? (
                                                        <Text style={{ color: "#fff" }}>
                                                            ...
                                                        </Text>
                                                    ) : (
                                                        <Ionicons
                                                            name={
                                                                playingId === item.id
                                                                    ? "pause"
                                                                    : "play-circle"
                                                            }
                                                            size={wp(6)}
                                                            color="#fff"
                                                        />
                                                    )}
                                                </View>

                                                <Text
                                                    numberOfLines={1}
                                                    style={styles.audioName}
                                                >
                                                    {item.attachment.name || "Voice Message"}
                                                </Text>
                                            </View>
                                            <Text style={styles.audioHint}>
                                                Tap to play/pause audio
                                            </Text>
                                        </TouchableOpacity>
                                    )}

                                    {/* DOCUMENT (UNCHANGED) */}
                                    {item.attachment.type === "document" && (
                                        <TouchableOpacity
                                            onPress={() =>
                                                Linking.openURL(item.attachment.url)
                                            }
                                            style={styles.docBox}
                                        >
                                            <Ionicons
                                                name="document-text-outline"
                                                size={28}
                                                color="#E74C3C"
                                            />

                                            <View style={{ flex: 1, marginLeft: 10 }}>
                                                <Text numberOfLines={1} style={styles.docTitle}>
                                                    {item.attachment.name}
                                                </Text>
                                                <Text style={styles.docSubtitle}>
                                                    Tap to open
                                                </Text>
                                            </View>

                                            <Ionicons
                                                name="open-outline"
                                                size={22}
                                                color="#2E86DE"
                                            />
                                        </TouchableOpacity>
                                    )}
                                </>
                            )}

                            {/* TIME */}
                            <Text
                                style={{
                                    fontSize: wp(2.5),
                                    marginTop: hp(0.3),
                                    opacity: 0.6,
                                    textAlign: "right",
                                    color: isMe ? "#fff" : "#222",
                                }}
                            >
                                {item.time}
                            </Text>
                                 {/* TIME */}
                            {/* <Text
                                style={{
                                    fontSize: wp(2.5),
                                    marginTop: hp(0.3),
                                    opacity: 0.6,
                                    textAlign: "right",
                                    color: isMe ? "#fff" : "#222",
                                }}
                            >
                                {JSON.stringify(item)}
                            </Text> */}
                            <View style={{ flexDirection: "row", marginTop: 4 }}>
    {Object.entries(item.reaction || {}).map(([emoji, users]) => (
        <Text key={emoji} style={{ marginRight: 4, fontSize: 12 }}>
            {emoji} {users.length}
        </Text>
    ))}
</View>
                        </View>
                    </View>
                </TouchableOpacity>
            </Swipeable>
        </>
    );
};

export default React.memo(ChatMessageItem);
const styles = StyleSheet.create({
    row: { marginVertical: hp(0.5), },
    left: { alignItems: "flex-start", },
    right: { alignItems: "flex-end", }, bubble: {
        maxWidth: "75%", padding: wp(3), borderRadius: wp(4),
    }, myBubble: {
        backgroundColor: COLORS.primary + "99",
        borderTopRightRadius: 0, borderRadius: wp(2.5),
    },
    theirBubble: {
        backgroundColor: "#fff", borderTopLeftRadius: 0,
    },
    text: {
        fontSize: wp(3.3), color: "#111",
    },
    image: { width: wp(25), height: wp(25), borderRadius: wp(2), },

    audioBox: {
        width: wp(45),
        backgroundColor: "#F5F5F5", borderRadius: 12, padding: 10,
    },
    audioHeader: {
        flexDirection: "row", alignItems: "center", marginBottom: 8,
    },
    audioName: { flex: 1, marginLeft: 8, fontSize: wp(3), },
    docBox: {
        flexDirection: "row", alignItems: "center", backgroundColor: "#F5F5F5",
        padding: 12,
        borderRadius: 12, width: 250,
    },
    docTitle: { fontWeight: "600", color: "#222", },
    docSubtitle: { fontSize: 12, color: "#777", },

    inlineReply: {
        flexDirection: "row",
        alignItems: "center", marginBottom: hp(0.5), backgroundColor: "#f3f3f3",
        padding: wp(1.5),
        borderRadius: wp(2),
    },
    replyLine: {
        width: 3,
        height: "100%", backgroundColor: COLORS.primary, marginRight: wp(2),
    },
    reaction: { fontSize: wp(4), },
    time: {
        fontSize: wp(2.5), marginTop: hp(0.3), opacity: 0.6,
        textAlign: "right",
    },
    swipeActionArea: {
        justifyContent: "center", alignItems: "center",
        width: wp(25),
    },
    swipeHint: {
        fontWeight: "600",
    },
    playBtn: {
        width: wp(10), height: wp(10), borderRadius: wp(5),
        backgroundColor: COLORS.primary,
        justifyContent: "center", alignItems: "center", marginRight: wp(2),
    },

    audioHint: {
        fontSize: wp(2.2), color: "#777", marginTop: wp(1), marginLeft: wp(2),
    },

    audioBox: {
        width: wp(50), backgroundColor: "#F5F5F5", borderRadius: 14, padding: 10,
        marginTop: 6,
    },
    audioHeader: { flexDirection: "row", alignItems: "center", },
    audioName: {
        flex: 1, marginLeft: wp(1), fontSize: wp(3),
        fontFamily: "Poppins_400Regular",
        textTransform: "capitalize"
    },
});