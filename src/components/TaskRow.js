import { useNavigation } from "@react-navigation/native";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Image, ImageBackground, Pressable, StyleSheet, Text, View
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

const TAB_ITEMS = [
  {
    key: "my_task",
    icon: require("../../assets/myTaskFill.png"),
    route: "MyTaskListScreen",
  },
  {
    key: "assigned_task",
    icon: require("../../assets/assignTaskFill.png"),
    route: "AssignTaskListScreen",
  },
];
const TaskRow = ({ homepageData }) => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  return (
    <>
      {/* 🔥 Create New Task at Top */}
      {homepageData?.allowCreateTask && (
        <Pressable
          style={{
            alignSelf: "center",
            marginTop: hp(2),
            width: wp(94),
          }}
          onPress={() =>
            navigation?.navigate("CreateTask", {
              canAssign: homepageData?.canAssign,
            })
          }
        >
          <View>
            <View>
              <ImageBackground
                resizeMode="cover"
                // source={require("../../assets/cardBg.png")}
                style={[
                  styles.card,
                  {
                    width: wp(94),
                    alignItems: "center",
                    justifyContent: "center",
                    height: hp(7),
                    backgroundColor: COLORS.primary, opacity: 1

                  },
                ]}
                imageStyle={[
                  styles.cardImage,
                  {
                    borderRadius: wp(2),
                  },
                ]}
              >
                <Icon
                  name="add-circle"
                  size={wp(8)}
                  color="#fff"
                  style={{ marginRight: hp(2) }}
                />

                <Text
                  style={[
                    styles.greeting,
                    {
                      maxWidth: wp(70),
                      fontSize: wp(4.3),
                      lineHeight: wp(6),
                    },
                  ]}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {t("create_new_task")}
                </Text>
              </ImageBackground>
            </View>
          </View>
        </Pressable>
      )}

      {/* 🔥 Task Cards Below */}
      <View style={styles.container}>
        {TAB_ITEMS.map((item, index) => {
          const isLeft = index === 0;

          return (
            <Pressable
              key={item.key}
              onPress={() =>
                navigation.navigate(item.route, { status: null })
              }
            >
              <View style={styles.wrapper}>
                <ImageBackground
                  resizeMode="cover"
                  // source={require("../../assets/buttonLgrd.png")}
                  style={[styles.card, {
                    backgroundColor: COLORS.primary, opacity: 1,
                    borderRadius: wp(4),
                  }]}
                  imageStyle={styles.cardImage}
                >
                  <Image
                    tintColor={COLORS.white}
                    source={item.icon}
                    style={styles.icon}
                    resizeMode="contain"
                  />

                  <Text
                    style={styles.greeting}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {t(item.key)}
                  </Text>
                </ImageBackground>
              </View>
            </Pressable>
          );
        })}
      </View>
    </>
  );
};
export default TaskRow;
const styles = StyleSheet.create({
  container: {
    flexDirection: "row", justifyContent: "space-between", width: wp(94), alignSelf: "center",
  }, wrapper: {
    marginVertical: wp(4), alignItems: "center",
  }, card: {
    width: wp(46), height: hp(7), paddingHorizontal: hp(2),
    flexDirection: "row", alignItems: "center",
  }, cardImage: { borderRadius: wp(2), }, icon: {
    width: wp(7), height: wp(7), marginRight: hp(1),
  }, greeting: {
    fontFamily: "Poppins_600SemiBold", color: COLORS.white, fontSize: wp(3.3), lineHeight: hp(2.6), flexShrink: 1,
    maxWidth: wp(30),
  },
});
