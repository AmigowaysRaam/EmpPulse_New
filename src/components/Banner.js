import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

const Banner = ({ homepageData }) => {
  const { t } = useTranslation();

  const employeeDetails =
    homepageData?.sections?.[1]?.employee_details;

  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  const timeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      const formattedTime = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();

      const formattedDate = `${day}-${month}-${year}`;

      setCurrentTime(formattedTime);
      setCurrentDate(formattedDate);

      timeAnim.setValue(0);

      Animated.timing(timeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    };

    updateTime();

    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={{
          width: "100%",
        }}
      >
        <View style={[styles.card, styles.cardImage]}>
          {/* Date & Time */}
          <View style={styles.dateTimeContainer}>
            <Text style={styles.value}>{currentDate}</Text>

            <Text style={[styles.value, styles.separator]}>
              |
            </Text>

            <Text style={styles.value}>{currentTime}</Text>
          </View>

          {/* Welcome Text */}
          <Animated.Text
            numberOfLines={1}
            style={styles.greeting}
          >
            {employeeDetails?.welcome_text}
            <Text style={styles.name}>
              {`, ${employeeDetails?.name || ""}`}
            </Text>
          </Animated.Text>

          {/* Employee Details */}
          <Animated.View style={styles.rowBetween}>
            <View style={styles.row}>
              <Text style={styles.value}>
                {employeeDetails?.employee_id || "-"}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>
                {t("joining_date")} :
              </Text>

              <Text style={styles.value}>
                {employeeDetails?.date || "-"}
              </Text>
            </View>
          </Animated.View>

          {/* Designation */}
          <Animated.View
            style={[
              styles.row,
              {
                marginTop: hp(0.5),
              },
            ]}
          >
            <Text
              numberOfLines={2}
              style={styles.designation}
            >
              {employeeDetails?.designation || "-"}
            </Text>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
};

export default Banner;

const styles = StyleSheet.create({
  wrapper: {
    width: "95%",
    marginVertical: wp(1),
    alignItems: "center",
    alignSelf: "center"
  },

  card: {
    width: "100%",
    minHeight: hp(16),
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    justifyContent: "center",
  },

  cardImage: {
    backgroundColor: COLORS.primary,
    borderRadius: wp(2),
  },

  dateTimeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(0.8),
  },

  separator: {
    marginHorizontal: wp(2),
  },

  greeting: {
    fontFamily: "Poppins_600SemiBold",
    color: COLORS.white,
    fontSize: wp(4.1),
    lineHeight: hp(3),
    marginBottom: hp(0.8),
  },

  name: {
    fontFamily: "Poppins_700Bold",
    color: COLORS.white,
    fontSize: wp(4.3),
    textTransform: "capitalize",
  },

  label: {
    fontFamily: "Poppins_400Regular",
    color: COLORS.white,
    fontSize: wp(3),
    marginRight: wp(1),
  },

  value: {
    fontFamily: "Poppins_500Medium",
    color: COLORS.white,
    fontSize: wp(3),
    textTransform: "capitalize",
  },

  designation: {
    fontFamily: "Poppins_500Medium",
    color: COLORS.white,
    fontSize: wp(3.2),
    maxWidth: "100%",
    lineHeight: hp(2.4),
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
  },
});