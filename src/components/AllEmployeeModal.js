import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { COLORS } from "../../app/resources/colors";
import { wp } from "../../app/resources/dimensions";
import { fetchData } from "./api/Api";

const AllEmployeeModal = ({ visible, onClose }) => {
  const profileDetails = useSelector(
    (state) => state?.auth?.profileDetails?.data
  );

  const [loading, setLoading] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [search, setSearch] = useState("");

  const fnGetAllEmp = async () => {
    try {
      setLoading(true);

      const response = await fetchData("kas-employee-list", "POST", {
        companyId: profileDetails?.companyId,
        limit: 100,
        page: 1,
        search: "",
      });

      console.log(
        "Employee Response",
        JSON.stringify(response?.employees?.[0], null, 2)
      );

      setEmployeeList(
        Array.isArray(response?.employees) ? response.employees : []
      );
    } catch (err) {
      console.log("Employee List Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fnGetAllEmp();
    }
  }, [visible]);

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

  const filteredEmployees = useMemo(() => {
    return employeeList.filter((employee) =>
      getEmployeeName(employee)
        .toLowerCase()
        .includes(search.trim().toLowerCase())
    );
  }, [employeeList, search]);

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
      <TouchableOpacity activeOpacity={0.8} style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {employeeName?.charAt(0)?.toUpperCase() || "E"}
          </Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>{employeeName}</Text>

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

          {/* Search */}
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

          {!loading && (
            <Text style={styles.countText}>
              Total Employees: {filteredEmployees.length}
            </Text>
          )}

          {loading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#4F46E5" />
            </View>
          ) : (
            <FlatList
              data={filteredEmployees}
              keyExtractor={(item, index) =>
                String(item?._id?._id || item?._id || item?.id || index)
              }
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
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
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    width: "95%",
    height: "75%",
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 10,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,

    elevation: 10,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },

  close: {
    fontSize: 22,
    fontWeight: "700",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 10,
  },

  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: "#111827",
  },

  clearText: {
    fontSize: 18,
    color: "#999",
    paddingLeft: 10,
  },

  countText: {
    marginBottom: 10,
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 14,
    marginBottom: wp(1),

  },

  avatar: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(10),
    backgroundColor: COLORS?.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(3),
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: wp(4),
    fontWeight: "700",
  },

  info: {
    flex: 1,
  },

  name: {
    fontSize: wp(3.5),
    fontWeight: "700",
    color: "#111827",
    textTransform: "capitalize"
  },

  mobile: {
    marginTop: 4,
    fontSize: wp(3.5),
    color: "#6B7280",
  },

  designation: {
    marginTop: 4,
    fontSize: wp(3.5),
    color: "#4F46E5",
    fontWeight: "600",
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyContainer: {
    marginTop: 60,
    alignItems: "center",
  },

  emptyText: {
    fontSize: 15,
    color: "#9CA3AF",
  },
});