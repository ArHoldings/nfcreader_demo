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

let TLV = require('node-tlv');

const CARD_EXPIRATION_TAG = '5F24';
const CARD_PAN_TAG = '5A';

import { Buffer } from 'buffer';
global.Buffer = Buffer

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
          onPress={() => this.getCardValues('MASTERCARD')}>
          <Text style={styles.buttonTextStyle}>MASTERCARD</Text>
        </TouchableHighlight>

        <TouchableHighlight
          style={styles.openButton}
          onPress={() => this.getCardValues('VISA')}>
          <Text style={styles.buttonTextStyle}>VISA</Text>
        </TouchableHighlight>

        <TouchableHighlight
          style={styles.openButton}
          onPress={() => this.getCardValues('TEST')}>
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

  async getCardValues(aidOption) {
    try {
      Alert.alert('Reading..\nPlease bring the card closer!');
      let tech = NfcTech.IsoDep;
      let resp = await NfcManager.requestTechnology(tech, {
        alertMessage: 'Ready to send some APDU'
      });

      Alert.alert('I got your tag');

      console.log();

      if (Platform.OS === 'android') {

        //Proximity Payment System Environment – PPSE (2PAY.SYS.DDF01)
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

        if (aidOption == "VISA") {
          //Application Selection
          resp = await NfcManager.transceive([
            0x00, //CLA Class 
            0xA4, //INS Instruction
            0x04, //P1  Parameter 1
            0x00, //P2  Parameter 2
            0x07, //AID Length 
            0xA0, 0x00, 0x00, 0x00, 0x03, 0x10, 0x10 //AID
          ]);
          //Initiate Application Process
          resp = await NfcManager.transceive([
            0x80, //CLA Class
            0xA8, //INS Instruction
            0x00, //P1  Parameter 1
            0x00, //P2  Parameter 2
            0x02, //AID Length 
            0x83, 0x00, //AID
            0x00 //fix
          ]);
          console.log('=====VISA=====')
          console.log(this.decToHex(resp).join(' '));
        }
        if (aidOption == "MASTERCARD") {
          //Application Selection
          resp = await NfcManager.transceive([
            0x00, //CLA Class 
            0xA4, //INS Instruction
            0x04, //P1  Parameter 1
            0x00, //P2  Parameter 2
            0x07, //AID Length 
            0xA0, 0x00, 0x00, 0x00, 0x04, 0x10, 0x10 //AID
          ]);
          //Initiate Application Process
          resp = await NfcManager.transceive([
            0x80, //CLA Class
            0xA8, //INS Instruction
            0x00, //P1  Parameter 1
            0x00, //P2  Parameter 2
            0x02, //AID Length 
            0x83, 0x00, //AID
            0x00 //fix
          ]);
          //Read Application Data 
          resp = await NfcManager.transceive([
            0x00, //CLA Class 
            0xB2, //INS Instruction
            0x01, //P1  Parameter 1
            0x14, //P2  Parameter 2
            0x00, //AID Length 
          ]);
          console.log('=====MASTERCARD=====');

          resp = this.decToHex(resp);
          let tlv = TLV.parse(resp.join(""));
          let tlv_child = tlv.child;

          let expiration = this.getTagValue(tlv_child, CARD_EXPIRATION_TAG);

          let pan = this.getTagValue(tlv_child, CARD_PAN_TAG);

          console.log('=====expiration=====');
          console.log(expiration);

          console.log('=====pan=====');
          console.log(pan);

        }

        if (aidOption == "TEST") {

          console.log('TEST')

        }

      }

      this._cleanUp();
    } catch (ex) {
      console.warn('ex', ex);
      this._cleanUp();
    }
  }

  getTagValue(tlv_child, tag) {
    let value = null;
    tlv_child.forEach((item) => {
      if (item.tag == tag) {
        value = item.value;
      }
    });

    return value;
  }

  //parse decimal resp into hexadecimal BER-TVL
  decToHex(resp) {
    resp.forEach((item, index, arr) => {
      let hexString = item.toString(16);
      let hexFixed = hexString.length == 1 ? 0 + hexString : hexString;
      arr[index] = hexFixed;
    });
    return resp;
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
    fontSize: 24,
  },
  textStyle: {
    color: '#0000A0',
    fontWeight: 'bold',
    fontSize: 34,
    textAlign: 'center',
  },
});

export default AppV2Apdu;