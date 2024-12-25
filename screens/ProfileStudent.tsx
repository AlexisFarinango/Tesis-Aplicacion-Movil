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
    console.log("fecha nacimiento", fechaISO);

    // Crear la fecha a partir de la cadena ISO
    const fecha = new Date(fechaISO);

    // Ajustar la fecha para evitar el desfase
    const fechaLocal = new Date(fecha.getTime() + fecha.getTimezoneOffset() * 60000);

    console.log("fecha nacimiento ajustada", fechaLocal);

    // Formatear la fecha
    const fechaFormateada = fechaLocal.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    console.log("fecha nacimiento formateada", fechaFormateada);

    return fechaFormateada;
};

// Esquema de validación con Yup
const validationSchema = Yup.object().shape({
    nombre: Yup.string().trim().matches(/^[A-Za-zñÑ\s]+$/, 'El nombre solo puede contener letras').required('Nombre Obligatorio').max(40, 'El nombre no puede tener más de 40 caracteres').min(3, "Debe existir un minimo de 3 caracteres"),
    apellido: Yup.string().trim().matches(/^[A-Za-zñÑ\s]+$/, 'El apellido solo puede contener letras').required('Apellido Obligatorio').max(40, 'El apellido no puede tener más de 40 caracteres').min(3, "Debe existir un minimo de 3 caracteres"),
    direccion: Yup.string().trim().required('Dirección Obligatoria').max(30, 'La dirección no puede tener más de 30 caracteres').min(3, "Debe existir un minimo de 3 caracteres"),
    ciudad: Yup.string().trim().matches(/^[A-Za-zñÑ\s]+$/, 'La ciudad solo puede contener letras').required('Ciudad Obligatoria').max(30, 'La ciudad no puede tener más de 30 caracteres').min(3, "Debe existir un minimo de 3 caracteres"),
    telefono: Yup.string().trim().matches(/^[0-9]+$/, 'El teléfono solo puede contener números').required('Teléfono Obligatorio').max(10, 'El teléfono no puede tener más de 10 caracteres').min(10, "Completa tu número de teléfono"),
});

export default function PerfilEstudiante() {
    const navigation = useNavigation();
    const { userData, datosusuario } = useContext(AuthContext);
    console.log("datos del perfil", userData);


    const handleUpdate = async (values) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            console.log("valores", values);

            // Crear un FormData para enviar la fotografía correctamente
            const formData = new FormData();
            formData.append('nombre', values.nombre);
            formData.append('apellido', values.apellido);
            formData.append('direccion', values.direccion);
            formData.append('ciudad', values.ciudad);
            formData.append('telefono', values.telefono);

            // Verificar si hay una nueva fotografía y agregarla al FormData
            // if (values.fotografia) {
            //     formData.append('fotografia', {
            //         uri: values.fotografia,
            //         type: 'image/jpeg', // Cambia esto si es necesario
            //         name: values.fotografia.split('/').pop() || `photo_${Date.now()}.jpg`,
            //     });
            // }

            console.log("Este es el formulario:", JSON.stringify(formData, null, 2));

            await axios.put(`${API_URL_BACKEND}/estudiante/modificar-perfil/${userData._id}`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });
            console.log("formulario actualizar: ", JSON.stringify(values, null, 2));

            Toast.show({
                type: "success",
                text1: "Actualización Realizada con Éxito",
                visibilityTime: 3000,
                onShow: () => console.log('Toast mostrado'),
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

    // const requestCameraPermission = async (setFieldValue) => {
    //     try {
    //         const granted = await PermissionsAndroid.request(
    //             PermissionsAndroid.PERMISSIONS.CAMERA,
    //             {
    //                 title: 'Permiso de Cámara',
    //                 message: 'La aplicación necesita acceso a la cámara.',
    //                 buttonNeutral: 'Preguntar luego',
    //                 buttonNegative: 'Cancelar',
    //                 buttonPositive: 'Aceptar',
    //             },
    //         );

    //         if (granted === PermissionsAndroid.RESULTS.GRANTED) {
    //             launchCamera({ mediaType: 'photo' }, (response) => {
    //                 if (response.assets) {
    //                     setFieldValue('fotografia', response.assets[0].uri);
    //                     console.log("foto tomada:", response.assets[0].uri);
    //                 }
    //             });
    //         } else {
    //             console.log('Permiso de cámara denegado');
    //         }
    //     } catch (err) {
    //         console.warn(err);
    //     }
    // };

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
            textAlign: "center",
            color: "#003366",
        },
        imageContainer: {
            alignItems: "center",
            marginBottom: 20,
        },
        profileImage: {
            width: 140,
            height: 140,
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
            color: "#666666",
        },
        readonlyInput: {
            backgroundColor: "#f5f5f5",
            color: "#aaa",
        },
        buttonfoto: {
            backgroundColor: "#003366",
            padding: 15,
            borderRadius: 10,
            marginBottom: 15,
            alignItems: "center",
            alignSelf: 'center',
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
            color: "#666666",
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
        description: {
            fontSize: 16,
            textAlign: 'center',
            marginBottom: 10,
            color: "#666666",
        },
    });

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <View style={styles.container}>
                    <Text style={styles.title}>Perfil de Usuario</Text>
                    <Text style={styles.description}>
                        Este módulo te permite ver y actualizar tu perfil
                    </Text>
                    <Formik
                        initialValues={{
                            nombre: userData.nombre || '',
                            apellido: userData.apellido || '',
                            direccion: userData.direccion || '',
                            ciudad: userData.ciudad || '',
                            telefono: userData.telefono || '',
                            // fotografia: userData.fotografia || '',
                        }}
                        validationSchema={validationSchema}
                        onSubmit={handleUpdate}
                    >
                        {({ handleChange, handleBlur, handleSubmit, values, setFieldValue, errors, touched }) => (
                            <>
                                <View style={styles.imageContainer}>
                                    <Image
                                        source={{
                                            uri: userData.fotografia,
                                        }}
                                        style={styles.profileImage}
                                    />
                                </View>
                                <View style={styles.buttonfoto}>
                                    <Text style={styles.buttonText}>Fotografía</Text>
                                </View>
                                <ScrollView>
                                    <View style={styles.profileSection}>
                                        <Text style={styles.label}>Nombres:</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={values.nombre}
                                            onChangeText={handleChange('nombre')}
                                            onBlur={handleBlur('nombre')}
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
                                            onBlur={handleBlur('apellido')}
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
                                            onBlur={handleBlur('direccion')}
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
                                            onBlur={handleBlur('ciudad')}
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
                                            onBlur={handleBlur('telefono')}
                                            placeholder="Teléfono"
                                            keyboardType="numeric"
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
                    <Toast />
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
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Iniciar Sesión')}>
                    <Image source={require('../icons/cerrarsesion.png')} style={styles.barNavicon} />
                    <Text style={styles.navText}>Cerrar Sesión</Text>
                </TouchableOpacity>
            </View>
        </GestureHandlerRootView>
    );
}
