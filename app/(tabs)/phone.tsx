import { useState, useEffect } from 'react';
import { Alert, Button, TextInput, View, StyleSheet, Text } from 'react-native';
import auth from '@react-native-firebase/auth';

export default function PhoneSignIn() {
  return (
    <Text>Hi</Text>
  );
  // const [confirm, setConfirm] = useState(null);
  // const [code, setCode] = useState('');
  // const [phoneNumber, setPhoneNumber] = useState('+91');
  //
  // useEffect(() => {
  //   const unsubscribe = auth().onAuthStateChanged(user => {
  //     if (user) {
  //       Alert.alert('Login Successful', `Welcome ${user.phoneNumber}`);
  //     }
  //   });
  //   return unsubscribe;
  // }, []);
  //
  // async function handleSignInWithPhoneNumber(phone) {
  //   try {
  //     const confirmation = await auth().signInWithPhoneNumber(phone);
  //     setConfirm(confirmation);
  //   } catch (error) {
  //     // Alert.alert('Error', 'Failed to send verification code.');
  //
  //     if (error instanceof Error) {
  //       Alert.alert('Error', error.message);
  //       console.error(error.message);
  //     } else {
  //       Alert.alert('Unknown Error', JSON.stringify(error));
  //       console.error(error);
  //     }
  //   }
  // }
  //
  // async function confirmCode() {
  //   try {
  //     await confirm.confirm(code);
  //   } catch (error) {
  //     Alert.alert('Invalid Code', 'The verification code is incorrect.');
  //   }
  // }
  //
  // return (
  //   <View style={styles.container}>
  //     {!confirm ? (
  //       <>
  //         <TextInput
  //           placeholder="Phone Number"
  //           value={phoneNumber}
  //           onChangeText={setPhoneNumber}
  //           style={styles.input}
  //           keyboardType="phone-pad"
  //         />
  //         <Button
  //           title="Send Verification Code"
  //           onPress={() => handleSignInWithPhoneNumber(phoneNumber)}
  //         />
  //       </>
  //     ) : (
  //       <>
  //         <TextInput
  //           placeholder="Enter OTP"
  //           value={code}
  //           onChangeText={setCode}
  //           style={styles.input}
  //           keyboardType="number-pad"
  //         />
  //         <Button title="Confirm Code" onPress={confirmCode} />
  //       </>
  //     )}
  //   </View>
  // );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginVertical: 8,
    borderRadius: 6,
  },
});
