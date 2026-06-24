import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Icon } from "react-native-elements";
import { useSelector } from "react-redux";

import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { fetchData } from "./api/Api";
import CommonHeader from "./CommonHeader";
import CustomDropdownData from "./CustomDropDownwihtUI";

export default function PayrollLogScreen() {
  const navigation = useNavigation();

  const [refreshing, setRefreshing] = useState(false);
  const [payrollData, setPayrollData] = useState([]);
  const [expandedItem, setExpandedItem] = useState(null);

  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1);

  const [yearPickerVisible, setYearPickerVisible] = useState(false);
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);

  const flatListRef = useRef();

  const profileDetails = useSelector(
    (state) => state?.auth?.profileDetails?.data
  );

  const currentYear = dayjs().year();
  const currentMonth = dayjs().month() + 1;

  useEffect(() => {
    if (
      selectedYear === currentYear &&
      selectedMonth > currentMonth
    ) {
      setSelectedMonth(currentMonth);
    }
  }, [selectedYear]);

  const monthOptions = Array.from(
    {
      length:
        selectedYear === currentYear
          ? currentMonth
          : 12,
    },
    (_, i) => ({
      label: dayjs().month(i).format("MMMM"),
      value: i + 1,
    })
  );

  const yearOptions = Array.from({ length: 15 }, (_, i) => {
    const year = dayjs().year() - i;
    return {
      label: String(year),
      value: year,
    };
  });

  useEffect(() => {
    loadPayroll();
  }, [selectedYear, selectedMonth]);

  const loadPayroll = async () => {
    try {
      setRefreshing(true);

      const response = await fetchData(
        "mob-employee-payroll",
        "POST",
        {
          employeeId: profileDetails?._id,
          year: selectedYear,
          month: selectedMonth,
        }
      );

      console.log(
        "Payroll API Response:",
        JSON.stringify(response, null, 2)
      );

      if (response?.success && response?.data) {
        const payroll = response.data;

        const formattedData = [
          {
            id: payroll._id,

            monthName: dayjs()
              .month(payroll.month - 1)
              .format("MMMM"),

            year: payroll.year,

            date:
              payroll.updatedAt ||
              payroll.createdAt,

            status:
              payroll.payrollStatus === "processed"
                ? "Paid"
                : payroll.payrollStatus === "approved"
                  ? "Approved"
                  : "Pending",

            grossSalary: payroll.grossSalary || 0,
            totalDeduction:
              payroll.totalDeductions || 0,
            amount: payroll.netSalary || 0,

            details: {
              basic: payroll.basicSalary || 0,
              hra: payroll.hra || 0,

              allowance:
                payroll.specialAllowance || 0,

              bonus:
                payroll.totalIncentive || 0,

              otherAllowance:
                (payroll.foodAllowance || 0) +
                (payroll.mobileAllowance || 0) +
                (payroll.driverAllowance || 0) +
                (payroll.carReimbursement || 0) +
                (payroll.monthlyAllowance || 0),

              pf: payroll.pfDeduction || 0,
              esi: payroll.esiDeduction || 0,

              professionalTax:
                payroll.otherDeductions || 0,

              lop:
                payroll.lopDeduction || 0,
            },
          },
        ];

        setPayrollData(formattedData);
      } else {
        setPayrollData([]);
      }
    } catch (error) {
      console.log("Payroll API Error:", error);
      setPayrollData([]);
    } finally {
      setRefreshing(false);
    }
  };

  const renderRow = ({ item }) => {
    const isExpanded = expandedItem === item.id;

    return (
      <Pressable
        style={styles.card}
        onPress={() =>
          setExpandedItem(
            isExpanded ? null : item.id
          )
        }
      >
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.monthText}>
              {item.monthName} {item.year}
            </Text>

            <Text style={styles.dateText}>
              Salary Date :{" "}
              {dayjs(item.date).format(
                "DD MMM YYYY"
              )}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.status === "Paid"
                    ? "#E8F8EC"
                    : "#FFF4D6",
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    item.status === "Paid"
                      ? "#0A8F3D"
                      : "#D68910",
                },
              ]}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.summaryRow}>
          <View style={styles.summaryBox}>
            <Text style={styles.label}>
              Gross Salary
            </Text>
            <Text style={styles.value}>
              ₹
              {Number(
                item.grossSalary
              ).toFixed(2)}
            </Text>
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.label}>
              Deduction
            </Text>
            <Text style={styles.value}>
              ₹
              {Number(
                item.totalDeduction
              ).toFixed(2)}
            </Text>
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.label}>
              Net Salary
            </Text>
            <Text
              style={[
                styles.value,
                { color: "#0A8F3D" },
              ]}
            >
              ₹
              {Number(item.amount).toFixed(
                2
              )}
            </Text>
          </View>
        </View>

        {isExpanded && (
          <View style={styles.expandedSection}>
            <Text style={styles.sectionTitle}>
              Earnings
            </Text>

            {[
              [
                "Basic Salary",
                item.details.basic,
              ],
              ["HRA", item.details.hra],
              [
                "Special Allowance",
                item.details.allowance,
              ],
              [
                "Bonus",
                item.details.bonus,
              ],
              [
                "Other Allowance",
                item.details.otherAllowance,
              ],
            ].map(([label, value]) => (
              <View
                style={styles.row}
                key={label}
              >
                <Text>{label}</Text>
                <Text>
                  ₹
                  {Number(value).toFixed(
                    2
                  )}
                </Text>
              </View>
            ))}

            <Text
              style={[
                styles.sectionTitle,
                { marginTop: hp(1.5) },
              ]}
            >
              Deductions
            </Text>

            {[
              ["PF", item.details.pf],
              ["ESI", item.details.esi],
              [
                "Professional Tax",
                item.details.professionalTax,
              ],
              ["LOP", item.details.lop],
            ].map(([label, value]) => (
              <View
                style={styles.row}
                key={label}
              >
                <Text>{label}</Text>
                <Text>
                  ₹
                  {Number(value).toFixed(
                    2
                  )}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <CommonHeader
        title="Payroll History"
        onBackPress={() =>
          navigation.goBack()
        }
      />

      <View style={styles.filterRow}>
        <Pressable
          style={styles.filterBtn}
          onPress={() =>
            setYearPickerVisible(true)
          }
        >
          <Text style={styles.filterText}>
            {selectedYear}
          </Text>
          <Icon
            type="feather"
            name="calendar"
            size={16}
            color="#FFF"
          />
        </Pressable>

        <Pressable
          style={styles.filterBtn}
          onPress={() =>
            setMonthPickerVisible(true)
          }
        >
          <Text style={styles.filterText}>
            {dayjs()
              .month(selectedMonth - 1)
              .format("MMM")}
          </Text>
          <Icon
            type="feather"
            name="calendar"
            size={16}
            color="#FFF"
          />
        </Pressable>
        <Pressable
          style={[{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            width: wp(15),
            backgroundColor: COLORS.primary,
            paddingHorizontal: wp(4),
            paddingVertical: hp(1),
            borderRadius: wp(10),
            gap: wp(2),
          }]}
          onPress={() =>
            setMonthPickerVisible(true)
          }
        >
          <Icon
            type="feather"
            name="download"
            size={16}
            color="#FFF"
          />
        </Pressable>
      </View>

      <FlatList
        ref={flatListRef}
        data={payrollData}
        keyExtractor={(item) =>
          item.id.toString()
        }
        renderItem={renderRow}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadPayroll}
          />
        }
        ListEmptyComponent={
          !refreshing && (
            <View
              style={styles.emptyContainer}
            >
              <Icon
                type="feather"
                name="file-text"
                size={50}
                color="#CCC"
              />
              <Text style={styles.emptyText}>
                No payroll records found
              </Text>
            </View>
          )
        }
      />

      <CustomDropdownData
        title="Choose Year"
        isVisible={yearPickerVisible}
        data={yearOptions}
        selectedItem={{
          value: selectedYear,
        }}
        onClose={() =>
          setYearPickerVisible(false)
        }
        onSelect={(item) => {
          setSelectedYear(item.value);
          setYearPickerVisible(false);
        }}
      />

      <CustomDropdownData
        title="Choose Month"
        isVisible={monthPickerVisible}
        data={monthOptions}
        selectedItem={{
          value: selectedMonth,
        }}
        onClose={() =>
          setMonthPickerVisible(false)
        }
        onSelect={(item) => {
          setSelectedMonth(item.value);
          setMonthPickerVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },

  filterRow: {
    flexDirection: "row",
    gap: wp(2),
    paddingHorizontal: wp(3),
    marginVertical: hp(1),
  },

  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: wp(36),
    backgroundColor: COLORS.primary,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: wp(10),
    gap: wp(2),
  },

  filterText: {
    color: "#FFF",
    fontSize: wp(3.6),
    fontFamily: "Poppins_600SemiBold",
  },

  card: {
    backgroundColor: "#FFF",
    marginHorizontal: wp(3),
    marginBottom: hp(1.2),
    borderRadius: wp(3),
    padding: wp(4),
    elevation: 3,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  monthText: {
    fontSize: wp(4),
    fontFamily: "Poppins_600SemiBold",
  },
  dateText: {
    fontSize: wp(3.2),
    color: "#777",
  },
  statusBadge: {
    paddingHorizontal: wp(3),
    borderRadius: wp(2),
    justifyContent: "center"
  },

  statusText: {
    fontSize: wp(3),
    fontFamily: "Poppins_600SemiBold",
  },

  divider: {
    height: 1,
    backgroundColor: "#EEE",
    marginVertical: hp(1.2),
  },

  summaryRow: {
    flexDirection: "row",
  },

  summaryBox: {
    flex: 1,
    alignItems: "center",
  },

  label: {
    fontSize: wp(3),
    color: "#777",
  },

  value: {
    marginTop: hp(0.5),
    fontSize: wp(3.6),
    fontFamily: "Poppins_600SemiBold",
  },

  expandedSection: {
    marginTop: hp(1.5),
    borderTopWidth: 1,
    borderColor: "#EEE",
    paddingTop: hp(1.2),
  },

  sectionTitle: {
    fontSize: wp(3.7),
    color: COLORS.primary,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: hp(1),
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: hp(0.5),
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp(15),
  },

  emptyText: {
    marginTop: hp(1),
    color: "#888",
    fontSize: wp(3.8),
  },
});