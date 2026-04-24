// App.js  — replace your existing App.js
import { UserProvider } from "./src/context/UserContext";
import AppNavigator from "./src/navigation/AppNavigator"; // adjust this path to match yours

export default function App() {
  return (
    <UserProvider>
      <AppNavigator />
    </UserProvider>
  );
}
