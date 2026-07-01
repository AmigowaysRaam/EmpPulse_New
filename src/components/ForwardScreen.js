import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList, Keyboard, Modal, StyleSheet, Text, TextInput, TouchableOpacity,
  View
} from "react-native";
import { useSelector } from "react-redux";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import { useToast } from "../../constants/ToastContext";
import { fetchData } from "./api/Api";
import ChatHeader from "./ChatHeader";
const ForwardScreen = ({ visible, }) => {

  const profileDetails = useSelector(
    (state) => state?.auth?.profileDetails?.data
  );
  const [page, setPage] = useState(1);
  const { messages } = useRoute()?.params || {};
  const { showToast } = useToast();
  const [hasMore, setHasMore] = useState(true);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [selectedUsers, setselectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const navigation = useNavigation();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const onClose = () => {
    navigation?.goBack()
  }
  useEffect(() => {
    // console.log("Keyboard Listener Added",
    //   JSON.stringify(messages, null, 2)
    // );
    const showSubscription = Keyboard.addListener(
      "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const hideSubscription = Keyboard.addListener(
      "keyboardDidHide",
      () => setKeyboardVisible(false)
    );
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);
  const onRefresh = async () => {
    try {
      setRefreshing(true); setPage(1); setHasMore(true);
      await fnGetAllEmp(1, false, search.trim());
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
    }
  };
  const [groupNameError, setGroupNameError] = useState("");
  const onSubmitApi = async () => {
    // messages MAP this id only and bind to the payload and send to the api
    // in this change the functionlity to forward the message to selected users or create a group chat with selected users
    try {
      setLoading(true);
      const memberIds = selectedUsers.map((user) => user._id);
      const mId = messages.map((mess) => mess.id);
      const body = {
        companyId: profileDetails?.companyId,
        userId: profileDetails?.id,
        messageId:mId,
        memberIds: memberIds,
      };
      // Alert.alert('', JSON.stringify(body, null, 2));
      return
      const response = await fetchData(
        "chat-forward-message",
        "POST",
        body
      );
      if (response?.success) {
        navigation.goBack();
        showToast(response?.message || 'Group Created Success', "success");
        // or navigate wherever you want
        // navigation.navigate("GroupChatScreen", {
        //   conversation: response?.conversation,
        // });
      }
      else {
        showToast(response?.message, "error");
      }
    } catch (err) {
      console.log("Create Group Error :", err);
    } finally {
      setLoading(false);
    }
  };
  const fnGetAllEmp = async (
    pageNo = 1,
    isLoadMore = false,
    searchText = search
  ) => {
    try {
      if (isLoadMore) {
        setPaginationLoading(true);
      } else {
        setLoading(true);
      }
      const response = await fetchData("kas-employee-list", "POST", {
        companyId: profileDetails?.companyId,
        limit: 20,
        page: pageNo,
        search: searchText,
      });

      const employees = Array.isArray(response?.employees)
        ? response.employees
        : [];

      setHasMore(employees.length >= 20);

      if (isLoadMore) {
        setEmployeeList((prev) => [...prev, ...employees]);
      } else {
        setEmployeeList(employees);
      }
    } catch (err) {
      console.log("Employee List Error:", err);
    } finally {
      setLoading(false);
      setPaginationLoading(false);
    }
  };
  useEffect(() => {
    if (visible) {
      setPage(1);
      setHasMore(true);
      setEmployeeList([]);
      fnGetAllEmp(1);
    }
  }, [visible]);
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setPage(1);
      setHasMore(true);
      fnGetAllEmp(1, false, search.trim());
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  const getEmployeeName = (employee) => {
    if (!employee) return "Unknown Employee";
    if (typeof employee?.employeeName === "string") {
      return employee.employeeName;
    }

    if (
      employee?.employeeName &&
      typeof employee.employeeName === "object"
    ) {
      return (
        employee.employeeName?.name ||
        employee.employeeName?.employeeName ||
        employee.employeeName?.fullName ||
        "Unknown Employee"
      );
    }
    return "Unknown Employee";
  };
  const handleLoadMore = () => {
    if (
      loading || paginationLoading || !hasMore) {
      return;
    }
    const nextPage = page + 1;
    setPage(nextPage);
    fnGetAllEmp(nextPage, true, search.trim());
  };
  const handleStartChart = async (props) => {
    try {
      setLoading(true);
      const response = await fetchData("chat-dm-create", "POST", {
        companyId: profileDetails?.companyId,
        contactId: props?._id,
        userId: profileDetails?.id
      });
      if (response?.success) {
        navigation?.navigate('ChatConvoScreen', { item: response?.conversation })
        // console?.log(response, "chat-dm-create")
        onClose();
      }
    } catch (err) {
      console.log("Employee List Error:", err);
    } finally {
      setLoading(false);
    }
  }
  const toggleSelection = (user) => {
    setselectedUsers((prev) => {
      const exists = prev.some((item) => item._id === user._id);
      if (exists) {
        return prev.filter((item) => item._id !== user._id);
      }
      return [...prev, user];
    });
  };
  const renderItem = ({ item }) => {
    const employeeName = getEmployeeName(item);
    const mobileNumber =
      typeof item?.mobileNumber === "object"
        ? item?.mobileNumber?.number || item?.mobileNumber?.mobile || ""
        : item?.mobileNumber;

    const designation =
      typeof item?.designation === "object"
        ? item?.designation?.name || item?.designation?.title || ""
        : item?.designation;

    const isSelected = selectedUsers.some(user => user._id === item._id);
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.card,
          isSelected && styles.selectedCard,
        ]}
        onPress={() => toggleSelection(item)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {employeeName?.charAt(0)?.toUpperCase() || "E"}
          </Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>
            {employeeName}
            {/* {JSON.stringify(item)} */}

          </Text>

          <Text style={styles.mobile}>
            {mobileNumber
              ? `${String(mobileNumber)}`
              : " No mobile number"}
          </Text>

          {!!designation && (
            <Text style={styles.designation}>
              {String(designation)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!paginationLoading) return null;

    return (
      <View style={{ paddingVertical: 15 }}>
        <ActivityIndicator size="small" color={COLORS?.primary} />
      </View>
    );
  };


  return (
    <>
      <ChatHeader
        title="Forward to"
        onBackPress={() => navigation?.goBack()}
        showBackButton />
      <View style={styles.screen}>
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search employee..."
            placeholderTextColor="#111"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />

          {!!search && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={employeeList}
            keyExtractor={(item, index) =>
              String(item?._id || item?.id || index)
            }
            ListEmptyComponent={
              <>
                <Text style={{
                  alignSelf: "center", marginTop: hp(10),
                  fontFamily: "Poppins_400Regular", fontSize: wp(4.5)
                }}>
                  No Employee
                </Text>
              </>
            }
            renderItem={renderItem}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            refreshing={refreshing}
            onRefresh={onRefresh}
            ListFooterComponent={renderFooter}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: 120,
            }}
          />
        )}
        {selectedUsers.length > 0 && (
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              onPress={() => setGroupModalVisible(true)}
              style={styles.createBtn}
            >
              <Text style={styles.createBtnText}>
                Create Group ({selectedUsers.length})
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <Modal
        visible={groupModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setGroupModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, {
            marginBottom: keyboardVisible ? hp(25) : 0,
          }]}>

            <Text style={styles.modalTitle}>
            Are you sure you want to forward this message?
            </Text>


          
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setGroupModalVisible(false);
                }}
              >
                <Text style={styles.cancelText}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.createModalBtn}
                onPress={() => {
                  onSubmitApi();
                }}
              >
                <Text style={styles.createText}>Forward</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};
