import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Image, ImageBackground, Pressable, StyleSheet, Text, View,
} from "react-native";
import { Icon } from "react-native-elements";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
const AttendanceDetails = ({ homepageData }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [attendanceSummary, setAttendanceSummary] = useState({
    total_days: 0,
    present_days: 0,
    half_days: 0,
    absent_days: 0,
    late_days: 0,
    hours_worked: 0,
  });

  const data = {
    attendance: {
      sectionTitle: "Attendance",
      month: "June",
      year: 2026,
      totalWorkingDays: 26,
      presentDays: 25,
      leaveDays: 20,
      cards: [
        {
          key: "login_time",
          label: "Log In Time",
          value: "09:00",
          icon: require("../../assets/loginicon.png"),
          bgColor: COLORS.primary + "10",
        },
        {
          key: "logout_time",
          label: "Log Out Time",
          value: "18:30",
          icon: require("../../assets/logouticon.png"),
          bgColor: COLORS.primary + "10",
        },
        {
          key: "morning_tea_break",
          label: "Morning Tea Break",
          value: "10:30",
          icon: require("../../assets/eveningteaBreak.png"),
          bgColor: COLORS.primary + "10",
        },
        {
          key: "evening_tea_break",
          label: "Evening Tea Break",
          value: "16:30",
          icon: require("../../assets/eveningteaBreak.png"),
          bgColor: COLORS.primary + "10",
        },
        {
          key: "lunch_break",
          label: "Lunch Break",
          value: "13:00",
          icon: require("../../assets/lBreak.png"),
          bgColor: COLORS.primary + "10",
        },
        {
          key: "today_working_hour",
          label: "Today Working Hour",
          value: "08:30",
          icon: require("../../assets/totalWork.png"),
          bgColor: COLORS.primary + "10",
        },
      ],
      break_details: [
        {
          key: "morning_tea_break",
          label: "Morning Tea Break",
          value: "10:30 - 10:45",
          icon: require("../../assets/eveningteaBreak.png"),
        },
        {
          key: "lunch_break",
          label: "Lunch Break",
          value: "13:00 - 14:00",
          icon: require("../../assets/lBreak.png"),
        },
        {
          key: "evening_tea_break",
          label: "Evening Tea Break",
          value: "16:30 - 16:45",
          icon: require("../../assets/eveningteaBreak.png"),
        },
      ],
    },
  };

  const attendance = data.attendance;

  const todayData = {};
  attendance.cards.forEach((item) => {
    todayData[item.key] = item.value;
  });

  const keys = attendance.cards.map((i) => i.key);

  const animations = useRef(
    keys.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const attendanceSection = homepageData?.sections?.find(
      (item) => item.section === "attendance_summary"
    );
    if (attendanceSection?.attendance_summary) {
      setAttendanceSummary(
        attendanceSection.attendance_summary
      );
      // {"section":"attendance_summary","attendance_summary":{"total_days":30,"present_days":0,"half_days":3,"absent_days":15,"late_days":0,"hours_worked":6.69}} attendance_summary     this is console data
    }
    const staggerAnims = animations.map((anim) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      })
    );
    Animated.stagger(120, staggerAnims).start();
  }, [homepageData]);

  const formattedDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const currentMonth = attendance.month;

  const totalWorkingDays =
    attendanceSummary?.total_days ??
    attendance.totalWorkingDays;

  const presentDays =
    attendanceSummary?.present_days ??
    attendance.presentDays;

  const absentDays =
    attendanceSummary?.absent_days ??
    attendance.leaveDays;

  const halfDays =
    attendanceSummary?.half_days ?? 0;

  const lateDays =
    attendanceSummary?.late_days ?? 0;

  const hoursWorked =
    attendanceSummary?.hours_worked ?? 0;

  const renderCard = (key, value, animValue) => {
    const info = attendance.cards.find(
      (c) => c.key === key
    );
    return (
      <Pressable key={key} style={styles.cardWrapper}>
        <Animated.View
          style={[
            styles.taskCard,
            { backgroundColor: info.bgColor },
            {
              opacity: animValue,
              transform: [
                {
                  translateY: animValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [15, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Image
            style={styles.icon}
            source={info.icon}
          />

          <View style={styles.cardTextContainer}>
            <Text style={styles.taskLabel}>
              {info.label}
            </Text>

            <Text style={styles.taskValue}>
              {value || "00:00"}
            </Text>
          </View>
        </Animated.View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() =>
          navigation.navigate("AttendanceLog", {
            hData: data,
          })
        }
      >
        <View style={styles.headerRow}>
          <Text
            numberOfLines={1}
            style={styles.title}
          >
            {`${currentMonth}-${attendance.year}`}
          </Text>

          <Pressable
            onPress={() =>
              navigation.navigate("AttendanceLog", {
                hData: data,
              })
            }
            style={styles.viewButton}
          >
            <Icon
              name="arrow-right"
              type="feather"
              color={COLORS.primary}
              size={wp(5)}
            />
          </Pressable>
        </View>

        <View
          style={[
            styles.headerRow,
            { marginVertical: wp(1) },
          ]}
        >
          <Text
            style={[
              styles.title,
              { fontSize: wp(3.5) },
            ]}
          >
            {`Total Working Days - ${totalWorkingDays}`}
          </Text>

          <Pressable
            onPress={() =>
              navigation.navigate(
                "PayrollLogScreen",
                { hData: data }
              )
            }
            style={[
              styles.viewSButton,
              { backgroundColor: COLORS.primary },
            ]}
          >
            <Text
              style={[
                styles.viewButtonText,
                { color: "#fff" },
              ]}
            >
              Payroll
            </Text>
          </Pressable>
        </View>

        <ImageBackground
          style={[
            styles.summaryCard,
            {
              backgroundColor: COLORS.primary,
              borderRadius: wp(2),
            },
          ]}
        >
          <View style={styles.summaryHalf}>
            <Text style={styles.summaryText}>
              {`${t("Present Days")}: ${presentDays}`}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryHalf}>
            <Text style={styles.summaryText}>
              {`${t("Absent Days")}: ${absentDays}`}
            </Text>
          </View>
        </ImageBackground>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: hp(1),
            paddingHorizontal: wp(2),
          }}
        >
          <Text style={styles.taskLabel}>
            Half Days: {halfDays}
          </Text>

          <Text style={styles.taskLabel}>
            Late Days: {lateDays}
          </Text>

          <Text style={styles.taskLabel}>
            Hours: {hoursWorked}
          </Text>
        </View>

        <Text style={styles.dateText}>
          {formattedDate}
        </Text>

        <View style={styles.grid}>
          {keys.map((key, index) =>
            renderCard(
              key,
              todayData[key],
              animations[index]
            )
          )}
        </View>

        <View style={{ marginTop: hp(2) }}>
          <Text
            style={[
              styles.taskLabel,
              { fontSize: wp(3.8) },
            ]}
          >
            Break Details
          </Text>

          {attendance.break_details.map((item) => (
            <View
              key={item.key}
              style={[
                styles.taskCard,
                {
                  marginTop: hp(1),
                  backgroundColor: "#fff",
                },
              ]}
            >
              <Image
                style={styles.icon}
                source={item.icon}
              />

              <View style={styles.cardTextContainer}>
                <Text style={styles.taskLabel}>
                  {item.label}
                </Text>

                <Text style={styles.taskValue}>
                  {item.value}
                </Text>
              </View>
            </View>
          ))}

          <Pressable
            onPress={() =>
              navigation.navigate(
                "LeaveManagement"
              )
            }
            style={{
              width: wp(80),
              height: hp(5),
              alignSelf: "center",
              marginTop: hp(2),
              backgroundColor: COLORS.primary,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: wp(5),
            }}
          >
            <Text
              style={{
                fontFamily:
                  "Poppins_500SemiBold",
                fontSize: wp(4),
                color: COLORS.white,
                lineHeight: hp(5),
              }}
            >
              Apply Leave
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </View>
  );
};

export default AttendanceDetails;

const styles = StyleSheet.create({
  container: {
    width: "94%", alignSelf: "center", backgroundColor: "#f9f9f9",
    borderRadius: wp(2), paddingVertical: hp(2), paddingHorizontal: wp(2.5),
    elevation: 4, marginVertical: hp(1.5),
  }, headerRow: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center",
  }, title: {
    fontFamily: "Poppins_600SemiBold", fontSize: wp(4.8),
    color: COLORS.primary, maxWidth: wp(50),
  }, viewButton: {
    paddingVertical: hp(0.2), paddingHorizontal: wp(4), borderRadius: wp(5),
    borderWidth: 1, borderColor: COLORS.primary, backgroundColor: COLORS.primary + "11",
  }, viewSButton: {
    paddingVertical: hp(0.7), paddingHorizontal: wp(3), borderRadius: wp(5),
  }, viewButtonText: {
    fontFamily: "Poppins_500Medium", fontSize: wp(3.2),
    color: COLORS.primary,
  }, dateText: {
    marginTop: hp(1), fontFamily: "Poppins_500Medium", fontSize: wp(3.1),
    color: COLORS.primary, alignSelf: "center",
  }, summaryCard: {
    flexDirection: "row", alignItems: "center", marginTop: hp(1.5), paddingVertical: hp(1.5),
  },
  summaryHalf: { flex: 1, alignItems: "center", }, summaryText: {
    fontFamily: "Poppins_600SemiBold", fontSize: wp(3.6), color: "#FFF",
  }, divider: { width: wp(0.5), height: "90%", backgroundColor: "#f9f9f9", }, grid: {
    flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginTop: hp(1.5),
  }, cardWrapper: {
    width: "49%", marginBottom: hp(1.2),
  }, taskCard: {
    borderRadius: wp(2), flexDirection: "row", alignItems: "center",
    padding: wp(1),
  }, icon: {
    width: wp(12), height: wp(12), resizeMode: "contain",
  }, cardTextContainer: {
    marginLeft: wp(2), flex: 1,
  }, taskLabel: { fontFamily: "Poppins_400Regular", fontSize: wp(2.6), },
  taskValue: {
    fontFamily: "Poppins_600SemiBold", fontSize: wp(3.6), marginTop: hp(0.2),
  },
});