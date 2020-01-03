import React, { Component } from "react";
import {
  Text,
  Image,
  ScrollView,
  View,
  StyleSheet,
  TouchableHighlight,
  FlatList,
  Alert,
  ActivityIndicator,
  ImageBackground,
  Animated
} from "react-native";
import { AdMobBanner } from "expo-ads-admob";
import {
  HeaderMain,
  SubHeaderMultiline,
  Card,
  CardSection,
  BandButton,
} from "./common";
import { connect } from "react-redux";
import { adminItem } from "../redux/actions/";
import Swipeable from 'react-native-gesture-handler/Swipeable';

import Colors from "../constants/Colors";
import Fonts from "../constants/Fonts";

import * as firebase from "firebase";
import "firebase/firestore";

class AdminMembersScreen extends Component {
  static navigationOptions = {
    header: null
  };
  _isMounted = false;

  constructor() {
    super();
    this.ref = firebase.firestore().collection("band_members");
    this.state = {
      band_members: [],
      loading: true
    };
  }

  componentDidMount() {
    this._isMounted = true;

    if (this._isMounted) {
      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          this.ref
            .where("userUid", "==", user.uid)
            .onSnapshot(this.onCollectionUpdate);
        }
      });
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  onCollectionUpdate = querySnapshot => {
    if (this._isMounted) {
      const band_members = [];
      
      querySnapshot.forEach(doc => {
        const { name, instrument, image_url, imageRef } = doc.data();
        band_members.push({
          key: doc.id, // Document ID
          doc, // DocumentSnapshot
          instrument,
          name,
          image_url,
          imageRef,
        });
      });
      this.setState({ band_members, loading: false })
    }
  };

  _renderItem = ({item}) => {
    return (
      <Swipeable
      renderRightActions={this.RightActions}
      renderLeftActions={this.LeftActions}
      overshootRight={false}
      overshootLeft={false}>
      <View style={styles.row}>
        <Image
          style={styles.rowIcon}
          source={{
            uri: item.image_url
          }}
        />
        <View style={styles.rowData}>
          <Text style={styles.rowDataText}>{item.name}</Text>
          <Text style={styles.rowDataText2}>{item.instrument}</Text>
        </View>
      </View>
      </Swipeable>
    );
  };

  DeleteandChangeButton = async ({ item }) => {
    if (this._isMounted) {
      this.setState({ loading: true });
      var storageRef = firebase.storage().ref();
      var deleteRef = storageRef.child(item.imageRef);
      deleteRef
        .delete()
        .then(function () {
          console.log("file deleted");
        })
        .catch(function (error) {
          console.log("error present: ", error);
        })
        .then(this.ref.doc(item.key).delete());

      this.setState({ loading: false });
    }
  };

  RightActions = (progress, dragX) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate:'clamp'
      
    })
   
      return (
        <View style={styles.actionsContainer}>
          <TouchableHighlight
            style={styles.actionButton}
            onPress={() =>
              this.props.navigation.navigate("MembersForm", { item })
            }
          >
            <Animated.Text style={styles.actionButtonText, { transform: [{ scale }]}}>Edit</Animated.Text>
          </TouchableHighlight>
        </View>
      );
    
  };

  LeftActions = (progress, dragX) => {
      const scale = dragX.interpolate({
        inputRange: [0, 100],
        outputRange: [0, 1],
        extrapolate:'clamp'
        
      })

      return (
        <View style={styles.actionsContainer2}>

          <TouchableHighlight
            style={[styles.actionButton, styles.actionButtonDestructive]}
            onPress={() => {
              Alert.alert(
                "Do you really want to delete this?",
                "Select your preferred option",
                [
                  {
                    text: "Yes, definitely!",
                    onPress: () => this.DeleteandChangeButton({ item })
                  },
                  {
                    text: "Oops, Don't delete please!",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                  }
                ]
              );
            }}
          >
            <Animated.Text style={styles.actionButtonText, { transform: [{ scale }]}}>Delete</Animated.Text>
          </TouchableHighlight>
        </View>
      );
    
  };

  render() {
    const data = this.state.band_members;
    return (
      <ImageBackground
        style={{ width: "100%", height: "100%", paddingBottom: 50 }}
        source={require("../assets/images/bcg_image2.png")}
        imageStyle={{ opacity: 0.3 }}
      >
        <HeaderMain
          headerText={"Edit Members"}
          style={{ backgroundColor: Colors.BLUEBCG }}
        />
        <ScrollView keyboardShouldPersistTaps="handled" style={{ flex: 1 }}>
          <SubHeaderMultiline
            headerText={"Edit/delete (swipe left) or add a new member"}
          />
          <Card>
            <View
              style={{
                paddingLeft: 10,
                paddingTop: 20
              }}
            >
              <FlatList
                data={data}
                keyExtractor={item => item.key}
                renderItem={this._renderItem}
              />
            </View>
            <View style={{ paddingTop: 20 }}></View>
            <CardSection
              style={{
                paddingTop: 20
              }}
            >
              {this.state.loading && (
                <View style={styles.loading}>
                  <ActivityIndicator size="large" />
                </View>
              )}
              <BandButton
                onPress={() => this.props.navigation.navigate("MemberCreate")}
                title="Add a new band member"
              />
            </CardSection>
            <View style={{ paddingTop: 10 }}></View>
          </Card>
        </ScrollView>
        <View style={{ marginBottom: 30 }}></View>
        <AdMobBanner
          bannerSize="fullBanner"
          style={styles.bottomBanner}
          adUnitID="ca-app-pub-5330182255902537/2078009402"
          servePersonalizedAds={false}
          onDidFailToReceiveAdWithError={this.bannerError}
        />
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    backgroundColor: "white",
    borderBottomColor: "#c4c4c2",
    borderBottomWidth: 0.5,
    borderTopColor: "#c4c4c2",
    borderTopWidth: 0.5,
    marginBottom: 5,
    height: 65
  },
  bottomBanner: {
    position: "absolute",
    bottom: 0
  },
  rowIcon: {
    flex: 1,
    width: 50,
    height: 50,
    marginRight: 20
  },
  rowData: {
    flex: 3
  },
  rowDataText: {
    fontSize: Fonts.md
  },
  rowDataText2: {
    fontSize: Fonts.xsm,
    fontWeight: "bold",
    color: Colors.LIGHTGREY
  },
  actionsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center"
  },
  actionsContainer2: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center"
  },
  actionButton: {
    padding: 10,
    width: 80,
    height: 60,
    backgroundColor: Colors.BANDEXBLK,
    borderRadius: 0.5
  },
  actionButtonDestructive: {
    backgroundColor: "#FF0000"
  },
  actionButtonText: {
    textAlign: "center",
    fontSize: Fonts.mini
  },
  dividerStyle: {
    backgroundColor: "blue",
    paddingTop: 2,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 10
  },
  loading: {
    zIndex: 100,
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center"
  }
});

export default connect(null, { adminItem })(AdminMembersScreen);
