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
          console.log('=====VISA=====');
          //Application Selection
          resp = await NfcManager.transceive([
            0x00, //CLA Class 
            0xA4, //INS Instruction
            0x04, //P1  Parameter 1
            0x00, //P2  Parameter 2
            0x07, //AID Length 
            0xA0, 0x00, 0x00, 0x00, 0x03, 0x10, 0x10 //AID
          ]);
          //console.log('=====Application Selection=====')
          //console.log(this.decToHex(resp).join(' '));

          //Initiate Application Process
          resp = await NfcManager.transceive([
            0x80, //CLA Class
            0xA8, //INS Instruction
            0x00, //P1  Parameter 1 
            0x00, //P2  Parameter 2
            0x23, //AID Length 
            0x83, //Tag for PDOL
            0x21,//Length of all data
            //PDOL-data: 
            0xF3, 0x20, 0x40, 0x00, //Tag: Terminal Transaction Qualifiers *required
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, //Tag: Amount, Authorised (Numeric) 
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, //Tag:  Amount, Other (Numeric)
            0x09, 0x78, //Tag: Terminal Country Code *required
            0x00, 0x00, 0x00, 0x00, 0x00, //Tag: Terminal Verification Results 
            0x00, 0x00, //Tag: Transaction Currency Code
            0x00, 0x00, 0x00, //Tag: Transaction Date
            0x00, //Tag: Transaction Type
            0x00, 0x00, 0x00, 0x00, //Tag:  Unpredictable Number 
            0x00 //Fix
          ]);
          //console.log('=====Initiate Application Process=====')
          //console.log(this.decToHex(resp).join(' '));

          //Read Application Data 
          resp = await NfcManager.transceive([
            0x00, //CLA Class 
            0xB2, //INS Instruction
            0x01, //P1  start - first record
            0x1C, //P2  Reference Control according Table
            0x00, //LE  Number of bytes to be read
          ]);

          //console.log('=====Read Application Data=====')
          //console.log(this.decToHex(resp).join(' '));

        }
        if (aidOption == "MASTERCARD") {
          console.log('=====MASTERCARD=====');
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
            0x83, //Tag for PDOL
            0x00, //Length of all data (Empty)
            0x00 //Fix
          ]);
          //Read Application Data 
          resp = await NfcManager.transceive([
            0x00, //CLA Class 
            0xB2, //INS Instruction
            0x01, //P1  start - first record
            0x14, //P2  Reference Control according Table
            0x00, //LE  Number of bytes to be read
          ]);
        }

        if (aidOption == "TEST") {

          console.log('TEST')

        }

        resp = this.decToHex(resp);
        let tlv = TLV.parse(resp.join(""));
        let tlv_child = tlv.child;

        let expiration = this.getTagValue(tlv_child, CARD_EXPIRATION_TAG);

        let pan = this.getTagValue(tlv_child, CARD_PAN_TAG);

        console.log('=====expiration=====');
        Alert.alert('=====expiration=====', expiration);
        console.log(expiration);

        console.log('=====pan=====');
        Alert.alert('=====pan=====', pan);
        console.log(pan);

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