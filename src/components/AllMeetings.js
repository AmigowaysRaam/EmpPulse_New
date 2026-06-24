import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator, FlatList, Linking, Pressable, StyleSheet, Text, TextInput, View
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useSelector } from "react-redux";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { fetchData } from "./api/Api";
import CommonHeader from "./CommonHeader";

const AllMeetings = () => {
  const navigation = useNavigation();
  const profileDetails = useSelector(
    (state) => state?.auth?.profileDetails?.data
  );
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchText, setSearchText] = useState("");

  const PER_PAGE = 10;
  const fnGetMeetings = async (
    page = 1,
    search = "",
    isLoadMore = false
  ) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      const response = await fetchData(
        "all-meeting-activity",
        "POST",
        {
          employeeId: profileDetails?.id,
          pageNo: page,
          per_page: PER_PAGE,
          limit: PER_PAGE,
          search,
        }
      );

      const meetingData = response?.proposals || [];
      // Alert.alert('fd', JSON.stringify(meetingData))
      if (response?.success) {
        if (page === 1) {
          setMeetings(meetingData);
        } else {
          setMeetings(prev => [...prev, ...meetingData]);
        }

        setHasMore(meetingData.length === PER_PAGE);
      } else {
        if (page === 1) {
          setMeetings([]);
        }
        setHasMore(false);
      }
    } catch (error) {
      console.log("Meeting API Error:", error);

      if (page === 1) {
        setMeetings([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (profileDetails?.id) {
        setPageNo(1);
        fnGetMeetings(1, searchText);
      }
    }, [profileDetails?.id, searchText])
  );

  const handleSearch = (text) => {
    setSearchText(text);
    setPageNo(1);
    fnGetMeetings(1, text);
  };

  const handleView = (item) => {
    // console.log("Meeting Details:", item);
    navigation.navigate("MeetingDetailsScreen", {
      mId: item?.assignmentId,
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    setPageNo(1);
    setHasMore(true);
    fnGetMeetings(1, searchText);
  };
  const loadMoreMeetings = () => {
    if (
      loadingMore || loading || !hasMore) {
      return;
    }
    const nextPage = pageNo + 1;
    setPageNo(nextPage);

    fnGetMeetings(
      nextPage,
      searchText,
      true
    );
  };
  const renderMeeting = ({ item, index }) => {
    const clientName =
      item?.leadId?.name || "Client Meeting";

    const makeCall = (phoneNumber) => {
      if (!phoneNumber) return;

      Linking.openURL(`tel:${phoneNumber}`);
    };
    const location =
      item?.leadId?.address ||
      item?.leadId?.district ||
      "Location Not Available";
    const distance =
      item?.location?.distanceKm
        ? `${item.location.distanceKm} KM`
        : "--";
    const travelTime =
      item?.location?.drivingDurationMin
        ? `${item.location.drivingDurationMin} Min`
        : "--";
    return (
      <Pressable
        onPress={() => navigation?.navigate("MeetingDetailsScreen", {
          mId: item?.assignmentId
        })}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {clientName?.charAt(0)?.toUpperCase()}
            </Text>
          </View>
          {/* <Text>
            {JSON.stringify(item)}
          </Text> */}
          <View style={styles.clientInfo}>
            <Text
              numberOfLines={1}
              style={styles.clientName}
            >
              {clientName}
            </Text>
            <View style={styles.locationRow}>
              <Icon
                name="map-marker"
                size={15}
                color="#EF4444"
              />

              <Text
                numberOfLines={2}
                style={styles.location}
              >
                {location}
              </Text>
            </View>

            <Pressable
              onPress={() =>
                makeCall(item?.leadId?.contactNumber)
              }
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.location,
                  {
                    color: "#2563EB",
                    fontWeight: "700",
                    marginTop: 4,
                  },
                ]}
              >
                📞 {item?.leadId?.contactNumber}
              </Text>
            </Pressable>
          </View>

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {index + 1}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.leadText}>
            Lead ID : {item?.leadId?.leadId || "-"}
          </Text>
          <View style={styles.rightInfo}>
            <View style={styles.inlineMetric}>
              <Icon
                name="map-marker-distance"
                size={14}
                color={COLORS?.primary}
              />
              <Text style={styles.inlineMetricText}>
                {distance}
              </Text>
            </View>

            <View style={styles.inlineMetric}>
              <Icon
                name="clock-outline"
                size={14}
                color="#10B981"
              />
              <Text style={styles.inlineMetricText}>
                {travelTime}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.buttonRow}>
          <Pressable
            onPress={() => navigation.navigate("MeetingDetailsScreen",
              {
                mId: item?.assignmentId
              }
            )}
            style={[
              styles.viewButton,
              {
                flex: 1,
                marginTop: 0,
                marginRight: wp(1.5),
              },
            ]}
          >
            <Icon name="eye-outline" size={wp(4)} color="#FFF" />
            <Text style={styles.viewText}>View History</Text>
          </Pressable>
        </View>
      </Pressable>
    );
  };
  return (
    <View style={styles.wrapper}>
      <CommonHeader showBackButton
        onBackPress={() => navigation.goBack()}
        title="All Meetings" />
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Icon
            name="magnify"
            size={20}
            color="#64748B"
          />
          <TextInput
            placeholder="Search meetings..."
            value={searchText}
            onChangeText={handleSearch}
            style={styles.searchInput}
            placeholderTextColor="#94A3B8"
          />
        </View>
        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
            />
          </View>
        ) : (
          <>
            <FlatList
              data={meetings}
              keyExtractor={(item, index) =>
                item?.assignmentId || index.toString()
              }
              renderItem={renderMeeting}
              refreshing={refreshing}
              onRefresh={onRefresh}
              showsVerticalScrollIndicator={false}
              onEndReached={loadMoreMeetings}
              onEndReachedThreshold={0.3}
              ListFooterComponent={() =>
                loadingMore ? (
                  <View style={{ paddingVertical: 20 }}>
                    <ActivityIndicator
                      color={COLORS.primary}
                    />
                  </View>
                ) : null
              }
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Icon
                    name="calendar-remove"
                    size={60}
                    color="#CBD5E1"
                  />
                  <Text style={styles.emptyText}>
                    No Meetings Available
                  </Text>
                </View>
              )}
            />
          </>
        )}
      </View>
    </View>
  );
};

