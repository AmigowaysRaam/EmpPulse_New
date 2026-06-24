import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { useSelector } from "react-redux";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { useToast } from "../../constants/ToastContext";
import AddEvidenceModal from "./AddEvidenceModal";
import { BASE_URL, fetchData } from "./api/Api";
import CommonConfirmModal from "./CommonConfirmModal";
import CommonHeader from "./CommonHeader";
import ConfirmDropDown from "./ConfirmDropDown";
import LocationPermissionModal from "./LocationPermissionModal";
import MeetingInfoCard from "./MeetingInfoCard";
import MeetingRouteMap from "./MeetingRouteMap";

const MeetingTimeLine = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { mId } = route.params || {};
  const [selectedStatus, setSelectedStatus] =
    useState(null);
  const [showDropDonw, setshowDropDonw] =
    useState(false);
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    action: null,
  });
  useEffect(() => {
    if (meetingData?.flags?.canUpdate) {
      setgetUpdate(true);
    }
  }, [meetingData?.flags]);

  const [getUpdate, setgetUpdate] =
    useState(false);
  const [loading, setlaoding] =
    useState(false);
  const [meetingData, setMeetingData] =
    useState(null);
  const [destination, setDestination] =
    useState(null);
  const [currentLocation, setCurrentLocation] =
    useState(null);
  const profileDetails = useSelector(
    (state) => state?.auth?.profileDetails?.data
  );
  const [statusList, setstatusList] = useState([]);
  const [location, setLocation] = useState(null);

  const fnMeetingActionApi = async (key) => {
    try {
      // console.log("Action Key =>", key);
      const payload = {
        assignmentId: mId,
        employeeId: profileDetails?.id,
        key,
        lat: location?.latitude,
        lon: location?.longitude,

      };
      const response = await fetchData(
        "meeting-lead-detail",
        "POST",
        payload
      );
      if (response?.success) {
        getMeetigDetails();
      }
    } catch (error) {
      console.log("Meeting Action Error:", error);
    }
  };
  const getActionConfig = () => {
    const flags = meetingData?.flags;

    if (flags?.canStart) {
      return {
        text: "Start Journey",
        apiKey: "start_travel",
        color: "green",
      };
    }

    if (flags?.canStartMeeting) {
      return {
        text: "Start Meeting",
        apiKey: "start_meeting",
        color: "orange",
      };
    }
    if (flags?.canStopMeeting) {
      return {
        text: "Complete Meeting",
        apiKey: "complete_meeting",
        color: "red",
      };
    }
    if (flags?.canUpdate) {
      return {
        text: "Update Status",
        apiKey: "update_status",
        color: COLORS.primary,
      };
    }
    return null;
  };

  const actionConfig = getActionConfig();

  useEffect(() => {
    getMeetigDetails();
  }, [getUpdate]);

  const { showToast } = useToast();

  const getMeetigDetails = async () => {
    try {
      setlaoding(true)
      const response = await fetchData(
        "meeting-lead-detail",
        "POST",
        {
          employeeId: profileDetails?.id,
          assignmentId: mId,
          lat: location?.latitude,
          lon: location?.longitude,
        }
      );

      if (response?.message) {
        showToast(response?.message, "success");
      }
      console.log('response', JSON.stringify({
        employeeId: profileDetails?.id,
        assignmentId: mId,
        lat: location?.latitude,
        lon: location?.longitude,
      }))
      if (response?.success) {
        const data = response?.data;
        setMeetingData(data);
        if (data?.flags?.canUpdate) {
          setgetUpdate(true)
        }
        if (data?.visit?.startLat && data?.visit?.startLon) {
          setCurrentLocation({
            latitude: Number(data.visit.startLat),
            longitude: Number(data.visit.startLon),
          });
        } else {
          // const deviceLocation = await getCurrentLocation();
          // if (deviceLocation) {
          //   setCurrentLocation(deviceLocation);
          // }
        }
        setDestination({
          latitude: Number(data?.location?.leadLat),
          longitude: Number(data?.location?.leadLng),
        });
        setstatusList(data?.statusOptions)
      } else {
        setlaoding(false)
        {
          response?.message &&
            showToast(response?.message, "error");
        }
      }
    } catch (error) {
      setlaoding(false)
      console.log('error', error)
    }
    finally {
      setlaoding(false)
    }
  };

  const handleSumbitUpdate = async (data) => {
    setgetUpdate(false)
    try {
      setlaoding(true);
      console.log("Evidence Data =>", JSON.stringify(data));
      const formData = new FormData();
      formData.append(
        "employeeId",
        profileDetails?.id
      );
      formData.append(
        "assignmentId",
        mId
      );
      formData.append(
        "actionType",
        data?.status?.key
      );
      if (data?.description) {
        formData.append(
          "reason",
          data?.description
        );
      }
      if (
        data?.status?.key ===
        "reschedule_meeting" &&
        data?.dueDate
      ) {
        formData.append(
          "newScheduledAt",
          new Date(data.dueDate).toISOString()
        );
      }
      if (
        data?.media &&
        Array.isArray(data.media)
      ) {
        data.media.forEach((item, index) => {
          formData.append("image", {
            uri: item.uri,
            name:
              item.fileName ||
              `image_${index}.jpg`,
            type: "image/jpeg",
          });
        });
      }
      console.log(
        "Submitting Action =>",
        data?.status?.key
      );
      const response = await fetch(
        `${BASE_URL}upload-meeting-image`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type":
              "multipart/form-data",
          },
          body: formData,
        }
      );
      const result = await response.json();
      console.log(
        "Upload Response =>",
        JSON.stringify(result)
      );
      if (result?.success) {
        setgetUpdate(false);
        getMeetigDetails();
        showToast(result?.message, "success");
      } else {
        showToast(result?.message, "error");
      }
    } catch (error) {
      // showToast(result?.message, "success");
    } finally {
      setlaoding(false);
      getMeetigDetails();
    }
  };
  return (
    <View style={styles.wrapper}>
      <CommonHeader
        showBackButton
        title="Meeting Timeline"
        onBackPress={() => navigation.goBack()}
      />
      <LocationPermissionModal
        onLocationReceived={(coords) => {
          console.log("TIME Location:", coords);
          setLocation(coords);
        }}
      />
      {
        loading ?
          <View style={{
            flex: 1, alignItems: "center", justifyContent: 'center',
            backgroundColor: COLORS?.primary + '22', margin: wp(5), borderRadius: wp(10)
          }}>
            <ActivityIndicator color={COLORS?.primary} />
          </View>
          :
          <>
            <View style={styles.container}>
              <MeetingInfoCard
                meetingData={meetingData}
              />
              <MeetingRouteMap
                currentLocation={currentLocation}
                destination={destination}
                meetingData={meetingData}
                profileDetails={profileDetails}
              />
              <AddEvidenceModal
                statusList={statusList}
                visible={getUpdate}
                onClose={() => {
                  setgetUpdate(false)
                  if (meetingData?.flags?.canUpdate) {
                    navigation?.goBack()
                  }
                }
                }
                onSubmit={(data) => {
                  handleSumbitUpdate(data)
                  console.log(
                    "Evidence Data =>",
                    data
                  );
                }}
              />

              <CommonConfirmModal
                visible={confirmModal.visible}
                title={confirmModal?.action?.text}
                message={`Are you sure you want to ${confirmModal?.action?.text?.toLowerCase()}?`}
                onCancel={() =>
                  setConfirmModal({
                    visible: false,
                    action: null,
                  })
                }
                onConfirm={() => {
                  const action = confirmModal.action;

                  setConfirmModal({
                    visible: false,
                    action: null,
                  });

                  if (action?.apiKey === "update_status") {
                    setgetUpdate(true);
                    return;
                  }
                  fnMeetingActionApi(action?.apiKey);
                }}
              />
              <ConfirmDropDown
                title="Meeting Status"
                onClose={() =>
                  setshowDropDonw(false)
                }
                isVisible={showDropDonw}
                data={statusList}
                selectedItem={{
                  value: selectedStatus?.value,
                }}
                onSelect={(item) => {
                  setshowDropDonw(false);
                  setSelectedStatus(item);
                }}
              />

              {/* meetingData?.flags === {"canStart":true,"canStartMeeting":false,"canStopMeeting":false,"canUpdate":false,"hasReachedDestination":false,"isOngoing":false,"_debug_blockers":[]} meetingData?.flags */}
              {actionConfig && (
                <View style={styles.buttonRow}>
                  <Pressable
                    onPress={() =>
                      setConfirmModal({
                        visible: true,
                        action: actionConfig,
                      })
                    }
                    style={[
                      styles.actionButton,
                      {
                        marginRight: wp(2),
                        backgroundColor: actionConfig.color,
                      },
                    ]}
                  >
                    <Text style={styles.updateButtonText}>
                      {actionConfig.text}
                    </Text>
                  </Pressable>
                </View>
              )}
              {/* this is for Update only  */}
              {/* <View style={styles.buttonRow}>
                <Pressable
                  onPress={() =>
                    setgetUpdate(true)
                  }
                  style={[styles.actionButton, { marginRight: wp(2) }]}
                >
                  <Text style={styles.updateButtonText}>
                    Update Status
                  </Text>
                </Pressable>
              </View> */}
            </View>
          </>
      }
    </View>
  );
};
export default MeetingTimeLine;
const styles = StyleSheet.create({
  wrapper: {
    flex: 1, backgroundColor: "#F8FAFC",
  }, topRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
  }, buttonRow: { flexDirection: "row", marginTop: hp(2), }, actionButton: {
    flex: 1, backgroundColor: COLORS.primary,
    paddingVertical: hp(1.8), borderRadius: wp(3), alignItems: "center", justifyContent: "center",
  }, distanceContainer: {
    alignItems: "flex-end", minWidth: wp(22),
  }, smallLabel: { fontSize: wp(3), color: "#6B7280", }, smallValue: {
    fontSize: wp(3.5), color: "#111827", marginTop: wp(1), fontFamily: "Poppins_600SemiBold"
  }, container: { flex: 1, paddingHorizontal: wp(4), paddingTop: hp(1), }, infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: wp(4), padding: wp(4), marginBottom: hp(2), elevation: 3,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.08, shadowRadius: 4,
  }, leadName: {
    fontSize: wp(5), fontWeight: "700", color: "#111827",
  }, phoneText: { marginTop: hp(0.8), fontSize: wp(3.8), color: COLORS.primary, fontWeight: "600", }, addressText: {
    marginTop: hp(0.8), fontSize: wp(3.4), color: "#6B7280", lineHeight: hp(2.3),
  }, divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: hp(1.5), },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: hp(1), }, item: { width: "48%", }, label: {
    fontSize: wp(3.2), color: "#6B7280", marginBottom: hp(0.4),
  }, value: {
    fontSize: wp(3.6), color: "#111827", fontWeight: "600",
  }, mapContainer: { overflow: "hidden", borderRadius: wp(4), }, map: { height: hp(45), width: "100%", }, updateButton: {
    backgroundColor: COLORS.primary, marginTop: hp(2), paddingVertical: hp(1.8),
    borderRadius: wp(3), alignItems: "center",
  }, updateButtonText: {
    color: "#FFF", fontWeight: "700", fontSize: wp(4),
  },
});