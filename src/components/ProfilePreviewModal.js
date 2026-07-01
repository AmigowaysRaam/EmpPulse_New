import { useEffect } from "react";
import {
    Dimensions,
    Modal,
    Pressable,
    StyleSheet,
    View
} from "react-native";

import { Image } from "expo-image";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";


const { width } = Dimensions.get("window");

export default function ProfilePreviewModal({
  visible,
  onClose,
  user,
}) {
  const scale = useSharedValue(0.7);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1);
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      scale.value = withTiming(0.7, { duration: 150 });
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [visible]);

  const animatedContainer = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const animatedImage = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleClose = () => {
    scale.value = withTiming(0.7, { duration: 150 });
    opacity.value = withTiming(0, { duration: 150 }, (finished) => {
      if (finished) runOnJS(onClose)();
    });
  };

  if (!user) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.container}>

        {/* Background */}
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose}>
     
          <View style={styles.darkOverlay} />
        </Pressable>

        {/* Content */}
        <Animated.View style={[styles.content, animatedContainer]}>

          {/* Profile Image */}
          <Animated.View style={animatedImage}>
            <Image
              source={{ uri: user.image }}
              style={styles.image}
              contentFit="cover"
              transition={200}
            />
          </Animated.View>

          {/* Name */}
          <View style={styles.nameContainer}>
            <View style={styles.nameBar}>
              <Animated.Text style={styles.nameText}>
                {user.name}
              </Animated.Text>
            </View>
          </View>
          {/* Bottom Actions */}
          {/* <View style={styles.actions}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="call" size={26} color="white" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="videocam" size={28} color="white" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="information-circle" size={28} color="white" />
            </TouchableOpacity>
          </View> */}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },

  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },

  content: {
    alignItems: "center",
    justifyContent: "center",
  },

  image: {
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: 20,
    backgroundColor: "#222",
  },

  nameContainer: {
    marginTop: 15,
  },

  nameBar: {
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },

  nameText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  actions: {
    flexDirection: "row",
    marginTop: 25,
    gap: 25,
  },

  iconBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
});