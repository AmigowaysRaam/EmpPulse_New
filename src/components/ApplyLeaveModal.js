import React, { useEffect, useState } from "react";
import {
    Keyboard, KeyboardAvoidingView, Modal, Platform,
    Pressable, SafeAreaView, StyleSheet, Text, TextInput, View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import CustomDropdownData from "./CustomDropDownwihtUI";
import LeaveDatePicker from "./LeaveDatePicker";

const ApplyLeaveModal = ({
    visible, onClose, onSubmit,
    leaveType, setLeaveType, fromDate, setFromDate, toDate, setToDate, leaveTypeArr,
    reason, setReason, t, formatDate, }) => {

    const [showPicker, setShowPicker] = useState(false);
    const [leaveTypeVisible, setLeaveTypeVisible] = useState(false);
    const [errors, setErrors] = useState({});
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [allowedLeave, setallowedLeave] = useState(1);

    useEffect(() => {
        console.log(leaveTypeArr)
        const showSub = Keyboard.addListener(
            "keyboardDidShow",
            () => setKeyboardVisible(true)
        );
        const hideSub = Keyboard.addListener(
            "keyboardDidHide",
            () => setKeyboardVisible(false)
        );
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    const handleDateSelect = (range) => {
        const start =
            range?.fromDate ||
            range?.from ||
            range?.startDate ||
            "";

        const end =
            range?.toDate ||
            range?.to ||
            range?.endDate ||
            "";
        setFromDate(start ? String(start) : "");
        setToDate(end ? String(end) : "");
        setShowPicker(false);

        setErrors((prev) => ({
            ...prev,
            dateRange: "",
        }));
    };

    const formatRange = () => {
        if (!fromDate) {
            return (
                t?.("select_date_range") ||
                "Select Date Range"
            );
        }

        const safeFrom = String(fromDate || "");
        const safeTo = String(toDate || "");

        if (!toDate) {
            return `From: ${formatDate?.(safeFrom) || safeFrom
                } - ?`;
        }

        return `${formatDate?.(safeFrom) || safeFrom
            } - ${formatDate?.(safeTo) || safeTo
            }`;
    };

    const clearRange = () => {
        setFromDate("");
        setToDate("");

        setErrors((prev) => ({
            ...prev,
            dateRange: "",
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!leaveType?.value) {
            newErrors.leaveType =
                "Leave type is required";
        }

        if (!fromDate || !toDate) {
            newErrors.dateRange =
                "Please select a date range";
        }

        if (!reason?.trim()) {
            newErrors.reason =
                "Reason is required";
        }

        setErrors(newErrors);

        return (
            Object.keys(newErrors).length === 0
        );
    };

    const handleSubmit = () => {
        if (!validateForm()) {
            return;
        }

        onSubmit?.({
            leaveTypeId: leaveType.value,
            leaveTypeName: leaveType.label,
            fromDate,
            toDate,
            reason,
        });
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
        >
            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={
                        Platform.OS === "ios"
                            ? "padding"
                            : undefined
                    }
                >
                    <View
                        style={[
                            styles.overlay,
                            {
                                paddingBottom: hp(
                                    keyboardVisible
                                        ? 20
                                        : 0
                                ),
                            },
                        ]}
                    >
                        <View style={styles.container}>
                            <Text style={styles.title}>
                                Apply Leave
                            </Text>

                            {/* Leave Type */}
                            <Pressable
                                style={styles.input}
                                onPress={() =>
                                    setLeaveTypeVisible(
                                        true
                                    )
                                }
                            >
                                <Text
                                    style={{
                                        color:
                                            leaveType?.label
                                                ? "#000"
                                                : "#555",
                                    }}
                                >
                                    {leaveType?.label ||
                                        "Select Leave Type"}
                                </Text>
                            </Pressable>

                            {errors.leaveType && (
                                <Text
                                    style={
                                        styles.errorText
                                    }
                                >
                                    {
                                        errors.leaveType
                                    }
                                </Text>
                            )}

                            {/* Date Range */}
                            <Pressable
                                style={
                                    styles.dateButton
                                }
                                onPress={() => {
                                    if (leaveType?.value) {
                                        setShowPicker(true);
                                    } else {
                                        setErrors((prev) => ({
                                            ...prev,
                                            leaveType: "Leave type is required",
                                        }));
                                    }
                                }}
                            >
                                <Icon
                                    name="calendar-today"
                                    size={wp(4)}
                                    color="#555"
                                />

                                <Text
                                    numberOfLines={1}
                                    style={
                                        styles.buttonText
                                    }
                                >
                                    {formatRange()}
                                </Text>

                                {(fromDate ||
                                    toDate) && (
                                        <Pressable
                                            onPress={
                                                clearRange
                                            }
                                            style={
                                                styles.clearIcon
                                            }
                                        >
                                            <Icon
                                                name="close"
                                                size={wp(5)}
                                                color="#555"
                                            />
                                        </Pressable>
                                    )}
                            </Pressable>

                            {errors.dateRange && (
                                <Text
                                    style={
                                        styles.errorText
                                    }
                                >
                                    {
                                        errors.dateRange
                                    }
                                </Text>
                            )}

                            {/* Reason */}
                            <TextInput
                                placeholder="Reason"
                                value={reason}
                                onChangeText={(
                                    text
                                ) => {
                                    setReason(
                                        text
                                    );

                                    setErrors(
                                        (
                                            prev
                                        ) => ({
                                            ...prev,
                                            reason:
                                                "",
                                        })
                                    );
                                }}
                                style={[
                                    styles.input,
                                    styles.textArea,
                                ]}
                                placeholderTextColor="#555"
                                multiline
                            />

                            {errors.reason && (
                                <Text
                                    style={
                                        styles.errorText
                                    }
                                >
                                    {
                                        errors.reason
                                    }
                                </Text>
                            )}

                            {/* Buttons */}
                            <View
                                style={
                                    styles.buttons
                                }
                            >
                                <Pressable
                                    style={
                                        styles.cancel
                                    }
                                    onPress={
                                        onClose
                                    }
                                >
                                    <Text
                                        style={
                                            styles.btnText
                                        }
                                    >
                                        Cancel
                                    </Text>
                                </Pressable>

                                <Pressable
                                    style={
                                        styles.submit
                                    }
                                    onPress={
                                        handleSubmit
                                    }
                                >
                                    <Text
                                        style={
                                            styles.btnText
                                        }
                                    >
                                        Apply
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                    <CustomDropdownData
                        title="Choose Leave Type"
                        isVisible={
                            leaveTypeVisible
                        }
                        data={leaveTypeArr}
                        selectedItem={
                            leaveType
                        }
                        onClose={() =>
                            setLeaveTypeVisible(
                                false
                            )
                        }
                        onSelect={(item) => {
                            setLeaveType(
                                item
                            );
                            setallowedLeave(item?.allowed)
                            setErrors(
                                (prev) => ({
                                    ...prev,
                                    leaveType:
                                        "",
                                })
                            );

                            setLeaveTypeVisible(
                                false
                            );
                        }}
                    />

                    <LeaveDatePicker
                        visible={showPicker}
                        onClose={() =>
                            setShowPicker(
                                false
                            )
                        }
                        onConfirm={
                            handleDateSelect
                        }
                        initialFrom={
                            fromDate
                        }
                        initialTo={toDate}
                        restrictFeatureDate={
                            false
                        }
                        disablePastDates={
                            true
                        }
                        maxDateSelect={allowedLeave}
                    />
                </KeyboardAvoidingView>
            </SafeAreaView>
        </Modal>
    );
};

export default ApplyLeaveModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor:
            "rgba(0,0,0,0.45)",
        justifyContent: "center",
        padding: wp(5),
    },

    container: {
        backgroundColor: "#fff",
        borderRadius: wp(4),
        padding: wp(4),
        width: wp(95),
        alignSelf: "center",
        height: hp(46),
    },

    title: {
        fontSize: wp(5),
        fontWeight: "700",
        marginBottom: hp(2),
    },

    input: {
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: wp(2),
        padding: wp(3),
        marginBottom: hp(1),
        justifyContent: "center",
    },

    textArea: {
        height: hp(10),
        textAlignVertical: "top",
    },

    dateButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor:
            COLORS?.white,
        padding: wp(3),
        borderRadius: wp(2),
        marginVertical: hp(1),
        paddingVertical: hp(2),
        borderWidth: wp(0.3),
        borderColor: "#CCC",
    },

    buttonText: {
        flex: 1,
        color: "#555",
        marginLeft: wp(2),
        fontSize: wp(3.5),
        fontWeight: "600",
    },

    clearIcon: {
        marginLeft: wp(2),
    },

    buttons: {
        flexDirection: "row",
        marginTop: hp(1),
    },

    cancel: {
        flex: 1,
        backgroundColor: "#9CA3AF",
        padding: wp(3),
        borderRadius: wp(2),
        marginRight: wp(2),
        alignItems: "center",
    },

    submit: {
        flex: 1,
        backgroundColor:
            COLORS?.primary,
        padding: wp(3),
        borderRadius: wp(2),
        alignItems: "center",
    },

    btnText: {
        color: "#fff",
        fontWeight: "700",
    },

    errorText: {
        color: "#DC2626",
        fontSize: wp(3),
        marginBottom: hp(1),
        marginTop: -hp(0.5),
    },
});