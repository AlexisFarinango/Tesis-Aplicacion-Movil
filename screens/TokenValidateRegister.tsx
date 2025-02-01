import axios from 'axios';
import React, { useState, useRef, useCallback } from 'react';
import { Text, View, TextInput, TouchableOpacity, StyleSheet, Modal, BackHandler } from 'react-native';
import { API_URL_BACKEND } from '@env';
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Toast from 'react-native-toast-message';
import RNMinimizeApp from 'react-native-minimize';


export default function TokenValidadoRegistro() {
    const [code, setCode] = useState(Array(10).fill(''));
    const [showModal, setShowModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigation = useNavigation();
    const inputs = useRef([]);
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

    const handleChangeText = (text, index) => {
        let newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        // Avanzar automáticamente al siguiente campo si hay texto y no es el último campo
        if (text && index < 5) {
            inputs.current[index + 1].focus();
        }
    };

    const handleSendToken = async () => {
        const tokenvalidatepass = code.join('');
        if (tokenvalidatepass.length !== 6) {
            Toast.show({
                type: "error",
                text1: "Completa todos los campos"
            });
        } else {
            try {
                const response = await axios.get(`${API_URL_BACKEND}/estudiante/confirmar/${tokenvalidatepass}`);
                console.log("Mensaje en consola: ", response.data.msg);
                Toast.show({
                    type: "success",
                    text1: `${response.data.msg}`
                })
                Toast.show({
                    type: 'success',
                    text1: `${response.data.msg}`
                })
                setTimeout(()=>{
                        navigation.navigate('Iniciar Sesión')
                },5000);
            } catch (error) {
                console.log("Se obtuvo un error al validar el token", error);
                Toast.show({
                    type: "error",
                    text1: "Código Inválido",
                    text2: "Revisa el código ingresado"
                });
            }
        }
    };
    return (
        <View style={styles.container}>
            <Toast />
            <Text style={styles.title}>Ingresa el código</Text>
            <View style={styles.codeContainer}>
                {Array.from({ length: 6 }).map((_, index) => (
                    <TextInput
                        key={index}
                        ref={(ref) => inputs.current[index] = ref}
                        style={styles.input}
                        maxLength={1}
                        keyboardType="default"
                        value={code[index]}
                        onChangeText={(text) => handleChangeText(text, index)}
                    />
                ))}
            </View>
            <TouchableOpacity style={styles.button} onPress={handleSendToken}>
                <Text style={styles.buttonText}>Enviar</Text>
            </TouchableOpacity>
        </View>
    );
}

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
        textAlign: 'center',
    },
    codeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '75%',
        marginBottom: 20,
    },
    input: {
        width: 40,
        height: 60,
        borderColor: '#DDD',
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: '#FFF',
        fontSize: 18,
        textAlign: 'center',
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
});
