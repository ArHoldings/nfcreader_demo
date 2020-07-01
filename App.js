import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Alert,
  StyleSheet,
  TouchableHighlight,
} from 'react-native';
import NfcManager, { NfcTech } from 'react-native-nfc-manager';

class AppV2Apdu extends React.Component {
  componentDidMount() {
    NfcManager.start();
  }

  componentWillUnmount() {
    this._cleanUp();
  }

  render() {
    return (
      <View style={styles.centeredView}>
        <Text style={styles.textStyle}>NFC DEMO</Text>
        <TouchableHighlight
          style={styles.openButton}
          onPress={this._test}>
          <Text style={styles.buttonTextStyle}>TEST</Text>
        </TouchableHighlight>

        <TouchableHighlight
          style={styles.openButton}
          onPress={this._cleanUp}>
          <Text style={styles.buttonTextStyle}>Cancel</Text>
        </TouchableHighlight>

      </View>
    )
  }

  _cleanUp = () => {
    NfcManager.cancelTechnologyRequest().catch(() => 0);
  }

  _test = async () => {
    try {
      Alert.alert('Reading..\nPlease bring the card closer!');
      let tech = NfcTech.IsoDep;
      let resp = await NfcManager.requestTechnology(tech, {
        alertMessage: 'Ready to send some APDU'
      });
      Alert.alert('<==TECH==>', resp);

      // the NFC uid can be found in tag.id
      let tag = await NfcManager.getTag();
      var stringTag = JSON.stringify(tag);
      Alert.alert('<==TAG==>', stringTag);

      if (Platform.OS === 'ios') {
        // here we assume AID A0000002471001 for ePassport
        // you will need to declare above AID in Info.plist like this:
        // ------------------------------------------------------------
        //   <key>com.apple.developer.nfc.readersession.iso7816.select-identifiers</key>
        //   <array>
        //   	 <string>A0000002471001</string>
        //   </array>
        // ------------------------------------------------------------
        console.warn('');
        //resp = await NfcManager.sendCommandAPDUIOS([0x00, 0x84, 0x00, 0x00, 0x08]);
        /**
         * or, you can use alternative form like this:
           resp = await NfcManager.sendCommandAPDUIOS({
             cla: 0,
             ins: 0x84,
             p1: 0,
             p2: 0,
             data: [],
             le: 8
           });
         */
      } else {

        //0x00, 0xA4, 0x04, 0x00, 0x0e,

        //AID= Visa Proximity Payment System Environment – PPSE (2PAY.SYS.DDF01)
        //0x32, 0x50, 0x41, 0x59, 0x2e, 0x53, 0x59, 0x53, 0x2e, 0x44, 0x44, 0x46, 0x30, 0x31, 0x00

        //+Promerica RESP = 111 48 132 14 50 80 65 89 46 83 89 83 46 68 68 70 48 49 165 30 191 12 27 97 25 79 7 160 0 0 0 3 16 16 80 11 86 73 83 65 32 68 69 66 73 84 79 135 1 1 144 0
        //+Popular RESP = 111 47 132 14 50 80 65 89 46 83 89 83 46 68 68 70 48 49 165 29 191 12 26 97 24 79 7 160 0 0 0 3 16 16 80 10 86 73 83 65 32 68 69 66 73 84 135 1 1 144 0
        //BCR RESP= 111 62 132 14 50 80 65 89 46 83 89 83 46 68 68 70 48 49 165 44 191 12 41 97 39 79 7 160 0 0 0 3 16 16 80 11 86 73 83 65 32 68 69 66 73 84 79 135 1 1 159 18 11 86 73 83 65 32 68 69 66 73 84 79 144 0
        //BAC RESP= 111 53 132 14 50 80 65 89 46 83 89 83 46 68 68 70 48 49 165 35 191 12 32 97 30 79 7 160 0 0 0 4 16 16 80 16 68 69 66 73 84 32 77 65 83 84 69 82 67 65 82 68 135 1 1 144 0

        resp = await NfcManager.transceive([0x00, 0xA4, 0x04, 0x00, 0x0e, 0x32, 0x50, 0x41, 0x59, 0x2e, 0x53, 0x59, 0x53, 0x2e, 0x44, 0x44, 0x46, 0x30, 0x31, 0x00]);

        //A0000000031010 Visa International
        //A0000000032020 Visa International
        //A0000000041010 Mastercard International
        //A0000000043060 Mastercard International United States Maestro (Debit)

        //----mastercard paypass-----
        //0xA0, 0x00, 0x00, 0x00, 0x04, 0x01
        //resp = await NfcManager.transceive([0x00, 0xA4, 0x04, 0x00, 0x0A, 0xA0, 0x00, 0x00, 0x00, 0x04, 0x01]);

        /* EXAMPLE
        resp = await NfcManager.transceive([
          0x00, // CLA Class           
          0xA4, // INS Instruction     
          0x04, // P1  Parameter 1
          0x00, // P2  Parameter 2
          0x0A, // Length
          0x63, 0x64, 0x63, 0x00, 0x00, 0x00, 0x00, 0x32, 0x32, 0x31 // AID
        ]);*/

        //0x87, 0xD6, 0x12, 0x00, 0x78, 0x29, 0xED, 0xFF, 0x87, 0xD6, 0x12, 0x00, 0x11, 0xEE, 0x11, 0xEE
        //resp = await NfcManager.transceive([0x00, 0x8a]);

        //AID  
        //resp = await NfcManager.transceive([0x00,a0x4, 0x04, 0x00, 0x07, 0xa0, 0x00, 0x00, 0x00, 0x04, 0x30, 0x60, 0x00]);

      }
      Alert.alert(resp.join(' '));
      console.log(resp.join(' '));

      this._cleanUp();
    } catch (ex) {
      console.warn('ex', ex);
      this._cleanUp();
    }
  }
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

export default AppV2Apdu;