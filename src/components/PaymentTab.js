import { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { hp, wp } from "../../app/resources/dimensions";
import MpinVerifyModal from "./MpinVerifyModal";

const paymentData = [
  {    id: "1",    title: "Initial Booking Advance",    amount: 200000,    date: "05 Jan 2025",
    status: "Paid",    type: "success",  },
  {
    id: "2",    title: "Foundation Stage Payment",    amount: 150000,    date: "18 Mar 2025",
    status: "Paid",    type: "success",  },  {
    id: "3",
    title: "Structure Completion",    amount: 150000,    date: "10 Jun 2025",    status: "Paid",
    type: "success",
  },  {    id: "4",    title: "Finishing Stage Payment",    amount: 180000,    date: "Pending",
    status: "Due",
    type: "warning",  },  {    id: "5",    title: "Final Handover",    amount: 170000,
    date: "Upcoming",
    status: "Pending",    type: "danger",  },];
const formatAmount = (value) => {
  return "₹ " + value.toLocaleString("en-IN");};

const PaymentTab = () => {
 const [showMpinModal, setShowMpinModal] = useState(true);
  const total = 850000;
  const paid = 500000;
  const pending = total - paid;

  const renderItem = ({ item }) => (
    <View style={styles.timelineItem}>
      {/* Dot */}
      <View
        style={[
          styles.dot,
          item.type === "success" && { backgroundColor: "#16A34A" },
          item.type === "warning" && { backgroundColor: "#F59E0B" },
          item.type === "danger" && { backgroundColor: "#DC2626" },
        ]}
      />
  <>
      <MpinVerifyModal
        visible={showMpinModal}
        onVerified={() => {
          setShowMpinModal(false);

          // Auto lock again after 30 seconds
          setTimeout(() => {
            setShowMpinModal(true);
          }, 30000);
        }}
      />
      </>
      {/* Line connector */}
      <View style={styles.line} />

      {/* Card */}
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.title}>{item.title}</Text>
          <Text
            style={[
              styles.status,
              item.type === "success" && { color: "#16A34A" },
              item.type === "warning" && { color: "#F59E0B" },
              item.type === "danger" && { color: "#DC2626" },
            ]}
          >
            {item.status}
          </Text>
        </View>

        <Text style={styles.amount}>{formatAmount(item.amount)}</Text>

        <Text style={styles.date}>{item.date}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Payment Timeline</Text>

      {/* Summary Card */}
      <View style={styles.summary}>
        <View>
          <Text style={styles.label}>Total Budget</Text>
          <Text style={styles.total}>{formatAmount(total)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.smallLabel}>Paid</Text>
            <Text style={styles.paid}>{formatAmount(paid)}</Text>
          </View>

          <View>
            <Text style={styles.smallLabel}>Pending</Text>
            <Text style={styles.pending}>{formatAmount(pending)}</Text>
          </View>
        </View>
      </View>

      {/* Timeline */}
      <FlatList
        data={paymentData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default PaymentTab;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: wp(4),
    borderRadius: wp(3),
    elevation: 2,
  },

  heading: {
    fontSize: wp(4.5),
    fontWeight: "800",
    marginBottom: hp(1.5),
    color: "#111",
  },

  summary: {
    backgroundColor: "#F3F4F6",
    padding: wp(4),
    borderRadius: wp(3),
    marginBottom: hp(2),
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: hp(1),
  },

  label: {
    fontSize: wp(3.2),
    color: "#6B7280",
  },

  smallLabel: {
    fontSize: wp(3),
    color: "#9CA3AF",
  },

  total: {
    fontSize: wp(4),
    fontWeight: "800",
    color: "#111",
    marginTop: 4,
  },

  paid: {
    fontSize: wp(3.5),
    fontWeight: "700",
    color: "#16A34A",
  },

  pending: {
    fontSize: wp(3.5),
    fontWeight: "700",
    color: "#DC2626",
  },

  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  dot: {
    width: wp(3),
    height: wp(3),
    borderRadius: wp(1.5),
    marginTop: hp(1),
  },
  line: {
    width: 2,
    height: "100%",
    backgroundColor: "#E5E7EB",
    marginHorizontal: wp(2),
  },

  card: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: wp(3.5),
    borderRadius: wp(2.5),
    marginBottom: hp(2),
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  title: {
    fontSize: wp(3.5),
    fontWeight: "700",
    color: "#111",
    flex: 1,
    paddingRight: 10,
  },

  status: {
    fontSize: wp(3),
    fontWeight: "700",
  },

  amount: {
    fontSize: wp(3.6),
    fontWeight: "800",
    color: "#111",
    marginTop: 4,
  },

  date: {
    fontSize: wp(3),
    color: "#6B7280",
    marginTop: 3,
  },
});