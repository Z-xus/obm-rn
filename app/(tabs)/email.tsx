import { useState } from 'react';
import { View, Text, Button } from 'react-native';
import auth from '@react-native-firebase/auth';

export default function Email() {
  const [status, setStatus] = useState<string | null>(null);

  const handleCreateUser = async () => {
    try {
      await auth().createUserWithEmailAndPassword(
        'jane.doe@example.com',
        'SuperSecretPassword!'
      );
      setStatus('User account created & signed in!');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setStatus('That email address is already in use!');
      } else if (error.code === 'auth/invalid-email') {
        setStatus('That email address is invalid!');
      } else {
        setStatus('Hi nauf Error: ' + error.message);
      }
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Create User" onPress={handleCreateUser} />
      {status && (
        <Text style={{ marginTop: 10 }}>
          {status}
        </Text>
      )}
    </View>
  );
}

