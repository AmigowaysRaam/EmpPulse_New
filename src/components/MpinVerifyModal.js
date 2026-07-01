import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";
import * as Device from "expo-device";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    Text,
    View,
} from "react-native";
import SmoothPinCodeInput from "react-native-smooth-pincode-input";
import { hp } from "../../app/resources/dimensions";
import { fetchData } from "./api/Api";

const MPIN_VERIFY_KEY = "LAST_MPIN_VERIFY";
const VERIFY_INTERVAL = 30 * 1000; // 30 seconds

export default function MpinVerifyModal({
  visible,
  onVerified,
}) {
  const [mpin, setMpin] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const pinRef = useRef(null);

  useEffect(() => {
    checkVerification();
  }, [visible]);

  const checkVerification = async () => {
    if (!visible) {
      setShowModal(false);
      return;
    }

    try {
      const lastVerify = await AsyncStorage.getItem(MPIN_VERIFY_KEY);

      if (lastVerify) {
        const diff = Date.now() - Number(lastVerify);

        if (diff < VERIFY_INTERVAL) {
          // Already verified within 30 seconds
          onVerified?.();
          return;
        }
      }

      setShowModal(true);

      setTimeout(() => {
        pinRef.current?.focus();
      }, 300);
    } catch (e) {
      setShowModal(true);
    }
  };

  const verify = async (code) => {
    setLoading(true);

    try {
      const raw = await AsyncStorage.getItem("USER_DATA");
      const user = JSON.parse(raw);

      const userId =
        user?.id ||
        user?.data?.id ||
        user?.data?.[0]?.id;

      const token = await messaging().getToken();

      const pseudoId = `${Device.brand}${Device.modelName}${userId}`;

      const response = await fetchData(
        "app-employee-login-mpin",
        "POST",
        {
          user_id: userId,
          mpin: code,
          fcm_token: token,
          deviceInfo: pseudoId,
        }
      );

      if (response?.text === "Success") {
        await AsyncStorage.setItem(
          MPIN_VERIFY_KEY,
          Date.now().toString()
        );

        setMpin("");
        setShowModal(false);
        onVerified?.();
      } else {
        setMpin("");
      }
    } catch (e) {
      setMpin("");
    }

    setLoading(false);
  };

  return (
    <Modal
      visible={showModal}
      transparent
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <MaterialIcons
            name="lock"
            size={60}
            color="#2563EB"
          />

          <Text style={styles.title}>
            Verify MPIN
          </Text>

          <Text style={styles.subtitle}>
            Enter your 4-digit MPIN
          </Text>

          <SmoothPinCodeInput
            ref={pinRef}
            value={mpin}
            onTextChange={setMpin}
            codeLength={4}
            password
            restrictToNumbers
            keyboardType="number-pad"
            cellStyle={styles.cell}
            cellStyleFocused={styles.cellFocused}
            onFulfill={verify}
          />

          {loading && <ActivityIndicator style={{ marginTop: 20 }} />}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    width: "85%",
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 25,
    alignItems: "center",
    marginBottom: hp(18),
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 15,
  },

  subtitle: {
    marginTop: 8,
    color: "#666",
    marginBottom: 25,
  },

  cell: {
    width: 55,
    height: 55,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    backgroundColor: "#F9FAFB",
  },

  cellFocused: {
    borderColor: "#2563EB",
    borderWidth: 2,
    backgroundColor: "#FFF",
  },
});