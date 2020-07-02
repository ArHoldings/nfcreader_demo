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

      console.log('<=====TECH=====>');
      console.log(resp);

      // the NFC uid can be found in tag.id
      let tag = await NfcManager.getTag();
      //var stringTag = JSON.stringify(tag);
      console.log('<=====TAG=====>');
      console.log('<=====TAG-techTypes=====>');
      console.log(tag.techTypes);

      console.log('<=====TAG-ID=====>');
      console.log(tag.id);

      Alert.alert('I got your tag');
      console.log('<=====Platform.OS=====>');
      console.log(Platform.OS);

      if (Platform.OS === 'android') {

        //AID= Visa Proximity Payment System Environment – PPSE (2PAY.SYS.DDF01)
        resp = await NfcManager.transceive([
          0x00, //CLA Class 
          0xA4, //INS Instruction
          0x04, //P1  Parameter 1
          0x00, //P2  Parameter 2
          0x0e, //AID Length 
          0x32, 0x50, 0x41, 0x59, 0x2e, 0x53, 0x59, 0x53, 0x2e, 0x44, 0x44, 0x46, 0x30, 0x31, 0x00 //AID
        ]);

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
  },
  textStyle: {
    color: '#0000A0',
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
  },
});

export default AppV2Apdu;