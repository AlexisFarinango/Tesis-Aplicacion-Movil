import { useNavigation, useFocusEffect } from "@react-navigation/native";
import React, { useContext, useState, useCallback } from "react";
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Image, BackHandler, Dimensions } from "react-native"
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL_BACKEND } from '@env'
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "../context/AuthContext";
import Toast from "react-native-toast-message";
import RNMinimizeApp from 'react-native-minimize';


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 15,
    marginBottom: 20,
    backgroundColor: '#FFF',
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#007BFF',
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: "#666666",
  },
  footerLink: {
    fontSize: 14,
    color: '#007BFF',
    fontWeight: 'bold',
    marginTop: 5,
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: "#003366",
    marginBottom: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: 'black',
    backgroundColor: 'black',
  },
  checkboxUnchecked: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: 'black',
  },
  helperText: {
    marginLeft: 10,
    color: "#666666",
  },
});

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [user, setUser] = useState("")
  const { login, setNamedocente } = useContext(AuthContext);
  const navigation = useNavigation();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { width } = Dimensions.get('window');
  const scaleFactor = width < 400 ? 0.6 : 2.0; // Aumenta el factor de escala para pantallas más grandes

  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {
        RNMinimizeApp.minimizeApp(); // Envía la aplicación al fondo
        return true; // Previene el comportamiento predeterminado
      };

      BackHandler.addEventListener('hardwareBackPress', handleBackPress);

      // Limpia el listener cuando se pierde el enfoque
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
      };
    }, [])
  );


  const handleLogin = async () => {
    console.log("nuevo",API_URL_BACKEND);
    
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: `Lo sentimos, todos los campos deben de estar llenos`,
        text2: "Completa los campos"
      })
      return;
    }
    const validacion = password.includes("EST")
    if (!validacion) {
      try {
        let response = await axios.post(`${API_URL_BACKEND}/docente/login`, {
          email: email,
          password: password,
        });

        const { token } = response.data;
        setNamedocente(response.data.nombre)

        await AsyncStorage.setItem('userToken', token);
        login(token);
        // const decodedToken = jwtDecode(token);

        // Redirige al usuario según su rol
        const user = jwtDecode(token);
        console.log(user);
        // setUser(decoded);

        if (user.rol === 'docente') {
          navigation.navigate("Docente");
          setEmail("");
          setPassword("");
        }

      } catch (errorDocente) {
        const status = errorDocente.response.status;
        if (status === 403) {
          Toast.show({
            type: 'error',
            text1: `Cuenta no Verificada`,
          })
        } else if (status === 404) {
          Toast.show({
            type: 'error',
            text1: `Docente no registrado`,
            text2: "Verifica el correo ingresado",
          })
        } else if (status === 401) {
          Toast.show({
            type: 'error',
            text1: `Correo o contraseña Incorrecto`,
          })
        } else {
          Toast.show({
            type: 'error',
            text1: `Problemas con el Servidor`,
            text2: `Revisa tu conexión a Internet`,
          })
        }
        // Si también falla el login de docente, mostramos un mensaje de error
        // alert("Usuario o contraseña incorrectos.");
        // console.log("Error de autenticación:", errorDocente);
      }
    } else {
      try {
        // Primero intentamos en el endpoint de estudiantes
        let response = await axios.post(`${API_URL_BACKEND}/estudiante/login`, {
          email: email,
          password: password,
        });

        const { token } = response.data;
        await AsyncStorage.setItem('userToken', token);
        login(token);
        // Redirige al usuario según su rol
        const user = jwtDecode(token);
        console.log(user);

        // setUser(decoded);
        if (user.rol === 'estudiante') {
          navigation.navigate("Estudiante");
          setEmail("");
          setPassword("");
        }

      } catch (errorEstudiante) {
        const status = errorEstudiante.response.status;
        if (status === 403) {
          Toast.show({
            type: 'error',
            text1: `Cuenta no Verificada`,
            text2: `Contactate con tu docente`,
          })
        } else if (status === 404) {
          Toast.show({
            type: 'error',
            text1: `Estudiante no registrado`,
            text2: "Verifica el correo ingresado",
          })
        } else if (status === 401) {
          Toast.show({
            type: 'error',
            text1: `Correo o contraseña Incorrecto`,
          })
        } else {
          Toast.show({
            type: 'error',
            text1: `Problemas con el Servidor`,
            text2: `Revisa tu conexión a Internet`,
          })
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../icons/logo.webp')}
        style={[styles.profileImage, { width: 140 * scaleFactor, height: 140 * scaleFactor }]}
      />
      <Text style={[styles.title, { fontSize: 36 * scaleFactor }]}>Iniciar Sesión</Text>
      <TextInput 
        style={[styles.input, { fontSize: 24 * scaleFactor }]} 
        placeholder="Correo Institucional"
        placeholderTextColor={"#888"}
        keyboardType="email-address"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      <TextInput
        style={[styles.input, { fontSize: 24 * scaleFactor }]} 
        placeholder="Contraseña"
        placeholderTextColor={"#888"}
        secureTextEntry={!passwordVisible}
        value={password}
        onChangeText={(text) => setPassword(text)}
      />
      <View style={styles.checkboxContainer}>
        <Text style={[styles.helperText, { fontSize: 20 * scaleFactor }]}>
          {passwordVisible ? "Contraseña visible" : "Contraseña oculta"}
        </Text>
        <TouchableOpacity
          onPress={() => setPasswordVisible(!passwordVisible)}
          style={styles.checkbox}>
          <View style={passwordVisible ? styles.checkboxChecked : styles.checkboxUnchecked} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
      >
        <Text style={[styles.buttonText, { fontSize: 24 * scaleFactor }]}>Ingresar</Text>
      </TouchableOpacity>
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.navigate('Recuperar Contraseña')}>
          <Text style={{ color: "#666666", fontSize: 14 }}>¿Has olvidado la Contraseña?</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.footer}>
        <Text style={[styles.footerText, { fontSize: 14 }]}>¿No tienes cuenta?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Registro')}>
          <Text style={[styles.footerLink, { fontSize: 14 }]}>Regístrate aquí</Text>
        </TouchableOpacity>
      </View>
      <Toast />
    </View>
  );
}