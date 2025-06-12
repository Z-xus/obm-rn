import { View, Text } from 'react-native';
export default function Check() {
  return <View><Text>Check Page</Text></View>
}

// import { useState, useEffect } from 'react';
// import { View, Text } from 'react-native';
// import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
//
// function App() {
//   const [initializing, setInitializing] = useState<boolean>(true);
//   const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
//
//   useEffect(() => {
//     const subscriber = auth().onAuthStateChanged((user) => {
//       setUser(user);
//       if (initializing) setInitializing(false);
//     });
//     return subscriber;
//   }, [initializing]);
//
//   if (initializing) return null;
//
//   if (!user) {
//     return (
//       <View>
//         <Text>Login</Text>
//       </View>
//     );
//   }
//
//   return (
//     <View>
//       <Text>Welcome {user.email}</Text>
//     </View>
//   );
// }
//
// export default App;
