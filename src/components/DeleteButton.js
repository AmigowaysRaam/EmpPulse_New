import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSelector } from "react-redux";
import { wp } from "../../app/resources/dimensions";
import { useToast } from "../../constants/ToastContext";
import { fetchData } from "./api/Api";

const DeleteMessagesButton = ({ selectedMessages = [] }) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

  const profileDetails = useSelector(
    (state) => state?.auth?.profileDetails?.data
  );
  const ids = selectedMessages?.map((m) => m.id) || [];
  const handleDelete = async () => {
    if (!ids.length) {
      Alert.alert("No messages selected");
      return;
    }
    try {
      setLoading(true);
      const response = await fetchData(
        "delete-chat-messages",
        "POST",
        {
          userId: profileDetails?.id,
          companyId: profileDetails?.companyId,
          messageId: ids,
        }
      );
console.log("DELETE RESPONSE:", response);
      if (response?.success) {
        showToast(response?.message || "Messages removed successfully",'success');
        setVisible(false);
      } else {
        showToast(response?.message || "Delete failed",'error');
        }
    } catch (err) {
      console.log("DELETE ERROR:", err);
      showToast("Something went wrong",'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* TRASH BUTTON */}
      <TouchableOpacity
        style={[
          styles.trashButton,
          !selectedMessages?.length && styles.trashDisabled,
        ]}
        onPress={() => setVisible(true)}
        disabled={!selectedMessages?.length}
        activeOpacity={0.7}
      >
        <Ionicons
          name="trash-outline"
          size={wp(6)}
          color={selectedMessages?.length ? "#111" : "#bbb"}
        />
      </TouchableOpacity>

      {/* CONFIRM MODAL */}
      <Modal transparent visible={visible} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.card}>
            {/* ICON */}
            <View style={styles.iconWrap}>
              <Ionicons name="warning-outline" size={wp(10)} color="#E53935" />
            </View>

            {/* TITLE */}
            <Text style={styles.title}>Delete Messages?</Text>

            <Text style={styles.subtitle}>
              You are about to delete{" "}
              <Text style={{ fontWeight: "700" }}>
                {selectedMessages?.length || 0}
              </Text>{" "}
              message(s). This action cannot be undone.
            </Text>

            {/* BUTTONS */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setVisible(false)}
                disabled={loading}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={handleDelete}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.deleteText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default DeleteMessagesButton;

const styles = StyleSheet.create({
  trashButton: {
    marginHorizontal: wp(2),
    padding: wp(2),
    borderRadius: wp(2),
  },

  trashDisabled: {
    opacity: 0.5,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    width: wp(78),
    backgroundColor: "#fff",
    borderRadius: wp(4),
    paddingVertical: wp(6),
    paddingHorizontal: wp(5),
    alignItems: "center",
    elevation: 12,
  },

  iconWrap: {
    marginBottom: wp(3),
  },

  title: {
    fontSize: wp(4.5),
    fontWeight: "700",
    color: "#111",
    textAlign: "center",
  },

  subtitle: {
    fontSize: wp(3.6),
    color: "#666",
    textAlign: "center",
    marginTop: wp(2),
    lineHeight: wp(5),
  },

  actions: {
    flexDirection: "row",
    marginTop: wp(6),
    width: "100%",
    justifyContent: "space-between",
  },

  cancelBtn: {
    flex: 1,
    marginRight: wp(2),
    paddingVertical: wp(3),
    borderRadius: wp(3),
    backgroundColor: "#F2F2F2",
    alignItems: "center",
  },

  deleteBtn: {
    flex: 1,
    marginLeft: wp(2),
    paddingVertical: wp(3),
    borderRadius: wp(3),
    backgroundColor: "#E53935",
    alignItems: "center",
  },

  cancelText: {
    color: "#333",
    fontWeight: "600",
    fontSize: wp(3.8),
  },

  deleteText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: wp(3.8),
  },
});