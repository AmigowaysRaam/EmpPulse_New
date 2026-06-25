import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  Clipboard, FlatList, Image, Keyboard, KeyboardAvoidingView, Modal, Platform,
  Pressable, StyleSheet, Text, TouchableOpacity, View
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Ionicons from "react-native-vector-icons/Ionicons";

import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import ChatInputBar from "./ChatInput";

const ChatConvoScreen = ({ route }) => {
  const { item } = route?.params || {};
  const navigation = useNavigation();
  const flatListRef = useRef();
  const swipeRefs = useRef(new Map());
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [selectionMode, setSelectionMode] = useState(false);
  // ✅ TOGGLE SELECTION
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const [messages, setMessages] = useState([
    { id: "1", text: "Hi, how are you?", sender: "them", time: "10:30 AM", reaction: null, starred: false },
    { id: "2", text: "I'm good, what about you?", sender: "me", time: "10:31 AM", reaction: null, starred: false },
  ]);

  const [inputText, setInputText] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  const [activeReactionMsg, setActiveReactionMsg] = useState(null);
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });

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
  // ✅ NEW UI STATE (ONLY ADDITION)
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

  const onRefresh = async () => {
    setRefreshing(true);

    try {
      // API call or refresh logic
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
    }
  };
  const sendMessage = () => {
    if (!inputText.trim()) return;

    const newMsg = {
      id: Date.now().toString(),
      text: inputText,
      sender: "me",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      replyTo: replyTo || null,
      reaction: null,
      starred: false,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");
    setReplyTo(null);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
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





  const renderItem = ({ item }) => {
    const isMe = item.sender === "me";
    const isSelected = selectedMessages.find(m => m.id === item.id);

    const renderRightActions = () => (
      <View style={styles.swipeActionArea}>
        <Text style={styles.swipeHint}>↩</Text>
      </View>
    );

    return (
      <Swipeable
        ref={(ref) => {
          if (ref) swipeRefs.current.set(item.id, ref);
        }}
        renderRightActions={renderRightActions}
        renderLeftActions={renderRightActions}
        onSwipeableOpen={() => {
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
          onLongPress={() => toggleSelectMessage(item)}
          onPress={() => {
            if (selectionMode) {
              toggleSelectMessage(item);
              return;
            }
            setSelectedMsg(item);
            setShowActionModal(true);
          }}
        >
          <View style={[styles.row, isMe ? styles.right : styles.left,
                isSelected && { backgroundColor: COLORS?.primary + "55", borderRadius:wp(2),paddingVertical:wp(2) }

          ]}>


            <View style={[
              styles.bubble,
              isMe ? styles.myBubble : styles.theirBubble,
            ]}>

              {item.replyTo && (
                <View style={styles.inlineReply}>
                  <View style={styles.replyLine} />
                  <Text numberOfLines={1}>{item.replyTo.text}</Text>
                </View>
              )}

              <Text style={styles.text}>{item.text}</Text>

              {item.starred && (
                <Text style={{ fontSize: wp(3) }}>⭐</Text>
              )}

              {item.reaction && (
                <Text style={styles.reaction}>{item.reaction}</Text>
              )}

              <Text style={styles.time}>{item.time}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };
  const clearSelection = () => {
    setSelectedMessages([]);
    setSelectionMode(false);
  };
  // ✅ STAR (bulk)
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
              style={{ flexDirection: "row" }}
              onPress={() => navigation.navigate("GroupChatInfoScreen")}
            >
              <Image source={{ uri: item?.avatar }} style={styles.avatar} />
              <View>
                <Text style={styles.name}>{item?.name}</Text>
                <Text style={styles.lastSeen}>last seen today</Text>
              </View>
            </Pressable>
          </View>
        )}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(i) => i.id}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={{
            padding: wp(3),
            paddingBottom: hp(12) + keyboardHeight,
          }}
        />

        {/* INPUT */}
        <View style={[styles.inputContainer, { bottom: keyboardHeight, zIndex: 999, elevation: 10 }]}>

          {replyTo && (
            <View style={styles.replyBar}>
              <View style={styles.replyBarLine} />

              <View style={{ flex: 1 }}>
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
  container: { flex: 1, backgroundColor: COLORS?.primary + "12" }, header: {
    height: hp(8), flexDirection: "row", alignItems: "center",
    paddingHorizontal: wp(4), borderBottomWidth: 0.5, borderColor: COLORS?.primary + 22
  }, avatar: {
    width: wp(10), height: wp(10), borderRadius: wp(5), borderWidth: wp(0.4), borderColor: COLORS?.primary, marginHorizontal: wp(2),
  }, name: { fontSize: wp(3.8), fontWeight: "600" }, lastSeen: { fontSize: wp(2.8), color: "#777" },
  row: { marginVertical: hp(0.5) }, left: { alignItems: "flex-start" }, right: { alignItems: "flex-end" }, bubble: { maxWidth: "75%", padding: wp(3), borderRadius: wp(4), }, selectionHeader: {
    height: hp(8), flexDirection: "row", alignItems: "center", paddingHorizontal: wp(3), backgroundColor: "#fff", justifyContent: "space-between",
  }, myBubble: {
    backgroundColor: COLORS?.primary + 10, borderTopRightRadius: 0,
  }, theirBubble: { backgroundColor: "#fff", borderTopLeftRadius: 0, }, text: { fontSize: wp(3.3), color: "#111" },
  time: { fontSize: wp(2.5), marginTop: hp(0.3), opacity: 0.6, textAlign: "right", }, inputContainer: {
    position: "absolute", left: 0, right: 0, backgroundColor: "#fff", borderTopWidth: 1, borderColor: "#eee",
  }, inputRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: wp(2), paddingVertical: hp(1), }, input: {
    flex: 1, backgroundColor: "#F4F5F7", borderRadius: wp(6), paddingHorizontal: wp(4), height: hp(5), fontSize: wp(3.3), color: "#000",
  }, replyBar: { flexDirection: "row", alignItems: "center", padding: wp(2), paddingVertical: wp(4), backgroundColor: "#f1f1f1", }, replyBarLine: {
    width: 4, height: "100%", backgroundColor: COLORS?.primary, marginRight: wp(2), borderRadius: 2,
  }, replyBarTitle: { fontSize: wp(2.8), color: "#555", }, replyBarText: { fontSize: wp(3.2), color: "#111", },
  inlineReply: {
    flexDirection: "row", alignItems: "center", marginBottom: hp(0.5), backgroundColor: "#f3f3f3", padding: wp(1.5), borderRadius: wp(2),
  }, replyLine: {
    width: 3, height: "100%", backgroundColor: COLORS?.primary, marginRight: wp(2), borderRadius: 2,
  }, swipeActionArea: {
    justifyContent: "center", alignItems: "center", width: wp(25), backgroundColor: "transparent",
  }, modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "center", alignItems: "center",
  }, actionBox: { width: wp(60), backgroundColor: "#fff", borderRadius: wp(4), paddingVertical: wp(2), elevation: 10, }, actionRow: {
    flexDirection: "row", alignItems: "center", padding: wp(3), borderBottomWidth: 0.5, borderColor: "#eee",
  },
  actionText: { marginLeft: wp(3), fontSize: wp(3.5), color: "#333", }, swipeHint: {
    fontWeight: "600", color: "#111",
  }, sendBtn: {
    backgroundColor: COLORS.primary, width: wp(9), height: wp(9), borderRadius: wp(4.5), justifyContent: "center",
    alignItems: "center", marginLeft: wp(2),
  }, swipeReply: {
    justifyContent: "center", alignItems: "center", width: wp(20),
    backgroundColor: "#DCF8C6", marginVertical: hp(0.5), borderRadius: wp(3),
  },
  swipeReplyText: { color: "#111", fontWeight: "600", fontSize: wp(3), }, reactionPopup: {
    position: "absolute",
    flexDirection: "row", backgroundColor: "#fff", padding: wp(2), borderRadius: wp(6), elevation: 8, marginTop: wp(4)
  }, emoji: { fontSize: wp(6), marginHorizontal: wp(2), }, reaction: { fontSize: wp(4), }, replyBox: {
    borderLeftWidth: 3,
    borderColor: "#25D366", position: "absolute", paddingLeft: wp(2),
  },
});