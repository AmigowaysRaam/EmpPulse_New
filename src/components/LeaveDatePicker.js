import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { useToast } from "../../constants/ToastContext";
const YEARS = Array.from({ length: 50 }, (_, i) => 2000 + i);
const LeaveDatePicker = ({ visible, onClose, onConfirm, initialFrom,
    initialTo, title, restrictFeatureDate, disablePastDates, maxDateSelect
}) => {
    const today = dayjs();
    const isDisabled = (day) => {
        if (disablePastDates && day.isBefore(today, "day")) {
            return true;
        }
        if (restrictFeatureDate && day.isAfter(today, "day")) {
            return true;
        }
        if (fromDate && !toDate && day.isBefore(fromDate, "day")) {
            return true;
        }
        return false;
    };
    const [fromDate, setFromDate] = useState(initialFrom ? dayjs(initialFrom) : null);
    const [toDate, setToDate] = useState(initialTo ? dayjs(initialTo) : null);
    const [errors, setError] = useState(null);
    const [fromText, setFromText] = useState(initialFrom ? dayjs(initialFrom).format("DD/MM/YYYY") : "");
    const [toText, setToText] = useState(initialTo ? dayjs(initialTo).format("DD/MM/YYYY") : "");
    const { t } = useTranslation();
    const [currentMonth, setCurrentMonth] = useState(today.month());
    const [currentYear, setCurrentYear] = useState(today.year());
    const [daysInMonth, setDaysInMonth] = useState([]);
    const yearListRef = useRef(null);
    const goToPreviousMonth = () => {
        const newDate = dayjs().year(currentYear).month(currentMonth).subtract(1, "month");
        setCurrentMonth(newDate.month());
        setCurrentYear(newDate.year());
    };

    const goToNextMonth = () => {
        const newDate = dayjs().year(currentYear).month(currentMonth).add(1, "month");
        setCurrentMonth(newDate.month());
        setCurrentYear(newDate.year());
    };
    useEffect(() => {
        const firstDayOfMonth = dayjs().year(currentYear).month(currentMonth).date(1);
        const totalDays = firstDayOfMonth.daysInMonth();
        const startWeekDay = firstDayOfMonth.day();

        const days = [];
        for (let i = 0; i < startWeekDay; i++) days.push(null);
        for (let i = 1; i <= totalDays; i++) {
            days.push(dayjs().year(currentYear).month(currentMonth).date(i));
        }

        setDaysInMonth(days);
    }, [currentMonth, currentYear, fromDate, toDate]);
    const scrollToYear = (year) => {
        if (yearListRef.current) {
            const index = YEARS.indexOf(year);
            if (index >= 0) {
                yearListRef.current.scrollToIndex({ index, animated: true });
            }
        }
    };
    const { showToast } = useToast();

    useEffect(() => {
        if (visible) {
            scrollToYear(currentYear);
        }
    }, [visible, currentYear]);

    // 
    const monthListRef = useRef(null);

    const isInRange = (day) => {
        if (!fromDate || !toDate) return false;
        return day.isAfter(fromDate, "day") && day.isBefore(toDate, "day");
    };

    // Format date input as DD/MM/YYYY
    const formatDateInput = (text) => {
        let digits = text.replace(/\D/g, "");
        if (digits.length > 8) digits = digits.slice(0, 8);

        if (digits.length >= 5) {
            return digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
        } else if (digits.length >= 3) {
            return digits.slice(0, 2) + "/" + digits.slice(2);
        } else {
            return digits;
        }
    };
    const handleFromChange = (text) => {
        const formatted = formatDateInput(text);

        // Parse date only if fully entered
        if (formatted.length === 10) {
            const parsed = dayjs(formatted, "DD/MM/YYYY", true);
            if (parsed.isValid()) {
                // If restrictFeatureDate is true, don't allow future dates
                if (restrictFeatureDate && parsed.isAfter(today, "day")) {
                    return; // Ignore the input
                }
                setFromDate(parsed.startOf("day"));
                setCurrentMonth(parsed.month());
                setCurrentYear(parsed.year());
                scrollToYear(parsed.year());
            } else {
                return; // Ignore invalid dates
            }
        }

        setFromText(formatted); // Update text only if allowed
    };

    const handleToChange = (text) => {
        const formatted = formatDateInput(text);
        if (formatted.length === 10) {
            const parsed = dayjs(formatted, "DD/MM/YYYY", true);
            if (parsed.isValid()) {
                // Block future dates
                if (restrictFeatureDate && parsed.isAfter(today, "day")) return;
                if (fromDate && parsed.isValid()) {
                    // if (parsed.isBefore(fromDate, "day")) return;
                    let start = fromDate;
                    let end = parsed;

                    if (parsed.isBefore(fromDate, "day")) {
                        start = parsed;
                        end = fromDate;
                    }

                    if (isRangeExceeded(start, end)) return;

                    setFromDate(start);
                    setToDate(end);

                    if (isRangeExceeded(fromDate, parsed)) return;

                    setToDate(parsed.startOf("day"));
                }
                setCurrentMonth(parsed.month());
                setCurrentYear(parsed.year());
                scrollToYear(parsed.year());
            } else {
                return;
            }
        }

        setToText(formatted); // Update text only if allowed
    };
    const isConfirmDisabled =
        maxDateSelect === 1
            ? !(fromDate && fromDate.isValid())
            : !(fromDate && toDate && fromDate.isValid() && toDate.isValid());

    const isRangeExceeded = (from, to) => {
        if (!from || !to || !maxDateSelect || maxDateSelect <= 1) return false;

        const diff = to.diff(from, "day") + 1; // inclusive range
        return diff > maxDateSelect;
    };
    const confirm = () => {
        if (maxDateSelect === 1) {
            if (!fromDate) {
                Alert.alert("Invalid Date", "Please select a date");
                return;
            }
            onConfirm({ from: fromDate.toDate(), to: fromDate.toDate() });
            onClose();
            return;
        }
        if (!fromDate || !toDate) {
            Alert.alert("Invalid Date", "Please select both From and To dates");
            return;
        }
        onConfirm({ from: fromDate.toDate(), to: toDate.toDate() });
        onClose();
    };
    const clearDates = () => {
        setFromDate(null);
        setToDate(null);
        setFromText("");
        setToText("");
    };
    const scrollToMonth = (month) => {
        if (monthListRef.current) {
            monthListRef.current.scrollToIndex({
                index: month,
                animated: true,
            });
        }
    };

    const selectDate = (day) => {
        setError(null);

        if (maxDateSelect === 1) {
            setFromDate(day);
            setToDate(null);
            setFromText(day.format("DD/MM/YYYY"));
            setToText("");
            return;
        }

        // Start new selection
        if (!fromDate || (fromDate && toDate)) {
            setFromDate(day);
            setToDate(null);
            setFromText(day.format("DD/MM/YYYY"));
            setToText("");
            return;
        }

        // If selected date is before fromDate, swap them
        let start = fromDate;
        let end = day;

        if (day.isBefore(fromDate, "day")) {
            start = day;
            end = fromDate;
        }

        if (isRangeExceeded(start, end)) {
            setError(`You can select maximum ${maxDateSelect} days`);
            return;
        }

        setFromDate(start);
        setToDate(end);
        setFromText(start.format("DD/MM/YYYY"));
        setToText(end.format("DD/MM/YYYY"));
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={[styles.modal, {
                    borderWidth: wp(errors ? 0.5 : 0),
                    borderColor: "red"
                }]}>
                    <Text style={styles.title}>{title || "Select Date Range"}</Text>
                    {errors && (
                        <Text style={{
                            color: "red", marginVertical: wp(2),
                            alignSelf: "center"
                        }}>
                            {errors}
                        </Text>
                    )}
                    <View style={styles.selectedDate}>
                        <TextInput
                            style={styles.dateInput}
                            placeholder="From Date"
                            value={fromText}
                            onFocus={() => {
                                scrollToMonth(currentMonth);
                                scrollToYear(currentYear);
                            }}
                            onChangeText={handleFromChange}
                            keyboardType="number-pad"
                            placeholderTextColor={COLORS.primary}
                        />
                        <Text style={{ marginHorizontal: 5 }}>-</Text>
                        <TextInput
                            style={styles.dateInput}
                            placeholder="To Date"
                            value={toText}
                            onChangeText={handleToChange}
                            placeholderTextColor={COLORS.primary}
                            keyboardType="number-pad"
                            onFocus={() => {
                                scrollToMonth(currentMonth);
                                scrollToYear(currentYear);
                            }}
                        />
                        {(fromText || toText) && (
                            <Pressable onPress={clearDates} style={{ marginLeft: 5 }}>
                                <Icon name="close" size={wp(5)} color={COLORS.primary} />
                            </Pressable>
                        )}
                    </View>

                    <View style={styles.monthHeader}>
                        <Pressable onPress={goToPreviousMonth}>
                            <Icon name="chevron-left" size={wp(7)} color={COLORS.primary} />
                        </Pressable>

                        <Text style={styles.monthHeaderText}>
                            {dayjs().month(currentMonth).format("MMMM")} {currentYear}
                        </Text>

                        <Pressable onPress={goToNextMonth}>
                            <Icon name="chevron-right" size={wp(7)} color={COLORS.primary} />
                        </Pressable>
                    </View>


                    {/* Calendar */}
                    <View style={styles.grid}>
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                            <Text key={d} style={styles.weekDay}>{d}</Text>
                        ))}

                        {daysInMonth.map((day, index) => {
                            if (!day) return <View key={`empty-${index}`} style={styles.dayItem} />;
                            const isSelected =
                                (fromDate && day.isSame(fromDate, "day")) ||
                                (toDate && day.isSame(toDate, "day"));
                            const isToday = day.isSame(today, "day");
                            const inRange = isInRange(day);
                            const disabled = isDisabled(day);  // ✅ Use the combined logic

                            return (
                                <Pressable
                                    key={day.format("YYYY-MM-DD")}
                                    onPress={() =>selectDate(day)}
                                    style={[
                                        styles.dayItem,
                                        isToday && !isSelected && styles.todayDayItem,
                                        inRange && styles.inRangeDayItem,
                                        isSelected && styles.activeDayItem,
                                        // disabled && { opacity: 0.3 },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.dayText,
                                            isToday && !isSelected && styles.todayDayText,
                                            (isSelected || inRange) && styles.activeDayText,
                                            disabled && { color: "#999" }, // grey out disabled days
                                        ]}
                                    >
                                        {day.date()}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <Pressable onPress={onClose}>
                            <Text style={styles.cancel}>{t('cancel')}</Text>
                        </Pressable>

                        <Pressable
                            onPress={confirm}
                            // disabled={isConfirmDisabled}
                        >
                            <Text
                                style={[
                                    styles.ok,
                                    // isConfirmDisabled && { opacity: 0.5 }
                                ]}
                            >
                                {t('confirm')}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
const styles = StyleSheet.create({
    monthHeader: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        marginVertical: hp(1), paddingHorizontal: wp(4),
    }, monthHeaderText: {
        fontSize: wp(4.5), fontFamily: "Poppins_600SemiBold", color: COLORS.primary,
    }, overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
    modal: { width: wp(95), backgroundColor: "#fff", borderRadius: wp(4), padding: wp(4), paddingVertical: hp(4) },
    title: { fontSize: wp(4), fontFamily: "Poppins_600SemiBold", textAlign: "center", marginBottom: hp(1) },
    selectedDatesContainer: { alignItems: "center", marginBottom: hp(1) },
    selectedDate: { width: wp(85), flexDirection: "row", justifyContent: "space-between", borderWidth: wp(0.5), borderColor: COLORS.primary, paddingHorizontal: wp(2), borderRadius: wp(2), alignItems: "center" },
    dateInput: { flex: 1, paddingHorizontal: wp(2), color: COLORS.primary, fontFamily: "Poppins_500Medium" },
    monthItem: { marginHorizontal: wp(2), padding: wp(2), borderRadius: wp(2), marginVertical: hp(0.5) },
    activeMonthItem: { backgroundColor: COLORS.primary },
    monthText: { color: "#333" },
    activeMonthText: { color: "#fff" },
    yearItem: { marginHorizontal: wp(2), padding: wp(2), borderRadius: wp(2), marginVertical: hp(0.5) },
    activeYearItem: { backgroundColor: COLORS.primary },
    yearText: { color: "#333" },
    activeYearText: { color: "#fff" },
    grid: { flexDirection: "row", flexWrap: "wrap", marginTop: hp(1) },
    weekDay: { width: wp(12), textAlign: "center", fontWeight: "600" },
    dayItem: { width: wp(12), height: wp(12), justifyContent: "center", alignItems: "center", marginVertical: hp(0.5), borderRadius: wp(6) },
    inRangeDayItem: { backgroundColor: COLORS.primary + "80" },
    activeDayItem: { backgroundColor: COLORS.primary },
    todayDayItem: { borderWidth: 2, borderColor: COLORS.primary },
    todayDayText: { color: COLORS.primary, fontFamily: "Poppins_600SemiBold" },
    dayText: { fontSize: wp(4) },
    activeDayText: { color: "#fff", fontFamily: "Poppins_600SemiBold" },
    actions: { flexDirection: "row", justifyContent: "space-between", marginTop: hp(2) },
    cancel: { color: COLORS.primary, fontSize: wp(4.5) },
    ok: { color: COLORS.primary, fontSize: wp(4.5), fontFamily: "Poppins_600SemiBold" },
});

export default LeaveDatePicker;
