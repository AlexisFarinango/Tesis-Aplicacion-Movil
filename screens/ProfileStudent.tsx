import React, { useContext } from "react";
import { Text, View, StyleSheet, Image, TouchableOpacity, TextInput, PermissionsAndroid } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { ScrollView } from "react-native-gesture-handler";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { launchCamera } from 'react-native-image-picker';
import { AuthContext } from "../context/AuthContext";
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from "axios";
import { API_URL_BACKEND } from '@env';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KeyboardAvoidingView, Platform } from 'react-native';

// Función para formatear fecha
const formatearfecha = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Esquema de validación con Yup
const validationSchema = Yup.object().shape({
    nombre: Yup.string().required('El nombre es requerido'),
    apellido: Yup.string().required('El apellido es requerido'),
    direccion: Yup.string().required('La dirección es requerida'),
    ciudad: Yup.string().required('La ciudad es requerida'),
    telefono: Yup.string().required('El teléfono es requerido'),
});

export default function PerfilEstudiante() {
    const navigation = useNavigation();
    const { userData, datosusuario } = useContext(AuthContext);
    console.log("datos del perfil",userData);
    

    const handleUpdate = async (values) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            console.log("valores",values);
            
            console.log("Este es el formulario:", JSON.stringify(values, null, 2));
            
            await axios.put(`${API_URL_BACKEND}/estudiante/modificar-perfil/${userData._id}`, values, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });

            Toast.show({
                type: "success",
                text1: "Actualización Realizada con Éxito",
            });
            await datosusuario();

            setTimeout(() => {
                navigation.navigate("Modulos");
            }, 3000);
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Error al Actualizar la Información",
            });
            console.error(error);
        }
    };

    const requestCameraPermission = async (setFieldValue) => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: 'Permiso de Cámara',
                    message: 'La aplicación necesita acceso a la cámara.',
                    buttonNeutral: 'Preguntar luego',
                    buttonNegative: 'Cancelar',
                    buttonPositive: 'Aceptar',
                },
            );

            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                launchCamera({ mediaType: 'photo' }, (response) => {
                    if (response.assets) {
                        setFieldValue('fotografia', response.assets[0].uri);
                        console.log("foto tomada:", response.assets[0].uri);
                        
                    }
                });
            } else {
                console.log('Permiso de cámara denegado');
            }
        } catch (err) {
            console.warn(err);
        }
    };

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
        imageContainer: {
            alignItems: "center",
            marginBottom: 20,
        },
        profileImage: {
            width: 150,
            height: 150,
            borderRadius: 75,
            borderWidth: 3,
            borderColor: "#003366",
        },
        profileSection: {
            marginBottom: 15,
            paddingHorizontal: 10,
        },
        label: {
            fontSize: 18,
            fontWeight: "600",
            color: "#003366",
        },
        input: {
            height: 50,
            borderColor: "#ccc",
            borderWidth: 1,
            borderRadius: 10,
            paddingHorizontal: 15,
            marginBottom: 15,
            backgroundColor: "#fff",
        },
        readonlyInput: {
            backgroundColor: "#f5f5f5",
            color: "#aaa",
        },
        button: {
            backgroundColor: "#003366",
            padding: 15,
            borderRadius: 10,
            marginBottom: 15,
            alignItems: "center",
        },
        buttonText: {
            color: "#fff",
            fontSize: 16,
            fontWeight: "bold",
        },
        statictext: {
            height: 25,
            paddingHorizontal: 0,
            marginBottom: 10,
            backgroundColor: "#fff",
        },
        barNavicon: {
            width: 30,
            height: 30,
            resizeMode: 'contain',
        },
        bottomNav: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            backgroundColor: '#FFF',
            paddingVertical: 10,
            borderTopWidth: 1,
            borderTopColor: '#E5E5E5',
        },
        navItem: {
            alignItems: 'center',
            justifyContent: 'center',
        },
        navText: {
            fontSize: 12,
            color: '#000',
            marginTop: 5,
        },
    });

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <View style={styles.container}>
                    <Toast/>
                    <Text style={styles.title}>Perfil de Usuario</Text>
                    <Formik
                        initialValues={{
                            nombre: userData.nombre || '',
                            apellido: userData.apellido || '',
                            direccion: userData.direccion || '',
                            ciudad: userData.ciudad || '',
                            telefono: userData.telefono || '',
                            fotografia: userData.fotografia || '',
                        }}
                        validationSchema={validationSchema}
                        onSubmit={handleUpdate}
                    >
                        {({ handleChange, handleSubmit, values, setFieldValue, errors, touched }) => (
                            <>
                                <View style={styles.imageContainer}>
                                    <Image
                                        source={{
                                            uri: values.fotografia || "https://img.freepik.com/vector-premium/icono-perfil-usuario-estilo-plano-ilustracion-vector-avatar-miembro-sobre-fondo-aislado-concepto-negocio-signo-permiso-humano_157943-15752.jpg",
                                        }}
                                        style={styles.profileImage}
                                    />
                                </View>
                                <TouchableOpacity style={styles.button} onPress={() => requestCameraPermission(setFieldValue)}>
                                    <Text style={styles.buttonText}>Actualizar Foto</Text>
                                </TouchableOpacity>
                                <ScrollView>
                                    <View style={styles.profileSection}>
                                        <Text style={styles.label}>Nombres:</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={values.nombre}
                                            onChangeText={handleChange('nombre')}
                                            placeholder="Nombres"
                                        />
                                        {errors.nombre && touched.nombre && <Text style={{ color: 'red' }}>{errors.nombre}</Text>}
                                    </View>
                                    <View style={styles.profileSection}>
                                        <Text style={styles.label}>Apellidos:</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={values.apellido}
                                            onChangeText={handleChange('apellido')}
                                            placeholder="Apellidos"
                                        />
                                        {errors.apellido && touched.apellido && <Text style={{ color: 'red' }}>{errors.apellido}</Text>}
                                    </View>
                                    {/* Campos no editables */}
                                    <View style={styles.profileSection}>
                                        <Text style={styles.label}>Correo Institucional:</Text>
                                        <Text style={styles.statictext}>{userData.email}</Text>
                                    </View>
                                    <View style={styles.profileSection}>
                                        <Text style={styles.label}>Cédula:</Text>
                                        <Text style={styles.statictext}>{userData.cedula}</Text>
                                    </View>
                                    <View style={styles.profileSection}>
                                        <Text style={styles.label}>Fecha de Nacimiento:</Text>
                                        <Text style={styles.statictext}>{formatearfecha(userData.fecha_nacimiento)}</Text>
                                    </View>
                                    {/* Campos editables */}
                                    <View style={styles.profileSection}>
                                        <Text style={styles.label}>Dirección:</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={values.direccion}
                                            onChangeText={handleChange('direccion')}
                                            placeholder="Dirección"
                                        />
                                        {errors.direccion && touched.direccion && <Text style={{ color: 'red' }}>{errors.direccion}</Text>}
                                    </View>
                                    <View style={styles.profileSection}>
                                        <Text style={styles.label}>Ciudad:</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={values.ciudad}
                                            onChangeText={handleChange('ciudad')}
                                            placeholder="Ciudad"
                                        />
                                        {errors.ciudad && touched.ciudad && <Text style={{ color: 'red' }}>{errors.ciudad}</Text>}
                                    </View>
                                    <View style={styles.profileSection}>
                                        <Text style={styles.label}>Teléfono:</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={values.telefono}
                                            onChangeText={handleChange('telefono')}
                                            placeholder="Teléfono"
                                        />
                                        {errors.telefono && touched.telefono && <Text style={{ color: 'red' }}>{errors.telefono}</Text>}
                                    </View>
                                    <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                                        <Text style={styles.buttonText}>Actualizar</Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            </>
                        )}
                    </Formik>
                </View>
            </KeyboardAvoidingView>
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Modulos')}>
                    <Image source={require('../icons/inicio.png')} style={styles.barNavicon} />
                    <Text style={styles.navText}>Inicio</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Ver Cursos')}>
                    <Image source={require('../icons/cursos.png')} style={styles.barNavicon} />
                    <Text style={styles.navText}>Cursos</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Ver Asistencias')}>
                    <Image source={require('../icons/asistencias.png')} style={styles.barNavicon} />
                    <Text style={styles.navText}>Asistencias</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Ver Actuaciones')}>
                    <Image source={require('../icons/actuaciones.png')} style={styles.barNavicon} />
                    <Text style={styles.navText}>Actuaciones</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Iniciar Sesion')}>
                    <Image source={require('../icons/cerrarsesion.png')} style={styles.barNavicon} />
                    <Text style={styles.navText}>Cerrar Sesión</Text>
                </TouchableOpacity>
            </View>
        </GestureHandlerRootView>
    );
}
