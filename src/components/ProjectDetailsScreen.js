import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";
import CommonHeader from "./CommonHeader";

import CredentialsTab from "./CredentialsTab";
import DetailsTab from "./DetailsTab";
import PaymentTab from "./PaymentTab";
const ProjectDetailsScreen = () => {
  const [activeTab, setActiveTab] = useState("details");

  const renderTabContent = () => {
    switch (activeTab) {
      case "details":
        return <DetailsTab />;
      case "payment":
        return <PaymentTab />;
      case "credentials":
        return <CredentialsTab />;
      default:
        return null;
    }
  };

  return (
    <>
      <CommonHeader title="Project Details" />

      <View style={styles.container}>
        {/* Tabs */}
        <View style={styles.tabContainer}>
          {["details", "payment", "credentials"].map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tab,
                activeTab === tab && styles.activeTab,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Content */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderTabContent()}
        </ScrollView>
      </View>
    </>
  );
};

export default ProjectDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: wp(4),
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: wp(3),
    padding: 5,
    marginBottom: hp(2),
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: hp(1),
    alignItems: "center",
    borderRadius: wp(2),
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: wp(3.2),
    color: "#666",
    fontWeight: "600",
  },
  activeTabText: {
    color: "#fff",
  },
});