export default ForwardScreen;
const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center", alignItems: "center",
  },
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center",
    alignItems: "center",
  }, modalContainer: {
    width: "90%", backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
  }, modalTitle: { fontSize: wp(4.5), 
    fontFamily: "Poppins_400Regular", textAlign: "center",
    marginBottom: 20, color: "#111", },
  modalInput: {
    borderWidth: 1, borderColor: "#ddd",
    borderRadius: wp(1), paddingHorizontal: wp(3), marginBottom: wp(4), height: wp(12),
  },
  modalButtonRow: { flexDirection: "row", justifyContent: "flex-end", },
  cancelBtn: {
    paddingHorizontal: 20, paddingVertical: 10, marginRight: 10,
  },
  errorText: {
    color: "red", fontSize: 12, marginTop: -10, marginBottom: 10, marginLeft: 4,
  }, cancelText: { color: "#666", fontWeight: "600", },

  createModalBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: wp(5), paddingVertical: wp(2), borderRadius: 8,
  },
  createText: { color: "#fff", fontWeight: "700", }, screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: wp(3), padding: wp(4),
  }, bottomContainer: {
    position: "absolute",
    bottom: 20,
    left: 20, right: 20,
  }, createBtn: {
    backgroundColor: COLORS.primary, height: 55, borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  }, createBtnText: {
    color: "#FFF", fontSize: 16,
    fontWeight: "600",
  },
  card: { padding: 16, backgroundColor: "#fff", }, selectedCard: {
    backgroundColor: "#d0ebff",
  }, container: {
    width: "98%", height: "90%", backgroundColor: "#F8FAFC", borderRadius: wp(2), paddingHorizontal: wp(3), paddingTop: wp(2),
    paddingBottom: wp(2),
  }, header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15,
  }, title: { fontSize: wp(4.9), color: "#111827", fontFamily: "Poppins_400Regular" }, close: { fontSize: 22, fontWeight: "700", },
  searchContainer: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1, borderColor: "#E5E7EB", marginBottom: 10,
  }, searchInput: {
    flex: 1, height: 48, fontSize: 15, color: "#555", fontFamily: "Poppins_400Regular"
  }, clearText: {
    fontSize: 18, color: "#999", paddingLeft: 10, fontFamily: "Poppins_400Regular"
  }, countText: {
    marginBottom: 10, fontSize: 13, color: "#6B7280", fontWeight: "500", fontFamily: "Poppins_400Regular"
  }, card: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", padding: wp(2), borderRadius: 14, marginBottom: wp(1),
  }, avatar: {
    width: wp(10), height: wp(10), borderRadius: wp(10), backgroundColor: COLORS?.primary, justifyContent: "center", alignItems: "center", marginRight: wp(3),
  }, avatarText: {
    color: "#FFFFFF", fontSize: wp(4.3), fontFamily: "Poppins_400Regular"
  }, info: {
    flex: 1, fontFamily: "Poppins_400Regular"
  }, name: { fontSize: wp(3.5), fontWeight: "700", color: "#111827", textTransform: "capitalize", fontFamily: "Poppins_400Regular" }, mobile: {
    marginTop: 4, fontSize: wp(3.5), color: "#6B7280", fontWeight: "700",
  }, designation: { marginTop: 4, fontSize: wp(3.5), color: "#4F46E5", }, loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center", }, emptyContainer: { marginTop: 60, alignItems: "center", }, emptyText: { fontSize: 15, color: "#9CA3AF", },
});