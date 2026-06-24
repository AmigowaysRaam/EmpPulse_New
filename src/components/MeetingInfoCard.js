import React from "react";
import {
    Linking,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

const MeetingInfoCard = ({ meetingData = {} }) => {
  const lead = meetingData?.lead || {};
  const location = meetingData?.location || {};
  const visit = meetingData?.visit || {};

  const handleCall = () => {
    if (lead?.contactNumber) {
      Linking.openURL(`tel:${lead.contactNumber}`);
    }
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.leftSection}>
          <Text
            numberOfLines={1}
            style={styles.leadName}
          >
            {lead?.name || "Lead Information"}
          </Text>

          {!!lead?.contactNumber && (
            <Pressable
              onPress={handleCall}
              style={styles.phoneContainer}
            >
              <Text style={styles.phoneText}>
                📞 {lead.contactNumber}
              </Text>
            </Pressable>
          )}
        </View>

        <View style={styles.rightSection}>
          <View style={styles.metricChip}>
            <Text style={styles.metricText}>
              📍 {location?.distanceText || "-"}
            </Text>
          </View>

          <View style={styles.metricChip}>
            <Text style={styles.metricText}>
              ⏱️ {location?.durationText || "-"}
            </Text>
          </View>
        </View>
      </View>

      {!!lead?.fullAddress && (
        <Text
          numberOfLines={3}
          style={styles.addressText}
        >
          📍 {lead.fullAddress}
        </Text>
      )}

      <View style={styles.divider} />

      {/* Bottom Information */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={styles.label}>
            Journey Status
          </Text>

          <Text
            numberOfLines={1}
            style={styles.value}
          >
            {meetingData?.journeyStatus || "-"}
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.label}>
            Started At
          </Text>

          <Text
            numberOfLines={1}
            style={styles.value}
          >
            {visit?.startedAt || "-"}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default MeetingInfoCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: wp(4),
    padding: wp(4),
    marginBottom: hp(2),

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,

    elevation: 4,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  leftSection: {
    flex: 1,
    paddingRight: wp(3),
  },

  leadName: {
    fontSize: wp(4.8),
    fontWeight: "700",
    color: "#111827",
  },

  phoneContainer: {
    marginTop: hp(0.8),
    alignSelf: "flex-start",
  },

  phoneText: {
    fontSize: wp(3.7),
    color: COLORS.primary,
    fontWeight: "600",
  },

  rightSection: {
    alignItems: "flex-end",
    gap: hp(0.7),
  },

  metricChip: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: wp(2.5),
    paddingVertical: hp(0.5),
    borderRadius: wp(2),
  },

  metricText: {
    fontSize: wp(3.2),
    color: "#374151",
    fontWeight: "600",
  },

  addressText: {
    marginTop: hp(1.2),
    fontSize: wp(3.4),
    color: "#6B7280",
    lineHeight: hp(2.4),
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: hp(1.8),
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoItem: {
    width: "48%",
  },
  label: {
    fontSize: wp(3.1),
    color: "#9CA3AF",
    marginBottom: hp(0.4),
    fontWeight: "500",
  },

  value: {
    fontSize: wp(3.7),
    color: "#111827",
    fontWeight: "600",
  },
});