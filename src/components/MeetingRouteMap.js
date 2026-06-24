import { Ionicons } from "@expo/vector-icons";
import React, { useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

const GOOGLE_MAPS_API_KEY =
  "AIzaSyD3aWLyn9qHavlshIy49b1Pi9jjKjIPMnc";

const MeetingRouteMap = ({
  currentLocation,
  destination,
  meetingData, profileDetails
}) => {
  const mapRef = useRef(null);

  const region =
    currentLocation && destination
      ? {
        latitude:
          (currentLocation.latitude +
            destination.latitude) /
          2,
        longitude:
          (currentLocation.longitude +
            destination.longitude) /
          2,
        latitudeDelta: 1,
        longitudeDelta: 1,
      }
      : null;

  if (
    !currentLocation ||
    !destination ||
    !region
  ) {
    return null;
  }

  return (
    <View style={styles.mapContainer}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        showsCompass
        zoomEnabled
        scrollEnabled
      >
        <Marker
          coordinate={currentLocation}
          title="Start Location"
          pinColor="green"
        >
          <View style={{
            width: wp(7), height: wp(7), backgroundColor: COLORS?.primary,
            borderRadius: wp(4), alignItems: "center", justifyContent: "center"
          }}>
            <Ionicons name="person" color={"#fff"} />
          </View>
          <Text numberOfLines={1} style={{
            fontFamily: 'Poppins_500SemiBold',
            backgroundColor: "#ccc", borderRadius: wp(1), padding: wp(0.5),
            fontSize: wp(2.5)
          }}>{profileDetails?.full_name}</Text>
        </Marker>

        <Marker
          coordinate={destination}
          title={
            meetingData?.lead?.name ||
            "Destination"
          }
          description={
            meetingData?.lead?.fullAddress
          }
          pinColor="red"
        />
        <MapViewDirections
          origin={currentLocation}
          destination={destination}
          apikey={GOOGLE_MAPS_API_KEY}
          strokeWidth={5}
          strokeColor={COLORS?.primary}
          mode="DRIVING"
          optimizeWaypoints
          onReady={(result) => {
            mapRef.current?.fitToCoordinates(
              result.coordinates,
              {
                edgePadding: {
                  top: 80, right: 40,
                  bottom: 80, left: 40,
                },
                animated: true,
              }
            );
          }}
          onError={(error) => {
            console.log(
              "Directions Error:",
              error
            );
          }}
        />
      </MapView>
    </View>
  );
};

export default MeetingRouteMap;

const styles = StyleSheet.create({
  mapContainer: {
    overflow: "hidden",
    borderRadius: wp(4),
  },

  map: {
    height: hp(45),
    width: "100%",
  },
});