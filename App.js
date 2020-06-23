import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  TouchableHighlight,
} from 'react-native';
import NfcManager, { NfcEvents } from 'react-native-nfc-manager';

class App extends React.Component {

  componentDidMount() {
    NfcManager.start();
    NfcManager.setEventListener(NfcEvents.DiscoverTag, tag => {
      var tagJSON = JSON.stringify(tag);
      Alert.alert('ID:', tag.id);
      Alert.alert('tagJSON:', tagJSON);
      console.log('TAG', tag);
      console.log('Type', typeof tag);
      NfcManager.unregisterTagEvent().catch(() => 0);
      //return tag;
    });
  }

  componentWillUnmount() {
    NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
    NfcManager.unregisterTagEvent().catch(() => 0);
  }

  render() {
    return (
      <View style={styles.centeredView}>
        <Text style={styles.textStyle}>NFC DEMO</Text>
        <TouchableHighlight
          style={styles.openButton}
          onPress={this._readNFC}>
          <Text style={styles.buttonTextStyle}>Read NFC Tag</Text>
        </TouchableHighlight>

        <TouchableHighlight
          style={styles.openButton}
          onPress={this._cancel}>
          <Text style={styles.buttonTextStyle}>Cancel</Text>
        </TouchableHighlight>

      </View>
    );
  }

  _cancel = () => {
    NfcManager.unregisterTagEvent().catch(() => 0);
  };

  _readNFC = async () => {
    try {
      Alert.alert('Reading..\nPlease bring the card closer!');
      await NfcManager.registerTagEvent();
    } catch (ex) {
      console.warn('ex', ex);
      NfcManager.unregisterTagEvent().catch(() => 0);
    }
  };

}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  openButton: {
    backgroundColor: '#0000A0',
    width: 200,
    margin: 20,
    borderWidth: 1,
    borderColor: 'black',
    padding: 10,
    elevation: 2,
    borderRadius: 20,
  },
  buttonTextStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textStyle: {
    color: '#0000A0',
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
  },
});

export default App;
