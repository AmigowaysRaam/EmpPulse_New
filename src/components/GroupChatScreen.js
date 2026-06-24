import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  Clipboard,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { Swipeable } from "react-native-gesture-handler";
import Ionicons from "react-native-vector-icons/Ionicons";

import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import ChatInputBar from "./ChatInput";

const GroupChatScreen = ({ route }) => {
  const { item } = route?.params || {};
  const navigation = useNavigation();

  const flatListRef = useRef();
  const swipeRefs = useRef(new Map());
  const messageInputRef = useRef(null);

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "Hi, how are you?",
      sender: {
        id: "u1",
        name: "Arun",
        avatar: "https://i.pravatar.cc/150?img=1",
      },
      time: "10:30 AM",
      reaction: null,
      starred: false,
    },
    {
      id: "2",
      text: "I'm good, what about you?",
      sender: {
        id: "me",
        name: "You",
        avatar: "https://i.pravatar.cc/150?img=2",
      },
      time: "10:31 AM",
      reaction: null,
      starred: false,
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  const [selectedMsg, setSelectedMsg] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // ✅ SAFE SEND MESSAGE
  const sendMessage = () => {
    if (!inputText.trim()) return;

    const newMsg = {
      id: Date.now().toString(),
      text: inputText,
      sender: {
        id: "me",
        name: "You",
        avatar: "https://i.pravatar.cc/150?img=2",
      },
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      reaction: null,
      starred: false,
      replyTo: replyTo || null,
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText("");
    setReplyTo(null);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // ✅ SAFE STAR
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

  // ✅ SAFE DELETE
  const deleteMsg = () => {
    if (!selectedMsg?.id) return;

    setMessages(prev =>
      prev.filter(m => m.id !== selectedMsg.id)
    );

    setShowActionModal(false);
    setSelectedMsg(null);
  };

  // ✅ SAFE COPY
  const copyMsg = () => {
    if (!selectedMsg?.text) return;

    Clipboard.setString(selectedMsg.text);

    setShowActionModal(false);
    setSelectedMsg(null);
  };

  // ✅ SAFE EDIT
  const editMsg = () => {
    if (!selectedMsg?.id) return;

    setInputText(selectedMsg.text || "");

    setShowActionModal(false);
    setSelectedMsg(null);
  };

  // ✅ SWIPE REPLY (SAFE)
  const renderRightActions = (msg) => (
    <TouchableOpacity
      style={styles.swipeActionArea}
      onPress={() => {
        if (!msg) return;

        setReplyTo(msg);
        setTimeout(() => {
          messageInputRef.current?.focus();
        }, 100);

        const ref = swipeRefs.current.get(msg.id);
        ref?.close();
      }}
    >
      <Text style={styles.swipeHint}>Reply</Text>
    </TouchableOpacity>
  );

  // ✅ RENDER MESSAGE (FULL SAFE)
  const renderItem = ({ item, index }) => {
    if (!item?.sender) return null;

    const isMe = item.sender.id === "me";
    const prev = messages[index - 1];

    const showAvatar =
      !prev || prev?.sender?.id !== item?.sender?.id;

    return (
      <Swipeable
        ref={(ref) => {
          if (ref) swipeRefs.current.set(item.id, ref);
        }}
        renderRightActions={renderRightActions}
        onSwipeableOpen={() => {
          // Alert.alert('',JSON.stringify(item))
          setReplyTo(item);   // ✅ SET REPLY HERE
          setTimeout(() => {
            messageInputRef.current?.focus();
          }, 100);

          const ref = swipeRefs.current.get(item.id);
          ref?.close();
        }}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onLongPress={() => {
            setSelectedMsg(item);
            setShowActionModal(true);
          }}
        >
          <View style={[
            styles.messageRow,
            isMe ? styles.rightAlign : styles.leftAlign
          ]}>

            {!isMe && showAvatar && (
              <Image
                source={{ uri: item.sender?.avatar }}
                style={styles.avatar}
              />
            )}

            <View style={[
              styles.bubble,
              isMe ? styles.myBubble : styles.theirBubble
            ]}>

              {!isMe && showAvatar && (
                <Text style={styles.senderName}>
                  {item.sender?.name}
                </Text>
              )}

              {item.replyTo?.text && (
                <View style={styles.replyBox}>
                  <Text numberOfLines={1} style={styles.replyText}>
                    {item.replyTo.text}
                  </Text>
                </View>
              )}
              <Text style={styles.messageText}>{item.text}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.time}>{item.time}</Text>
                {item.starred && <Text>⭐</Text>}
              </View>
            </View>
            {isMe && showAvatar && (
              <Image
                source={{ uri: item.sender?.avatar }}
                style={styles.avatar}
              />
            )}
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Ionicons
            onPress={() => navigation.goBack()}
            name="chevron-back"
            size={wp(7)}
          />
          <Image source={{ uri: item?.avatar }} style={styles.headerAvatar} />
          <View>
            <Text style={styles.name}>{item?.name}</Text>
          </View>
        </View>

        {/* CHAT */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{
            padding: wp(3),
            paddingBottom: hp(12) + keyboardHeight,
          }}
        />
        <View style={[styles.inputContainer, { bottom: keyboardHeight }]}>
          {replyTo && (
            <View style={styles.replyBar}>
              <View style={styles.replyBarLine} />

              <View style={{ flex: 1 }}>
                {/* <Text style={styles.replyBarTitle}>Replying to</Text> */}
                <Text numberOfLines={1} style={styles.replyBarText}>
                  {replyTo.text}
                </Text>
              </View>

              <TouchableOpacity onPress={() => setReplyTo(null)}>
                <Ionicons name="close" size={20} />
              </TouchableOpacity>
            </View>
          )}
          <ChatInputBar
            inputText={inputText}
            setInputText={setInputText}
            onSend={sendMessage}
            messageInputRef={messageInputRef}
          />
        </View>

        {/* ACTION MODAL */}
        <Modal visible={showActionModal} transparent animationType="fade">
          <TouchableOpacity
            style={styles.modalOverlay}
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
    <Ionicons name={icon} size={20} />
    <Text style={styles.actionText}>{label}</Text>
  </TouchableOpacity>
);

export default GroupChatScreen;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EAF2F8" },

  header: {
    height: hp(8),
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(3),
    backgroundColor: "#fff",
    elevation: 3,
  },
  replyBar: {
    flexDirection: "row", alignItems: "center",
    padding: wp(2), backgroundColor: "#f1f1f1",
  }, replyBarLine: {
    width: 4, height: "100%",
    backgroundColor: COLORS?.primary,
    marginRight: wp(2), borderRadius: 2,
  },

  replyBarTitle: {
    fontSize: wp(2.8), color: "#555",
  },
  replyBarText: {
    fontSize: wp(3.2), color: "#111",
  },
  headerAvatar: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    marginHorizontal: wp(2),
  },

  name: { fontSize: wp(3.8), fontWeight: "600" },
  lastSeen: { fontSize: wp(2.8), color: "#777" },

  messageRow: {
    flexDirection: "row",
    marginVertical: hp(0.3),
    alignItems: "flex-end",
  },

  leftAlign: { justifyContent: "flex-start" },
  rightAlign: { justifyContent: "flex-end" },

  avatar: {
    width: wp(7),
    height: wp(7),
    borderRadius: wp(3.5),
    marginRight: wp(2),
  },
  senderName: {
    fontSize: wp(3),
    fontWeight: "600",
    color: "#444",
    marginBottom: wp(1),
  },
  bubble: {
    maxWidth: "75%",
    padding: wp(3),
    borderRadius: wp(4),
  },

  myBubble: {
    backgroundColor: "#DCF8C6",
    borderTopRightRadius: 0,
  },

  theirBubble: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 0,
  },

  messageText: {
    fontSize: wp(3.4),
    color: "#111",
  },

  metaRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: hp(0.5),
    gap: 4,
  },

  time: {
    fontSize: wp(2.4),
    color: "#666",
  },

  inputContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 0.5,
    borderColor: "#ddd",
  },

  swipeActionArea: {
    justifyContent: "center",
    alignItems: "center",
    width: wp(20),
  },

  swipeHint: { fontSize: wp(3.2), color: "#111" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },

  actionBox: {
    width: wp(60),
    backgroundColor: "#fff",
    borderRadius: wp(4),
  },

  actionRow: {
    flexDirection: "row",
    padding: wp(3),
    borderBottomWidth: 0.5,
    borderColor: "#eee",
    alignItems: "center",
  },

  actionText: {
    marginLeft: wp(3),
    fontSize: wp(3.5),
  },

  replyBox: {
    backgroundColor: "#ff0000",
    padding: wp(1.5),
    borderRadius: wp(2),
    marginBottom: hp(0.5),
  },

  replyText: {
    fontSize: wp(3),
    color: "#444",
  },
});