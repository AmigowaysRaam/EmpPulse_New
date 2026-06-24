import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated, FlatList, RefreshControl, StyleSheet, Text, TextInput,
  View
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSelector } from "react-redux";

import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { fetchData } from "./api/Api";
import AttHeader from "./AttendacneLogin";

export default function AttendanceActivity() {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const [refreshing, setRefreshing] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [searchText, setSearchText] = useState("");

  const [summary, setSummary] = useState({
    totalEmployees: 0,
    loggedEmp: 0,
  });

  const profileDetails = useSelector(
    (state) => state?.auth?.profileDetails?.data
  );
  useEffect(() => {
    loadEmployees();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadEmployees();
    }, [])
  );

  const loadEmployees = async () => {
    try {
      const response = await fetchData(
        "app-attendance-summary",
        "POST",
        {
          company_id: "6a22ad0876ef48d4a7e16b6f",
        }
      );

      console.log(
        "attendance API Response:",
        profileDetails?._id,
        response
      );

      if (response?.data) {
        setSummary({
          totalEmployees: response.data.totalEmployees || 0,
          loggedEmp: response.data.loggedEmp || 0,
        });

        setEmployees(response.data.employees || []);
      }
    } catch (error) {
      console.error("API Error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadEmployees();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Online":
        return "#4CAF50";
      case "On Break":
        return "#FF9800";
      case "Offline":
        return "#F44336";
      default:
        return "#999";
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    const search = searchText.toLowerCase();

    return (
      employee?.name?.toLowerCase()?.includes(search) ||
      employee?.employeeId?.toLowerCase()?.includes(search)
    );
  });
  const SummaryCard = ({ title, value, color }) => (
    <Animated.View
      style={[
        styles.summaryCard,
        {
          borderLeftColor: color,
          backgroundColor: color + "20",
        },
      ]}
    >
      <View style={styles.summaryHeader}>
        <Text style={styles.summaryTitle}>{title}</Text>
        <Text style={styles.summaryValue}>{value}</Text>
      </View>
    </Animated.View>
  );

  const renderEmployee = ({ item }) => {
    const statusColor = getStatusColor(item.status);
    return (
      <View style={styles.employeeCard}>
        <View style={styles.topRow}>
          <View style={styles.avatar}>
            <Ionicons
              name="person"
              size={24}
              color="#FFF"
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.employeeName}>
              {item.name}
            </Text>

            <Text style={styles.employeeId}>
              {item.employeeId}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons
            name="log-in-outline"
            size={18}
            color="#4CAF50"
          />

          <Text style={styles.infoText}>
            Login : {item.loginTime}
          </Text>
          {
            item?.logoutTime &&

            <Text style={styles.infoText}>
              Logout : {item?.logoutTime || '-'}
            </Text>
          }
        </View>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <AttHeader
        title="Attendance Login"
        showBackButton={false}
      />

      <View style={styles.stickyHeader}>
        <View style={styles.summaryRow}>
          <SummaryCard
            title="Employees"
            value={summary.totalEmployees}
            color="#2196F3"
          />
          <SummaryCard
            title="Online"
            value={summary.loggedEmp}
            color="#4CAF50"
          />
        </View>
      </View>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#888"
          style={{ marginRight: 8 }}
        />
        <TextInput
          placeholder="Search employee..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />
        {searchText.length > 0 && (
          <Ionicons
            name="close-circle"
            size={20}
            color="#888"
            onPress={() => setSearchText("")}
          />
        )}
      </View>

      <FlatList
        data={filteredEmployees}
        keyExtractor={(item, index) =>
          item.id?.toString() || index.toString()
        }
        renderItem={renderEmployee}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: wp(4),
          paddingBottom: hp(3),
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        ListEmptyComponent={
          !refreshing && (
            <>
              <Ionicons
                name="people-outline"
                size={60}
                color="#CCC"
                style={{
                  alignSelf: "center",
                  marginTop: hp(5),
                }}
              />

              <Text
                style={{
                  textAlign: "center",
                  fontFamily: "Poppins_600SemiBold",
                }}
              >
                {searchText
                  ? "No matching employee found."
                  : "No employee activity found."}
              </Text>
            </>
          )
        }
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6FA",
  },
  stickyHeader: {
    backgroundColor: "#F4F6FA",
    paddingHorizontal: wp(4),
    paddingTop: hp(1),
    zIndex: 100,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp(1.5),
  },

  summaryCard: {
    width: "48%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: wp(4),
    borderLeftWidth: wp(1),
  },

  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  summaryTitle: {
    color: "#555",
    fontSize: wp(3.2),
    fontFamily: "Poppins_600SemiBold",
  },

  summaryValue: {
    fontSize: wp(5),
    fontWeight: "700",
    color: "#222",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    marginHorizontal: wp(4),
    marginBottom: hp(1.5),
    paddingHorizontal: wp(3),
    borderRadius: 12,
    elevation: 2,
    height: hp(6),
  },

  searchInput: {
    flex: 1,
    color: "#222",
    fontSize: wp(3.8),
    fontFamily: "Poppins_400Regular",
  },

  employeeCard: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: wp(4),
    marginBottom: hp(1),
    elevation: 2,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(3),
  },
  employeeName: {
    fontSize: wp(4),
    fontWeight: "700",
    color: "#222",
    textTransform:"capitalize"
  },
  employeeId: {
    fontSize: wp(3),
    color: "#888",
    marginTop: 2,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(1.2),
  },

  infoText: {
    marginLeft: wp(2),
    fontSize: wp(3.3),
    color: "#555",
    fontFamily: "Poppins_600SemiBold"
  },
});