import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useRef, useState } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { Icon } from "react-native-elements";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import CustomSingleDatePickerModal from "./SingleDateSelect";

export default function ReminderModal({ visible, onClose, onSave }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date());

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [error, setError] = useState("");

    const [keyboardVisible, setKeyboardVisible] = useState(false);

    const scrollRef = useRef(null);

    useEffect(() => {
        const showSub = Keyboard.addListener("keyboardDidShow", () => {
            setKeyboardVisible(true);
        });

        const hideSub = Keyboard.addListener("keyboardDidHide", () => {
            setKeyboardVisible(false);
        });

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    const reset = () => {
        setTitle("");
        setDescription("");
        setSelectedDate(new Date());
        setError("");
        Keyboard.dismiss();
        onClose();
    };

    const scrollToEnd = () => {
        setTimeout(() => {
            scrollRef.current?.scrollToEnd({ animated: true });
        }, 150);
    };

    const handleSave = () => {
        if (!title.trim()) {
            setError("Title is required");
            return;
        }

        onSave({
            title,
            description,
            time: selectedDate.getTime(),
        });

        reset();
    };

    const onTimeChange = (event, selectedTime) => {
        setShowTimePicker(false);
        if (!selectedTime || event?.type === "dismissed") return;
        const updated = new Date(selectedDate);
        updated.setHours(selectedTime.getHours());
        updated.setMinutes(selectedTime.getMinutes());
        updated.setSeconds(0);
        updated.setMilliseconds(0);
        setSelectedDate(updated);
    };
    return (
        <>
            <Modal visible={visible} transparent animationType="fade">
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.overlay}>
                            <ScrollView
                                ref={scrollRef}
                                keyboardShouldPersistTaps="handled"
                                contentContainerStyle={styles.scrollContent}
                                showsVerticalScrollIndicator={false}
                            >
                                <View
                                    style={[
                                        styles.box,
                                        keyboardVisible && { minHeight: hp(85) },
                                    ]}
                                >
                                    {/* CLOSE ICON */}
                                    <Icon
                                        name="close"
                                        type="antdesign"
                                        onPress={reset}
                                        containerStyle={styles.closeIcon}
                                    />
                                    <Text style={styles.title}>Add Reminder</Text>
                                    <TextInput
                                        placeholderTextColor="#999"
                                        autoFocus
                                        placeholder="Title"
                                        value={title}
                                        onChangeText={(t) => {
                                            t.length <= 35 && setTitle(t);
                                        }}
                                        onFocus={scrollToEnd}
                                        style={styles.input}
                                    />

                                    {!!error && (
                                        <Text style={styles.errorText}>{error}</Text>
                                    )}

                                    {/* DESCRIPTION */}
                                    <TextInput
                                        placeholderTextColor="#999"
                                        placeholder="Description"
                                        value={description}
                                        onChangeText={setDescription}
                                        onFocus={scrollToEnd}
                                        style={[styles.input, styles.textArea]}
                                        multiline
                                    />

                                    {/* DATE */}
                                    <TouchableOpacity
                                        style={styles.selector}
                                        onPress={() => setShowDatePicker(true)}
                                    >
                                        <Text style={styles.selectorText}>
                                            📅 {selectedDate.toLocaleDateString()}
                                        </Text>
                                    </TouchableOpacity>

                                    {/* TIME */}
                                    <TouchableOpacity
                                        style={styles.selector}
                                        onPress={() => setShowTimePicker(true)}
                                    >
                                        <Text style={styles.selectorText}>
                                            ⏰{" "}
                                            {selectedDate.toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </Text>
                                    </TouchableOpacity>

                                    {/* SAVE */}
                                    <TouchableOpacity
                                        style={styles.save}
                                        onPress={handleSave}
                                    >
                                        <Text style={styles.saveText}>Save Reminder</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </Modal>

            {/* DATE PICKER */}
            <CustomSingleDatePickerModal
                disablePastDates={true}
                visible={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                initialDate={selectedDate}
                onConfirm={(date) => {
                    const updated = new Date(selectedDate);
                    updated.setFullYear(date.getFullYear());
                    updated.setMonth(date.getMonth());
                    updated.setDate(date.getDate());
                    setSelectedDate(updated);
                }}
            />

            {/* TIME PICKER */}
            {showTimePicker && (
                <DateTimePicker
                    mode="time"
                    is24Hour={false}
                    display="spinner"
                    value={selectedDate}
                    onChange={onTimeChange}
                />
            )}
        </>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        padding: wp(4),
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
    },
    box: {
        backgroundColor: "#fff",
        borderRadius: wp(2),
        padding: wp(4),
        paddingTop: wp(5),
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 8,
        position: "relative",
    },

    closeIcon: {
        position: "absolute",
        right: 12,
        top: 12,
        zIndex: 10,
    },

    title: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 15,
        textAlign: "center",
    },

    input: {
        borderWidth: 1,
        borderColor: "#e5e5e5",
        borderRadius: 10,
        padding: wp(4),
        marginBottom: 12,
        backgroundColor: "#fafafa",
        color: "#333",
    },

    textArea: {
        height: 90,
        textAlignVertical: "top",
    },

    selector: {
        padding: 14,
        borderWidth: 1,
        borderColor: "#e5e5e5",
        borderRadius: 10,
        marginBottom: 12,
        backgroundColor: "#f9f9f9",
    },

    selectorText: {
        fontSize: 14,
        color: "#333",
    },

    save: {
        backgroundColor: COLORS.primary || "#007AFF",
        padding: 14,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 5,
    },

    saveText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
    },

    errorText: {
        color: "red",
        marginBottom: 8,
        fontSize: 13,
    },
}); 