export default AllMeetings;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  searchContainer: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", borderRadius: wp(3), paddingHorizontal: wp(3),
    marginBottom: hp(1.5),
    borderWidth: 1, borderColor: "#E2E8F0",
  }, searchInput: {
    flex: 1, height: hp(6), marginLeft: wp(2),
    color: "#111827", fontSize: wp(3.5),
  }, container: { flex: 1, paddingHorizontal: wp(4), paddingTop: hp(1), }, headerCard: {
    backgroundColor: COLORS?.primary, borderRadius: wp(5), padding: wp(5),
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: hp(2),
  },
  headerTitle: { color: "#FFF", fontSize: wp(5), fontWeight: "700", },
  headerSubTitle: { color: "#DCE7FF", fontSize: wp(3.2), marginTop: hp(0.4), }, countBadge: {
    width: wp(14),
    height: wp(14), borderRadius: wp(7), backgroundColor: "#FFF", justifyContent: "center",
    alignItems: "center",
  }, countText: { color: COLORS?.primary, fontSize: wp(5), fontWeight: "700", }, card: {
    backgroundColor: COLORS?.primary + '22', borderRadius: wp(4), padding: wp(2),
    marginBottom: hp(1.5),
  }, cardHeader: { flexDirection: "row", alignItems: "center", },
  avatarContainer: {
    width: wp(8), height: wp(8), borderRadius: wp(6),
    backgroundColor: COLORS?.primary, justifyContent: "center", alignItems: "center",
  },
  avatarText: { color: "#FFF", fontSize: wp(4), fontWeight: "700", }, clientInfo: { flex: 1, marginLeft: wp(3), }, clientName: {
    color: "#111827", fontSize: wp(3), fontWeight: "700",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: hp(2),
  },

  halfButton: {
    flex: 1,
    marginTop: 0,
  },

  halfButtonFirst: {
    marginRight: wp(2),
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center", marginTop: hp(0.4),
  }, location: {
    color: "#6B7280", marginLeft: 4, flex: 1, fontSize: wp(3),
  }, statusBadge: {
    backgroundColor: "#E0E7FF", paddingHorizontal: wp(3), paddingVertical: hp(0.5), borderRadius: wp(5),
  }, statusText: { color: COLORS?.primary, fontSize: wp(2.8), fontWeight: "700", },
  bottomRow: {
    flexDirection: "row", justifyContent: "space-between",
  }, metricCard: { flexDirection: "row", alignItems: "center", }, iconCircle: {
    width: wp(10),
    height: wp(10), borderRadius: wp(5), justifyContent: "center", alignItems: "center",
    marginRight: wp(2),
  }, viewButton: {
    marginTop: hp(2), backgroundColor: COLORS?.primary, borderRadius: wp(3), paddingVertical: hp(1.2),
    flexDirection: "row", justifyContent: "center", alignItems: "center",
  },
  viewText: { color: "#FFF", fontSize: wp(3.3), fontWeight: "700", marginLeft: wp(1.5), }, viewAllButton: {
    backgroundColor: COLORS?.primary, marginTop: hp(1), marginBottom: hp(2), borderRadius: wp(3), paddingVertical: hp(1.4),
    flexDirection: "row",
    justifyContent: "center", alignItems: "center",
  }, viewAllText: {
    color: "#FFF", fontSize: wp(3.5), fontWeight: "700",
    marginRight: wp(2),
  }, loader: { flex: 1, justifyContent: "center", alignItems: "center", },
  emptyContainer: { alignItems: "center", justifyContent: "center", marginTop: hp(10), },
  emptyText: {
    marginTop: hp(1), color: "#64748B", fontSize: wp(3.8), fontWeight: "600",
  }, infoRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: hp(1.2),
  }, leadText: {
    color: "#111827", fontSize: wp(3.1), fontWeight: "600", flex: 1,
  }, rightInfo: { flexDirection: "row", alignItems: "center", }, inlineMetric: {
    flexDirection: "row", alignItems: "center",
    marginLeft: wp(3),
  }, inlineMetricText: { marginLeft: wp(1), color: "#374151", fontSize: wp(2.8), fontWeight: "600", },
});