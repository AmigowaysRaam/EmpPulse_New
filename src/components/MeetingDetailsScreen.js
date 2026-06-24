import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView, StyleSheet, Text, View,
} from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { useSelector } from "react-redux";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { fetchData } from "./api/Api";
import CommonHeader from "./CommonHeader";
import ImageViewerModal from "./ImageViewver";
import LocationPermissionModal from "./LocationPermissionModal";

const MeetingDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { mId } = route.params || {};
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
  const [location, setLocation] = useState(null);

  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  useEffect(() => {
    getMeetigDetails();
  }, []);

  const getMeetigDetails = async () => {
    try {
      setlaoding(true)
      const response = await fetchData(
        "meeting-lead-detail",
        "POST",
        {
          employeeId: profileDetails?.id,
          assignmentId: mId,
          latitude: location?.latitude,
          longitude: location?.longitude,
        }
      );
      if (response?.success) {
        const data = response?.data;
        // console.log(data,"datadata")
        setMeetingData(data);
        if (data?.visit?.startLat && data?.visit?.startLon) {
          setCurrentLocation({
            latitude: Number(data.visit.startLat),
            longitude: Number(data.visit.startLon),
          });
        } else {

        }
        setDestination({
          latitude: Number(data?.location?.leadLat),
          longitude: Number(data?.location?.leadLng),
        });
      }
    } catch (error) {
      console.log(
        "meeting-lead-detail API Error:",
        error
      );
    }
    finally {
      setlaoding(false)
    }
  };

  return (
    <View style={styles.wrapper}>
      <CommonHeader
        showBackButton
        title="Meeting Details"
        onBackPress={() => navigation.goBack()}
      />
      <LocationPermissionModal
        onLocationReceived={(coords) => {
          console.log("TIME Location:", coords);
          setLocation(coords);
        }}
      />


      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator
            color={COLORS.primary}
          />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: hp(3),
          }}
        >
          <View style={styles.container}>
            {meetingData?.activity?.length > 0 ? (
              <View style={styles.activityCard}>
                <Text style={styles.cardTitle}>
                  Travel Activity
                </Text>

                {meetingData.activity.map(
                  (item, index) => (
                    <View
                      key={index}
                      style={styles.timelineRow}
                    >
                      <View
                        style={styles.timelineLeft}
                      >
                        <View
                          style={styles.iconCircle}
                        >
                          <MaterialCommunityIcons
                            name={
                              item?.key === "travel_started"
                                ? "car"
                                : item?.key === "reached"
                                  ? "map-marker-check"
                                  : item?.key === "meeting_started"
                                    ? "account-group"
                                    : item?.key === "meeting_completed"
                                      ? "check-circle"
                                      : "circle"
                            }
                            size={16}
                            color="#fff"
                          />
                        </View>

                        {index !==
                          meetingData.activity
                            .length -
                          1 && (
                            <View
                              style={
                                styles.timelineLine
                              }
                            />
                          )}
                      </View>

                      <View
                        style={
                          styles.timelineContent
                        }
                      >
                        <View
                          style={styles.statusTag}
                        >
                          <Text
                            style={
                              styles.statusText
                            }
                          >
                            {item?.label}
                          </Text>
                        </View>

                        <Text
                          style={styles.timeText}
                        >
                          {new Date(
                            item?.at
                          ).toLocaleString()}
                        </Text>

                        <Text
                          style={styles.areaText}
                        >
                          {
                            item?.meta
                              ?.locationCard
                              ?.area
                          }
                          ,{" "}
                          {
                            item?.meta
                              ?.locationCard
                              ?.city
                          }
                        </Text>
                        <Text style={styles.addressText}>
                          {item?.meta?.locationCard?.fullAddress}
                        </Text>
                        {item?.meta?.imageUrl ? (
                          <Pressable
                            onPress={() => {
                              setSelectedImage(item?.meta?.imageUrl);
                              setViewerVisible(true);
                            }
                            }
                            style={styles.imageContainer}>
                            <Image
                              source={{ uri: item.meta.imageUrl }}
                              style={styles.activityImage}
                              resizeMode="contain"
                            />
                          </Pressable>
                        ) : null}
                      </View>
                    </View>
                  )
                )}
                <ImageViewerModal
                  visible={viewerVisible}
                  uri={selectedImage}
                  onClose={() =>
                    setViewerVisible(false)
                  }
                />
              </View>
            )
              :
              <Text style={{
                alignSelf: 'center', marginTop: hp(5),
                fontFamily: "Poppins_600SemiBold"
              }}>
                No Activity
              </Text>
            }
          </View>

        </ScrollView>
      )}
    </View>
  );
};
export default MeetingDetailsScreen;
const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#FFFFFF", }, container: { flex: 1, paddingHorizontal: wp(4), paddingTop: hp(1), }, infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: wp(4), padding: wp(2), marginBottom: hp(2), elevation: 3,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2, }, shadowOpacity: 0.08, shadowRadius: 4,
  }, loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.primary + "15", margin: wp(5), borderRadius: 20, },
  imageContainer: { marginTop: hp(1.5), }, activityImage: { width: "33%", height: hp(10), borderRadius: 2, backgroundColor: "#F3F4F6", }, activityCard: {
    backgroundColor: "#FFF", borderRadius: 18, padding: wp(2), marginBottom: hp(2),
  }, cardTitle: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: hp(2), }, timelineRow: { flexDirection: "row", }, timelineLeft: {
    width: 40, alignItems: "center",
  }, iconCircle: {
    width: wp(10), height: wp(10), borderRadius: wp(5), backgroundColor: COLORS.primary,
    justifyContent: "center", alignItems: "center",
  }, timelineLine: {
    width: 2, flex: 1, backgroundColor: "#E5E7EB", marginTop: 4,
  }, timelineContent: { flex: 1, paddingLeft: wp(3), paddingBottom: hp(2), }, statusTag: {
    alignSelf: "flex-start", backgroundColor: "#DCFCE7", paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, marginBottom: hp(1),
  }, statusText: { color: "#15803D", fontWeight: "700", fontSize: wp(3), },
  timeText: {
    color: "#6B7280", marginBottom: hp(0.8), fontSize: wp(3),
  }, areaText: { fontSize: wp(3.1), fontWeight: "700", color: "#111827", marginBottom: hp(0.5), }, addressText: { color: "#4B5563", fontSize: wp(2.5), lineHeight: 20, },
});