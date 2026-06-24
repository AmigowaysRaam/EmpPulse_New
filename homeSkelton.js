import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import { COLORS } from "./app/resources/colors";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const wp = (percentage) => (SCREEN_WIDTH * percentage) / 100;
const hp = (percentage) => (SCREEN_HEIGHT * percentage) / 100;
const PRODUCT_WIDTH = (SCREEN_WIDTH - 30) / 2; // 2 columns with 10px spacing
const HomeLoader = () => {
    const Skeleton = ({ width, height, borderRadius, style }) => {
        const shimmerAnim = useRef(new Animated.Value(-1)).current;
        const duration = Math.floor(Math.random() * (1500 - 800 + 1)) + 800;
        useEffect(() => {
            Animated.loop(
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration,
                    useNativeDriver: true,
                })
            ).start();
        }, []);
        const getShimmerStyle = (loaderWidth) => {
            const translateX = shimmerAnim.interpolate({
                inputRange: [-1, 1],
                outputRange: [-loaderWidth, loaderWidth],
            });
            return {
                transform: [{ translateX }],
            };
        };
        return (
            <View
                style={[
                    {
                        width,
                        height,
                        borderRadius,
                        overflow: "hidden",
                        backgroundColor: COLORS?.primary + "20",
                        alignSelf: "center",
                    },
                    style,
                ]}
            >
                <Animated.View
                    style={[
                        {
                            width: "30%", // width of shimmer highlight
                            height: "100%",
                            backgroundColor: COLORS?.primary + "50",
                            opacity: 0.5,
                        },
                        StyleSheet.absoluteFill,
                        getShimmerStyle(width),
                    ]}
                />
            </View>
        );
    };

    const products = Array.from({ length: 8 }).map((_, i) => ({ id: i.toString() }));
    const renderProduct = () => (
        <View style={styles.productContainer}>
            <Skeleton width={PRODUCT_WIDTH} height={hp(12)} borderRadius={10} />
        </View>
    );
    return (
        <View style={styles.container}>
            <View style={[styles.banner, {
            }]}>
                <Skeleton
                    width={SCREEN_WIDTH - 20} height={hp(10)} borderRadius={10} />
            </View>
            <View style={[styles.banner, {
            }]}>
                <Skeleton
                    width={SCREEN_WIDTH - 20} height={hp(4)} borderRadius={10} />
            </View>
            <View style={[styles.banner, {
            }]}>
                <Skeleton
                    width={SCREEN_WIDTH - 20} height={hp(4)} borderRadius={10} />
            </View>
            <View style={[styles.banner, {
            }]}>
                <Skeleton
                    width={SCREEN_WIDTH - 20} height={hp(10)} borderRadius={10} />
            </View>
            <View style={[styles.banner, {
            }]}>
                <Skeleton
                    width={SCREEN_WIDTH - 20} height={hp(10)} borderRadius={10} />
            </View>
            <View style={[styles.banner, {
            }]}>
                <Skeleton
                    width={SCREEN_WIDTH - 20} height={hp(10)} borderRadius={10} />
            </View>

        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    banner: {
        paddingHorizontal: 10,
        marginBottom: hp(2),
    },
    productContainer: {
        marginBottom: hp(1),
    },
});
export default HomeLoader;
