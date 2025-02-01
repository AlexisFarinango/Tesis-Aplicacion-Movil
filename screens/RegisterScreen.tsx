import React, { useState } from "react";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Modal, TouchableOpacity, Button, Image, PermissionsAndroid, ScrollView, StyleSheet, Text, TextInput, View, Dimensions, ActivityIndicator } from "react-native";
import { launchCamera } from "react-native-image-picker";
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from "axios";
import { API_URL_BACKEND } from '@env'
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";


const validacionForm = Yup.object().shape({
    nombre: Yup.string().trim().matches(/^[A-Za-zñÑáéíóúÁÉÍÓÚ\s]+$/, 'El nombre solo puede contener letras').required('Nombre Obligatorio').max(40, 'El nombre no puede tener más de 40 caracteres').min(3, "Debe existir un minimo de 3 caracteres"),
    apellido: Yup.string().trim().matches(/^[A-Za-zñÑáéíóúÁÉÍÓÚ\s]+$/, 'El apellido solo puede contener letras').required('Apellido Obligatorio').max(40, 'El apellido no puede tener más de 40 caracteres').min(3, "Debe existir un minimo de 3 caracteres"),
    cedula: Yup.string().trim().matches(/^[0-9]+$/, 'La cédula solo puede contener números').required('Cedula Obligatoria').max(10, 'La cédula no puede tener más de 10 caracteres').min(10, "Completa tu cédula"),
    email: Yup.string().trim().required('Correo Institucional Obligatorio').email("Debe ser un correo válido").matches(
        /@(epn\.edu\.ec)$/i,
        'El correo debe ser institucional: @epn.edu.ec'
    ).min(3, "Debe existir un minimo de 3 caracteres"),
    password: Yup.string().trim().required('Contraseña Obligatoria').min(8, "Debe existir un minimo de 8 caracteres"),
    fecha_nacimiento: Yup.string().required("Fecha de Nacimiento Obligatoria"),
    direccion: Yup.string().trim().required('Dirección Obligatoria').max(30, 'La dirección no puede tener más de 30 caracteres').min(3, "Debe existir un minimo de 3 caracteres"),
    ciudad: Yup.string().trim().matches(/^[A-Za-zñÑáéíóúÁÉÍÓÚ\s]+$/, 'La ciudad solo puede contener letras').required('Ciudad Obligatoria').max(30, 'La ciudad no puede tener más de 30 caracteres').min(3, "Debe existir un minimo de 3 caracteres"),
    telefono: Yup.string().trim().matches(/^[0-9]+$/, 'El teléfono solo puede contener números').required('Teléfono Obligatorio').max(10, 'El teléfono no puede tener más de 10 caracteres').min(10, "Completa tu número de teléfono"),
    fotografia: Yup.mixed().required('Debes capturar una imagen.'),
});





