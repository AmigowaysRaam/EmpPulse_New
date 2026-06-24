import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import {
    Image, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView,
    StyleSheet, Text, TextInput, TouchableOpacity, View
} from "react-native";
import { Camera, CameraType } from "react-native-camera-kit";
import { Icon } from "react-native-elements";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { useToast } from "../../constants/ToastContext";
import ConfirmDropDown from "./ConfirmDropDown";
import ImageViewerModal from "./ImageViewver";
import CustomSingleDatePickerModal from "./SingleDateSelect";

export default function AddEvidenceModal({
    visible, onClose, onSubmit, statusList }) {
    const [description, setDescription] = useState("");
    const [media, setMedia] = useState([]);
    const [viewerVisible, setViewerVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
    const [showDatePicker, setshowDatePicker] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [cameraType, setCameraType] = useState(CameraType.Back);
    const { showToast } = useToast();
    const [errors, setErrors] = useState({
        status: "",
        description: "",
        media: "",
        dueDate: "",
    });
    useEffect(() => {
        const showSub = Keyboard.addListener(
            "keyboardDidShow",
            () => setIsKeyboardOpen(true)
        );
        const hideSub = Keyboard.addListener(
            "keyboardDidHide",
            () => setIsKeyboardOpen(false)
        );
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    const [selectedStatus, setSelectedStatus] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [dueDate, setDueDate] = useState(null);
    const [dueDateText, setDueDateText] = useState("");
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const validateForm = () => {
        const newErrors = {
            status: "",
            description: "",
            media: "",
            dueDate: "",
        };

        let isValid = true;
        if (!selectedStatus) {
            newErrors.status = "Please select a meeting status";
            isValid = false;
        }

        if (selectedStatus?.getDescription && !description.trim()) {
            newErrors.description = "Description is required";
            isValid = false;
        }

        if (selectedStatus?.getImage && media.length === 0) {
            newErrors.media = "Please attach at least one image";
            isValid = false;
        }
        if (selectedStatus?.getCalendar && !dueDate) {
            newErrors.dueDate = "Please select a date";
            isValid = false;
        }
        setErrors(newErrors);
        return isValid;
    };
    const cameraRef = useRef(null);

    const captureImage = async () => {
        try {
            const image = await cameraRef.current?.capture();

            if (image?.uri) {
                setMedia((prev) => [
                    ...prev,
                    {
                        type: "image",
                        uri: image.uri,
                        fileName: image.uri.split("/").pop(),
                    },
                ]);

                setErrors((prev) => ({
                    ...prev,
                    media: "",
                }));
            }

            setShowCamera(false);
        } catch (error) {
            console.log("Capture Error:", error);
        }
    };
    const removeMedia = (index) => {
        setMedia((prev) => prev.filter((_, i) => i !== index));
    };
    const handleSubmit = () => {
        if (!validateForm()) {
            return;
        }
    
        setShowConfirmModal(true);
    };
    const handleConfirmSubmit = () => {
        setShowConfirmModal(false);
    
        onSubmit?.({
            status: selectedStatus,
            description,
            media,
            dueDate,
        });
    
        setErrors({
            status: "",
            description: "",
            media: "",
            dueDate: "",
        });
    
        setDescription("");
        setMedia([]);
        setSelectedStatus(null);
        setDueDate(null);
        setDueDateText("");
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onClose}
        >
            <Pressable
                style={[styles.overlay, {
                }]}
                onPress={onClose}
            >
                <Pressable
                    style={styles.container}
                    onPress={(e) => e.stopPropagation()}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : undefined}
                    >
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            contentContainerStyle={{
                                paddingBottom: isKeyboardOpen
                                    ? hp(40)
                                    : hp(2),
                            }}
                        >
                            <View style={styles.header}>
                                <Text style={styles.title}>
                                    Attach Supporting Evidence
                                </Text>
                                <TouchableOpacity onPress={onClose} style={
                                    {
                                        backgroundColor: COLORS?.primary + 22, padding: wp(1),
                                        borderRadius: wp(2)
                                    }
                                }>
                                    <Icon
                                        name="x"
                                        type="feather"
                                        size={wp(5)}
                                        color={COLORS.primary}
                                    />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.label}>
                                Meeting Status
                            </Text>

                            <TouchableOpacity
                                style={styles.dropdownBtn}
                                onPress={() => setShowDropdown(true)}
                            >
                                <Text
                                    style={{
                                        color: selectedStatus ? "#000" : "#999",
                                        fontFamily: "Poppins_400Regular",
                                    }}
                                >
                                    {selectedStatus?.label || "Select Status"}
                                </Text>

                                <Icon
                                    name="chevron-down"
                                    type="feather"
                                    size={20}
                                    color="#666"
                                />
                            </TouchableOpacity>
                            {errors.status ? (
                                <Text style={styles.errorText}>
                                    {errors.status}
                                </Text>
                            ) : null}
                            <View style={styles.buttonRow}>
                                {
                                    media?.length != 3 &&
                                    <TouchableOpacity
                                        style={styles.mediaBtn}
                                        onPress={() => {
                                            if (media?.length < 3) {
                                                setShowCamera(true);
                                            }
                                        }}
                                    >
                                        <Icon
                                            name="camera"
                                            type="feather"
                                            size={wp(6)}
                                            color={COLORS.primary}
                                        />
                                        <Text style={styles.mediaText}>
                                            Capture Image
                                        </Text>
                                    </TouchableOpacity>
                                }

                            </View>
                            <Modal
                                visible={showCamera}
                                animationType="slide"
                                onRequestClose={() => setShowCamera(false)}
                            >
                                <View style={{ flex: 1, backgroundColor: "#000" }}>
                                    <Camera
                                        ref={cameraRef}
                                        style={{ flex: 1 }}
                                        cameraType={cameraType}
                                    />

                                    <TouchableOpacity
                                        onPress={() =>
                                            setCameraType((prev) =>
                                                prev === CameraType.Back
                                                    ? CameraType.Front
                                                    : CameraType.Back
                                            )
                                        }
                                        style={{
                                            position: "absolute",
                                            top: 50,
                                            right: 20,
                                            backgroundColor: "rgba(0,0,0,0.5)",
                                            padding: 10,
                                            borderRadius: 20,
                                        }}
                                    >
                                        <Icon
                                            name="refresh-cw"
                                            type="feather"
                                            color="#fff"
                                            size={24}
                                        />
                                    </TouchableOpacity>

                                    <View
                                        style={{
                                            position: "absolute",
                                            bottom: 40,
                                            width: "100%",
                                            alignItems: "center",
                                        }}
                                    >
                                        <TouchableOpacity
                                            onPress={captureImage}
                                            style={{
                                                width: 80,
                                                height: 80,
                                                borderRadius: 40,
                                                backgroundColor: "#fff",
                                                borderWidth: 5,
                                                borderColor: "#ddd",
                                            }}
                                        />
                                    </View>

                                    <TouchableOpacity
                                        onPress={() => setShowCamera(false)}
                                        style={{
                                            position: "absolute",
                                            top: 50,
                                            left: 20,
                                            backgroundColor: "rgba(0,0,0,0.5)",
                                            padding: 10,
                                            borderRadius: 20,
                                        }}
                                    >
                                        <Icon
                                            name="x"
                                            type="feather"
                                            color="#fff"
                                            size={24}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </Modal>
                            {media?.length > 0 && (
                                <View style={styles.gridContainer}>
                                    {media.map((item, index) => (
                                        <View
                                            key={`${item.uri}-${index}`}
                                            style={styles.gridItem}
                                        >
                                            <TouchableOpacity
                                                style={styles.removeBtn}
                                                onPress={() =>
                                                    removeMedia(index)
                                                }
                                            >
                                                <Icon
                                                    name="trash"
                                                    type="feather"
                                                    size={16}
                                                    color="#ff0000"
                                                />
                                            </TouchableOpacity>


                                            <TouchableOpacity
                                                activeOpacity={0.9}
                                                onPress={() => {
                                                    setSelectedImage(item.uri);
                                                    setViewerVisible(true);
                                                }}
                                            >
                                                <Image
                                                    source={{ uri: item.uri }}
                                                    style={styles.mediaPreview}
                                                    resizeMode="cover"
                                                />
                                            </TouchableOpacity>

                                        </View>
                                    ))}
                                </View>
                            )}
                            {
                                errors.media ? (
                                    <Text style={styles.errorText}>
                                        {errors.media}
                                    </Text>
                                ) : null
                            }
                            {selectedStatus?.getCalendar && (
                                <>
                                    <Text style={styles.label}>
                                        Reschedule Date
                                    </Text>

                                    <TouchableOpacity
                                        style={styles.dropdownBtn}
                                        onPress={() => setshowDatePicker(true)}
                                    >
                                        <Text
                                            style={{
                                                color: dueDateText ? "#000" : "#999",
                                                fontFamily: "Poppins_400Regular",
                                            }}
                                        >
                                            {dueDateText || "Select Date"}
                                        </Text>
                                    </TouchableOpacity>
                                    {errors.dueDate ? (
                                        <Text style={styles.errorText}>
                                            {errors.dueDate}
                                        </Text>
                                    ) : null}
                                </>
                            )}

                            <ImageViewerModal
                                visible={viewerVisible}
                                uri={selectedImage}
                                onClose={() =>
                                    setViewerVisible(false)
                                }
                            />
                            {/* Description */}
                            <Text style={styles.label}>
                                Description
                            </Text>
                            <TextInput
                                value={description}
                                onChangeText={(text) => {
                                    setDescription(text);
                                    if (text.trim()) {
                                        setErrors((prev) => ({
                                            ...prev,
                                            description: "",
                                        }));
                                    }
                                }}
                                multiline
                                placeholder="Enter description..."
                                style={styles.descriptionInput}
                                placeholderTextColor={'#999'}
                            />
                            {errors.description ? (
                                <Text style={[styles.errorText, {
                                    marginTop: wp(2)
                                }]}>
                                    {errors?.description}
                                </Text>
                            ) : null}
                            <TouchableOpacity
                                style={styles.submitBtn}
                                onPress={handleSubmit}
                            >
                                <Text style={styles.submitText}>
                                    Submit
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                        {/* <Text>{JSON.stringify(selectedStatus)}</Text> */}
                        <ConfirmDropDown
                            title="Meeting Status"
                            isVisible={showDropdown}
                            data={statusList}
                            selectedItem={{
                                value: selectedStatus ? selectedStatus : null,
                            }}
                            onClose={() => setShowDropdown(false)}
                            onSelect={(item) => {
                                setShowDropdown(false);
                                setSelectedStatus(item);
                                setErrors((prev) => ({
                                    ...prev,
                                    status: "",
                                }));
                                if (!item?.getCalendar) {
                                    setDueDate(null);
                                    setDueDateText("");
                                }

                                if (!item?.getDescription) {
                                    setDescription("");
                                }

                                if (!item?.getImage) {
                                    setMedia([]);
                                }
                            }}
                        />
                        {showDatePicker && (
                            <CustomSingleDatePickerModal
                                disablePastDates={true}
                                restrictFeatureDate={false}
                                visible={showDatePicker}
                                initialDate={
                                    dueDate
                                        ? dayjs(dueDate).toDate()
                                        : new Date()
                                }
                                onClose={() =>
                                    setshowDatePicker(false)
                                }
                                onConfirm={(selectedDate) => {
                                    const parsed = dayjs(selectedDate);
                                    setDueDate(selectedDate);
                                    setDueDateText(
                                        parsed.format(
                                            "DD/MM/YYYY"
                                        )
                                    );
                                    setshowDatePicker(false);
                                    setErrors((prev) => ({
                                        ...prev,
                                        dueDate: "",
                                    }));
                                }}
                            />
                        )}
                    </KeyboardAvoidingView>
                </Pressable>
            </Pressable>
            <Modal
    visible={showConfirmModal}
    transparent
    animationType="fade"
    onRequestClose={() => setShowConfirmModal(false)}
>
    <View style={confirmStyles.overlay}>
        <View style={confirmStyles.container}>
            <Text style={confirmStyles.title}>
                Confirmation
            </Text>

            <Text style={confirmStyles.message}>
                {selectedStatus?.message ||
                    "Are you sure you want to continue?"}
            </Text>

            <View style={confirmStyles.buttonRow}>
                <TouchableOpacity
                    style={[
                        confirmStyles.button,
                        confirmStyles.cancelButton,
                    ]}
                    onPress={() => setShowConfirmModal(false)}
                >
                    <Text style={confirmStyles.cancelText}>
                        Cancel
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        confirmStyles.button,
                        confirmStyles.confirmButton,
                    ]}
                    onPress={handleConfirmSubmit}
                >
                    <Text style={confirmStyles.confirmText}>
                        Confirm
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    </View>
</Modal>
        </Modal>
    );
}
const confirmStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        width: "85%",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000",
        marginBottom: 12,
        textAlign: "center",
    },
    message: {
        fontSize: 15,
        color: "#555",
        textAlign: "center",
        marginBottom: 20,
        lineHeight: 22,
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: "#F3F4F6",
        marginRight: 8,
    },
    confirmButton: {
        backgroundColor: COLORS.primary,
        marginLeft: 8,
    },
    cancelText: {
        color: "#374151",
        fontWeight: "600",
    },
    confirmText: {
        color: "#fff",
        fontWeight: "600",
    },
});
const styles = StyleSheet.create({
    overlay: {
        flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end",
    },
    errorText: {
        color: "#EF4444",
        fontSize: wp(3.2),
        marginTop: -hp(1),
        marginBottom: hp(1.2),
        marginLeft: wp(1),
        fontFamily: "Poppins_400Regular",
    },
    container: { backgroundColor: "#fff", borderTopLeftRadius: wp(5), borderTopRightRadius: wp(5), padding: wp(5), maxHeight: hp(95), }, header: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: hp(2), padding: wp(2)
    }, title: { fontSize: wp(4.8), color: COLORS.primary, fontFamily: "Poppins_600SemiBold", }, dropdownBtn: {
        minHeight: hp(6), borderWidth: 1, borderColor: "#ddd", borderRadius: wp(3), paddingHorizontal: wp(4), flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: hp(2), backgroundColor: "#fff",
    }, buttonRow: {
        flexDirection: "row", justifyContent: "space-between", marginBottom: hp(2),
    }, mediaBtn: {
        width: "100%", borderWidth: 1, borderColor: COLORS.primary + "30", borderRadius: wp(3), paddingVertical: hp(4), alignItems: "center", alignSelf: "center"
    }, mediaText: { marginTop: hp(1), fontFamily: "Poppins_500Medium", fontSize: wp(3.6), }, gridContainer: {
        flexDirection: "row", flexWrap: "wrap", marginBottom: hp(2),
    }, gridItem: {
        marginHorizontal: wp(1),
        width: "31%", height: hp(12), marginBottom: hp(1.5), borderRadius: wp(3), overflow: "hidden", backgroundColor: "#f5f5f5", position: "relative",
    }, mediaPreview: { width: "100%", height: "100%", }, removeBtn: { position: "absolute", top: 5, right: 5, width: 24, height: 24, borderRadius: 12, backgroundColor: "#f9f9f9", justifyContent: "center", alignItems: "center", zIndex: 10, }, label: {
        fontSize: wp(4), color: "#000", marginBottom: hp(1),
        fontFamily: "Poppins_500Medium",
    }, descriptionInput: {
        minHeight: hp(15), borderWidth: 1, borderColor: "#ddd", borderRadius: wp(3),
        padding: wp(3), textAlignVertical: "top", fontFamily: "Poppins_400Regular",
    }, submitBtn: {
        backgroundColor: COLORS.primary, marginTop: hp(3), paddingVertical: hp(1.7), borderRadius: wp(3),
        alignItems: "center",
    }, submitText: {
        color: "#fff", fontSize: wp(4),
        fontFamily: "Poppins_600SemiBold",
    },
});