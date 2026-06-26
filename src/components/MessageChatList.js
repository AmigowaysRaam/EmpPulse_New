import messaging from "@react-native-firebase/messaging";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList, Image, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSelector } from "react-redux";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import AllEmployeeModal from "./AllEmployeeModal";
import ChatHeader from "./ChatHeader";
import { fetchData } from "./api/Api";

const MessageChatList = () => {

  const [searchText, setSearchText] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [ShowAllEmp, setShowAllEmp] = useState(false);
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [chatData, setChatData] = useState([]);
  const profileDetails = useSelector(
    (state) => state?.auth?.profileDetails?.data
  );

  useFocusEffect(
    useCallback(() => {
      getGetMessageList();
      return () => {
      };
    }, [])
  );
  const getGetMessageList = async () => {
    try {
      const response = await fetchData("chat-dm-list", "POST", {
        companyId: profileDetails?.companyId,
        userId: profileDetails?.id,
        limit: 100, page: 1,
        search: "",
        // usertype: "company",
      });
      // Alert.alert('', JSON.stringify(response.conversations, null, 2))
      if (response?.success) {
        const formattedData = response.conversations.map((conversation) => {
          const otherMember = conversation.members.find(
            (member) => member._id !== "6a15b4c2d8b58832cb004185"
          );
          return {
            id: conversation._id,
            conversationId: conversation._id,
            type:
              conversation.type == "group"
                ? "Group"
                : "Personal",
            name: otherMember?.name || "Unknown",
            message:
              otherMember?.designation ||
              otherMember?.role ||
              "Start Conversation",
            time: new Date(
              conversation.updatedAt
            ).toLocaleDateString(),
            unread: 0,
            avatar: otherMember?.photoUrl
              ? `YOUR_IMAGE_BASE_URL${otherMember.photoUrl}`
              : "https://i.pravatar.cc/150?img=1",

            online: otherMember?.online || false,
            memberData: otherMember,
          };
        });
        setChatData(formattedData);
      }
    } catch (err) {
      console.log("Employee List Error:", err);
    }
  };
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await getGetMessageList();
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
    }
  };
  const filters = ["All", "Unread", "Groups"];
  useEffect(() => {
    const unsubscribeOnMessage = messaging().onMessage(async (notification) => {
      console.log("🔔 Foreground notification received");
      onRefresh()
    });
    return () => {
      unsubscribeOnMessage();
    };
  }, []);

  const filteredChats = useMemo(() => {
    let data = [...chatData];

    if (selectedFilter === "Unread") {
      data = data.filter((item) => item.unread > 0);
    }
    if (selectedFilter == "Groups") {
      data = data.filter((item) => item.type === "Group");
    }
    if (searchText.trim()) {
      data = data.filter(
        (item) =>
          item.name.toLowerCase().includes(searchText.toLowerCase()) ||
          item.message.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    return data;
  }, [chatData, searchText, selectedFilter]);
  // GroupChatScreen
  const renderItem = ({ item }) => (
    <TouchableOpacity

      activeOpacity={0.8}
      style={styles.chatItem}
      onPress={() =>
        item?.type == 'Group'
          ? navigation?.navigate('GroupChatScreen', { item })
          : navigation?.navigate('ChatConvoScreen', { item })
      }
    >
      <View style={styles.avatarContainer}>
        <Image
          source={{
            uri:
              item.avatar ||
              "https://i.pravatar.cc/150?img=4",
          }}
          style={styles.avatar}
        />
        {item.online && <View style={styles.onlineDot} />}
      </View>
      <View style={styles.chatContent}>
        <View style={styles.topRow}>
          <Text style={styles.name}>{item.name}</Text>
          <Text
            style={[
              styles.time,
              item.unread > 0 && styles.unreadTime,
            ]}
          >
            {item.time}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <Text numberOfLines={1} style={styles.message}>
            {item.message}
          </Text>
          {item.unread > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {item.unread}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity >
  );

  const renderFilter = (item) => (
    <TouchableOpacity
      key={item}
      onPress={() => setSelectedFilter(item)}
      style={[
        styles.filterChip,
        selectedFilter === item &&
        styles.activeFilterChip,
      ]}
    >
      <Text
        style={[
          styles.filterText,
          selectedFilter === item &&
          styles.activeFilterText,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );
  return (
    <View style={styles.container}>
      <ChatHeader
        title="Chat"
        rightIconName="add-circle"
        showBackButton={false}
        onRightIconPress={() => navigation?.navigate("CreateGroupScreen")}
      />
      <AllEmployeeModal
        visible={false}
      />
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={22}
          color="#777"
        />
        <TextInput
          placeholder="Search chats..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />
      </View>
      <View style={styles.filterContainer}>
        {filters.map(renderFilter)}
      </View>
      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{
            alignItems: "center",
            marginTop: wp(10)
          }}>
            <Ionicons
              name="chatbubble-outline"
              size={hp(10)}
              color={COLORS?.primary + "25"}
            />
            <Text style={{
              marginTop: hp(4),
              fontSize: wp(4),
              color: "#666", fontFamily: 'Poppins_600SemiBold'
            }}>
              No Chats
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => (
          <View style={styles.separator} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      />
      <TouchableOpacity
        onPress={() => setShowAllEmp(true)}
        style={styles.fab}>
        <Ionicons
          name="chatbubble"
          size={wp(7)}
          color="#fff"
        />
        <AllEmployeeModal
          visible={ShowAllEmp}
          onClose={() => setShowAllEmp(false)}
        />
      </TouchableOpacity>
    </View>
  );
};
export default MessageChatList;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", }, searchContainer: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#F4F5F7", marginHorizontal: wp(4),
    marginTop: hp(1), paddingHorizontal: wp(3), borderRadius: wp(8), height: hp(5),
  }, searchInput: {
    flex: 1, marginLeft: wp(2), fontSize: wp(3.2), color: "#000",
  }, filterContainer: {
    flexDirection: "row", marginTop: hp(1.5), marginBottom: hp(1), paddingHorizontal: wp(4),
  },
  filterChip: {
    paddingHorizontal: wp(4), paddingVertical: hp(0.8), borderRadius: wp(6),
    backgroundColor: "#F1F3F5", marginRight: wp(2),
  },
  activeFilterChip: { backgroundColor: COLORS.primary, }, filterText: { fontSize: wp(3.4), color: "#555", fontWeight: "500", },
  activeFilterText: { color: "#fff", }, chatItem: {
    flexDirection: "row", paddingHorizontal: wp(4), paddingVertical: hp(1.2), backgroundColor: "#fff",
  }, avatarContainer: { position: "relative", }, avatar: {
    width: wp(12), height: wp(12), borderRadius: wp(6), borderWidth: wp(0.5),
    borderColor: COLORS?.primary
  }, onlineDot: {
    position: "absolute", bottom: 2,
    right: 2, width: wp(3.5), height: wp(3.5), borderRadius: wp(2), backgroundColor: "#25D366", borderWidth: 2, borderColor: "#fff",
  }, chatContent: {
    flex: 1, marginLeft: wp(3), justifyContent: "center",
  }, topRow: { flexDirection: "row", justifyContent: "space-between", },
  bottomRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginTop: hp(0.4),
  }, name: {
    fontSize: wp(3), color: "#111", fontFamily: "Poppins_400Regular"
  }, message: {
    flex: 1, color: "#666", fontSize: wp(2.8), marginRight: wp(2), fontFamily: "Poppins_400Regular"
  }, time: { fontSize: wp(3), color: "#888", }, unreadTime: {
    color: COLORS.primary, fontWeight: "600",
  }, badge: {
    minWidth: wp(5), height: wp(5), borderRadius: wp(3), backgroundColor: COLORS.primary,
    justifyContent: "center", alignItems: "center", paddingHorizontal: wp(1),
  },
  badgeText: {
    color: "#fff", fontWeight: "700", fontSize: wp(3),
  }, separator: {
    height: 1, backgroundColor: "#F1F1F1",
    marginLeft: wp(20),
  }, fab: {
    position: "absolute", bottom: hp(3), right: wp(5), width: wp(14),
    height: wp(14), borderRadius: wp(7), backgroundColor: COLORS.primary, justifyContent: "center",
    alignItems: "center", elevation: 8,
  },
});