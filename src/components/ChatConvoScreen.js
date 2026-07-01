import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Clipboard,
  FlatList,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { BASE_URL, fetchData } from "./api/Api";
import ChatInputBar from "./ChatInput";
import ChatMessageItem from "./ChatMessageItem";
import DeleteMessagesButton from "./DeleteButton";

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
    (state) => state?.auth?.profileDetails?.data,
  );

  const socketRef = useRef(null);
  const initialized = useRef(false);
  useFocusEffect(
    useCallback(() => {
      const socket = io("https://amigoways.org", {
        path: "/socket.io",
        transports: ["polling", "websocket"],
        reconnection: true,
      });
      socketRef.current = socket;
      socket.on("connect", () => {
        console.log("✅ Connected:", socket.id);
        //   console.log("✅ Socket connected:", socket.id);
        socket.emit("join_user", profileDetails?.id);
        socket.emit("join_room", item?.conversationId);
      });
      socket.on("receive_message", (data) => {
        // console.log("📩 Message:", data);
        const formatted = {
          id: data._id,
          text: data.text || "",
          sender: data.senderId === profileDetails?.id ? "me" : "them",
          senderName: data.senderName,
          time: new Date(data.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          attachment: data.attachment,
          status: data.status,
        };
        setMessages((prev) => {
          // avoid duplicates
          const exists = prev.some((m) => m.id === formatted.id);
          if (exists) return prev;
          return [...prev, formatted];
        });
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({
            animated: false,
          });
        }, 100);

        // auto scroll
        requestAnimationFrame(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        });
      });

      socket.on("disconnect", (reason) => {
        console.log("🔌 Disconnected:", reason);
      });
      return () => {
        console.log("🚪 Screen unfocused → disconnect socket");
        socket.disconnect();
        socketRef.current = null;
      };
    }, []),
  );

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardOpen(true);
        setKeyboardHeight(e.endCoordinates.height);
      },
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardOpen(false);
        setKeyboardHeight(0);
      },
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    getMessagesList();
  }, []);

  const emojis = ["❤️", "😂", "😮", "😢"];

  const getMessagesList = async () => {
    try {
      const response = await fetchData("chat-messages", "POST", {
        companyId: profileDetails?.companyId,
        userId: profileDetails?.id,
        limit: 100,
        page: 1,
        search: "",
        conversationId: item?.conversationId,
      });
      if (response?.success) {
        console.log("Messages", JSON.stringify(response.messages, null, 2));
        const formattedMessages = response.messages.map((msg) => ({
          id: msg._id,
          text: msg.text || "",
          reaction: msg.reactions || "",
          sender: msg.senderId == profileDetails?.id ? "me" : "them",
          senderName: msg.senderName,
          time: new Date(msg.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          starred: false,
          replyTo: null,
          attachment: msg.attachment,
          status: msg.senderId === profileDetails?.id ? "sent" : "them",
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
  const isSent = selectedMsg?.senderId === profileDetails?.id;
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

  const sendMessage = async (props) => {
    // Sending message: {"type": "image", "uri": "file:///data/user/0/com.emppulse/cache/ImagePicker/2a35d61e-3f3d-4b58-ba72-b802dc5cecd3.jpeg"}
    const text = inputText.trim();
    // if (!text) return;
    const tempId = Date.now().toString();
    // Optimistic message
    // const optimisticMsg = {
    //   id: tempId,
    //   text,
    //   sender: "me",
    //   time: new Date().toLocaleTimeString(),
    //   status: "sending",
    // };
    // setMessages((prev) => [...prev, optimisticMsg]);
    setInputText("");

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("companyId", profileDetails?.companyId);
      formData.append("userId", profileDetails?.id);
      formData.append("conversationId", item?.conversationId);
      formData.append("text", text);

      // Attach image
      if (props?.uri) {
        formData.append("file", {
          uri: props.uri,
          name: props.uri.split("/").pop(), // 2a35d61e-3f3d-4b58-ba72-b802dc5cecd3.jpeg
          type:
            props.type === "image" ? "image/jpeg" : "application/octet-stream",
        });
      }
      const response = await fetch(`${BASE_URL}chat-send-message`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });
      console.log(
        "Sending message with FormData:",
        formData,
        JSON.stringify(response),
      );
      if (response?.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId
              ? {
                  ...m,
                  id: response?.message?._id,
                  status: "sent",
                }
              : m,
          ),
        );
      } else {
        console.log("Send Message Failed:", response);
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m, status: "failed" } : m)),
        );
      }
    } catch (err) {
      console.log("Send Message Error:", err);
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: "failed" } : m)),
      );
    } finally {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({
          animated: true,
        });
      }, 100);
    }
  };

  const addReaction = (emoji) => {
    if (!activeReactionMsg) return;
    setMessages((prev) =>
      prev.map((m) =>
        m.id === activeReactionMsg.id ? { ...m, reaction: emoji } : m,
      ),
    );
    setActiveReactionMsg(null);
  };

  const toggleStar = () => {
    if (!selectedMsg?.id) return;
    setMessages((prev) =>
      prev.map((m) =>
        m.id === selectedMsg.id ? { ...m, starred: !m.starred } : m,
      ),
    );
    setShowActionModal(false);
    setSelectedMsg(null);
  };

  const deleteMsg = () => {
    if (!selectedMsg?.id) return;
    // Alert .alert('',JSON.stringify(selectedMsg, null, 2),)
    setMessages((prev) => prev.filter((m) => m.id !== selectedMsg.id));
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
    setMessages((prev) =>
      prev.map((m) =>
        m.id === selectedMsg.id
          ? { ...m, text: selectedMsg.text, isEditing: true }
          : m,
      ),
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
      PROFILE_ID={profileDetails?.id}
    />
  );
  const clearSelection = () => {
    setSelectedMessages([]);
    setSelectionMode(false);
  };
  const starSelected = () => {
    const ids = selectedMessages.map((m) => m.id);
    setMessages((prev) =>
      prev.map((m) => (ids.includes(m.id) ? { ...m, starred: !m.starred } : m)),
    );
    clearSelection();
  };
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      // behavior={Platform.OS === "ios" ? "padding" : "height"}
      // keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.container}>
        {selectionMode ? (
          <View style={styles.selectionHeader}>
            <TouchableOpacity onPress={clearSelection}>
              <Ionicons name="close" size={24} />
            </TouchableOpacity>
            <Text style={{ flex: 1, textAlign: "center" }}>
              {selectedMessages.length} selected
            </Text>
            <TouchableOpacity
              style={{ marginHorizontal: wp(2) }}
              onPress={starSelected}
            >
              <Ionicons name="star-outline" size={wp(6)} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ marginHorizontal: wp(2) }}
              onPress={() =>
                navigation.navigate("ForwardScreen", {
                  messages: selectedMessages,
                })
              }
            >
              <Ionicons name="arrow-redo-outline" size={wp(6)} />
            </TouchableOpacity>
            <DeleteMessagesButton selectedMessages={selectedMessages} />
          </View>
        ) : (
          <View style={styles.header}>
            <Ionicons
              onPress={() => navigation.goBack()}
              name="chevron-back"
              size={wp(7)}
            />
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
        <ImageBackground
          source={require("../../assets/chatBg.jpg")}
          resizeMode="cover"
          style={styles.chatBackground}
          imageStyle={styles.chatBgImage}
        >
          <View style={{ paddingBottom: hp(2) }}>
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
                  <Text
                    style={{
                      alignSelf: "center",
                      padding: wp(2),
                      backgroundColor: COLORS?.primary + "12",
                      paddingHorizontal: wp(6),
                      borderRadius: wp(2),
                    }}
                  >
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
                paddingBottom: keyboardOpen ? keyboardHeight + hp(10) : hp(10),
              }}
            />
          </View>
        </ImageBackground>
        <View
          style={[
            styles.inputContainer,
            { bottom: keyboardHeight, zIndex: 999, elevation: 10 },
          ]}
        >
          {replyTo && (
            <View style={styles.replyBar}>
              <View style={styles.replyBarLine} />
              <View style={{ flex: 1 }}>
                {!!replyTo.text && (
                  <Text numberOfLines={1} style={styles.replyBarText}>
                    {replyTo.text}
                  </Text>
                )}
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
          <ChatInputBar
            inputText={inputText}
            setInputText={setInputText}
            onSend={(item) => sendMessage(item)}
            messageInputRef={messageInputRef}
          />
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
            <View>
              <View style={styles.bubbleContainer}>
                <View
                  style={[
                    styles.bubble,
                    selectedMsg?.status === "sent"
                      ? styles.sentBubble
                      : styles.receivedBubble,
                  ]}
                >
                  <Text style={styles.msgText}>{selectedMsg?.text}</Text>
                </View>
              </View>
              {/* ACTION BOX (ONLY EMOJIS + ACTIONS) */}
              <View style={styles.actionBox}>
                {/* Emojis */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                  }}
                >
                  {emojis.map((e) => (
                    <Text
                      key={e}
                      onPress={() => {
                        addReaction(e);
                        setShowActionModal(false);
                      }}
                      style={{ fontSize: wp(5) }}
                    >
                      {e}
                    </Text>
                  ))}
                </View>
                <View
                  style={{
                    height: 1,
                    backgroundColor: "#eee",
                    marginVertical: wp(2),
                  }}
                />
                <ActionBtn
                  icon="create-outline"
                  label="Edit"
                  onPress={editMsg}
                />
                <ActionBtn
                  icon="star-outline"
                  label="Star"
                  onPress={toggleStar}
                />
                <ActionBtn icon="copy-outline" label="Copy" onPress={copyMsg} />
              </View>
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
  bubbleContainer: { marginTop: wp(4), alignItems: "center" },
  bubble: { width: "50%", padding: wp(3), borderRadius: wp(3) },
  sentBubble: {
    backgroundColor: COLORS.primary,
    alignSelf: "flex-end",
    borderTopRightRadius: 2,
  },
  receivedBubble: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    borderTopLeftRadius: 2,
  },
  msgText: { fontSize: wp(3.5), color: "#ccc" },
  chatBackground: { flex: 1 },
  replyBarSubText: {
    fontSize: wp(3),
    color: "#666",
    marginTop: 2,
    fontWeight: "500",
  },
  chatBgImage: {
    opacity: 0.08,
  },
  container: { flex: 1, backgroundColor: COLORS.primary + "12" },
  header: {
    height: hp(8),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(4),
    borderBottomWidth: 0.5,
    borderColor: COLORS.primary + "22",
  },
  avatar: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    borderWidth: wp(0.4),
    borderColor: COLORS.primary,
    marginHorizontal: wp(2),
  },
  name: { fontSize: wp(3.8), fontWeight: "600" },
  lastSeen: { fontSize: wp(2.8), color: "#777" },
  selectionHeader: {
    height: hp(8),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(3),
    backgroundColor: "#fff",
  },
  inputContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  replyBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: wp(2),
    paddingVertical: wp(4),
    backgroundColor: "#f1f1f1",
  },
  replyBarLine: {
    width: 4,
    height: "100%",
    backgroundColor: COLORS.primary,
    marginRight: wp(2),
    borderRadius: 2,
  },
  replyBarText: { fontSize: wp(3.2), color: "#111" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionBox: {
    width: wp(60),
    marginTop: wp(3),
    backgroundColor: "#fff",
    borderRadius: wp(4),
    paddingVertical: wp(2),
    elevation: 10,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: wp(3),
    borderBottomWidth: 0.5,
    borderColor: "#eee",
  },
  actionText: {
    marginLeft: wp(3),
    fontSize: wp(3.5),
    color: "#333",
  },
});
