import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useSelector } from "react-redux";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

const TodayMeetings = ({ homepageData }) => {
  const navigation = useNavigation();

  const profileDetails = useSelector(
    (state) => state?.auth?.profileDetails?.data
  );

  const todayMeetings = homepageData?.sections?.find(
    (item) => item.section === "meeting_list"
  );

  const meetingData =
    todayMeetings?.meeting_list?.map((item) => ({
      id: item?._id,
      clientName: item?.leadId?.name || "-",
      location: `${item?.leadId?.address || ""}${item?.leadId?.district
        ? `, ${item?.leadId?.district}`
        : ""
        }`,
      description: `Lead ID : ${item?.leadId?.leadId || "-"}`,
      distance:
        item?.location?.distanceText ||
        (item?.location?.distanceKm
          ? `${item?.location?.distanceKm} km`
          : "--"),
      travelTime:
        item?.location?.durationText ||
        (item?.location?.drivingDurationMin
          ? `${item?.location?.drivingDurationMin} mins`
          : "--"),
      canStart: item?.canStart,
      journeyStatus: item?.journeyStatus,
      originalData: item,
    })) || [];

  const visibleMeetings = meetingData.slice(0, 2);

  const handleView = (item) => {
    // Alert.alert('JKH',JSON.stringify(item, null, 2))
    navigation.navigate("MeetingTimeLine", {
      mId: item?.assignmentId,
    });
    // navigation.navigate("TodayMeetingsLIsts", {
    //   meetingData: item,
    // });
  };

  const handleViewAll = () => {
    navigation.navigate("TodayMeetingsLIsts", {
      meetings: todayMeetings?.meeting_list || [],
      title: "Today's Meetings",
    });
  };

  const renderMeeting = ({ item, index }) => (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.clientSection}>
          <Text numberOfLines={1} style={styles.clientName}>
            {item.clientName}
          </Text>

          <View style={styles.locationRow}>
            <Icon
              name="map-marker"
              size={14}
              color="#EF4444"
            />
            <Text numberOfLines={1} style={styles.location}>
              {item.location}
            </Text>
          </View>
        </View>

        <View style={styles.serialBadge}>
          <Text style={styles.serialText}>
            #{index + 1}
          </Text>
        </View>
      </View>

      <Text
        numberOfLines={1}
        style={styles.description}
      >
        {item.description}
      </Text>

      <View style={styles.infoContainer}>
        <View style={styles.infoBox}>
          <Icon
            name="map-marker-distance"
            size={16}
            color={COLORS?.primary}
          />
          <Text style={styles.infoValue}>
            {item.distance}
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Icon
            name="clock-outline"
            size={16}
            color="#10B981"
          />
          <Text style={styles.infoValue}>
            {item.travelTime}
          </Text>
        </View>

        <Pressable
          onPress={() => handleView(item.originalData)}
          style={styles.viewButton}
        >
          <Text style={styles.viewText}>
            View
          </Text>
        </Pressable>
      </View>

      <View style={styles.statusContainer}>
        {/* <Text
          style={[
            styles.statusText,
            {
              color:
                item.journeyStatus === "completed"
                  ? "#10B981"
                  : item.journeyStatus === "ongoing"
                    ? "#F59E0B"
                    : "#6B7280",
            },
          ]}
        >
          Status : {item.journeyStatus || "pending"}
        </Text> */}

        {/* {item.canStart && (
          <View style={styles.startBadge}>
            <Text style={styles.startText}>
              Can Start
            </Text>
          </View>
        )} */}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerCard}>
        <View>
          <Text style={styles.headerTitle}>
            Today's Meetings
          </Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {todayMeetings?.totalMeeting || 0}
          </Text>
        </View>
      </View>

      {meetingData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon
            name="calendar-remove"
            size={40}
            color="#9CA3AF"
          />

          {/* <Text style={styles.emptyText}>
            No Meetings Scheduled Today
          </Text> */}
        </View>
      ) : (
        <>
          <View style={styles.listContainer}>
            <FlatList
              data={visibleMeetings}
              keyExtractor={(item) => item.id}
              renderItem={renderMeeting}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
          <Pressable
            onPress={handleViewAll}
            style={styles.viewAllButton}
          >
            <Text style={styles.viewAllText}>
              View All Meetings
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
};

export default TodayMeetings;

const styles = StyleSheet.create({
  container: {
    width: wp(92),
    alignSelf: "center",
    marginTop: hp(1),
    backgroundColor: COLORS?.primary + "15",
    borderRadius: wp(3),
    padding: wp(3),
  },

  headerCard: {
    backgroundColor: COLORS?.primary,
    borderRadius: wp(1),
    padding: wp(3.5),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hp(1),
  },

  headerTitle: {
    color: "#fff",
    fontSize: wp(4.3),
    fontWeight: "700",
  },

  headerSubTitle: {
    color: "#DCE7FF",
    fontSize: wp(2.9),
    marginTop: hp(0.2),
  },

  countBadge: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  countText: {
    color: COLORS?.primary,
    fontSize: wp(4.5),
    fontWeight: "700",
  },

  listContainer: {
    minHeight: hp(8),
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: wp(3),
    padding: wp(2.8),
    marginBottom: hp(0.8),
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    elevation: 2,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  clientSection: {
    flex: 1,
    marginRight: wp(2),
  },

  clientName: {
    fontSize: wp(3.6),
    fontWeight: "700",
    color: "#111827",
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(0.2),
  },

  location: {
    marginLeft: 4,
    color: "#6B7280",
    fontSize: wp(2.8),
    flex: 1,
  },

  serialBadge: {
    backgroundColor: "#EEF2FF",
    alignItems: "center", justifyContent: "center",
    height: hp(2.5), width: hp(2.5), borderRadius: wp(5), borderWidth: wp(0.3), borderColor: COLORS?.primary
  },

  serialText: {
    color: COLORS?.primary,
    fontWeight: "700",
    fontSize: wp(2.8),
  },

  description: {
    marginTop: hp(0.5),
    color: "#4B5563",
    fontSize: wp(2.8),
    lineHeight: 16,
  },

  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(0.9),
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: wp(3),
  },

  infoValue: {
    marginLeft: 3,
    color: "#111827",
    fontSize: wp(2.9),
    fontWeight: "600",
  },

  viewButton: {
    marginLeft: "auto",
    backgroundColor: COLORS?.primary,
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(0.55),
    borderRadius: wp(2),
  },

  viewText: {
    color: "#FFF",
    fontSize: wp(2.9),
    fontWeight: "600",
  },

  statusContainer: {
    marginTop: hp(0.7),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statusText: {
    fontSize: wp(2.8),
    fontWeight: "600",
    textTransform: "capitalize",
  },

  startBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.25),
    borderRadius: wp(2),
  },

  startText: {
    color: "#15803D",
    fontSize: wp(2.6),
    fontWeight: "700",
  },

  viewAllButton: {
    backgroundColor: COLORS?.primary,
    marginTop: hp(0.5),
    paddingVertical: hp(1.1),
    borderRadius: wp(3),
    alignItems: "center",
  },

  viewAllText: {
    color: "#FFF",
    fontSize: wp(3.3),
    fontWeight: "700",
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hp(3),
  },

  emptyText: {
    marginTop: hp(1),
    color: "#6B7280",
    fontSize: wp(3.4),
    fontWeight: "600",
  },
});