import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import {
  Animated, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View
} from "react-native";
import { useSelector } from "react-redux";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import CommonHeader from "./CommonHeader";
import { fetchData } from "./api/Api";
const statuses = ["All", "Active", "Inactive", "Pending"];
const generateLeads = () =>
  Array.from({ length: 20 }).map((_, i) => {
    const status = ["Active", "Inactive", "Pending"][i % 3];
    return {
      id: i + 1, name: `Lead ${i + 1}`,
      phone: `98765${1000 + i}`, status,
      address: `No.${i + 10}, MG Road, Madurai, Tamil Nadu`,
    };
  });

const getInitials = (name) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase();
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
const SkeletonCard = () => {
  const opacity = new Animated.Value(0.3);
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[styles.skeletonCard, { opacity }]}>
      <View style={styles.skeletonAvatar} />
      <View style={{ flex: 1 }}>
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, { width: "60%" }]} />
      </View>
    </Animated.View>
  );
};
const LeadListScreen = () => {
  const route = useRoute();
  const { title } = route.params || {};
  const navigation = useNavigation();
  // useEffect(() => {
  //   const pseudoId = `${Device.brand}${Device.modelName}${Device?.totalMemory}`;
  //   console.log('DevicepseudoId', pseudoId)
  // }, []);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [leads, setLeads] = useState([]);
  useEffect(() => {
    getListofLeads()
    setTimeout(() => {
      setLeads(generateLeads());
      setLoading(false);
    }, 1200);
  }, []);

  const profileDetails = useSelector(
    (state) => state?.auth?.profileDetails?.data
  );
  const getListofLeads = async () => {
    try {
      const response = await fetchData(
        "my-leads-list",
        "POST",
        {
          userId: profileDetails?.id,
          per_page: 10, pageNo: 1,
          limit: 10, filter: search,
          title
        }
      );
      console.log(response, "leads response")
      // {"data": [{"_id": "6a2a3ce92772b4815a8e04cb", "address": "No:59-A, Nethaji Nagar,, Mettupatti Road, Nagal Nagar, Dindigul :624003.,", "assignedAt": "2026-06-18T10:58:36.125Z", "contactNumber": "9245864517 / 9965791495", "district": "Dindigul", "isActiveToday": true, "leadId": "L01", "name": "Yogi Traders", "status": "converted"}, {"_id": "6a2a3d862772b4815a8e0af9", "address": "Cuddalore", "assignedAt": "2026-06-18T11:01:31.622Z", "contactNumber": "9342128043", "district": "Cuddalore", "isActiveToday": true, "leadId": "L370", "name": "Pravin", "status": "converted"}, {"_id": "6a2a3cfd2772b4815a8e0a51", "address": "Ariyalur", "assignedAt": "2026-06-18T11:00:36.226Z", "contactNumber": "9443303157", "district": "Ariyalur", "isActiveToday": true, "leadId": "L354", "name": "A.S.A Construction", "status": "converted"}, {"_id": "6a2a3ce92772b4815a8e04cf", "address": "Dindigul", "assignedAt": "2026-06-18T10:58:36.425Z", "contactNumber": "9842188367", "district": "Dindigul", "isActiveToday": true, "leadId": "L02", "name": "Srinivasa Builders", "status": "converted"}, {"_id": "6a2a3cfd2772b4815a8e0a55", "address": "Andimadam", "assignedAt": "2026-06-18T11:00:36.526Z", "contactNumber": "8610830105", "district": "Ariyalur", "isActiveToday": true, "leadId": "L355", "name": "S.S.K Construction", "status": "converted"}, {"_id": "6a2a3d862772b4815a8e0afd", "address": "Chidambaram", "assignedAt": "2026-06-18T11:01:31.821Z", "contactNumber": "9360864581", "district": "Cuddalore", "isActiveToday": true, "leadId": "L371", "name": "Sivagami", "status": "converted"}, {"_id": "6a2a3d862772b4815a8e0b01", "address": "Chidambaram", "assignedAt": "2026-06-18T11:01:32.021Z", "contactNumber": "6383715833", "district": "Cuddalore", "isActiveToday": true, "leadId": "L372", "name": "Sankar", "status": "converted"}, {"_id": "6a2a3cfd2772b4815a8e0a59", "address": "Ariyalur", "assignedAt": "2026-06-18T11:00:36.625Z", "contactNumber": "9597898928", "district": "Ariyalur", "isActiveToday": true, "leadId": "L356", "name": "SAB sri annai builders", "status": "converted"}, {"_id": "6a2a3ce92772b4815a8e04d3", "address": "Dindigul", "assignedAt": "2026-06-18T10:58:36.522Z", "contactNumber": "9003332214", "district": "Dindigul", "isActiveToday": true, "leadId": "L03", "name": "Nirmal", "status": "converted"}, {"_id": "6a2a3ce92772b4815a8e04d7", "address": "Dindigul", "assignedAt": "2026-06-18T10:58:36.526Z", "contactNumber": "9962149658", "district": "Dindigul", "isActiveToday": true, "leadId": "L04", "name": "Raghupathyraja", "status": "converted"}], "filter": "", "page": 1, "success": true, "total": 1129, "totalPages": 113} leads response
      if (response?.success) {

      } else {
      }
    } catch (error) {
      console.error("my-leads-list API Error:", error);
    } finally {

    }
  }


  const onRefresh = () => {
    setRefreshing(true);

    setTimeout(() => {
      setLeads(generateLeads()); // simulate API refresh
      setRefreshing(false);
    }, 1000);
  };
  /* filtered list */
  const filteredLeads = useMemo(() => {
    return leads.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.phone.includes(search);

      const matchStatus =
        selectedStatus === "All"
          ? true
          : item.status === selectedStatus;

      return matchSearch && matchStatus;
    });
  }, [search, selectedStatus, leads]);

  /* 📊 COUNT BADGES */
  const statusCounts = useMemo(() => {
    const counts = {
      All: leads.length,
      Active: 0,
      Inactive: 0,
      Pending: 0,
    };
    leads.forEach((l) => {
      counts[l.status] += 1;
    });
    return counts;
  }, [leads]);

  const renderItem = ({ item }) => (
    <Pressable onPress={() => {
      navigation?.navigate('LeadDetailtScreen', {
        item: item
      })
    }} style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {getInitials(item.name)}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.sub}>{item.phone}</Text>
        <Text style={styles.address}>{item.address}</Text>
      </View>

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
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <CommonHeader
        title={title || "Leads"}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      {/* 🔍 SEARCH */}
      <TextInput
        placeholder="Search leads..."
        value={search}
        onChangeText={setSearch}
        style={styles.searchBar}
        placeholderTextColor={'#444'}
      />

      {/* 📊 STATUS TABS WITH COUNTS */}
      <View style={styles.tabs}>
        {statuses.map((status) => (
          <Pressable
            key={status}
            onPress={() => setSelectedStatus(status)}
            style={[
              styles.tab,
              selectedStatus === status && styles.tabActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                selectedStatus === status && styles.tabTextActive,
              ]}
            >
              {status} ({statusCounts[status]})
            </Text>
          </Pressable>
        ))}
      </View>
      {loading ? (
        <View style={{ padding: wp(4) }}>
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredLeads}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => (
            <View style={{ height: hp(1) }} />
          )}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
        />
      )}
    </View>
  );
};

export default LeadListScreen;

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  searchBar: {
    margin: wp(4),
    padding: wp(3),
    backgroundColor: "#fff",
    borderRadius: wp(2),
    fontSize: wp(3.5),
    elevation: 2,
  },

  tabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: wp(4),
    marginBottom: wp(2),
  },

  tab: {
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(3),
    borderRadius: wp(2),
    backgroundColor: "#E5E7EB",
    marginRight: wp(2),
    marginBottom: wp(2),
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: wp(3),
    color: "#374151",
  },

  tabTextActive: {
    color: "#fff",
    fontWeight: "600",
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
    elevation: 2,
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

  info: {
    flex: 1,
  },

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
  },

  statusText: {
    fontSize: wp(3),
    fontWeight: "600",
  },

  /* Skeleton */
  skeletonCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: wp(3),
    backgroundColor: "#fff",
    borderRadius: wp(3),
    marginBottom: hp(1),
  },

  skeletonAvatar: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: "#E5E7EB",
    marginRight: wp(3),
  },

  skeletonLine: {
    height: hp(1.2),
    backgroundColor: "#E5E7EB",
    marginBottom: 6,
    borderRadius: 4,
    width: "80%",
  },
});