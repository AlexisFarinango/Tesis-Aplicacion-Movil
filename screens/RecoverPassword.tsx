import React, { useState } from "react";
import { View,Text, StyleSheet, TouchableOpacity,TextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import axios from "axios";
import { API_URL_BACKEND } from '@env'

export default function RecuperarContra(){
    const [email,setEmail]= useState("");
    const navigation = useNavigation();
    const handleRecuperar=async()=>{
        if(!email){
            alert("Porfavor ingresa el correo")
            return;
        }else{
            const response = await axios.post(`${API_URL_BACKEND}/estudiante/recuperar-password`,{
                email:email,
            })
            console.log("Email para recuperar constraseña",email);
            Toast.show({
                type: 'success',
                text1: 'Contraseña recuperada',
                text2: 'Porfavor, revisa tu correo'
            })
            setTimeout(()=>{
                    navigation.navigate('Iniciar Sesion')
            },5000);
        }
        
    }
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: "#fff",
            padding: 20,
            justifyContent: "center",
        },
        title: {
            fontSize: 28,
            fontWeight: "bold",
            marginBottom: 20,
            textAlign: "center",
            color: "#003366",  // Azul oscuro
        },
        label: {
            fontSize: 18,
            fontWeight: "600",
            marginBottom: 10,
            color: "#003366",  // Azul oscuro
            textAlign: "center",
        },
        input: {
            height: 50,
            borderColor: "#003366",  // Azul oscuro
            borderWidth: 1,
            borderRadius: 10,
            paddingHorizontal: 15,
            fontSize: 16,
            marginBottom: 20,
            color: "#333",
        },
        button: {
            backgroundColor: "#007BFF",  // Rojo
            padding: 15,
            borderRadius: 10,
            alignItems: "center",
        },
        buttonText: {
            color: "#fff",
            fontSize: 16,
            fontWeight: "bold",
        },
    });
    return(
        <View style={styles.container}>
            <Text style={styles.title}>Recuperación de Contraseña</Text>
            <Text style={styles.label}>Ingresa tu correo Electronico</Text>
            <TextInput style={styles.input} placeholder="Correo institucional para recuperación" value={email} onChangeText={setEmail} keyboardType="email-address"/>
            <TouchableOpacity style={styles.button} onPress={handleRecuperar}>
                <Text style={styles.buttonText}>Recuperar Contraseña</Text>
            </TouchableOpacity>
            <Toast/>
        </View>
    )
}