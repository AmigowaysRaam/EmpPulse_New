import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import CommonHeader from "./CommonHeader";

const GroupChatInfoScreen = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [muted, setMuted] = useState(false);

  const profile = {
    name: "Study Group 💬",
    about: "Available",
    phone: "+91 9876543210",
    mediaCount: 248,
    starredMessages: 12,
    groupsInCommon: 4,
    avatar: "https://i.pravatar.cc/300?img=12",
  };

  const members = [
    {
      id: "1",
      name: "John Smith",
      role: "Admin",
      avatar: "https://i.pravatar.cc/300?img=1",
      online: true,
    },
    {
      id: "2",
      name: "Sarah Johnson",
      role: "Member",
      avatar: "https://i.pravatar.cc/300?img=2",
      online: false,
    },
    {
      id: "3",
      name: "Michael Lee",
      role: "Member",
      avatar: "https://i.pravatar.cc/300?img=3",
      online: true,
    },
    {
      id: "4",
      name: "Emma Watson",
      role: "Member",
      avatar: "https://i.pravatar.cc/300?img=4",
      online: false,
    },
  ];
  const MenuItem = ({
    icon,
    title,
    subtitle,
    onPress,
    color = "#54656F",
  }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.iconBubble}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle ? (
          <Text style={styles.menuSubtitle}>{subtitle}</Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#B0B0B0" />
    </TouchableOpacity>
  );
  const MemberItem = ({ item }) => (
    <Pressable
      onPress={() => {
        navigation?.navigate('ChatUserProfileScreen')
      }
      }
      style={styles.memberItem}>
      <View>
        <Image source={{ uri: item.avatar }} style={styles.memberAvatar} />
        {item.online && <View style={styles.onlineDot} />}
      </View>

      <View style={{ flex: 1, marginLeft: wp(3) }}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberRole}>{item.role}</Text>
      </View>

      <Ionicons name="chatbubble-outline" size={18} color="#54656F" />
    </Pressable>
  );

  const handleConfirmMute = () => {
    setMuted(true);
    setModalVisible(false);
  };

  const handleUnmute = () => {
    setMuted(false);
    setModalVisible(false);
  };

  return (
    <>
      <CommonHeader title="Group Info"
        onBackPress={() => navigation?.goBack()}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.headerBg} />

        <View style={styles.profileCard}>
          <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          <Text style={styles.name}>{profile.name}</Text>
        </View>

        {/* MENU */}
        <View style={styles.section}>
          <MenuItem
            icon="star-outline"
            title="Starred Messages"
            subtitle={`${profile.starredMessages} messages`}
            onPress={() => navigation.navigate("StarredMessagesScreen")}
          />

          <MenuItem
            icon="images-outline"
            title="Media, Links & Docs"
            subtitle={`${profile.mediaCount} items`}
            onPress={() => navigation.navigate("MediaSharedScreen")}
          />

          <MenuItem
            icon={muted ? "notifications" : "notifications-off-outline"}
            title={muted ? "Unmute Notifications" : "Mute Notifications"}
            subtitle={muted ? "Muted" : "Stop notifications"}
            onPress={() => setModalVisible(true)}
            color={muted ? "#25D366" : "#54656F"}
          />
        </View>

        {/* MEMBERS SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Members ({members.length})
            </Text>
          </View>

          <FlatList
            data={members}
            keyExtractor={(item) => item.id}
            renderItem={MemberItem}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      {/* MODAL */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {muted ? "Unmute Notifications?" : "Mute Notifications?"}
            </Text>

            <Text style={styles.modalText}>
              {muted
                ? "You will start receiving notifications again."
                : "You will no longer receive notifications from this chat."}
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.btn, styles.cancelBtn]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.confirmBtn]}
                onPress={muted ? handleUnmute : handleConfirmMute}
              >
                <Text style={styles.confirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default GroupChatInfoScreen;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },

  headerBg: {
    height: hp(10),
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: wp(8),
    borderBottomRightRadius: wp(8),
  },

  profileCard: {
    backgroundColor: "#fff",
    marginHorizontal: wp(4),
    marginTop: -hp(5),
    borderRadius: wp(5),
    alignItems: "center",
    paddingVertical: hp(3),
    elevation: 4,
  },

  avatar: {
    width: wp(22),
    height: wp(22),
    borderRadius: wp(11),
    marginTop: -hp(6),
    borderWidth: 3,
    borderColor: "#fff",
  },

  name: {
    fontSize: wp(5),
    color: "#111B21",
    marginTop: hp(1),
    fontFamily: "Poppins_400Regular"

  },

  phone: {
    fontSize: wp(3.5),
    color: "#667781",
    marginTop: 2,
  },

  section: {
    backgroundColor: "#fff",
    marginTop: hp(1.5),
    marginHorizontal: wp(4),
    borderRadius: wp(4),
    overflow: "hidden",
  },

  sectionHeader: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderBottomWidth: 0.5,
    borderBottomColor: "#EEE",
  },

  sectionTitle: {
    fontSize: wp(4),
    fontWeight: "700",
    color: "#111B21",
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderBottomWidth: 0.5,
    borderBottomColor: "#EEE",
    fontFamily: "Poppins_400Regular"

  },

  iconBubble: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: "#F2F4F7",
    alignItems: "center",
    justifyContent: "center",
  },

  menuContent: {
    flex: 1,
    marginLeft: wp(3),
  },

  menuTitle: {
    fontSize: wp(3.5),
    fontWeight: "600",
    color: "#111B21",
    fontFamily: "Poppins_400Regular",

  },

  menuSubtitle: {
    fontSize: wp(3.2),
    color: "#667781",
    marginTop: 2,
    fontFamily: "Poppins_400Regular",
  },

  /* MEMBERS */
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
  },

  memberAvatar: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(6),
  },

  memberName: {
    fontSize: wp(3),
    fontWeight: "600",
    color: "#111B21",
  },

  memberRole: {
    fontSize: wp(3.2),
    color: "#667781",
    marginTop: 2,
  },

  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#25D366",
    position: "absolute",
    bottom: 2,
    right: 2,
    borderWidth: 2,
    borderColor: "#fff",
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "82%",
    backgroundColor: "#fff",
    borderRadius: wp(4),
    padding: wp(5),
  },

  modalTitle: {
    fontSize: wp(4.5),
    color: "#111B21",
    marginBottom: hp(1),
    fontFamily: "Poppins_400Regular",

  },

  modalText: {
    fontSize: wp(3.6),
    color: "#667781",
    marginBottom: hp(2),
    fontFamily: "Poppins_400Regular",
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },

  btn: {
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    borderRadius: wp(2),
    marginLeft: wp(2),
  },

  cancelBtn: {
    backgroundColor: "#EEE",
  },

  confirmBtn: {
    backgroundColor: COLORS.primary,
  },

  cancelText: {
    color: "#333",
    fontWeight: "600",
    fontFamily: "Poppins_400Regular",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "600",
    fontFamily: "Poppins_400Regular",

  },
});