export default function RegistroEstudiante() {
    const [selectedImage, setSelectedImage] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const navigation = useNavigation();
    const [imageError, setImageError] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(true);
    const { width, height } = Dimensions.get('window');
    const [loading, setLoading] = useState(false);
    const [dots, setDots] = useState('');
    const scaleFactor = width < 400 ? 0.8 : 1;



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
                console.log('Permiso de cámara otorgado');
                launchCamera({ mediaType: 'photo' }, (response) => {
                    if (response.didCancel) {
                        console.log('Usuario canceló la cámara');
                    } else if (response.error) {
                        console.log('Error al lanzar la cámara:', response.error);
                    } else {
                        console.log('Foto capturada:', response.assets[0]);
                        const image = response.assets[0];
                        setSelectedImage(image.uri); 
                        setFieldValue('fotografia', image); 
                    }
                });
            } else {
                console.log('Permiso de cámara denegado');
            }
        } catch (err) {
            console.warn(err);
        }
    };


    const handleSubmit = async (values) => {
        console.log(values.fotografia.uri);
        if (!values.fotografia?.uri) {
            Toast.show({
                type: "error",
                text1: "No se ha capturado una fotografía"
            }); 
            console.log("No se ha capturado una fotografía");

            return; 
        } else {
            setImageError('');
        }
        setLoading(true);
        setDots(''); 
        const interval = setInterval(() => {
            setDots(prev => prev.length < 3 ? prev + '.' : ''); 
        }, 300);

        const formData = new FormData();
        formData.append('nombre', values.nombre);
        formData.append('apellido', values.apellido);
        formData.append('cedula', values.cedula);
        formData.append('email', values.email);
        formData.append('password', `EST${values.password}`);
        const fecha = new Date(values.fecha_nacimiento);
        const formattedDate = `${fecha.getFullYear()}/${String(fecha.getMonth() + 1).padStart(2, '0')}/${String(fecha.getDate()).padStart(2, '0')}`;
        formData.append('fecha_nacimiento', formattedDate);
        formData.append('direccion', values.direccion);
        formData.append('ciudad', values.ciudad);
        formData.append('telefono', values.telefono);
        formData.append('fotografia', {
            uri: values.fotografia.uri,
            type: values.fotografia.type,
            name: values.fotografia.fileName || `photo_${Date.now()}.jpg`,
        });

        console.log("formulario: ", JSON.stringify(formData, null, 2));


        console.log("ruta", `${API_URL_BACKEND}/estudiante/registro-estudiante`);
        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };

            let response = await axios.post(`${API_URL_BACKEND}/estudiante/registro-estudiante`, formData, config);
            if (response.status === 201) {
                Toast.show({ type: 'success', text1: 'Usuario Registrado revisa tu correo', text2: 'Registro Exitoso' });
                setTimeout(() => navigation.navigate('Token Registro'), 3000);
                console.log(response.data);
            }
        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                console.error("Error en la respuesta del servidor:", error.response.data);
                console.error("Estado HTTP:", status);
                console.error("Encabezados de respuesta:", error.response.headers);

                if (status === 400) {
                    console.error("Solicitud incorrecta (400) ");
                    Toast.show({ type: 'error', text1: 'Existen campos vacios' });
                } else if (status === 409) {
                    console.error("Email o cédula ya registrados.");
                    Toast.show({ type: 'error', text1: 'Email o cédula ya registrados' });
                } else if (status === 422) {
                    console.error("La fotografía ingresada no contiene un rostro.");
                    Toast.show({ type: 'error', text1: 'La fotografía tomada no contiene un rostro' });
                } else if (status === 500) {
                    console.error("Error del servidor (500)");
                    Toast.show({ type: 'error', text1: 'Error en el servidor' });
                } else {
                    console.error(`Error con código ${status}`);
                }
                console.error("Detalles completos del error:", error.toJSON());
            }
        } finally {
            clearInterval(interval);
            setLoading(false); 
            setDots(''); 
        };
    }


    const formatDate = (date) => {
        if (date instanceof Date && !isNaN(date)) {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return `${year}/${month}/${day}`; 
        } else {
            return "";
        }
    };
    const handleChangeDate = (event, selectedDate, setFieldValue) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setFieldValue("fecha_nacimiento", selectedDate);
        }
    };
    return (
        <View style={{ flex: 1 }}>
            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.9)' }}>
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ width: '90%', backgroundColor: 'white', borderRadius: 10, padding: 20 }}>
                            <Text style={[styles.modalTitle, { fontSize: 24 * scaleFactor, color: 'black' }]}>
                                Asegúrese de cumplir con lo siguiente al tomarse su fotografía para el registro.
                            </Text>
                            <View style={{ alignItems: 'center', marginVertical: 10 }}>
                                <Image source={require('../icons/camara.png')} style={[styles.modalImage, { width: 120 * scaleFactor, height: 120 * scaleFactor }]} />
                            </View>
                            <Text style={[styles.modalText, { fontSize: 18 * scaleFactor, color: 'black' }]}>🔹 Asegúrese de que su rostro esté completamente visible y no use accesorios que puedan obstruirlo.</Text>
                            <Text style={[styles.modalText, { fontSize: 18 * scaleFactor, color: 'black' }]}>🔹 Tómese la fotografía en un lugar bien iluminado para garantizar que sea clara y de buena calidad.</Text>
                            <Text style={[styles.modalText, { fontSize: 18 * scaleFactor, color: 'black' }]}>🔹 Mantenga una distancia de 30 a 40 cm entre su rostro y la cámara al tomarse la fotografía.</Text>
                            <Text style={[styles.modalText, { fontSize: 18 * scaleFactor, color: 'black' }]}>
                                ⚠️Este proceso es único y debe realizarse cumpliendo con las condiciones indicadas para que su registro funcione correctamente.⚠️
                            </Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 5 }}>
                                <TouchableOpacity
                                    style={styles.modalButton}
                                    onPress={() => {
                                        setIsModalVisible(false); 
                                    }}
                                >
                                    <Text style={[styles.buttonText, { fontSize: 18 * scaleFactor, textAlign: 'center' }]}>Entendido</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.modalButtonregresar}
                                    onPress={() => {
                                        setIsModalVisible(false); 
                                        navigation.goBack(); 
                                    }}
                                >
                                    <Text style={[styles.buttonText, { fontSize: 18 * scaleFactor, textAlign: 'center' }]}>Realizar registro en otro momento</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
            <View>
                <Text style={[styles.title, { fontSize: 28 * scaleFactor }]}>Nuevo Estudiante</Text>
            </View>
            <View style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.container}>
                    <Formik
                        initialValues={{
                            nombre: '',
                            apellido: '',
                            cedula: '',
                            email: '',
                            password: '',
                            fecha_nacimiento: null,
                            direccion: '',
                            ciudad: '',
                            telefono: '',
                            fotografia: Yup.mixed().test(
                                'fileFormat',
                                'Solo se permiten imágenes',
                                value => value && value.type.startsWith('image/')
                            ),

                        }}
                        validationSchema={validacionForm}
                        onSubmit={handleSubmit}>
                        {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched, isValid, isSubmitting }) => (
                            <>
                                <Text style={styles.labeldos}>Nombres:</Text>
                                <TextInput
                                    style={[styles.input, { fontSize: 18 * scaleFactor }]}
                                    placeholder="Ingresa tu nombre"
                                    placeholderTextColor={"#888"}
                                    onChangeText={text => {
                                        if (text.length <= 30) {
                                            handleChange('nombre')(text)
                                        }
                                    }}
                                    onBlur={handleBlur('nombre')}
                                    value={values.nombre}
                                />
                                {touched.nombre && errors.nombre && <Text style={styles.error}>{errors.nombre}</Text>}

                                <Text style={styles.labeldos}>Apellidos:</Text>
                                <TextInput
                                    style={[styles.input, { fontSize: 18 * scaleFactor }]}
                                    placeholder="Ingresa tu apellido"
                                    placeholderTextColor={"#888"}
                                    onChangeText={text => {
                                        if (text.length <= 30) {

                                            handleChange('apellido')(text)
                                        }
                                    }}
                                    onBlur={handleBlur('apellido')}
                                    value={values.apellido}
                                />
                                {touched.apellido && errors.apellido && <Text style={styles.error}>{errors.apellido}</Text>}

                                <Text style={styles.labeldos}>Cédula:</Text>
                                <TextInput
                                    style={[styles.input, { fontSize: 18 * scaleFactor }]}
                                    placeholder="Ingresa tu cédula"
                                    placeholderTextColor={"#888"}
                                    onChangeText={text => {
                                        if (text.length <= 10) {

                                            handleChange('cedula')(text)
                                        }
                                    }}
                                    onBlur={handleBlur('cedula')}
                                    value={values.cedula}
                                    keyboardType="numeric"
                                />
                                {touched.cedula && errors.cedula && <Text style={styles.error}>{errors.cedula}</Text>}

                                <Text style={styles.labeldos}>Correo Institucional:</Text>
                                <TextInput
                                    style={[styles.input, { fontSize: 18 * scaleFactor }]}
                                    placeholder="Ingresa tu correo"
                                    placeholderTextColor={"#888"}
                                    onChangeText={text => {
                                        if (text.length <= 50) {
                                            handleChange('email')(text)
                                        }
                                    }}
                                    onBlur={handleBlur('email')}
                                    value={values.email}
                                />
                                {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}

                                <Text style={styles.labeldos}>Contraseña:</Text>
                                <Text style={styles.selectedDate}>Recuerda que tu contraseña iniciara con "EST"</Text>
                                <View style={styles.passwordContainer}>
                                    <Text style={styles.prefix}>EST</Text>
                                    <TextInput
                                        style={[styles.inputpassword, { fontSize: 18 * scaleFactor }]}
                                        placeholder="Ingresa tu contraseña"
                                        placeholderTextColor={"#888"}
                                        secureTextEntry={!passwordVisible}
                                        onChangeText={text => {
                                            if (text.includes(' ')) {
                                                return;
                                            }
                                            handleChange('password')(text); 
                                        }}
                                        onBlur={handleBlur('password')}
                                        value={values.password}
                                    />
                                </View>
                                {touched.password && errors.password && <Text style={styles.error}>{errors.password}</Text>}
                                <View style={styles.checkboxContainer}>
                                    <Text style={styles.helperText}>
                                        {passwordVisible ? "Contraseña visible" : "Contraseña oculta"}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => setPasswordVisible(!passwordVisible)} 
                                        style={styles.checkbox}>
                                        <View style={passwordVisible ? styles.checkboxChecked : styles.checkboxUnchecked} />
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.labeldos}>Fecha de Nacimiento:</Text>
                                <TouchableOpacity
                                    style={styles.customButton}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Text style={styles.buttonText}>Seleccionar Fecha</Text>
                                </TouchableOpacity>

                                {showDatePicker && (
                                    <DateTimePicker
                                        value={values.fecha_nacimiento ? new Date(values.fecha_nacimiento) : new Date()}
                                        mode="date"
                                        display="default"
                                        maximumDate={new Date()}
                                        onChange={(event, selectedDate) => handleChangeDate(event, selectedDate, setFieldValue)}
                                    />
                                )}
                                {values.fecha_nacimiento && <Text style={styles.selectedDate}>Fecha seleccionada: {formatDate(new Date(values.fecha_nacimiento))}</Text>}
                                {touched.fecha_nacimiento && errors.fecha_nacimiento && <Text style={styles.error}>{errors.fecha_nacimiento}</Text>}

                                <Text style={styles.labeldos}>Dirección:</Text>
                                <TextInput
                                    style={[styles.input, { fontSize: 18 * scaleFactor }]}
                                    placeholder="Ingresa tu dirección"
                                    placeholderTextColor={"#888"}
                                    onChangeText={text => {
                                        if (text.length <= 30) {
                                            handleChange('direccion')(text)
                                        }
                                    }}
                                    onBlur={handleBlur('direccion')}
                                    value={values.direccion}
                                />
                                {touched.direccion && errors.direccion && <Text style={styles.error}>{errors.direccion}</Text>}

                                <Text style={styles.labeldos}>Ciudad:</Text>
                                <TextInput
                                    style={[styles.input, { fontSize: 18 * scaleFactor }]}
                                    placeholder="Ingresa tu ciudad"
                                    placeholderTextColor={"#888"}
                                    onChangeText={text => {
                                        if (text.length <= 30) {
                                            handleChange('ciudad')(text)
                                        }
                                    }}
                                    onBlur={handleBlur('ciudad')}
                                    value={values.ciudad}
                                />
                                {touched.ciudad && errors.ciudad && <Text style={styles.error}>{errors.ciudad}</Text>}

                                <Text style={styles.labeldos}>Teléfono:</Text>
                                <TextInput
                                    style={[styles.input, { fontSize: 18 * scaleFactor }]}
                                    placeholder="Ingresa tu teléfono"
                                    placeholderTextColor={"#888"}
                                    onChangeText={text => {
                                        if (text.length <= 10) {
                                            handleChange('telefono')(text);
                                        }
                                    }}
                                    onBlur={handleBlur('telefono')}
                                    value={values.telefono}
                                    keyboardType="numeric"
                                />
                                {touched.telefono && errors.telefono && <Text style={styles.error}>{errors.telefono}</Text>}
                                <TouchableOpacity
                                    style={styles.customButton}
                                    onPress={() => requestCameraPermission(setFieldValue)}
                                    onBlur={handleBlur('fotografia')}
                                >
                                    <Text style={styles.buttonText}>Tomar Fotografía del Rostro</Text>
                                </TouchableOpacity>
                                {selectedImage && (
                                    <Image source={{ uri: selectedImage }} style={styles.image} />
                                )}

                                <TouchableOpacity
                                    style={[
                                        styles.button,
                                        { backgroundColor: isValid ? '#4CAF50' : '#CCC', opacity: isValid && !isSubmitting ? 1 : 0.5 },
                                    ]}
                                    onPress={handleSubmit}
                                    disabled={!isValid || isSubmitting}
                                >
                                    <Text style={[styles.buttonText, { fontSize: 20 * scaleFactor }]}>Enviar</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </Formik>
                </ScrollView>
            </View>
            {loading && (
                <View style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    zIndex: 1000 
                }}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff' }}>Registrando información{dots}</Text>
                </View>
            )}
            <Toast />
        </View>
    );
}
const styles = StyleSheet.create({
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 30,
        marginTop: 30,
        textAlign: "center",
        color: "#666666",
    },
    container: {
        padding: 20,
        flexGrow: 1, 
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginVertical: 10,
        borderRadius: 5,
        backgroundColor: "#fff",
        color: "#666666",
    },
    error: {
        color: 'red',
        fontSize: 12,
    },
    image: {
        width: 100,
        height: 100,
        marginVertical: 10,
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
    inputpassword: {
        flex: 1, 
        height: 40, 
        backgroundColor: "#fff",
        color: "#666666",
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
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
    label: {
        fontSize: 16,
        marginVertical: 5,
    },
    selectedDate: {
        fontSize: 14,
        marginVertical: 5,
        color: 'gray',
    },
    button: {
        padding: 10,
        marginVertical: 10,
        backgroundColor: '#4CAF50', 
        borderRadius: 5,
        borderWidth: 1,  
        borderColor: '#ccc', 
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    customButton: {
        backgroundColor: '#007BFF',
        padding: 10, 
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#0056b3', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginVertical: 10, 
    },
    labeldos: {
        fontSize: 18,
        fontWeight: "600",
        color: "#003366",
    },
    errordos: {
        color: 'red',
        fontSize: 12,
        marginVertical: 5,
        textAlign: 'center', 
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
    },
    modalImage: {
        width: '50%',
        height: '30%',
    },
    modalText: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 20,
        marginTop: 5,
        paddingHorizontal: 20,
    },
    modalTitle: {
        color: '#fff',
        textAlign: 'center',
        paddingHorizontal: 20,
        fontSize: 24,
        fontWeight: "bold",
    },
    modalButton: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#0056b3',
        marginHorizontal: 10, 
        flex: 1, 
        alignItems: 'center', 
    },
    modalButtonregresar: {
        backgroundColor: '#e52510',
        padding: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#e52510',
        marginHorizontal: 10, 
        flex: 1,
        alignItems: 'center',
    },
});