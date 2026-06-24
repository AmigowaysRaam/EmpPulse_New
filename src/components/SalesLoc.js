import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

const CUSTOMERS = [
    {
        id: "1",
        name: "ABC Traders",
        latitude: 9.9252,
        longitude: 78.1198,
        visited: false,
    },
    {
        id: "2",
        name: "XYZ Agencies",
        latitude: 9.9315,
        longitude: 78.126,
        visited: false,
    },
    {
        id: "3",
        name: "Star Distributors",
        latitude: 9.938,
        longitude: 78.132,
        visited: false,
    },
];

export default function SalesTrackerScreen() {
    const mapRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [employeeLocation, setEmployeeLocation] = useState(null);
    const [customers, setCustomers] = useState(CUSTOMERS);
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    useEffect(() => {
        initializeLocation();
    }, []);

    const initializeLocation = async () => {
        try {
            const { status } =
                await Location.requestForegroundPermissionsAsync();

            if (status !== "granted") {
                Alert.alert(
                    "Permission Required",
                    "Location permission is required."
                );
                return;
            }

            const current =
                await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                });

            setEmployeeLocation(current.coords);

            await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    distanceInterval: 10,
                },
                (location) => {
                    setEmployeeLocation(location.coords);
                }
            );
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const calculateDistance = (
        lat1,
        lon1,
        lat2,
        lon2
    ) => {
        const R = 6371;

        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;

        const a =
            Math.sin(dLat / 2) *
            Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

        const c =
            2 * Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            );

        return R * c;
    };

    const distanceToCustomer = useMemo(() => {
        if (!employeeLocation || !selectedCustomer)
            return null;

        return calculateDistance(
            employeeLocation.latitude,
            employeeLocation.longitude,
            selectedCustomer.latitude,
            selectedCustomer.longitude
        );
    }, [employeeLocation, selectedCustomer]);

    const handleCheckIn = () => {
        if (!selectedCustomer) {
            Alert.alert(
                "Select Customer",
                "Choose a customer first."
            );
            return;
        }

        if (!distanceToCustomer) return;

        if (distanceToCustomer > 0.1) {
            Alert.alert(
                "Too Far",
                "You must be within 100 meters."
            );
            return;
        }

        const updated = customers.map((item) =>
            item.id === selectedCustomer.id
                ? { ...item, visited: true }
                : item
        );

        setCustomers(updated);

        Alert.alert(
            "Success",
            `Checked in at ${selectedCustomer.name}`
        );
    };

    const routeCoordinates = [
        ...(employeeLocation
            ? [
                {
                    latitude: employeeLocation.latitude,
                    longitude: employeeLocation.longitude,
                },
            ]
            : []),
        ...customers.map((item) => ({
            latitude: item.latitude,
            longitude: item.longitude,
        })),
    ];

    if (loading || !employeeLocation) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" />
                <Text style={styles.loaderText}>
                    Loading Location...
                </Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <Text style={styles.title}>
                    Sales Tracker
                </Text>

                <Text style={styles.subtitle}>
                    Live Visit Monitoring
                </Text>
            </View>

            <MapView
                ref={mapRef}
                style={styles.map}
                showsUserLocation
                initialRegion={{
                    latitude:
                        employeeLocation.latitude,
                    longitude:
                        employeeLocation.longitude,
                    latitudeDelta: 0.03,
                    longitudeDelta: 0.03,
                }}
            >
                <Marker
                    coordinate={{
                        latitude:
                            employeeLocation.latitude,
                        longitude:
                            employeeLocation.longitude,
                    }}
                    title="Employee"
                    pinColor="blue"
                />

                {customers.map((customer) => (
                    <Marker
                        key={customer.id}
                        coordinate={{
                            latitude:
                                customer.latitude,
                            longitude:
                                customer.longitude,
                        }}
                        title={customer.name}
                        pinColor={
                            customer.visited
                                ? "green"
                                : "red"
                        }
                        onPress={() =>
                            setSelectedCustomer(customer)
                        }
                    />
                ))}

                <Polyline
                    coordinates={routeCoordinates}
                    strokeWidth={4}
                />
            </MapView>

            <View style={styles.customerPanel}>
                <Text style={styles.panelTitle}>
                    Customers
                </Text>

                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={customers}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.customerCard,
                                selectedCustomer?.id ===
                                item.id &&
                                styles.selectedCard,
                            ]}
                            onPress={() =>
                                setSelectedCustomer(item)
                            }
                        >
                            <Text style={styles.customerName}>
                                {item.name}
                            </Text>

                            <Text>
                                {item.visited
                                    ? "✅ Visited"
                                    : "⏳ Pending"}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            <View style={styles.bottomSheet}>
                <Text style={styles.infoTitle}>
                    Visit Details
                </Text>

                <Text style={styles.info}>
                    Current Latitude:
                    {" "}
                    {employeeLocation.latitude.toFixed(
                        6
                    )}
                </Text>

                <Text style={styles.info}>
                    Current Longitude:
                    {" "}
                    {employeeLocation.longitude.toFixed(
                        6
                    )}
                </Text>

                {selectedCustomer && (
                    <>
                        <Text style={styles.info}>
                            Customer:
                            {" "}
                            {selectedCustomer.name}
                        </Text>

                        <Text style={styles.info}>
                            Distance:
                            {" "}
                            {distanceToCustomer
                                ? (
                                    distanceToCustomer *
                                    1000
                                ).toFixed(0)
                                : 0}
                            {" "}
                            m
                        </Text>
                    </>
                )}

                <TouchableOpacity
                    style={styles.checkinButton}
                    onPress={handleCheckIn}
                >
                    <MaterialCommunityIcons
                        name="map-marker-check"
                        size={22}
                        color="#fff"
                    />

                    <Text
                        style={styles.checkinText}
                    >
                        Check In
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    loaderText: {
        marginTop: 10,
    },

    header: {
        backgroundColor: "#fff",
        padding: 16,
    },

    title: {
        fontSize: 24,
        fontWeight: "700",
    },

    subtitle: {
        color: "#666",
        marginTop: 4,
    },

    map: {
        flex: 1,
    },

    customerPanel: {
        position: "absolute",
        top: 90,
        left: 10,
    },

    panelTitle: {
        fontWeight: "700",
        marginBottom: 10,
        backgroundColor: "#fff",
        padding: 8,
        borderRadius: 10,
    },

    customerCard: {
        backgroundColor: "#fff",
        padding: 12,
        marginRight: 10,
        borderRadius: 12,
        width: 150,
    },

    selectedCard: {
        borderWidth: 2,
    },

    customerName: {
        fontWeight: "600",
        marginBottom: 5,
    },

    bottomSheet: {
        position: "absolute", left: 10,
        right: 10, bottom: 10, backgroundColor: "#fff",
        borderRadius: 20, padding: 16,
    },

    infoTitle: {
        fontSize: 18, fontWeight: "700",
        marginBottom: 10,
    },

    info: { marginBottom: 5, },

    checkinButton: {
        marginTop: 12, backgroundColor: "#2563EB",
        height: 50, borderRadius: 12, flexDirection: "row",
        alignItems: "center", justifyContent: "center",
    },
    checkinText: {
        color: "#fff", fontWeight: "700", marginLeft: 8,
    },
});