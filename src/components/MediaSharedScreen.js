import { Video } from "expo-av";
import React, { useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { hp, wp } from "../../app/resources/dimensions";
import CommonHeader from "./CommonHeader";

const { width } = Dimensions.get("window");
const PAGE_SIZE = 12;

const MediaSharedScreen = () => {
    const allMedia = Array.from({ length: 50 }).map((_, i) => {
        const isVideo = i % 5 === 0; // every 5th item is video
        return {
            id: i.toString(),
            uri: isVideo
                ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                : `https://picsum.photos/300/300?random=${i}`,
            type: isVideo ? "video" : "image",
        };
    });

    const [visibleData, setVisibleData] = useState(
        allMedia.slice(0, PAGE_SIZE)
    );
    const [page, setPage] = useState(1);
    const [selectedMedia, setSelectedMedia] = useState(null);

    const videoRef = useRef(null);

    const loadMore = () => {
        const nextPage = page + 1;
        const start = nextPage * PAGE_SIZE;
        const end = start + PAGE_SIZE;

        if (start >= allMedia.length) return;

        setVisibleData((prev) => [
            ...prev,
            ...allMedia.slice(start, end),
        ]);

        setPage(nextPage);
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.mediaBox}
            onPress={() => setSelectedMedia(item)}
        >
            <Image source={{ uri: item.uri }} style={styles.media} />

            <View style={styles.overlay}>
                <Ionicons
                    name={item.type === "video" ? "play" : "image"}
                    size={16}
                    color="#fff"
                />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <CommonHeader title="Media Shared" />

            {visibleData.length === 0 ? (
                <View style={styles.empty}>
                    <Ionicons name="images-outline" size={60} color="#ccc" />
                    <Text style={styles.emptyText}>No media shared yet</Text>
                </View>
            ) : (
                <FlatList
                    data={visibleData}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    numColumns={3}
                    contentContainerStyle={styles.list}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* PREVIEW MODAL */}
            <Modal visible={!!selectedMedia} transparent animationType="fade">
                <View style={styles.modalBg}>
                    <TouchableOpacity
                        style={styles.closeBtn}
                        onPress={() => setSelectedMedia(null)}
                    >
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>

                    {selectedMedia?.type === "image" && (
                        <Image
                            source={{ uri: selectedMedia.uri }}
                            style={styles.previewImage}
                            resizeMode="contain"
                        />
                    )}

                    {selectedMedia?.type === "video" && (
                        <Video
                            ref={videoRef}
                            source={{ uri: selectedMedia.uri }}
                            style={styles.previewImage}
                            useNativeControls
                            resizeMode="contain"
                            shouldPlay
                            isLooping
                        />
                    )}
                </View>
            </Modal>
        </View>
    );
};

export default MediaSharedScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F0F2F5",
    },

    list: {
        padding: wp(2),
        alignSelf: "center",
    },

    mediaBox: {
        width: width / 3 - wp(2),
        height: width / 3 - wp(2),
        margin: wp(1),
        borderRadius: wp(2),
        overflow: "hidden",
        backgroundColor: "#eee",
    },

    media: {
        width: "100%",
        height: "100%",
    },

    overlay: {
        position: "absolute",
        top: 5,
        right: 5,
        backgroundColor: "rgba(0,0,0,0.4)",
        padding: 3,
        borderRadius: 6,
    },

    empty: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    emptyText: {
        marginTop: hp(1),
        fontSize: wp(4),
        color: "#999",
    },

    modalBg: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.95)",
        justifyContent: "center",
        alignItems: "center",
    },

    previewImage: {
        width: "90%",
        height: "80%",
    },

    closeBtn: {
        position: "absolute",
        top: 40,
        right: 20,
        zIndex: 10,
    },
});