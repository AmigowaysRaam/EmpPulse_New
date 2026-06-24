import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator, FlatList, Modal, Pressable, RefreshControl, StyleSheet, Text, TextInput,
  View
} from "react-native";
import { useSelector } from "react-redux";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { useToast } from "../../constants/ToastContext";
import ApplyLeaveModal from "./ApplyLeaveModal";
import CommonHeader from "./CommonHeader";
import { fetchData } from "./api/Api";

const statuses = ["All", "Pending", "Approved", "Rejected"];
const LeaveManagement = () => {
  const navigation = useNavigation();
  const profileDetails = useSelector(
    (state) => state?.auth?.profileDetails?.data
  );
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [leaves, setLeaves] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");
  const [leaveTypeArr, seleaveTypeArr] = useState([]);
  const [loading, setLoading] = useState(false);

  const formatDate = (date) => {
    if (!date) return "-";

    try {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "#16A34A";

      case "Rejected":
        return "#DC2626";

      case "Pending":
        return "#F59E0B";

      default:
        return "#6B7280";
    }
  };
  const { showToast } = useToast();

  const getMyLeaves = async () => {
    try {
      setLoading(true);
      setRefreshing(true);

      const response = await fetchData(
        "get-leave-summary",
        "POST",
        {
          employeeId: profileDetails?._id,
          companyId: profileDetails?.companyId,
        }
      );
      if (response?.success) {
        seleaveTypeArr(response?.leaveTypes);
        const formattedLeaves =
          response?.appliedLeaves?.map((item) => ({
            id: item?._id || Date.now(),
            leaveType:
              item?.leaveType ||
              item?.leaveCategory ||
              "Leave",

            fromDate: formatDate(item?.startDate),
            toDate: formatDate(item?.endDate),

            days:
              item?.days ||
              item?.numberOfDays ||
              1,

            status: item?.status || "Pending",

            reason: item?.reason || "-",
          })) || [];

        setLeaves(formattedLeaves);
      } else {
        setLeaves([]);
      }
    } catch (error) {
      console.log("Leave API Error:", error);
      setLeaves([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => {
    if (profileDetails?._id) {
      getMyLeaves();
    }
  }, [profileDetails]);

  const filteredLeaves = useMemo(() => {
    return leaves.filter((item) => {
      const matchesStatus =
        selectedStatus === "All" ||
        item?.status === selectedStatus;

      const searchText = search.toLowerCase();

      const matchesSearch =
        item?.leaveType
          ?.toLowerCase()
          ?.includes(searchText) ||
        item?.reason
          ?.toLowerCase()
          ?.includes(searchText);

      return matchesStatus && matchesSearch;
    });
  }, [leaves, selectedStatus, search]);

  const statusCounts = useMemo(() => {
    const counts = {
      All: leaves.length,
      Pending: 0,
      Approved: 0,
      Rejected: 0,
    };

    leaves.forEach((item) => {
      if (counts[item.status] !== undefined) {
        counts[item.status] += 1;
      }
    });

    return counts;
  }, [leaves]);

  const onRefresh = () => {
    getMyLeaves();
  };

  const applyLeave = async () => {
    try {
      if (!leaveType?.label) {
        alert("Please select leave type");
        return;
      }

      if (!fromDate) {
        alert("Please select start date");
        return;
      }

      if (!toDate) {
        alert("Please select end date");
        return;
      }

      setLoading(true);

      const payload = {
        employeeId: profileDetails?._id,
        companyId: profileDetails?.companyId,
        leaveType: leaveType?.label,
        startDate: fromDate,
        endDate: toDate,
        reason: reason?.trim() || "",
      };

      const response = await fetchData(
        "add-leave",
        "POST",
        payload
      );

      if (response?.success) {
        showToast(response?.message, "success");

        await getMyLeaves();
        setLeaveType("");
        setFromDate("");
        setToDate("");
        setReason("");

        setModalVisible(false);
      } else {
        showToast(response?.message, "error");
      }
    } catch (error) {
      console.log("Add Leave Error:", error);
      showToast("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.leaveType}>
          {item.leaveType}
        </Text>

        <Text style={styles.dateText}>
          📅 {item.fromDate} - {item.toDate}
        </Text>

        <Text style={styles.daysText}>
          🗓️ {item.days} Day(s)
        </Text>

        <Text style={styles.reasonText}>
          {item.reason}
        </Text>
        {
          item?.approvalReason != '' &&

          <Text style={styles.reasonText}>
            {item?.approvalReason}
          </Text>
        }
      </View>
      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor:
              getStatusColor(item.status) + "20",
          },
        ]}
      >
        <Text
          style={[
            styles.statusText,
            {
              color: getStatusColor(item.status),
            },
          ]}
        >
          {item.status}
        </Text>
      </View>
    </View>
  );
  return (
    <View style={styles.container}>
      <CommonHeader
        title="Leave Management"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <TextInput
        placeholder="Search Leave..."
        placeholderTextColor="#888"
        value={search}
        onChangeText={setSearch}
        style={styles.searchBar}
      />

      <View style={styles.tabs}>
        {statuses.map((status) => (
          <Pressable
            key={status}
            onPress={() =>
              setSelectedStatus(status)
            }
            style={[
              styles.tab,
              selectedStatus === status &&
              styles.activeTab,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                selectedStatus === status &&
                styles.activeTabText,
              ]}
            >
              {status} ({statusCounts[status]})
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filteredLeaves}
        keyExtractor={(item) =>
          item.id.toString()
        }
        renderItem={renderItem}
        contentContainerStyle={{
          padding: wp(4),
          paddingBottom: hp(12),
        }}
        ItemSeparatorComponent={() => (
          <View style={{ height: hp(1) }} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No Leave Requests Found
          </Text>
        }
      />

      <Pressable
        style={styles.applyButton}
        onPress={() =>
          setModalVisible(true)
        }
      >
        <Text style={styles.applyButtonText}>
          + Apply Leave
        </Text>
      </Pressable>
      <Modal transparent visible={loading}>
        <View style={styles.loaderContainer}>
          <View style={styles.loaderBox}>
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
            />
            <Text style={styles.loaderText}>
              Applying Leave...
            </Text>
          </View>
        </View>
      </Modal>

      <ApplyLeaveModal
        visible={modalVisible}
        onClose={() =>
          setModalVisible(false)
        }
        onSubmit={applyLeave}
        leaveType={leaveType}
        setLeaveType={setLeaveType}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        reason={reason}
        setReason={setReason}
        formatDate={formatDate}
        leaveTypeArr={leaveTypeArr}
      />
    </View>
  );
};

export default LeaveManagement;

// KEEP YOUR EXISTING styles OBJECT BELOW THIS LINE
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  loaderBox: {
    backgroundColor: "#FFF",
    paddingVertical: hp(3),
    paddingHorizontal: wp(8),
    borderRadius: wp(3),
    alignItems: "center",
  },

  loaderText: {
    marginTop: hp(1),
    fontSize: wp(3.5),
    color: "#333",
  },
  searchBar: {
    margin: wp(4),
    backgroundColor: "#FFF",
    borderRadius: wp(3),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.4),
    elevation: 2,
    fontSize: wp(3.5),
  },

  tabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: wp(4),
    marginBottom: hp(1),
  },

  tab: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderRadius: wp(2),
    marginRight: wp(2),
    marginBottom: wp(2),
  },

  activeTab: {
    backgroundColor: COLORS.primary,
  },

  tabText: {
    fontSize: wp(3),
    color: "#374151",
  },

  activeTabText: {
    color: "#FFF",
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: wp(3),
    padding: wp(4),
    elevation: 2,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  leaveType: {
    fontSize: wp(4),
    fontWeight: "700",
    color: "#111827",
  },

  dateText: {
    marginTop: hp(0.6),
    color: "#4B5563",
    fontSize: wp(3.2),
  },

  daysText: {
    marginTop: hp(0.4),
    color: "#6B7280",
    fontSize: wp(3),
  },

  reasonText: {
    marginTop: hp(0.8),
    color: "#374151",
    fontSize: wp(3.1),
  },

  statusBadge: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.6),
    borderRadius: wp(2),
    marginLeft: wp(2),
  },

  statusText: {
    fontWeight: "700",
    fontSize: wp(3),
  },

  applyButton: {
    position: "absolute",
    bottom: hp(3),
    right: wp(5),
    backgroundColor: COLORS.primary,
    borderRadius: wp(10),
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.5),
    elevation: 5,
  },

  applyButtonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: wp(3.5),
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: wp(5),
  },

  modalContainer: {
    backgroundColor: "#FFF",
    borderRadius: wp(4),
    padding: wp(5),
  },

  modalTitle: {
    fontSize: wp(5),
    fontWeight: "700",
    marginBottom: hp(2),
  },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: wp(2),
    padding: wp(3),
    marginBottom: hp(1.5),
  },

  modalButtons: {
    flexDirection: "row",
    marginTop: hp(1),
  },

  cancelButton: {
    flex: 1,
    backgroundColor: "#9CA3AF",
    padding: wp(3),
    borderRadius: wp(2),
    marginRight: wp(2),
    alignItems: "center",
  },

  submitButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: wp(3),
    borderRadius: wp(2),
    alignItems: "center",
  },

  modalBtnText: {
    color: "#FFF",
    fontWeight: "700",
  },

  emptyText: {
    textAlign: "center",
    marginTop: hp(10),
    color: "#6B7280",
  },
});