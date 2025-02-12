import axios from 'axios';
import React, { useState, useRef, useCallback } from 'react';
import { Text, View, TextInput, TouchableOpacity, StyleSheet, Modal, BackHandler } from 'react-native';
import { API_URL_BACKEND } from '@env';
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Toast from 'react-native-toast-message';
import RNMinimizeApp from 'react-native-minimize';

export default function TokenValidado() {
    const [code, setCode] = useState(Array(10).fill(''));
    const [showModal, setShowModal] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);
    const navigation = useNavigation();
    const inputs = useRef([]);
    const handleNewPasswordChange = (text) => {
     
        if (text.includes(' ')) {
           
            return;
        }
        setNewPassword(text); 
    };

    const handleConfirmPasswordChange = (text) => {
        
        if (text.includes(' ')) {
   
            return;
        }
        setConfirmPassword(text);
    };
    useFocusEffect(
        useCallback(() => {
            const handleBackPress = () => {
                RNMinimizeApp.minimizeApp(); 
                return true; 
            };

            BackHandler.addEventListener('hardwareBackPress', handleBackPress);

     
            return () => {
                BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
            };
        }, [])
    );

    const handleChangeText = (text, index) => {
        let newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

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
                const response = await axios.get(`${API_URL_BACKEND}/estudiante/recuperar-password/${tokenvalidatepass}`);
                console.log("Mensaje en consola: ", response.data.msg);
                Toast.show({
                    type: "success",
                    text1: `${response.data.msg}`
                })
               
                setShowModal(true);
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

    const handleSavePassword = async () => {
        const tokenvalidatepass = code.join('');
        if (!newPassword || !confirmPassword) {
            Toast.show({
                type: "error",
                text1: "Los campos no pueden estar vacíos"
            });
            return;
        } else {
            if (newPassword !== confirmPassword) {
                Toast.show({
                    type: "error",
                    text1: "Las contraseñas no coinciden"
                });
                return;
            } else {
                if (newPassword.length < 8 || confirmPassword.length < 8) {
                    Toast.show({
                        type: "error",
                        text1: "La contraseña debe tener al menos 8 caracteres"
                    });
                    return;
                }else{
                    try {
                        const prefixedNewPassword = `EST${newPassword}`;
                        const prefixedConfirmPassword = `EST${confirmPassword}`;
                        const response = await axios.post(`${API_URL_BACKEND}/estudiante/nueva-password/${tokenvalidatepass}`, {
                            password: prefixedNewPassword,
                            confirmarPassword: prefixedConfirmPassword,
                        });
                        console.log("Contraseña cambiada exitosamente");
    
                        setShowModal(false);
                        Toast.show({
                            type: 'success',
                            text1: `${response.data.msg}`
                        })
                        setTimeout(() => {
                            navigation.navigate('Iniciar Sesión')
                        }, 3000);
    
                    } catch (error) {
                        console.log("No se pudo actualizar la contraseña: ", error);
                    }
                }
            }
        }
    };

    return (
        <View style={styles.container}>
            <Toast />
            <Text style={styles.title}>Ingresar Código</Text>
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


            <Modal
                visible={showModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Ingresa nueva contraseña</Text>
                        <View style={styles.passwordContainer}>
                            <Text style={styles.prefix}>EST</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Nueva contraseña"
                                secureTextEntry={!showPasswords}
                                value={newPassword}
                                onChangeText={handleNewPasswordChange}
                            />
                        </View>
                            {newPassword.length < 8 && newPassword.length > 0 && (
                                <Text style={styles.errorText}>La contraseña debe tener al menos 8 caracteres.</Text>
                            )}
                        <View style={styles.passwordContainer}>
                            <Text style={styles.prefix}>EST</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Confirmar nueva contraseña"
                                secureTextEntry={!showPasswords}
                                value={confirmPassword}
                                onChangeText={handleConfirmPasswordChange}
                            />
                        </View>
                            {confirmPassword.length < 8 && confirmPassword.length > 0 && (
                                <Text style={styles.errorText}>La contraseña debe tener al menos 8 caracteres.</Text>
                            )}
                        <View style={styles.checkboxContainer}>
                            <TouchableOpacity onPress={() => setShowPasswords(!showPasswords)}>
                                <Text style={styles.checkboxText}>
                                    {showPasswords ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.modalButton} onPress={handleSavePassword}>
                            <Text style={styles.modalButtonText}>Guardar contraseña</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: "#666666",
    },
    passwordContainer: {
        marginVertical: 10,
        flexDirection: 'row', 
        alignItems: 'center', 
        borderWidth: 1, 
        borderColor: '#ccc', 
        borderRadius: 5, 
        padding: 5, 
    },
    prefix: {
        marginRight: 5, 
        fontWeight: 'bold',
        color: "#666666",
    },
    modalInput: {
        flex: 1, 
        height: 40, 
        backgroundColor: "#fff",
        color: "#666666",
    },
    modalButton: {
        backgroundColor: '#007BFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    modalButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    checkboxText: {
        fontSize: 16,
        color: '#007BFF',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
    },
});
