import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Image,
  Modal,
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

const ChatProfileScreen = () => {
  const navigation = useNavigation();

  const [modalVisible, setModalVisible] = useState(false);
  const [muted, setMuted] = useState(false);

  const profile = {
    name: "John Smith",
    about: "Available",
    phone: "+91 9876543210",
    mediaCount: 248,
    starredMessages: 12,
    groupsInCommon: 4,
    avatar: "https://i.pravatar.cc/300?img=12",
  };

  // ✅ Dummy groups list
  const groupsInCommonList = [
    { id: "1", name: "Family Group", members: 8 },
    { id: "2", name: "College Friends", members: 15 },
    { id: "3", name: "React Native Devs", members: 120 },
    { id: "4", name: "Weekend Plan", members: 6 },
  ];

  const MenuItem = ({ icon, title, subtitle, nav, onPress }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => {
        if (onPress) return onPress();
        if (nav) navigation?.navigate(nav);
      }}
    >
      <Ionicons name={icon} size={22} color="#54656F" />
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle ? (
          <Text style={styles.menuSubtitle}>{subtitle}</Text>
        ) : null}
      </View>

      <Ionicons name="chevron-forward" size={18} color="#999" />
    </TouchableOpacity>
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
      <CommonHeader title="Profile" />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBg} />

        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          <Image source={{ uri: profile.avatar }} style={styles.avatar} />

          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.phone}>{profile.phone}</Text>
          <Text style={styles.about}>
            {muted ? "Muted" : profile.about}
          </Text>
        </View>

        <View style={styles.section}>
          <MenuItem
            icon="star-outline"
            title="Starred Messages"
            subtitle={`${profile.starredMessages} messages`}
            nav="StarredMessagesScreen"
          />

          <MenuItem
            icon="image-outline"
            title="Medias Shared"
            subtitle={`${profile.mediaCount} files`}
            nav="MediaSharedScreen"
          />

          <MenuItem
            icon={muted ? "notifications" : "notifications-off-outline"}
            title={muted ? "Unmute Notifications" : "Mute Notifications"}
            subtitle={muted ? "Notifications are muted" : "Tap to mute"}
            onPress={() => setModalVisible(true)}
          />
        </View>

        {/* GROUPS IN COMMON */}
        <View style={styles.section}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupHeaderText}>Groups in Common</Text>
          </View>

          {groupsInCommonList.map((group) => (
            <View key={group.id} style={styles.groupItem}>
              <View style={styles.groupAvatar}>
                <Ionicons name="people" size={18} color="#fff" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.groupName}>{group.name}</Text>
                <Text style={styles.groupMembers}>
                  {group.members} members
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color="#999" />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* CONFIRM MODAL */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {muted ? "Unmute Notifications?" : "Mute Notifications?"}
            </Text>

            <Text style={styles.modalText}>
              {muted
                ? "You will start receiving notifications again."
                : "You will stop receiving notifications from this chat."}
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

export default ChatProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS?.primary + "12",
  },
  headerBg: {
    height: hp(12),
    backgroundColor: COLORS?.primary,
  },
  profileCard: {
    backgroundColor: "#fff",
    marginHorizontal: wp(4),
    marginTop: -hp(8),
    borderRadius: wp(5),
    alignItems: "center",
    paddingVertical: hp(3),
    paddingHorizontal: wp(5),
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
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
    fontWeight: "700",
    color: "#111B21",
    marginTop: hp(1),
  },
  phone: {
    fontSize: wp(3.6),
    color: "#667781",
    marginTop: 2,
  },
  about: {
    fontSize: wp(3.5),
    color: "#25D366",
    marginTop: 2,
  },
  section: {
    backgroundColor: "#fff",
    marginTop: hp(1.5),
    marginHorizontal: wp(4),
    borderRadius: wp(4),
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderBottomWidth: 0.5,
    borderBottomColor: "#EEE",
  },
  menuContent: {
    flex: 1,
    marginLeft: wp(3),
  },
  menuTitle: {
    fontSize: wp(4),
    fontWeight: "500",
    color: "#111B21",
  },
  menuSubtitle: {
    fontSize: wp(3.2),
    color: "#667781",
    marginTop: 2,
  },

  groupHeader: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderBottomWidth: 0.5,
    borderBottomColor: "#EEE",
  },
  groupHeaderText: {
    fontSize: wp(4),
    fontWeight: "600",
    color: "#111B21",
  },
  groupItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderBottomWidth: 0.5,
    borderBottomColor: "#EEE",
  },
  groupAvatar: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp(3),
  },
  groupName: {
    fontSize: wp(3.8),
    fontWeight: "500",
    color: "#111B21",
  },
  groupMembers: {
    fontSize: wp(3.2),
    color: "#667781",
    marginTop: 2,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: wp(4),
    padding: wp(5),
  },
  modalTitle: {
    fontSize: wp(4.5),
    fontWeight: "700",
    color: "#111B21",
    marginBottom: hp(1),
  },
  modalText: {
    fontSize: wp(3.6),
    color: "#667781",
    marginBottom: hp(2),
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
  },
  confirmText: {
    color: "#fff",
    fontWeight: "600",
  },
});