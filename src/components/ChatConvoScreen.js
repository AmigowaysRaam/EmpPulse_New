
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Ionicons from "react-native-vector-icons/Ionicons";

import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

const ChatConvoScreen = ({ route }) => {
  const { item } = route?.params || {};
  const navigation = useNavigation();

  const flatListRef = useRef();
  const swipeRefs = useRef(new Map());

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const [messages, setMessages] = useState([
    { id: "1", text: "Hi, how are you?", sender: "them", time: "10:30 AM", reaction: null },
    { id: "2", text: "I'm good, what about you?", sender: "me", time: "10:31 AM", reaction: null },
  ]);

  const [inputText, setInputText] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  const [activeReactionMsg, setActiveReactionMsg] = useState(null);
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });

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

  const renderItem = ({ item }) => {
    const isMe = item.sender === "me";

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
        onSwipeableOpen={() => {
          setReplyTo(item);
          const ref = swipeRefs.current.get(item.id);
          ref?.close();
        }}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          // onPress={() => setReplyTo(item)}
          onLongPress={(e) => {
            const { pageX, pageY } = e.nativeEvent;
            setActiveReactionMsg(item);
            setPopupPos({ x: pageX, y: pageY - 20 });
          }}
        >
          <View style={[styles.row, isMe ? styles.right : styles.left]}>
            <View
              style={[
                styles.bubble,
                isMe ? styles.myBubble : styles.theirBubble,
              ]}
            >
              {/* INLINE REPLY PREVIEW (WhatsApp style) */}
              {item.replyTo && (
                <View style={styles.inlineReply}>
                  <View style={styles.replyLine} />
                  <Text numberOfLines={1} style={styles.replyTextSmall}>
                    {item.replyTo.text}
                  </Text>
                </View>
              )}

              <Text style={styles.text}>{item.text}</Text>

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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Ionicons
            onPress={() => navigation.goBack()}
            name="chevron-back"
            size={wp(7)}
            color="#111"
          />

          <Image
            source={{ uri: item?.image || "https://i.pravatar.cc/150?img=3" }}
            style={styles.avatar}
          />

          <View>
            <Text style={styles.name}>{item?.name || "Unknown"}</Text>
            <Text style={styles.lastSeen}>last seen today</Text>
          </View>
        </View>

        {/* CHAT */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={{
            padding: wp(3),
            paddingBottom: hp(12) + keyboardHeight,
          }}
        />

        {/* REACTION POPUP */}
        {activeReactionMsg && (
          <View
            style={[
              styles.reactionPopup,
              { top: popupPos.y, left: popupPos.x - wp(18) },
            ]}
          >
            <TouchableOpacity onPress={() => addReaction("👍")}>
              <Text style={styles.emoji}>👍</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => addReaction("❤️")}>
              <Text style={styles.emoji}>❤️</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* INPUT AREA */}
        <View style={[styles.inputContainer, { bottom: keyboardHeight }]}>
          {/* TOP REPLY BAR (clean WhatsApp style) */}
          {replyTo && (
            <View style={styles.replyBar}>
              <View style={styles.replyBarLine} />
              <View style={{ flex: 1 }}>
                <Text style={styles.replyBarTitle}>Replying to</Text>
                <Text numberOfLines={1} style={styles.replyBarText}>
                  {replyTo.text}
                </Text>
              </View>

              <TouchableOpacity onPress={() => setReplyTo(null)}>
                <Ionicons name="close" size={20} />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.inputRow}>
            <TextInput
              placeholder="Message"
              value={inputText}
              onChangeText={setInputText}
              style={styles.input}
              placeholderTextColor={'#444'}
            />
            <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
              <Ionicons name="send" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatConvoScreen;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS?.primary + "12" },
  header: {
    height: hp(8), flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(4),
    borderBottomWidth: 0.5,
    borderColor: COLORS?.primary + 22
  },
  avatar: {
    width: wp(10), height: wp(10), borderRadius: wp(5),
    marginHorizontal: wp(2),
  },

  name: { fontSize: wp(3.8), fontWeight: "600" }, lastSeen: { fontSize: wp(2.8), color: "#777" },

  row: { marginVertical: hp(0.5) },
  left: { alignItems: "flex-start" }, right: { alignItems: "flex-end" },
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

  text: { fontSize: wp(3.3), color: "#111" },

  time: {
    fontSize: wp(2.5),
    marginTop: hp(0.3),
    opacity: 0.6,
    textAlign: "right",
  },
  inputContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(2),
    paddingVertical: hp(1),
  },

  input: {
    flex: 1,
    backgroundColor: "#F4F5F7",
    borderRadius: wp(6),
    paddingHorizontal: wp(4),
    height: hp(5),
    fontSize: wp(3.3),
    color: "#000",
  },
  replyBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: wp(2),
    backgroundColor: "#f1f1f1",
  },

  replyBarLine: {
    width: 4,
    height: "100%",
    backgroundColor: "#25D366",
    marginRight: wp(2),
    borderRadius: 2,
  },

  replyBarTitle: {
    fontSize: wp(2.8),
    color: "#555",
  },

  replyBarText: {
    fontSize: wp(3.2),
    color: "#111",
  },

  inlineReply: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(0.5),
    backgroundColor: "#f3f3f3",
    padding: wp(1.5),
    borderRadius: wp(2),
  },

  replyLine: {
    width: 3,
    height: "100%",
    backgroundColor: "#25D366",
    marginRight: wp(2),
    borderRadius: 2,
  },

  swipeActionArea: {
    justifyContent: "center",
    alignItems: "center",
    width: wp(25),
    backgroundColor: "transparent",
  },

  swipeHint: {
    fontWeight: "600",
    color: "#111",
  },
  sendBtn: {
    backgroundColor: COLORS.primary,
    width: wp(9),
    height: wp(9),
    borderRadius: wp(4.5),
    justifyContent: "center",
    alignItems: "center",
    marginLeft: wp(2),
  },
  swipeReply: {
    justifyContent: "center",
    alignItems: "center",
    width: wp(20),
    backgroundColor: "#DCF8C6",
    marginVertical: hp(0.5),
    borderRadius: wp(3),
  },

  swipeReplyText: {
    color: "#111",
    fontWeight: "600",
    fontSize: wp(3),
  },
  reactionPopup: {
    position: "absolute",
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: wp(2),
    borderRadius: wp(6),
    elevation: 8,
    marginTop: wp(4)
  },

  emoji: {
    fontSize: wp(6),
    marginHorizontal: wp(2),
  },
  reaction: {
    fontSize: wp(4),
  },
  replyBox: {
    borderLeftWidth: 3,
    borderColor: "#25D366",
    position: "absolute",
    paddingLeft: wp(2),
  },
});