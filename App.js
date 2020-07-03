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
        <Text style={styles.textStyle}></Text>
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

      console.log();
      console.log('<=====TECH=====>');
      console.log(resp);
      console.log();

      // the NFC uid can be found in tag.id
      let tag = await NfcManager.getTag();
      //var stringTag = JSON.stringify(tag);
      console.log('<=====TAG=====>');
      console.log('<=====techTypes=====>');
      console.log(tag.techTypes);

      console.log('<=====id=====>');
      console.log(tag.id);
      console.log();

      Alert.alert('I got your tag');
      console.log('<=====Platform.OS=====>');
      console.log(Platform.OS);
      console.log();

      if (Platform.OS === 'android') {

        //AID= Visa Proximity Payment System Environment – PPSE (2PAY.SYS.DDF01)
        //0x32, 0x50, 0x41, 0x59, 0x2e, 0x53, 0x59, 0x53, 0x2e, 0x44, 0x44, 0x46, 0x30, 0x31, 0x00
        /*resp = await NfcManager.transceive([
          0x00, //CLA Class 
          0xA4, //INS Instruction
          0x04, //P1  Parameter 1
          0x00, //P2  Parameter 2
          0x0e, //AID Length 
          0x32, 0x50, 0x41, 0x59, 0x2e, 0x53, 0x59, 0x53, 0x2e, 0x44, 0x44, 0x46, 0x30, 0x31, 0x00 //AID
        ]);*/

        //VISA AID = A0000000031010 -> 0xA0, 0x00, 0x00, 0x00, 0x03, 0x10, 0x10,
        //MASTERCARD AID = A0000000041010 -> 0xA0, 0x00, 0x00, 0x00, 0x04, 0x10, 0x10,

        //let aidOption = "VISA";
        //let aidOption = "MASTERCARD";

        let aidOption = "MASTERCARD";

        //00 b2 02 0c 00

        if (aidOption == "VISA") {
          resp = await NfcManager.transceive([
            0x00, //CLA Class 
            0xA4, //INS Instruction
            0x04, //P1  Parameter 1
            0x00, //P2  Parameter 2
            0x07, //AID Length 
            0xA0, 0x00, 0x00, 0x00, 0x03, 0x10, 0x10 //AID
          ]);
          resp = await NfcManager.transceive([
            0x80,
            0xA8,
            0x00,
            0x00,
            0x0A,
            0x83, 0x0B, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00
          ]);
        }
        if (aidOption == "MASTERCARD") {
          resp = await NfcManager.transceive([
            0x00, //CLA Class 
            0xA4, //INS Instruction
            0x04, //P1  Parameter 1
            0x00, //P2  Parameter 2
            0x07, //AID Length 
            0xA0, 0x00, 0x00, 0x00, 0x04, 0x10, 0x10 //AID
          ]);
          resp = await NfcManager.transceive([
            0x80,
            0xA8,
            0x00,
            0x00,
            0x02,
            0x83, 0x00,
            0x00
          ]);
        }
        if (aidOption == "TEST") {
          resp = await NfcManager.transceive([
            0x00, //CLA Class 
            0xB2, //INS Instruction
            0x01, //P1  Parameter 1
            0x0C, //P2  Parameter 2
            0x00, //AID Length 
          ]);
        }

        //Decimal response to Hexadecimal BER-TLV
        resp.forEach((item, index, arr) => {
          let hexString = item.toString(16);
          let hexFixed = hexString.length == 1 ? 0 + hexString : hexString;
          arr[index] = hexFixed;
        });

        let ber_tlv = resp.join(" ");
        console.log('<=====BER-TLV=====>');
        console.log(ber_tlv)

      }

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
    fontSize: 34,
  },
  textStyle: {
    color: '#0000A0',
    fontWeight: 'bold',
    fontSize: 34,
    textAlign: 'center',
  },
});

export default AppV2Apdu;