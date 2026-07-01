import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { hp, wp } from "../../app/resources/dimensions";

const credentialsData = [
  {
    id: "1",
    label: "GitHub Repository",
    value: "github.com/company/erp",
    type: "link",
    action: "Open",
    icon: "github",
  },
  {
    id: "2",
    label: "Server IP Address",
    value: "192.168.1.10",
    type: "text",
    action: "Copy",
    icon: "server",
  },
  {
    id: "3",
    label: "Admin Email",
    value: "admin@abc.com",
    type: "text",
    action: "Copy",
    icon: "mail",
  },
  {
    id: "4",
    label: "API Key",
    value: "••••••••••••••••••",
    type: "secure",
    action: "Reveal",
    icon: "key",
  },
];

const documentsData = [
  {
    id: "d1",
    name: "System Architecture",
    size: "2.4 MB",
    type: "PDF",
    icon: "file-pdf-box",
  },
  {
    id: "d2",
    name: "Database Schema",
    size: "1.1 MB",
    type: "DOC",
    icon: "file-document-outline",
  },
  {
    id: "d3",
    name: "Deployment Guide",
    size: "3.8 MB",
    type: "PDF",
    icon: "file-pdf-box",
  },
  {
    id: "d4",
    name: "API Reference",
    size: "1.9 MB",
    type: "PDF",
    icon: "file-pdf-box",
  },
];

const CredentialsTab = () => {
  const renderCredential = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={styles.iconWrap}>
          <Feather name={item.icon} size={18} color="#2563EB" />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.value}>{item.value}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.actionBtn}>
        <Feather
          name={
            item.action === "Copy"
              ? "copy"
              : item.action === "Open"
              ? "external-link"
              : "eye"
          }
          size={14}
          color="#fff"
        />
        <Text style={styles.actionText}>{item.action}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDocument = ({ item }) => (
    <TouchableOpacity style={styles.docCard}>
      <View style={styles.docIconWrap}>
        <MaterialIcons name={'folder'} size={26} color="#2563EB" />
      </View>

      <Text style={styles.docName} numberOfLines={1}>
        {item.name}
      </Text>

      <Text style={styles.docMeta}>
        {item.type} • {item.size}
      </Text>

      <View style={styles.downloadRow}>
        <Ionicons name="download-outline" size={14} color="#fff" />
        <Text style={styles.downloadText}>Download</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.section}>
      {/* HEADER */}
      <View style={styles.header}>
        <MaterialIcons name="security" size={22} color="#2563EB" />
        <Text style={styles.heading}>Secure Vault</Text>
      </View>

      {/* CREDENTIALS */}
      <Text style={styles.subHeading}>Credentials</Text>
      <FlatList
        data={credentialsData}
        keyExtractor={(item) => item.id}
        renderItem={renderCredential}
        scrollEnabled={false}
      />

      {/* DOCUMENTS */}
      <Text style={[styles.subHeading, { marginTop: hp(2) }]}>
        Documents & Files
      </Text>

      <FlatList
        data={documentsData}
        keyExtractor={(item) => item.id}
        renderItem={renderDocument}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        scrollEnabled={false}
      />
    </View>
  );
};

export default CredentialsTab;

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#FFFFFF",
    padding: wp(4),
    borderRadius: wp(4),
    elevation: 3,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(1.5),
  },

  heading: {
    fontSize: wp(5),
    fontWeight: "800",
    color: "#111827",
    marginLeft: 6,
  },

  subHeading: {
    fontSize: wp(3.8),
    fontWeight: "700",
    color: "#374151",
    marginBottom: hp(1),
  },

  /* CREDENTIAL CARD */
  card: {
    backgroundColor: "#F8FAFC",
    padding: wp(3.5),
    borderRadius: wp(3),
    marginBottom: hp(1.5),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#E0ECFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  label: {
    fontSize: wp(3.1),
    color: "#6B7280",
  },
  value: {
    fontSize: wp(3.6),
    fontWeight: "700",
    color: "#111827",
    marginTop: 2,
  },

  actionBtn: {    flexDirection: "row",    alignItems: "center",    gap: 6,
    backgroundColor: "#2563EB",    paddingHorizontal: wp(3),    paddingVertical: hp(0.8),    borderRadius: wp(2.5),
  },
  actionText: {
    color: "#fff",
    fontSize: wp(3),
    fontWeight: "600",
  },

  /* GRID */
  gridRow: {
    justifyContent: "space-between",
    marginBottom: hp(1.5),
  },

  docCard: {
    flex: 1,
    backgroundColor: "#EEF2FF",
    borderRadius: wp(3),
    padding: wp(3),
    marginHorizontal: wp(1),
    alignItems: "center",
    justifyContent: "center",
  },

  docIconWrap: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(1),
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },

  docName: {
    fontSize: wp(3.3),
    fontWeight: "700",
    color: "#1E3A8A",
    textAlign: "center",
  },

  docMeta: {
    fontSize: wp(2.8),
    color: "#64748B",
    marginTop: 2,
    textAlign: "center",
  },

  downloadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: hp(1),
    backgroundColor: "#1D4ED8",
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.6),
    borderRadius: wp(2),
  },

  downloadText: {
    color: "#fff",
    fontSize: wp(2.8),
    fontWeight: "600",
  },
});