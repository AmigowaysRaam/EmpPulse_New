import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef } from "react";
import {
  Animated, Image, Pressable, StyleSheet, Text, View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../app/resources/colors";
import { wp } from "../../app/resources/dimensions";
export default function ChatHeader({
  title = "",
  onBackPress,
  showBackButton = true,
  rightIconName,
  onRightIconPress,
}) {
  const navigation = useNavigation();
  const backScale = useRef(new Animated.Value(1)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(titleAnim, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleBack = () => {
    Animated.sequence([
      Animated.timing(backScale, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(backScale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onBackPress) {
        onBackPress();
      } else {
      }
    });
  };
  const titleTranslate = titleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });
  const titleOpacity = titleAnim;
  return (
    <View style={styles.shadowWrapper}>
      <View style={styles.container}>
        {/* Back Arrow */}
        {
          showBackButton &&
          <Pressable onPress={handleBack} hitSlop={10}>
            <Animated.View
              style={[
                styles.iconContainer,
                { transform: [{ scale: backScale }] },
              ]}
            >
              <Image
                source={require("../../assets/backIcon.png")}
                style={styles.icon}
              />
            </Animated.View>
          </Pressable>
        }
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: titleOpacity,
              transform: [{ translateX: titleTranslate }],
            },
          ]}
        >
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>
        </Animated.View>
        {rightIconName && (
          <Pressable onPress={onRightIconPress} hitSlop={10}>
            <Ionicons
              name={rightIconName}
              size={wp(7)}
              color={COLORS.primary}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  shadowWrapper: { backgroundColor: "#fff", shadowColor: "#000", }, container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wp(4), height: wp(15), borderBottomWidth: 1, borderColor: "#ccc",
  },
  iconContainer: {
    padding: wp(1),
    marginRight: wp(3),
  }, icon: { width: wp(6), height: wp(6), resizeMode: "contain", },
  titleContainer: {
    flex: 1, alignItems: "flex-start",
  }, title: {
    fontSize: wp(5.5), color: COLORS.primary, fontFamily: "Poppins_500Medium", lineHeight: wp(8), textTransform: 'capitalize'
  },
});
