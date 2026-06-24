import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import { hp, wp } from "../../app/resources/dimensions";

const OngoingMeetings = ({ homepageData }) => {
  const navigation = useNavigation();

  const ongoingSection = homepageData?.sections?.find(
    (item) => item?.section === "ongoing_list"
  );

  const meeting = ongoingSection?.ongoing_list;

  if (!meeting) return null;

  const handleView = () => {
    navigation.navigate("MeetingTimeLine", {
      mId: meeting?.assignmentId,
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.container}
      onPress={handleView}
    >
      {/* Left */}
      <View style={styles.leftSection}>
        <View style={styles.liveDot} />

        <View>
          <Text numberOfLines={1} style={styles.name}>
            {meeting?.leadId?.name}
          </Text>

          <Text numberOfLines={1} style={styles.subText}>
            {meeting?.leadId?.district} •{" "}
            {meeting?.location?.distanceText}
          </Text>
        </View>
      </View>

      {/* Center */}
      <View style={styles.centerSection}>
        <Icon
          name="clock-outline"
          size={16}
          color="#fff"
        />
        <Text style={styles.timeText}>
          {meeting?.location?.durationText}
        </Text>
      </View>

      {/* Right */}
      <View style={styles.rightSection}>
        <Text style={styles.status}>
          ONGOING
        </Text>

        <Icon
          name="chevron-right"
          size={22}
          color="#fff"
        />
      </View>
    </TouchableOpacity>
  );
};

export default OngoingMeetings;

const styles = StyleSheet.create({
  container: {
    width: wp(92),
    alignSelf: "center",
    marginVertical: hp(1),
    backgroundColor: "#22C55E",
    borderRadius: wp(3),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 4,
  },

  leftSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF0000",
    marginRight: wp(3),
  },

  name: {
    color: "#fff",
    fontSize: wp(3.7),
    fontWeight: "700",
    maxWidth: wp(35),
  },

  subText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: wp(2.8),
    marginTop: hp(0.2),
  },

  centerSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.5),
    borderRadius: wp(5),
  },

  timeText: {
    color: "#fff",
    marginLeft: wp(1),
    fontSize: wp(2.8),
    fontWeight: "600",
  },

  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: wp(2),
  },

  status: {
    color: "#FFF",
    fontSize: wp(2.8),
    fontWeight: "700",
  },
});