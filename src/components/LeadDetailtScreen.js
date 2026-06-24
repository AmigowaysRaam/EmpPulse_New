import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View
} from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import CommonHeader from "./CommonHeader";

const getStatusColor = (status) => {
  switch (status) {
    case "Active":
      return "#16A34A";
    case "Inactive":
      return "#DC2626";
    case "Pending":
      return "#F59E0B";
    default:
      return "#6B7280";
  }
};
const LeadDetailtScreen = () => {
  const route = useRoute();
  const { item } = route.params || {};
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1200);
  }, []);

  return (
    <View style={styles.container}>
      <CommonHeader
        title={item?.name || item?.title || "Leads"}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      {item && (
        <View style={styles.selectedCard}>
          <Text style={styles.selectedTitle}>Selected Lead</Text>

          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.sub}>{item.phone}</Text>
          <Text style={styles.address}>{item.address}</Text>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) + "20" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>
      )}

    </View>
  );
};

export default LeadDetailtScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  selectedCard: {
    margin: wp(4),
    padding: wp(4),
    backgroundColor: "#fff",
    borderRadius: wp(3),
    elevation: 3,
  },

  selectedTitle: {
    fontSize: wp(3.5),
    fontWeight: "700",
    marginBottom: wp(2),
    color: "#111827",
  },

  listContainer: {
    padding: wp(4),
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: wp(3),
    borderRadius: wp(3),
    marginBottom: hp(1),
  },

  avatar: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(3),
  },

  avatarText: {
    color: "#fff",
    fontSize: wp(3.5),
    fontWeight: "700",
  },

  info: { flex: 1 },

  name: {
    fontSize: wp(4),
    fontWeight: "600",
    color: "#111827",
  },

  sub: {
    fontSize: wp(3.2),
    color: "#6B7280",
  },

  address: {
    fontSize: wp(3),
    color: "#9CA3AF",
  },

  statusBadge: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: wp(2),
    marginLeft: wp(2),
  },

  statusText: {
    fontSize: wp(3),
    fontWeight: "600",
  },
});