import React, {useEffect, useState} from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { enableScreens } from 'react-native-screens';
import Login from "./screens/Login";
import HomeScreen from "./screens/HomeScreen";
import RegistroEstudiante from "./screens/RegisterScreen";
import RecuperarContra from "./screens/RecoverPassword";
import StudentNavigation from "./RoutesStudent";
import TeacherNavigation from "./RoutesTeacher";
import TokenValidado from "./screens/TokenValidate";
import { AuthProvider } from './context/AuthContext'; // Ajusta la ruta según tu estructura
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
  const [initialRoute, setInitialRoute] = useState("Home");
  
  // useEffect(() => {
  //   // Función para manejar el deep link cuando la aplicación se abre desde un enlace
  //   const handleDeepLink = (url) => {
  //     if (url && url.includes("/recuperar-password/")) {
  //       const token = url.split("/recuperar-password/")[1]; // Extrae el token del URL
  //       setInitialRoute("Token Validado");
  //       navigationRef.current?.navigate("Token Validado", { token });
  //     }
  //   };

  //   // Obtener el enlace inicial si la app se abre desde un deep link
  //   const getInitialURL = async () => {
  //     const initialUrl = await Linking.getInitialURL();
  //     if (initialUrl) {
  //       handleDeepLink(initialUrl);
  //     }
  //   };

  //   // Escuchar cambios en el deep link mientras la app está abierta
  //   const urlListener = Linking.addEventListener('url', (event) => {
  //     handleDeepLink(event.url);
  //   });

  //   getInitialURL();

  //   // Limpieza del listener al desmontar el componente
  //   return () => {
  //     urlListener.remove();
  //   };
  // }, []);


  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Iniciar Sesion" component={Login} />
        <Stack.Screen name="Registro" component={RegistroEstudiante} />
        <Stack.Screen name="Recuperar Contraseña" component={RecuperarContra} />
        <Stack.Screen name="Docente" component={TeacherNavigation} options={{headerShown: false}}/>
        <Stack.Screen name="Estudiante" component={StudentNavigation} options={{headerShown: false}}/>
        <Stack.Screen name="Token Validado" component={TokenValidado} options={{headerShown: false}} />
        <Stack.Screen name="Token Registro" component={TokenValidadoRegistro} options={{headerShown: false}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
