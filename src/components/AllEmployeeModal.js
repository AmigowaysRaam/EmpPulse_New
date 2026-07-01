import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity,
  View
} from "react-native";
import { useSelector } from "react-redux";
import { COLORS } from "../../app/resources/colors";
import { wp } from "../../app/resources/dimensions";
import { fetchData } from "./api/Api";

const AllEmployeeModal = ({ visible, onClose }) => {

  const profileDetails = useSelector(
    (state) => state?.auth?.profileDetails?.data
  );
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);

  const [selectedUsers, setselectedUsers] = useState([]);

  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const onRefresh = async () => {
    try {
      setRefreshing(true); setPage(1); setHasMore(true);
      await fnGetAllEmp(1, false, search.trim());
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
    }
  };

  const fnGetAllEmp = async (
    pageNo = 1,
    isLoadMore = false,
    searchText = search
  ) => {
    try {
      if (isLoadMore) {
        setPaginationLoading(true);
      } else {
        setLoading(true);
      }
      const response = await fetchData("kas-employee-list", "POST", {
        companyId: profileDetails?.companyId,
        limit: 20,
        page: pageNo,
        search: searchText,
      });

      const employees = Array.isArray(response?.employees)
        ? response.employees
        : [];

      setHasMore(employees.length >= 20);

      if (isLoadMore) {
        setEmployeeList((prev) => [...prev, ...employees]);
      } else {
        setEmployeeList(employees);
      }
    } catch (err) {
      console.log("Employee List Error:", err);
    } finally {
      setLoading(false);
      setPaginationLoading(false);
    }
  };
  useEffect(() => {
    if (visible) {
      setPage(1);
      setHasMore(true);
      setEmployeeList([]);
      fnGetAllEmp(1);
    }
  }, [visible]);
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setPage(1);
      setHasMore(true);
      fnGetAllEmp(1, false, search.trim());
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  const getEmployeeName = (employee) => {
    if (!employee) return "Unknown Employee";
    if (typeof employee?.employeeName === "string") {
      return employee.employeeName;
    }

    if (
      employee?.employeeName &&
      typeof employee.employeeName === "object"
    ) {
      return (
        employee.employeeName?.name ||
        employee.employeeName?.employeeName ||
        employee.employeeName?.fullName ||
        "Unknown Employee"
      );
    }
    return "Unknown Employee";
  };
  const handleLoadMore = () => {
    if (
      loading || paginationLoading || !hasMore) {
      return;
    }
    const nextPage = page + 1;
    setPage(nextPage);
    fnGetAllEmp(nextPage, true, search.trim());
  };
  const handleStartChart = async (props) => {
    try {
      setLoading(true);
      const response = await fetchData("chat-dm-create", "POST", {
        companyId: profileDetails?.companyId,
        contactId: props?._id,
        userId: profileDetails?.id
      });
      console?.log(response, "chat-dm-create")
      if (response?.success) {
        navigation?.navigate('ChatConvoScreen', { item: response?.conversation })
        // console?.log(response, "chat-dm-create")
        onClose();
      }
    } catch (err) {
      console.log("Employee List Error:", err);
    } finally {
      setLoading(false);
    }
  }
  const toggleSelection = (user) => {
    setselectedUsers((prev) => {
      const exists = prev.some((item) => item._id === user._id);

      if (exists) {
        return prev.filter((item) => item._id !== user._id);
      }

      return [...prev, user];
    });
  };
  const renderItem = ({ item }) => {
    const employeeName = getEmployeeName(item);
    const mobileNumber =
      typeof item?.mobileNumber === "object"
        ? item?.mobileNumber?.number || item?.mobileNumber?.mobile || ""
        : item?.mobileNumber;

    const designation =
      typeof item?.designation === "object"
        ? item?.designation?.name || item?.designation?.title || ""
        : item?.designation;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.card,
          // selectedUsers.includes(item._id) && styles.selectedCard,
        ]}
        // onLongPress={() => toggleSelection(item)}
        onPress={() => {
          // if (selectedUsers.length > 0) {
          //   // Toggle selection if selection mode is active
          //   toggleSelection(item);
          // } else {
          //   // Normal behavior
          handleStartChart(item);
          // }
        }}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {employeeName?.charAt(0)?.toUpperCase() || "E"}
          </Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>
            {employeeName}
            {/* {JSON.stringify(item)} */}

          </Text>

          <Text style={styles.mobile}>
            {mobileNumber
              ? `${String(mobileNumber)}`
              : " No mobile number"}
          </Text>

          {!!designation && (
            <Text style={styles.designation}>
              {String(designation)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!paginationLoading) return null;

    return (
      <View style={{ paddingVertical: 15 }}>
        <ActivityIndicator size="small" color={COLORS?.primary} />
      </View>
    );
  };


  return (

    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>All Employees</Text>

            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.searchContainer}>
            <TextInput
              placeholder="Search employee..."
              placeholderTextColor="#999"
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
            {!!search && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Text style={styles.clearText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#4F46E5" />
            </View>
          ) : (
            <FlatList
              data={employeeList}
              keyExtractor={(item, index) =>
                String(item?._id?._id || item?._id || item?.id || index)
              }
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: 20,
                flexGrow: 1,
              }}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.3}
              refreshing={refreshing}
              onRefresh={onRefresh}
              ListFooterComponent={renderFooter}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    No employees found
                  </Text>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};
export default AllEmployeeModal;
const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.90)",
    justifyContent: "center", alignItems: "center",
  },
  card: { padding: 16, backgroundColor: "#fff", }, selectedCard: {
    backgroundColor: "#d0ebff",
  }, container: {
    width: "93%", height: "80%", backgroundColor: "#F8FAFC", borderRadius: wp(2), paddingHorizontal: wp(3), paddingTop: wp(2),
    paddingBottom: wp(2),
  }, header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15,
  }, title: { fontSize: wp(4.9), color: "#111827", fontFamily: "Poppins_400Regular" }, close: { fontSize: 22, fontWeight: "700", },
  searchContainer: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 10,
  }, searchInput: {
    flex: 1,
    height: 48, fontSize: 15, color: "#111827", fontFamily: "Poppins_400Regular"
  }, clearText: {
    fontSize: 18, color: "#999", paddingLeft: 10, fontFamily: "Poppins_400Regular"
  }, countText: {
    marginBottom: 10, fontSize: 13, color: "#6B7280", fontWeight: "500", fontFamily: "Poppins_400Regular"
  }, card: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", padding: wp(2), borderRadius: 14, marginBottom: wp(1),
  }, avatar: {
    width: wp(10), height: wp(10), borderRadius: wp(10), backgroundColor: COLORS?.primary, justifyContent: "center",
    alignItems: "center", marginRight: wp(3),
  }, avatarText: {
    color: "#FFFFFF", fontSize: wp(4.3), fontFamily: "Poppins_400Regular"
  }, info: {
    flex: 1, fontFamily: "Poppins_400Regular"
  }, name: {
    fontSize: wp(3.5), fontWeight: "700", color: "#111827", textTransform: "capitalize", fontFamily: "Poppins_400Regular"
  }, mobile: {
    marginTop: 4, fontSize: wp(3.5), color: "#6B7280", fontWeight: "700",
  }, designation: { marginTop: 4, fontSize: wp(3.5), color: "#4F46E5", }, loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center", },
  emptyContainer: { marginTop: 60, alignItems: "center", }, emptyText: { fontSize: 15, color: "#9CA3AF", },
});