import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList, Pressable, RefreshControl, StyleSheet, Text, View
} from "react-native";
import { Icon } from "react-native-elements";
import { useSelector } from "react-redux";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import AttendanceDetailsLog from "./AttendanceDetailsLog";
import AttendanceRow from "./AttendanceRow";
import AttendTableHeader from "./AttendanceTblHead";
import CommonHeader from "./CommonHeader";
import CustomDropdownData from "./CustomDropDownwihtUI";
import { fetchData } from "./api/Api";
export default function AttendanceLog({ route }) {
  const navigation = useNavigation();
  const [summaryData, setSummaryData] = useState({
    total_days: 0, present_days: 0, absent_days: 0, late_days: 0,
    working_hours: "00:00",
  });
  const [attendanceDetails, setAttendanceDetails] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [loginData, setLoginData] = useState([]);
  const [scrollY, setScrollY] = useState(0);
  const [expandedItem, setExpandedItem] = useState(null);
  const [yearDropdownVisible, setYearDropdownVisible] = useState(false);
  const [monthDropdownVisible, setMonthDropdownVisible] = useState(false);
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1);
  const flatListRef = useRef();
  const profileDetails = useSelector(
    (state) => state?.auth?.profileDetails?.data
  );
  useEffect(() => {
    loadAttendance();
  }, [selectedMonth, selectedYear]);
  const loadAttendance = async () => {
    try {
      setRefreshing(true);

      const response = await fetchData(
        "employee-attendance-log",
        "POST",
        {
          employee_id: profileDetails?.id,
          month: selectedMonth,
          year: selectedYear,
        }
      );
      // console.log("API Response", JSON.stringify(response));
      if (response?.success) {
        const attendanceData =
          response?.attendance?.map((item) => ({
            id: item.id,
            date: item.date,
            status: item.status,
            login: item.login,
            logout: item.logout,
            details: {
              login_time: item?.details?.login_time || "--",
              logout_time: item?.details?.logout_time || "--",
              morning_tea_break:
                item?.details?.morning_tea_break || "--",
              lunch_break:
                item?.details?.lunch_break || "--",
              evening_tea_break:
                item?.details?.evening_tea_break || "--",
              today_working_hour:
                item?.details?.today_working_hour || "--",
            },
          })) || [];
        setLoginData(attendanceData);
        setAttendanceDetails(
          response?.attendance?.[response?.attendance?.length - 1]?.details || {}
        );
        setSummaryData({
          total_days: response?.summary?.total_days || 0,
          present_days: response?.summary?.present_days || 0,
          absent_days: response?.summary?.absent_days || 0,
          late_days: response?.summary?.late_days || 0,
          working_hours:
            response?.summary?.working_hours || "00:00",
        });
      } else {
        setLoginData([]);
        setSummaryData({
          total_days: 0,
          present_days: 0,
          absent_days: 0,
          late_days: 0,
          working_hours: "00:00",
        });
      }
    } catch (error) {
      console.error("Attendance API Error:", error);
      setLoginData([]);
      setSummaryData({
        total_days: 0,
        present_days: 0,
        absent_days: 0,
        late_days: 0,
        working_hours: "00:00",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAttendance();
  };

  const handleScroll = (event) => setScrollY(event.nativeEvent.contentOffset.y);
  const showFixedHeader = scrollY > hp(60);

  const handleRowPress = (itemDate) => {
    const index = loginData.findIndex((i) => i.date === itemDate);
    if (index !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    }
  };
  const yearOptions = Array.from({ length: 10 }, (_, i) => {
    const y = dayjs().year() - i;
    return { label: y.toString(), value: y };
  });

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    label: dayjs().month(i).format("MMMM"),
    value: i + 1,
  }));

  return (
    <View style={styles.container}>
      <CommonHeader title="Attendance Log" onBackPress={() => navigation.goBack()} />

      {showFixedHeader && <AttendTableHeader style={styles.fixedHeader} />}

      <FlatList
        ref={flatListRef}
        data={loginData}
        // keyExtractor={(item) => item.id.toString()}
        keyExtractor={(item, index) =>
          item?.id?.toString() || index.toString()
        }
        renderItem={({ item }) => (
          <AttendanceRow
            item={item}
            expandedItem={expandedItem}
            onRowPress={handleRowPress}
            setExpandedItem={setExpandedItem}
          />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: hp(3), paddingTop: hp(1) }}
        ListEmptyComponent={
          <>
            <Text style={{
              alignSelf: "center", justifyContent: "center", marginTop: hp(4),
              fontFamily: "Poppins_600SemiBold"
            }}>
              No data
            </Text></>
        }
        ListHeaderComponent={
          <>
            <View style={{ flexDirection: "row", paddingHorizontal: wp(3), justifyContent: "space-between", marginBottom: hp(2) }}>
              <View style={{ flex: 1, marginRight: wp(1) }}>
                <Pressable
                  style={[styles.dateToggle, {
                    borderWidth: wp(0.4), borderColor:
                      COLORS?.primary
                  }]}
                  onPress={() => setYearDropdownVisible(!yearDropdownVisible)}
                >
                  <Text style={styles.dateToggleText}>{selectedYear}</Text>
                  <Icon type="feather"
                    name={yearDropdownVisible ? "calendar" : "calendar"}
                    size={wp(5)}
                    color="#fff"
                  />
                </Pressable>
                <CustomDropdownData
                  onClose={() => setYearDropdownVisible(false)}
                  title={'Choose Year'}
                  isVisible={yearDropdownVisible}
                  data={yearOptions}
                  selectedItem={{ value: selectedYear }}
                  onSelect={(item) => {
                    setSelectedYear(item.value);
                    setYearDropdownVisible(false);
                    const currentMonth = dayjs().month() + 1;
                    setSelectedMonth(currentMonth);
                  }}
                />
              </View>
              <View style={{ flex: 1, marginLeft: wp(1) }}>
                <Pressable
                  style={[styles.dateToggle, {
                    borderWidth: wp(0.4), borderColor:
                      COLORS?.primary
                  }]}
                  onPress={() => setMonthDropdownVisible(!monthDropdownVisible)}
                >
                  <Text style={styles.dateToggleText}>
                    {monthOptions.find(m => m.value === selectedMonth)?.label || "Month"}
                  </Text>
                  <Icon type="feather" name={monthDropdownVisible ? "arrow-drop-up" : "calendar"}
                    size={wp(5)} color="#fff"
                  />
                </Pressable>
              </View>
            </View>
            <AttendanceDetailsLog homepageData={summaryData}
              attendanceDetails={attendanceDetails}
            />
            <View style={{ marginLeft: wp(4) }}>
              <CustomDropdownData
                title={'Choose Month'}
                isVisible={monthDropdownVisible}
                onClose={() => setMonthDropdownVisible(false)}
                data={monthOptions}
                selectedItem={{ value: selectedMonth }}
                onSelect={(item) => {
                  setSelectedMonth(item.value);
                  setMonthDropdownVisible(false);
                }}
              />
            </View>
            {!showFixedHeader && <AttendTableHeader style={styles.fixedHeader} />}
          </>
        }
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  fixedHeader: { position: "absolute", top: hp(12), left: 0, right: 0, zIndex: 999, elevation: 4 },
  dateToggle: {
    paddingVertical: wp(2),
    marginBottom: wp(2),
    backgroundColor: COLORS.primary, borderRadius: wp(2),
    width: "100%", alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-around", paddingHorizontal: wp(4),
  }, dateToggleText: {
    fontSize: wp(3.8),
    color: "#fff", fontFamily: "Poppins_600SemiBold", lineHeight: hp(3)
  },
});