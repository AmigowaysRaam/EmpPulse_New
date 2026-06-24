import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator, Animated, Modal, Pressable, StyleSheet, Text, View,
} from "react-native";
import { Icon } from "react-native-elements";
import { useSelector } from "react-redux";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { useToast } from "../../constants/ToastContext";
import { fetchData } from "./api/Api";
export const PunchCard = React.memo(({ onLoading }) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [allowPunchIn, setallowPunchIn] = useState(false);

  const [loginTime, setloginTime] = useState(false);
  const [logoutTime, setlogoutTime] = useState(false);

  const navigation = useNavigation();
  useEffect(() => {
    const interval = setInterval(
      () => setCurrentTime(new Date()),
      1000
    );
    return () => clearInterval(interval);
  }, []);

  const translateY = useRef(new Animated.Value(hp(5))).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const cardScale = useRef(new Animated.Value(1)).current;
  const activeAnim = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const profileDetails = useSelector(
    (state) => state?.auth?.profileDetails?.data
  );



  const getPUnchinCard = async () => {
    try {
      const response = await fetchData(
        "mobile-punch-status",
        "POST",
        {
          employeeId: profileDetails.id,
        }
      );
      console.log(response, "mobile-punch-status")
      // {"employee": {"employeeId": "Emp-045", "employeeImage": "image-1781184348545-277529901.png", "id": "6a2a6d481a97a14713b20567", "name": "Gowtham "}, "is_punched_in": false, "mobileAttendanceEnabled": true, "success": true} mobile-punch-status
      // After Punch in 
      // {"employee": {"employeeId": "Emp-045", "employeeImage": "image-1781184348545-277529901.png", "id": "6a2a6d481a97a14713b20567", "name": "Gowtham "}, "is_punched_in": true, "mobileAttendanceEnabled": true, "success": true} mobile-punch-status
      // {"employee": {"employeeId": "Emp-045", "employeeImage": "image-1781184348545-277529901.png", "id": "6a2a6d481a97a14713b20567", "name": "Gowtham "}, "is_punched_in": false, "login_time": "10:34 am", "logout_time": "10:38 am", "mobileAttendanceEnabled": true, "success": true} mobile-punch-status
      if (response?.success) {
        setallowPunchIn(response.mobileAttendanceEnabled);
        setIsPunchedIn(response.is_punched_in);
        setloginTime(response?.login_time)
        setlogoutTime(response?.logout_time)

      }
    } catch (error) {
      console.error("mobile-punch-status Error:", error);
    } finally {

    }
  }


  useFocusEffect(
    useCallback(() => {
      translateY.setValue(hp(5));
      opacity.setValue(0);
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
      ]).start();
    }, [translateY, opacity])
  );

  useFocusEffect(
    useCallback(() => {
      getPUnchinCard();
    }, [])
  );

  useEffect(() => {
    Animated.parallel([
      Animated.spring(activeAnim, {
        toValue: isPunchedIn ? 1 : 0,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [isPunchedIn, activeAnim, glowOpacity]);

  const animatePress = useCallback(() => {
    Animated.parallel([
      Animated.spring(pressScale, {
        toValue: 0.92,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 0.97,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.spring(pressScale, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.spring(cardScale, {
            toValue: 1.03,
            friction: 4,
            useNativeDriver: true,
          }),
          Animated.spring(cardScale, {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }, 120);
  }, [pressScale, cardScale]);

  const handlePunchPress = useCallback(() => {
    if (loading) return;

    animatePress();
    setConfirmVisible(true);
  }, [loading, animatePress]);

  const handleConfirmPunch = useCallback(async () => {
    setConfirmVisible(false);
    setLoading(true);
    onLoading?.(true);
    try {
      const punchType = isPunchedIn ? "out" : "in";

      const response = await fetchData(
        "mobile-punch-mark",
        "POST",
        {
          employeeId: profileDetails.id,
          type: punchType,
        }
      );
      console.log(response, "mobile-punch-mark")
      if (response?.success) {
        console.log('pnchin', response)
        // {"employee": {"employeeId": "Emp-045", "employeeImage": "image-1781184348545-277529901.png", "id": "6a2a6d481a97a14713b20567", "name": "Gowtham "}, "is_punched_in": true, "mobileAttendanceEnabled": true, "success": true} mobile-punch-status
        showToast(response?.message, 'success')
        setIsPunchedIn(response.is_punched_in);

      }


    } catch {
      showToast("Something went wrong", "error");
    } finally {
      setLoading(false);
      onLoading?.(false);
    }
  }, [isPunchedIn, onLoading, showToast]);

  const formattedDate = useMemo(
    () => currentTime.toDateString(),
    [currentTime]
  );

  const formattedTime = useMemo(
    () =>
      currentTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    [currentTime]
  );

  const backgroundColor = activeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.primary, COLORS.accent],
  });

  const rotate = activeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const modalColor = isPunchedIn
    ? "#FF5757"
    : "#4CAF50";

  const modalTitle = isPunchedIn
    ? t("punchOut")
    : t("punchIn");

  const modalMessage = isPunchedIn
    ? "Are you sure you want to punch out for today?"
    : "Are you sure you want to punch in and start your work day?";

  return (
    !allowPunchIn ?
      <Pressable
        style={styles.attendanceCard}
        onPress={() =>
          navigation.navigate("AttendanceLogScreen")
        }
      >
        <View style={styles.attendanceContent}>
          <Icon
            name="history"
            type="material"
            size={24}
            color={COLORS.primary}
          />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.attendanceTitle}>
              Attendance Log
            </Text>
            <Text style={styles.attendanceSubTitle}>
              View attendance activity history
            </Text>
          </View>

          <Icon
            name="chevron-right"
            type="material"
            size={24}
            color="#999"
          />
        </View>
      </Pressable>
      :
      <>
        <Animated.View
          style={[
            styles.card,
            {
              opacity,
              transform: [
                { translateY },
                { scale: cardScale },
              ],
            },
          ]}
        >
          <View style={styles.leftContainer}>
            <Text style={styles.dateText}>
              {formattedDate}
            </Text>

            <Text style={styles.timeText}>
              {formattedTime}
            </Text>

            {
              loginTime &&
              <Text style={[styles.timeText, {
                fontFamily: "Poppins_600SemiBold", fontSize: wp(4),
              }]}>
                {`Login@ ${loginTime}`}
              </Text>
            }

            {
              logoutTime &&
              <Text style={[styles.timeText, {
                fontFamily: "Poppins_600SemiBold", fontSize: wp(4)
              }]}>
                {`Logout@ ${logoutTime}`}
              </Text>
            }

          </View>
          <View style={styles.rightSection}>
            {/* isPunchedIn */}
            <View style={styles.buttonOuter}>
              <Animated.View
                style={[
                  styles.glow,
                  {
                    opacity: glowOpacity,
                    backgroundColor: isPunchedIn
                      ? COLORS.accent
                      : COLORS.primary,
                  },
                ]}
              />

              <Animated.View
                style={{
                  transform: [{ scale: pressScale }],
                }}
              >
                <Pressable
                  disabled={loading}
                  onPress={handlePunchPress}
                >
                  <Animated.View
                    style={[
                      styles.roundButton,
                      { backgroundColor },
                    ]}
                  >
                    {loading ? (
                      <ActivityIndicator
                        size="large"
                        color={COLORS.white}
                      />
                    ) : (
                      <>
                        <Animated.View
                          style={{
                            transform: [{ rotate }],
                          }}
                        >
                          <Icon
                            name={
                              isPunchedIn
                                ? "logout"
                                : "login"
                            }
                            size={wp(6)}
                            color={COLORS.white}
                          />
                        </Animated.View>

                        <Text style={styles.buttonText}>
                          {modalTitle}
                        </Text>
                      </>
                    )}
                  </Animated.View>
                </Pressable>
              </Animated.View>
            </View>
            <Pressable
              style={styles.attendanceButton}
              onPress={() =>
                navigation?.navigate("AttendanceLog", {
                  hData: null,
                })
              }
            >
              <Icon
                name="history"
                type="material"
                size={18}
                color={COLORS.primary}
              />
              <Text style={styles.attendanceButtonText}>
                Attendance Log
              </Text>
            </Pressable>
          </View>
        </Animated.View>
        <Modal
          visible={confirmVisible}
          transparent
          animationType="fade"
          onRequestClose={() =>
            setConfirmVisible(false)
          }
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() =>
              setConfirmVisible(false)
            }
          >
            <Pressable style={styles.modalContainer}>
              <View
                style={[
                  styles.modalIconContainer,
                  {
                    backgroundColor: `${modalColor}25`,
                  },
                ]}
              >
                <Icon
                  name={
                    isPunchedIn
                      ? "logout"
                      : "login"
                  }
                  size={32}
                  color={modalColor}
                />
              </View>

              <Text style={styles.modalTitle}>
                {modalTitle}
              </Text>

              <Text style={styles.modalMessage}>
                {modalMessage}
              </Text>

              <View style={styles.modalButtonRow}>
                <Pressable
                  style={[
                    styles.modalButton,
                    styles.cancelButton,
                  ]}
                  onPress={() =>
                    setConfirmVisible(false)
                  }
                >
                  <Text style={styles.cancelText}>
                    {t("cancel")}
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.modalButton,
                    styles.confirmButton,
                    {
                      backgroundColor: modalColor,
                    },
                  ]}
                  onPress={handleConfirmPunch}
                >
                  <Text style={styles.confirmText}>
                    {t("confirm")}
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </>

  );
});

export default PunchCard;

const styles = StyleSheet.create({
  card: {
    width: wp(95),
    alignSelf: "center",
    marginTop: hp(1),
    padding: wp(4),
    backgroundColor: COLORS.ashGrey,
    borderRadius: wp(3),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  leftContainer: {
    flex: 1,
  },

  dateText: {
    fontSize: wp(4),
    color: COLORS.textPrimary,
    fontFamily: "Poppins_600SemiBold",
  },

  timeText: {
    fontSize: wp(7),
    color: COLORS.primary,
    fontFamily: "Poppins_600SemiBold",
    marginTop: hp(0.5),
  },

  buttonOuter: {
    width: wp(35),
    height: wp(35),
    borderRadius: wp(18),
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  }, rightSection: {
    alignItems: "center",
  },
  attendanceCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  
  attendanceContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  attendanceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  
  attendanceSubTitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },

  attendanceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: hp(1.5),
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(0.8),
    borderRadius: wp(6),
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },

  attendanceButtonText: {
    marginLeft: wp(1.5),
    color: COLORS.primary,
    fontSize: wp(3.2),
    fontFamily: "Poppins_600SemiBold",
  },

  glow: {
    position: "absolute",
    width: wp(35),
    height: wp(35),
    borderRadius: wp(18),
  },

  roundButton: {
    width: wp(35),
    height: wp(35),
    borderRadius: wp(18),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
    elevation: 6,
  },

  buttonText: {
    color: COLORS.white,
    fontSize: wp(3.5),
    fontFamily: "Poppins_600SemiBold",
    textAlign: "center",
    marginTop: hp(0.5),
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.80)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(6),
  },

  modalContainer: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: wp(5),
    padding: wp(6),
    alignItems: "center",
  },

  modalIconContainer: {
    width: wp(18),
    height: wp(18),
    borderRadius: wp(9),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hp(2),
  },

  modalTitle: {
    fontSize: wp(5),
    fontFamily: "Poppins_600SemiBold",
    color: COLORS.textPrimary,
  },

  modalMessage: {
    marginTop: hp(1),
    fontSize: wp(3.8),
    textAlign: "center",
    color: "#666",
    lineHeight: 22,
  },

  modalButtonRow: {
    flexDirection: "row",
    marginTop: hp(3),
    width: "100%",
  },

  modalButton: {
    flex: 1,
    paddingVertical: hp(1.5),
    borderRadius: wp(3),
    alignItems: "center",
  },

  cancelButton: {
    backgroundColor: "#F1F3F5",
    marginRight: wp(2),
  },

  confirmButton: {
    marginLeft: wp(2),
  },
  cancelText: {
    color: "#555",
    fontFamily: "Poppins_600SemiBold",
  },
  confirmText: {
    color: "#FFF",
    fontFamily: "Poppins_600SemiBold",
  },
});