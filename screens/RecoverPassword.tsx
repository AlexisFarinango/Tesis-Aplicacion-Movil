import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import axios from "axios";
import { API_URL_BACKEND } from '@env'


export default function RecuperarContra() {
    const [email, setEmail] = useState("");
    const navigation = useNavigation();
    const handleRecuperar = async () => {
        if (!email) {
            Toast.show({
                type: "error",
                text1: "Por favor ingresa el correo",
            });
            return;
        } else {
            try {
                const response = await axios.post(`${API_URL_BACKEND}/estudiante/recuperar-password`, {
                    email: email,
                })
                console.log("Email para recuperar constraseña", email);

                Toast.show({
                    type: 'success',
                    text1: `${response.data.msg}`,
                    text2: 'Porfavor, revisa tu correo'
                })
                setTimeout(() => {
                    navigation.navigate('Token Validado')
                }, 5000);
            } catch (error) {
                console.log("Se ha presentado el siguiente error", error);
                const status = error.response.status;
                if (status === 404) {
                    Toast.show({
                        type: 'error',
                        text1: `Estudiante no registrado`,
                        text2: "Verifica el correo ingresado",
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
            color: "#003366", 
        },
        label: {
            fontSize: 18,
            fontWeight: "600",
            marginBottom: 10,
            color: "#003366", 
            textAlign: "center",
        },
        input: {
            height: 50,
            borderColor: "#003366", 
            borderWidth: 1,
            borderRadius: 10,
            paddingHorizontal: 15,
            fontSize: 16,
            marginBottom: 20,
            color: "#666666",
        },
        button: {
            backgroundColor: "#007BFF", 
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
    return (
        <View style={styles.container}>
            <Toast />
            <Text style={styles.label}>Ingresa tu correo Electrónico</Text>
            <TextInput style={styles.input} placeholder="Correo institucional para recuperación" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <TouchableOpacity style={styles.button} onPress={handleRecuperar}>
                <Text style={styles.buttonText}>Enviar</Text>
            </TouchableOpacity>
            <Toast />
        </View>
    )
}