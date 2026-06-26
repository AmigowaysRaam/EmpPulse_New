import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert, Clipboard, FlatList, Image, ImageBackground, Keyboard, KeyboardAvoidingView,
  Modal, Platform, Pressable, RefreshControl, StyleSheet, Text, TouchableOpacity, View
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSelector } from "react-redux";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { fetchData } from "./api/Api";
import ChatInputBar from "./ChatInput";
import ChatMessageItem from "./ChatMessageItem";

const ChatConvoScreen = ({ route }) => {

  const { item } = route?.params || {};
  const navigation = useNavigation();
  const flatListRef = useRef();
  const swipeRefs = useRef(new Map());
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const profileDetails = useSelector(
    (state) => state?.auth?.profileDetails?.data
  );

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardOpen(true);
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardOpen(false);
        setKeyboardHeight(0);
      }
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    getMessagesList();
  }, []);

  const getMessagesList = async () => {
    try {
      const response = await fetchData("chat-messages", "POST", {
        companyId: profileDetails?.companyId,
        userId: profileDetails?.id,
        limit: 100, page: 1, search: "",
        conversationId: item?.conversationId
      });
      if (response?.success) {
        // console.log("Messages", response);
        const formattedMessages = response.messages.map((msg) => ({
          id: msg._id,
          text: msg.text || "",
          sender:
            msg.status === "sent"
              ? "me"
              : "them",
          senderName: msg.senderName,
          time: new Date(msg.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          reaction: null,
          starred: false,
          replyTo: null,
          attachment: msg.attachment,
          status: msg.status,
        }));

        setMessages(formattedMessages);

        setTimeout(() => {
          flatListRef.current?.scrollToEnd({
            animated: false,
          });
        }, 200);
      }
    } catch (err) {
      console.log("Message Error", err);
    }
  };
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [activeReactionMsg, setActiveReactionMsg] = useState(null);
  const messageInputRef = useRef(null);
  const toggleSelectMessage = (msg) => {
    if (!msg?.id) return;
    setSelectedMessages((prev) => {
      const exists = prev.find((m) => m.id === msg.id);
      let updated;
      if (exists) {
        updated = prev.filter((m) => m.id !== msg.id);
      } else {
        updated = [...prev, msg];
      }
      setSelectionMode(updated.length > 0);
      return updated;
    });
  };

  const [selectedMsg, setSelectedMsg] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  // useEffect(() => {
  //   if (messages.length) {
  //     requestAnimationFrame(() => {
  //       flatListRef.current?.scrollToEnd({
  //         animated: true,
  //       });
  //     });
  //   }
  // }, [keyboardHeight]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      getMessagesList();
      // API call or refresh logic
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
    }
  };

  const sendMessage = async (data) => {
    try {
      const text = inputText.trim();
      if (!text && !attachment) return;
      const payload = {
        companyId: profileDetails?.companyId,
        userId: profileDetails?.id,
        conversationId: item?.conversationId,
        text,
        // type: attachment ? attachment.type : "text",
        // attachment,
        // replyMessageId: localMessage.replyTo?.id || null,
      };
      const response = await fetchData(
        "chat-send-message", "POST", payload
      );
      console.log("SEND RESPONSE =>", response);
      if (response?.success) {
        getMessagesList()
        setInputText('')
        setReplyTo(null)
      } else {
        Alert.alert("Error", response?.message || "Failed to send message");
      }
    } catch (error) {
      console.log("SEND ERROR", error);
      Alert.alert("Error", "Unable to send message.");
    }
    finally {
      setInputText('')
    }
  };

  const addReaction = (emoji) => {
    if (!activeReactionMsg) return;
    setMessages((prev) =>
      prev.map((m) =>
        m.id === activeReactionMsg.id
          ? { ...m, reaction: emoji }
          : m
      )
    );
    setActiveReactionMsg(null);
  };


  const toggleStar = () => {
    if (!selectedMsg?.id) return;
    setMessages(prev =>
      prev.map(m =>
        m.id === selectedMsg.id
          ? { ...m, starred: !m.starred }
          : m
      )
    );
    setShowActionModal(false);
    setSelectedMsg(null);
  };

  const deleteMsg = () => {
    if (!selectedMsg?.id) return;
    setMessages(prev => prev.filter(m => m.id !== selectedMsg.id));
    setShowActionModal(false);
    setSelectedMsg(null);
  };

  const copyMsg = () => {
    if (!selectedMsg?.text) return;
    Clipboard.setString(selectedMsg.text);
    setShowActionModal(false);
    setSelectedMsg(null);
  };

  const editMsg = () => {
    if (!selectedMsg?.id) return;

    setInputText(selectedMsg.text);

    setMessages(prev =>
      prev.map(m =>
        m.id === selectedMsg.id
          ? { ...m, text: selectedMsg.text, isEditing: true }
          : m
      )
    );
    setShowActionModal(false);
    setSelectedMsg(null);
  };
  const renderItem = ({ item }) => (
    <ChatMessageItem
      item={item}
      selectionMode={selectionMode}
      selectedMessages={selectedMessages}
      toggleSelectMessage={toggleSelectMessage}
      setSelectedMsg={setSelectedMsg}
      setShowActionModal={setShowActionModal}
      setReplyTo={setReplyTo}
      swipeRefs={swipeRefs}
      messageInputRef={messageInputRef}
    />
  );
  const clearSelection = () => {
    setSelectedMessages([]);
    setSelectionMode(false);
  };

  const starSelected = () => {
    const ids = selectedMessages.map(m => m.id);
    setMessages(prev =>
      prev.map(m =>
        ids.includes(m.id) ? { ...m, starred: !m.starred } : m
      )
    );

    clearSelection();
  };
  return (
    <KeyboardAvoidingView style={{ flex: 1 }}>
      <View style={styles.container}>
        {selectionMode ? (
          <View style={styles.selectionHeader}>
            <TouchableOpacity onPress={clearSelection}>
              <Ionicons name="close" size={24} />
            </TouchableOpacity>

            <Text style={{ flex: 1, textAlign: "center" }}>
              {selectedMessages.length} selected
            </Text>

            <TouchableOpacity style={{ marginHorizontal: wp(2) }} onPress={starSelected}>
              <Ionicons name="star-outline" size={wp(6)} />
            </TouchableOpacity>

            <TouchableOpacity style={{ marginHorizontal: wp(2) }} onPress={() => Alert.alert("Forward")}>
              <Ionicons name="arrow-redo-outline" size={wp(6)} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.header}>
            <Ionicons onPress={() => navigation.goBack()} name="chevron-back" size={wp(7)} />

            <Pressable
              style={{ flexDirection: "row", flex: 1 }}
              onPress={() => navigation.navigate("ChatProfileScreen")}
            >
              <Image source={{ uri: item?.avatar }} style={styles.avatar} />
              <View>
                <Text style={styles.name}>{item?.name}</Text>
                <Text style={styles.lastSeen}>last seen today</Text>
              </View>
            </Pressable>
          </View>
        )}
        {/* chatBg.jpg */}
        <ImageBackground
          source={require('../../assets/chatBg.jpg')}
          resizeMode="cover"
          style={styles.chatBackground}
          imageStyle={styles.chatBgImage}
        >
          <View style={{}}>
            <FlatList
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[COLORS.primary]}
                  tintColor={COLORS.primary}
                />
              }
              ListEmptyComponent={
                <>
                  <Text style={{
                    alignSelf: "center",
                    padding: wp(2), backgroundColor: COLORS?.primary + "12",
                    paddingHorizontal: wp(6), borderRadius: wp(2)
                  }}>
                    No chats
                  </Text>
                </>
              }
              ref={flatListRef}
              data={messages}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: false })
              }
              contentContainerStyle={{
                padding: wp(3),
                paddingBottom: hp(12) + keyboardHeight,
              }}
            />
          </View>
        </ImageBackground>
        <View style={[styles.inputContainer, { bottom: keyboardHeight, zIndex: 999, elevation: 10 }]}>
          {replyTo && (
            <View style={styles.replyBar}>
              <View style={styles.replyBarLine} />

              <View style={{ flex: 1 }}>
                {/* TEXT */}
                {!!replyTo.text && (
                  <Text numberOfLines={1} style={styles.replyBarText}>
                    {replyTo.text}
                  </Text>
                )}
                {/* ATTACHMENT PREVIEW */}
                {replyTo.attachment && (
                  <Text numberOfLines={1} style={styles.replyBarSubText}>
                    {replyTo.attachment.type === "image" && "📷 Photo"}
                    {replyTo.attachment.type === "video" && "🎥 Video"}
                    {replyTo.attachment.type === "audio" && "🎤 Voice Message"}
                    {replyTo.attachment.type === "document" &&
                      (replyTo.attachment.name || "📄 Document")}
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={() => setReplyTo(null)}>
                <Ionicons name="close" size={20} />
              </TouchableOpacity>
            </View>
          )}
          <ChatInputBar inputText={inputText} setInputText={setInputText} onSend={sendMessage}
            messageInputRef={messageInputRef} />
        </View>
        <Modal
          visible={showActionModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowActionModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => {
              setShowActionModal(false);
              setSelectedMsg(null);
            }}
          >
            <View style={styles.actionBox}>
              <ActionBtn icon="create-outline" label="Edit" onPress={editMsg} />
              <ActionBtn icon="trash-outline" label="Delete" onPress={deleteMsg} />
              <ActionBtn icon="star-outline" label="Star" onPress={toggleStar} />
              <ActionBtn icon="copy-outline" label="Copy" onPress={copyMsg} />

            </View>
          </TouchableOpacity>
        </Modal>

      </View>
    </KeyboardAvoidingView>
  );
};
const ActionBtn = ({ icon, label, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.actionRow}>
    <Ionicons name={icon} size={20} color="#333" />
    <Text style={styles.actionText}>{label}</Text>
  </TouchableOpacity>
);

