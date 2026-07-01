import { ScrollView, StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

const projectData = {
  title: "ERP Management System",
  tech: "React Native, TypeScript, Redux",
  company: "ABC Technologies Pvt Ltd",
  client: "Global Enterprises Inc.",
  startDate: "12 Jan 2024",
  endDate: "30 Jul 2024",
  status: "In Progress",
  budget: "$45,000",
  teamSize: "6 Members",
  description:
    "A scalable enterprise resource planning system designed to streamline operations across finance, HR, procurement, and inventory. The system provides real-time analytics, role-based access control, and seamless integration with third-party tools.",
};

// 👇 NEW TEAM MEMBERS DATA
const teamMembers = [
  { id: 1, name: "John Doe", role: "Project Manager" },
  { id: 2, name: "Sarah Khan", role: "Frontend Developer" },
  { id: 3, name: "Michael Lee", role: "Backend Developer" },
  { id: 4, name: "Aisha Rahman", role: "UI/UX Designer" },
  { id: 5, name: "David Smith", role: "QA Engineer" },
  { id: 6, name: "Priya Nair", role: "DevOps Engineer" },
];

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "#16a34a";
    case "in progress":
      return "#f59e0b";
    case "pending":
      return "#ef4444";
    default:
      return "#64748b";
  }
};

const getInitials = (name) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.row}>
    <View style={styles.iconBox}>
      <Icon name={icon} size={20} color={COLORS.primary} />
    </View>

    <View style={styles.rowText}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  </View>
);

const SectionCard = ({ title, children }) => (
  <View style={styles.card}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

// 👇 NEW TEAM MEMBER UI CARD
const MemberCard = ({ member }) => (
  <View style={styles.memberCard}>
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{getInitials(member.name)}</Text>
    </View>

    <View style={styles.memberInfo}>
      <Text style={styles.memberName}>{member.name}</Text>
      <Text style={styles.memberRole}>{member.role}</Text>
    </View>
  </View>
);

const DetailsTab = () => {
  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      {/* HEADER CARD */}
      <View style={styles.headerCard}>
        <Text style={styles.projectTitle}>{projectData.title}</Text>

        <View style={styles.metaRow}>
          <Icon name="business" size={16} color="#64748b" />
          <Text style={styles.metaText}>{projectData.company}</Text>
        </View>

        <View
          style={[
            styles.statusChip,
            { backgroundColor: getStatusColor(projectData.status) + "20" },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(projectData.status) },
            ]}
          >
            {projectData.status}
          </Text>
        </View>
      </View>

      {/* DETAILS */}
      <SectionCard title="Project Details">
        <InfoRow icon="code" label="Technology" value={projectData.tech} />
        <InfoRow icon="person" label="Client" value={projectData.client} />
        <InfoRow icon="event" label="Start Date" value={projectData.startDate} />
        <InfoRow
          icon="event-available"
          label="End Date"
          value={projectData.endDate}
        />
        <InfoRow icon="group" label="Team Size" value={projectData.teamSize} />
        <InfoRow
          icon="attach-money"
          label="Budget"
          value={projectData.budget}
        />
      </SectionCard>

      {/* 👇 NEW TEAM MEMBERS SECTION */}
      <SectionCard title="Team Members">
        {teamMembers.map((member) => (
          <MemberCard key={member.id} member={member} />
        ))}
      </SectionCard>

      {/* DESCRIPTION */}
      <SectionCard title="Description">
        <Text style={styles.description}>{projectData.description}</Text>
      </SectionCard>
    </ScrollView>
  );
};

export default DetailsTab;

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#f6f7fb",
    padding: wp(3),
  },

  headerCard: {
    backgroundColor: "#fff",
    padding: wp(4),
    borderRadius: wp(4),
    marginBottom: hp(2),
    elevation: 3,
  },

  projectTitle: {
    fontSize: wp(5),
    fontWeight: "800",
    color: "#111",
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(0.8),
    gap: 6,
  },

  metaText: {
    color: "#64748b",
    fontSize: wp(3.2),
  },

  statusChip: {
    alignSelf: "flex-start",
    marginTop: hp(1.2),
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: 20,
  },

  statusText: {
    fontSize: wp(3),
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#fff",
    padding: wp(4),
    borderRadius: wp(4),
    marginBottom: hp(0.5),
    elevation: 2,
  },
  sectionTitle: {
    fontSize: wp(4),
    fontWeight: "700",
    marginBottom: hp(1.5),
    color: "#0f172a",
  },

  row: {
    flexDirection: "row",
    marginBottom: hp(1.5),
    alignItems: "flex-start",
  },

  iconBox: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(2),
    backgroundColor: "#eef2ff",
    justifyContent: "center",
    alignItems: "center",
  },

  rowText: {
    marginLeft: wp(3),
    flex: 1,
  },

  label: {
    fontSize: wp(3),
    color: "#94a3b8",
    fontWeight: "600",
  },

  value: {
    fontSize: wp(3.6),
    color: "#1e293b",
    marginTop: 2,
    fontWeight: "600",
  },

  description: {
    fontSize: wp(3.5),
    color: "#475569",
    lineHeight: 22,
  },

  // 👇 NEW STYLES FOR TEAM UI
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp(1),
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },

  avatar: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: "#4f46e5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(3),
  },

  avatarText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: wp(3.5),
  },

  memberInfo: {
    flex: 1,
  },

  memberName: {
    fontSize: wp(3.6),
    fontWeight: "700",
    color: "#0f172a",
  },

  memberRole: {
    fontSize: wp(3),
    color: "#64748b",
    marginTop: 2,
  },
});