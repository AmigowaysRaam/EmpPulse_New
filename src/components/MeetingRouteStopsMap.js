import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";

import { COLORS } from "../../app/resources/colors";
import { hp, wp } from "../../app/resources/dimensions";

const GOOGLE_MAPS_API_KEY =
  "AIzaSyD3aWLyn9qHavlshIy49b1Pi9jjKjIPMnc";

const MeetingRouteStopsMap = ({
  currentLocation,
  destination,
  meetingData,
  profileDetails,
}) => {
  const mapRef = useRef(null);
  const hasFittedMap = useRef(false);

  const stops = useMemo(() => {
    if (!meetingData?.activity?.length) return [];

    return meetingData.activity
      .filter(
        (item) =>
          item?.meta?.lat != null &&
          item?.meta?.lon != null
      )
      .map((item, index) => ({
        id: `${item.key}-${index}`,
        label:
          item.label ||
          item.key?.replace(/_/g, " "),
        key: item.key,
        at: item.at,
        coordinate: {
          latitude: Number(item.meta.lat),
          longitude: Number(item.meta.lon),
        },
      }));
  }, [meetingData?.activity]);

  const waypoints = useMemo(
    () => stops.map((stop) => stop.coordinate),
    [stops]
  );

  const region = useMemo(() => {
    if (!currentLocation || !destination)
      return null;

    return {
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
    };
  }, [currentLocation, destination]);

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
        showsUserLocation={false}
        showsCompass
        zoomEnabled
        scrollEnabled
      >
        {/* User Marker */}
        <Marker
          coordinate={currentLocation}
          tracksViewChanges={false}
        >
          <View style={styles.userMarkerWrapper}>
            <View style={styles.userMarker}>
              <Ionicons
                name="person"
                size={18}
                color="#fff"
              />
            </View>

            {!!profileDetails?.full_name && (
              <View style={styles.nameContainer}>
                <Text
                  numberOfLines={1}
                  style={styles.nameText}
                >
                  {profileDetails.full_name}
                </Text>
              </View>
            )}
          </View>
        </Marker>

        {/* Activity Stops */}
        {stops.map((stop, index) => (
          <Marker
            key={stop.id}
            coordinate={stop.coordinate}
            title={stop.label}
            description={new Date(
              stop.at
            ).toLocaleString()}
            tracksViewChanges={false}
          >
            <View style={styles.stopMarker}>
              <Text style={styles.stopNumber}>
                {index + 1}
              </Text>
            </View>
          </Marker>
        ))}

        {/* Destination */}
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
          waypoints={waypoints}
          apikey={GOOGLE_MAPS_API_KEY}
          strokeWidth={5}
          strokeColor={COLORS.primary}
          mode="DRIVING"
          optimizeWaypoints
          onReady={(result) => {
            if (hasFittedMap.current) return;

            hasFittedMap.current = true;

            mapRef.current?.fitToCoordinates(
              result.coordinates,
              {
                edgePadding: {
                  top: 80,
                  right: 40,
                  bottom: 80,
                  left: 40,
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

      {/* Activity Timeline */}
      {stops.length > 0 && (
        <View style={styles.timelineContainer}>
          <Text style={styles.timelineTitle}>
            Travel Activity
          </Text>

          {stops.map((item, index) => (
            <View
              key={item.id}
              style={styles.timelineRow}
            >
              <View style={styles.timelineDot}>
                <Text
                  style={styles.timelineDotText}
                >
                  {index + 1}
                </Text>
              </View>

              <View
                style={styles.timelineContent}
              >
                <Text
                  style={styles.timelineLabel}
                >
                  {item.label}
                </Text>

                <Text
                  style={styles.timelineTime}
                >
                  {new Date(
                    item.at
                  ).toLocaleString()}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default React.memo(
  MeetingRouteStopsMap
);

const styles = StyleSheet.create({
  mapContainer: {
    overflow: "hidden",
    borderRadius: wp(4),
  },

  map: {
    height: hp(45),
    width: "100%",
  },

  userMarkerWrapper: {
    alignItems: "center",
  },

  userMarker: {
    width: wp(7),
    height: wp(7),
    borderRadius: wp(3.5),
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  nameContainer: {
    marginTop: 4,
    backgroundColor: "#EAEAEA",
    borderRadius: wp(1),
    paddingHorizontal: wp(2),
    paddingVertical: wp(0.5),
    maxWidth: wp(25),
  },

  nameText: {
    fontFamily: "Poppins_500SemiBold",
    fontSize: wp(2.5),
  },

  stopMarker: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: "#FF9800",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },

  stopNumber: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: wp(3),
  },

  timelineContainer: {
    paddingHorizontal: wp(2),
    marginTop: hp(2),
  },

  timelineTitle: {
    fontSize: wp(4),
    fontWeight: "700",
    marginBottom: hp(1),
  },

  timelineRow: {
    flexDirection: "row",
    marginBottom: hp(1.2),
  },

  timelineDot: {
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3),
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: wp(3),
  },

  timelineDotText: {
    color: "#FFF",
    fontSize: wp(2.5),
    fontWeight: "700",
  },

  timelineContent: {
    flex: 1,
  },

  timelineLabel: {
    fontSize: wp(3.4),
    fontWeight: "600",
  },

  timelineTime: {
    fontSize: wp(2.8),
    color: "#666",
    marginTop: 2,
  },
});