export default ChatConvoScreen;

const styles = StyleSheet.create({
  chatBackground: {
    flex: 1,
  }, replyBarSubText: { fontSize: wp(3), color: "#666", marginTop: 2, fontWeight: "500", }, chatBgImage: {
    opacity: 0.08,
  }, container: { flex: 1, backgroundColor: COLORS.primary + "12", }, header: {
    height: hp(8), flexDirection: "row", alignItems: "center", paddingHorizontal: wp(4), borderBottomWidth: 0.5, borderColor: COLORS.primary + "22",
  }, avatar: {
    width: wp(10), height: wp(10), borderRadius: wp(5), borderWidth: wp(0.4), borderColor: COLORS.primary, marginHorizontal: wp(2),
  }, name: { fontSize: wp(3.8), fontWeight: "600", }, lastSeen: { fontSize: wp(2.8), color: "#777", }, selectionHeader: {
    height: hp(8), flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: wp(3), backgroundColor: "#fff",
  }, inputContainer: {
    position: "absolute", left: 0, right: 0, backgroundColor: "#fff", borderTopWidth: 1, borderColor: "#eee",
  }, replyBar: {
    flexDirection: "row", alignItems: "center", padding: wp(2), paddingVertical: wp(4), backgroundColor: "#f1f1f1",
  }, replyBarLine: { width: 4, height: "100%", backgroundColor: COLORS.primary, marginRight: wp(2), borderRadius: 2, }, replyBarText: { fontSize: wp(3.2), color: "#111", },
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "center", alignItems: "center",
  }, actionBox: {
    width: wp(60), backgroundColor: "#fff", borderRadius: wp(4), paddingVertical: wp(2), elevation: 10,
  }, actionRow: { flexDirection: "row", alignItems: "center", padding: wp(3), borderBottomWidth: 0.5, borderColor: "#eee", }, actionText: {
    marginLeft: wp(3), fontSize: wp(3.5), color: "#333",
  },
});