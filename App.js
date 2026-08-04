// App.js  — replace your existing App.js
import { UserProvider } from "./src/context/UserContext";
import AppNavigator from "./src/navigation/AppNavigator"; // adjust this path to match yours

import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <AppNavigator />
      </UserProvider>
    </SafeAreaProvider>
  );
}
