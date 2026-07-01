import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
    FlatList, Pressable, StyleSheet, Text, TextInput, View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import CommonHeader from "./CommonHeader";
const PROJECTS = [
  {
    id: "1",
    name: "ERP Management",
    technology: "React Native",
    status: "completed",
    client: "ABC Technologies",
    manager: "John Mathew",
    teamSize: 8,
    startDate: "12 Jan 2024",
    endDate: "30 Jul 2024",
    priority: "High",
    progress: "100%",
    location: "Kochi",
    description: "Enterprise resource planning application.",
  },
  {
    id: "2",
    name: "Hospital Management",
    technology: "Flutter",
    status: "ongoing",
    client: "City Hospital",
    manager: "Anita Joseph",
    teamSize: 6,
    startDate: "15 Mar 2025",
    endDate: "30 Dec 2025",
    priority: "Medium",
    progress: "65%",
    location: "Trivandrum",
    description: "Hospital administration and patient management.",
  },
  {
    id: "3",
    name: "CRM System",
    technology: "React",
    status: "completed",
    client: "Global Solutions",
    manager: "David Paul",
    teamSize: 5,
    startDate: "10 Jun 2023",
    endDate: "20 Nov 2023",
    priority: "High",
    progress: "100%",
    location: "Bangalore",
    description: "Customer relationship management platform.",
  },
  {
    id: "4",
    name: "E-Commerce",
    technology: "Node.js",
    status: "ongoing",
    client: "Shop World",
    manager: "Rahul Nair",
    teamSize: 10,
    startDate: "01 Feb 2025",
    endDate: "31 Jan 2026",
    priority: "High",
    progress: "48%",
    location: "Chennai",
    description: "Multi-vendor e-commerce platform.",
  },
  {
    id: "5",
    name: "Inventory System",
    technology: "Laravel",
    status: "completed",
    client: "Prime Industries",
    manager: "Neethu S",
    teamSize: 4,
    startDate: "18 Jan 2024",
    endDate: "12 Jun 2024",
    priority: "Low",
    progress: "100%",
    location: "Hyderabad",
    description: "Warehouse inventory management solution.",
  },
];
const FILTERS = ["all", "completed", "ongoing"];
const ProjectListScreen = () => {
  const route = useRoute();
    const navigation = useNavigation();
  const [search, setSearch] = useState(route.params?.search || "");
  const [status, setStatus] = useState(route.params?.status || "all");
  const [projects, setProjects] = useState(PROJECTS);

  useEffect(() => {
    filterProjects(search, status);
  }, [search, status]);

  const filterProjects = (text, filter) => {
    let data = PROJECTS;

    if (filter !== "all") {
      data = data.filter(item => item.status === filter);
    }

    if (text.length > 0) {
      data = data.filter(item =>
        item.name.toLowerCase().includes(text.toLowerCase())
      );
    }

    setProjects(data);
  };

const renderItem = ({ item }) => (
  <Pressable onPress={() => navigation.navigate("ProjectDetailsScreen", { project: item })} style={styles.card}>

    {/* Icon */}
    <View style={styles.icon}>
      <Icon name="folder" color={COLORS.primary} size={28} />
    </View>

    {/* Content */}
    <View style={{ flex: 1 }}>

      {/* Title */}
      <Text style={styles.title} numberOfLines={1}>
        {item.name}
      </Text>

      {/* Row 1: Technology + Client */}
      <View style={styles.row}>
        <Icon name="code" size={14} color="#666" />
        <Text style={styles.text}>{item.technology}</Text>

        <Text style={styles.dot}>•</Text>

        <Icon name="business" size={14} color="#666" />
        <Text style={styles.text}>{item.client}</Text>
      </View>

      {/* Row 2: Manager + Team */}
      <View style={styles.row}>
        <Icon name="person" size={14} color="#666" />
        <Text style={styles.text}>{item.manager}</Text>

        <Text style={styles.dot}>•</Text>

        <Icon name="groups" size={14} color="#666" />
        <Text style={styles.text}>{item.teamSize} members</Text>
      </View>

      {/* Row 3: Dates */}
      <View style={styles.row}>
        <Icon name="event" size={14} color="#666" />
        <Text style={styles.text}>
          {item.startDate} → {item.endDate}
        </Text>
      </View>

      {/* Bottom row */}
      <View style={styles.bottomRow}>

        {/* Progress */}
        <View style={styles.progressBox}>
          <Icon name="trending-up" size={14} color="#4CAF50" />
          <Text style={styles.progressText}>{item.progress}</Text>
        </View>

        {/* Priority */}
        <View
          style={[
            styles.priority,
            {
              backgroundColor:
                item.priority === "High"
                  ? "#FEE2E2"
                  : item.priority === "Medium"
                  ? "#FEF3C7"
                  : "#DCFCE7",
            },
          ]}
        >
          <Text
            style={{
              fontSize: wp(3),
              fontWeight: "600",
              color:
                item.priority === "High"
                  ? "#DC2626"
                  : item.priority === "Medium"
                  ? "#B45309"
                  : "#15803D",
            }}
          >
            {item.priority}
          </Text>
        </View>

        {/* Status */}
        <View
          style={[
            styles.status,
            {
              backgroundColor:
                item.status === "completed"
                  ? "#DCFCE7"
                  : "#FEF3C7",
            },
          ]}
        >
          <Text
            style={{
              color:
                item.status === "completed"
                  ? "#15803D"
                  : "#B45309",
              fontSize: wp(3),
              fontWeight: "700",
            }}
          >
            {item.status.toUpperCase()}
          </Text>
        </View>

        <Icon name="chevron-right" size={24} color="#999" />
      </View>

    </View>
  </Pressable>
);

  return (
       <View style={{flex: 1, backgroundColor: "#fff"}}>
         <CommonHeader title="Project"/>

    <View style={styles.container}>

      <View style={styles.search}>
        <Icon
          name="search"
          size={wp(5)}
          color="#777"
        />

        <TextInput
          placeholder="Search Project..."
          value={search}
          onChangeText={setSearch}
          style={styles.input}
          placeholderTextColor="#777"
        />
      </View>

      {/* Filters */}

      <View style={styles.filterRow}>
        {FILTERS.map(item => (
          <Pressable
            key={item}
            onPress={() => setStatus(item)}
            style={[
              styles.filterButton,
              status === item && {
                backgroundColor: COLORS.primary,
              },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                status === item && {
                  color: "#FFF",
                },
              ]}
            >
              {item.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Project List */}

      <FlatList
        data={projects}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingBottom: hp(3),
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Icon
              name="folder-off"
              size={60}
              color="#CCC"
            />

            <Text style={styles.emptyText}>
              No Projects Found
            </Text>
          </View>
        )}
      />
    </View>
        </View>
  );
};

export default ProjectListScreen;

const styles = StyleSheet.create({
    info: {
  marginTop: 3,
  color: "#555",
  fontSize: wp(3),
},

description: {
  marginTop: 6,
  color: "#666",
  fontSize: wp(3),
  lineHeight: 18,
},
row: {
  flexDirection: "row",
  alignItems: "center",
  flexWrap: "wrap",
  marginTop: 4,
},

text: {
  marginLeft: 4,
  fontSize: wp(3),
  color: "#555",
},

dot: {
  marginHorizontal: 6,
  color: "#aaa",
},

bottomRow: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 10,
  flexWrap: "wrap",
  gap: 6,
},

progressBox: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#EEF7FF",
  paddingHorizontal: wp(2.5),
  paddingVertical: hp(0.3),
  borderRadius: wp(5),
},

progressText: {
  marginLeft: 4,
  fontSize: wp(2.8),
  fontWeight: "600",
  color: "#333",
},

priority: {
  paddingHorizontal: wp(3),
  paddingVertical: hp(0.3),
  borderRadius: wp(5),
},
  container: {    flex: 1,    backgroundColor: "#F5F7FA",    padding: wp(4),  },  search: {    flexDirection: "row",
    alignItems: "center",    backgroundColor: "#FFF",
    borderRadius: wp(1),    paddingHorizontal: 12,    height: hp(5),    marginBottom: hp(2),    elevation: 2,
  },  input: {    flex: 1,    marginLeft: 8,    fontSize: wp(4),  },  filterRow: {    flexDirection: "row",
    marginBottom: hp(2),  },  filterButton: {    paddingHorizontal: wp(4),    paddingVertical: wp(1),
    borderRadius: wp(10),    backgroundColor: "#FFF",    marginRight: 10,    elevation: 2,
  },
  filterText: {    color: "#444",    fontWeight: "600",    fontSize: wp(3),  },
  card: {   flexDirection: "row",    backgroundColor: "#FFF",   borderRadius: wp(1),    padding: wp(2),
    marginBottom: hp(1.5),    alignItems: "center",    elevation: 2,  },  icon: {    width: wp(15),    height: wp(15),    borderRadius: wp(10),
    backgroundColor: "#EEF2FF",    justifyContent: "center",
    alignItems: "center",    marginRight: 15,  },  title: {    fontSize: wp(3),    fontWeight: "700",
    color: "#222",  },  tech: {    marginTop: 4,    color: "#666",    fontSize: wp(3.2),  },

  status: {    alignSelf: "flex-start",      borderRadius: wp(10),    paddingHorizontal: wp(4),
    paddingVertical: wp(1),  },  empty: {   marginTop: hp(10),    alignItems: "center",  },  emptyText: {    marginTop: 10,    color: "#777",    fontSize: wp(3),  },
});