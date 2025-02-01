import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { enableScreens } from 'react-native-screens';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from "react-native";
import Login from "./screens/Login";
import HomeScreen from "./screens/HomeScreen";
import RegistroEstudiante from "./screens/RegisterScreen";
import RecuperarContra from "./screens/RecoverPassword";
import StudentNavigation from "./RoutesStudent";
import TeacherNavigation from "./RoutesTeacher";
import TokenValidado from "./screens/TokenValidate";
import { AuthProvider } from './context/AuthContext';
import TokenValidadoRegistro from "./screens/TokenValidateRegister";



enableScreens();
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

const MainApp = () => {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const isFirstLaunch = await AsyncStorage.getItem('isFirstLaunch');
        if (isFirstLaunch === null) {
          // Primer lanzamiento
          await AsyncStorage.setItem('isFirstLaunch', 'false'); // Marcar como no primer lanzamiento
          setInitialRoute("Bienvenido(a)"); // Mostrar HomeScreen
        } else {
          // No es el primer lanzamiento
          setInitialRoute("Iniciar Sesión"); // Ir directamente al Login
        }
      } catch (error) {
        console.error("Error al verificar AsyncStorage", error);
        setInitialRoute("Iniciar Sesión"); // Fallback al Login
      }
    };

    checkFirstLaunch();
  }, []);
  if (initialRoute === null) {
    // Mostrar indicador de carga mientras se determina el initialRoute
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Bienvenido(a)" component={HomeScreen} />
        <Stack.Screen name="Iniciar Sesión" component={Login} options={{
          title: 'Iniciar Sesión', // Texto del encabezado
          headerBackVisible: false, // Oculta la flecha de regreso
        }} />
        <Stack.Screen name="Registro" component={RegistroEstudiante} />
        <Stack.Screen name="Recuperar Contraseña" component={RecuperarContra} />
        <Stack.Screen name="Docente" component={TeacherNavigation} options={{ headerShown: false }} />
        <Stack.Screen name="Estudiante" component={StudentNavigation} options={{ headerShown: false }} />
        <Stack.Screen name="Token Validado" component={TokenValidado} options={{ headerShown: false }} />
        <Stack.Screen name="Token Registro" component={TokenValidadoRegistro} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
