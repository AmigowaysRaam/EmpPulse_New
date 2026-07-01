import { useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

const dashboardStats = [
  {
    id: 1,
    title: "Projects",
    value: "25",
    icon: "folder",
    color: "#4F46E5",
    status: "all",
  },
  {
    id: 2,
    title: "Completed",
    value: "18",
    icon: "check-circle",
    color: "#22C55E",
    status: "completed",
  },
  {
    id: 3,
    title: "Ongoing",
    value: "05",
    icon: "pending-actions",
    color: "#F59E0B",
    status: "ongoing",
  },
  {
    id: 4,
    title: "Clients",
    value: "12",
    icon: "groups",
    color: "#06B6D4",
    status: "clients",
  },
];

const ProjectDashboard = () => {
  const navigation = useNavigation();

  const onPressCard = (item) => {
    navigation.navigate("ProjectListScreen", {
      status: item.status,
      title: item.title,
    });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Project Dashboard</Text>

      <View style={styles.row}>
        {dashboardStats.map((item) => (
          <Pressable
            key={item.id}
            style={styles.item}
            onPress={() => onPressCard(item)}
            android_ripple={{ color: "#E5E7EB", borderless: true }}
          >
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: item.color },
              ]}
            >
              <Icon
                name={item.icon}
                size={wp(5)}
                color="#FFF"
              />
            </View>

            <Text style={styles.value}>{item.value}</Text>

            <Text style={styles.label}>{item.title}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

export default ProjectDashboard;

const styles = StyleSheet.create({
  card: {
    width: wp(94),
    alignSelf: "center",
    marginTop: hp(2),
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: hp(2),
    paddingHorizontal: wp(3),
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  title: {
    fontSize: wp(4.3),
    fontFamily: "Poppins_600SemiBold",
    color: "#222",
    marginBottom: hp(2),
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  item: {
    width: wp(20),
    alignItems: "center",
    paddingVertical: hp(0.8),
    borderRadius: 12,
  },

  iconContainer: {
    width: wp(11),
    height: wp(11),
    borderRadius: wp(5.5),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(0.8),
  },

  value: {
    fontSize: wp(4.8),
    fontFamily: "Poppins_700Bold",
    color: "#111827",
  },

  label: {
    fontSize: wp(2.8),
    color: "#6B7280",
    textAlign: "center",
    marginTop: 2,
  },
});