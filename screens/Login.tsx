import { useNavigation } from "@react-navigation/native";
import React, { useContext, useState } from "react";
import { Text, View, StyleSheet, TextInput, TouchableOpacity } from "react-native"
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL_BACKEND } from '@env'
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "../context/AuthContext";



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
    color: '#888',
  },
  footerLink: {
    fontSize: 14,
    color: '#007BFF',
    fontWeight: 'bold',
    marginTop: 5,
  },
});

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [user, setUser] = useState("")
  const { login } = useContext(AuthContext);
  const navigation = useNavigation();





  const handleLogin = async () => {
    if (!email || !password) {
      alert('Por favor completa los campos');
      return;
    }
    const validacion = password.includes("EST")
    if(!validacion){
      try {
        let response = await axios.post(`${API_URL_BACKEND}/docente/login`, {
          email: email,
          password: password,
        });

        const { token } = response.data;
        await AsyncStorage.setItem('userToken', token);
        login(token);
        // const decodedToken = jwtDecode(token);

        // Redirige al usuario según su rol
        const user = jwtDecode(token);
        console.log(user);
        // setUser(decoded);

        if (user.rol === 'docente') {
          navigation.navigate("Docente");
        }

      } catch (errorDocente) {
        // Si también falla el login de docente, mostramos un mensaje de error
        alert("Usuario o contraseña incorrectos.");
        console.log("Error de autenticación:", errorDocente);
      }
    }else{
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
        }
  
      } catch (errorEstudiante) {
        console.log("Error estudiante: ",errorEstudiante);
      }
    }
    // try {
    //   // Primero intentamos en el endpoint de estudiantes
    //   let response = await axios.post(`${API_URL_BACKEND}/estudiante/login`, {
    //     email: email,
    //     password: password,
    //   });

    //   const { token } = response.data;
    //   await AsyncStorage.setItem('userToken', token);
    //   login(token);
    //   // Redirige al usuario según su rol
    //   if (user.rol === 'estudiante') {
    //     navigation.navigate("Estudiante");
    //   }

    // } catch (errorEstudiante) {
    //   // Si hay un error, intentamos con el endpoint de docentes
    //   try {
    //     let response = await axios.post(`${API_URL_BACKEND}/docente/login`, {
    //       email: email,
    //       password: password,
    //     });

    //     const { token } = response.data;
    //     await AsyncStorage.setItem('userToken', token);
    //     login(token);
    //     // const decodedToken = jwtDecode(token);

    //     // Redirige al usuario según su rol
    //     if (user.rol === 'docente') {
    //       navigation.navigate("Docente");
    //     }

    //   } catch (errorDocente) {
    //     // Si también falla el login de docente, mostramos un mensaje de error
    //     alert("Usuario o contraseña incorrectos.");
    //     console.log("Error de autenticación:", errorDocente);
    //   }
    // }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesion</Text>
      <TextInput style={styles.input}
        placeholder="Correo Institucional"
        placeholderTextColor={"#888"}
        keyboardType="email-address"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor={"#888"}
        secureTextEntry
        value={password}
        onChangeText={(text) => setPassword(text)}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
      ><Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.navigate('Recuperar Contraseña')}>
          <Text>¿Has olvidado la Contraseña?</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>¿No tienes cuenta?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Registro')}>
          <Text style={styles.footerLink}>Regístrate aquí</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}