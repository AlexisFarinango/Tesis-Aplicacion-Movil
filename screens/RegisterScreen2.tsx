import React, { useState } from "react";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { TouchableOpacity, Button, Image, PermissionsAndroid, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { launchCamera } from "react-native-image-picker";
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from "axios";
import { API_URL_BACKEND } from '@env'
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";

// Esquema de validación con Yup
const validacionForm = Yup.object().shape({
    nombre: Yup.string().required('Nombre Obligatorio').max(30, 'El nombre no puede tener más de 30 caracteres'),
    apellido: Yup.string().required('Apellido Obligatorio').max(30, 'El apellido no puede tener más de 30 caracteres'),
    cedula: Yup.string().required('Cedula Obligatoria').max(10, 'La cédula no puede tener más de 10 caracteres'),
    email: Yup.string().required('Correo Institucional Obligatorio').email("Debe ser un correo válido").matches(
        /@(epn\.edu\.ec)$/i,
        'El correo debe ser institucional: @epn.edu.ec'
    ),
    password: Yup.string().required('Contraseña Obligatoria'),
    fecha_nacimiento: Yup.string().required("Fecha de Nacimiento Obligatoria"),
    direccion: Yup.string().required('Dirección Obligatoria').max(30, 'La dirección no puede tener más de 30 caracteres'),
    ciudad: Yup.string().required('Ciudad Obligatoria').max(30, 'La ciudad no puede tener más de 30 caracteres'),
    telefono: Yup.string().required('Telefono Obligatorio').max(10, 'El teléfono no puede tener más de 10 caracteres'),
    fotografia: Yup.mixed().required('Debes capturar una imagen.'),
});

// Función para formatear la fecha
const formatDate = (date) => {
    if (!date) return ""; // Si no hay fecha, retorna un string vacío
    const d = new Date(date);
    // Resetea la hora para evitar problemas con la zona horaria
    d.setHours(0, 0, 0, 0); 
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0"); // Mes comienza en 0
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`; // Construye el formato deseado
};



export default function RegistroEstudiante() {
    const [selectedImage, setSelectedImage] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const navigation = useNavigation();

    const handleChangeDate = (event, selectedDate, setFieldValue) => {
        setShowDatePicker(false);
        if (selectedDate) {
            // Actualiza el valor de la fecha en Formik
            setFieldValue("fecha_nacimiento", selectedDate.toISOString().split("T")[0]);
        }
    };

    // Solicitar permiso de cámara y capturar foto
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
                        setSelectedImage(image.uri); // Muestra la imagen en la vista
                        setFieldValue('fotografia', image); // Asigna la imagen al formulario
                    }
                });
            } else {
                console.log('Permiso de cámara denegado');
            }
        } catch (err) {
            console.warn(err);
        }
    };

    // Manejar el envío del formulario
    const handleSubmit = async (values) => {
        const formData = new FormData();
        formData.append('nombre', values.nombre);
        formData.append('apellido', values.apellido);
        formData.append('cedula', values.cedula);
        formData.append('email', values.email);
        formData.append('password', values.password);
        formData.append('fecha_nacimiento', values.fecha_nacimiento);
        formData.append('direccion', values.direccion);
        formData.append('ciudad', values.ciudad);
        formData.append('cell', values.cell);
        formData.append('fotografia', {
            uri: values.fotografia.uri,
            type: values.fotografia.type,
            name: values.fotografia.fileName || `photo_${Date.now()}.jpg`,
        });

        console.log("formulario: ", JSON.stringify(formData, null, 2));

        // Aquí puedes realizar la petición al backend usando Axios o Fetch
        // Ejemplo:
        console.log("ruta", `${API_URL_BACKEND}/estudiante/registro-estudiante`);
        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };

            let response = await axios.post(`${API_URL_BACKEND}/estudiante/registro-estudiante`, formData, config);
            Toast.show({ type: 'success', text1: 'Usuario Registrado', text2: 'Sus datos fueron ingresados con éxito' });
            setTimeout(() => navigation.navigate('Token Registro'), 5000);
            console.log(response.data);
        } catch (error) {
            if (error.response) {
                // Errores de respuesta del servidor (código de estado diferente de 2xx)
                console.error("Error en la respuesta del servidor:", error.response.data);
                console.error("Estado HTTP:", error.response.status);
                console.error("Encabezados de respuesta:", error.response.headers);
            } else if (error.request) {
                // La solicitud fue realizada pero no se recibió respuesta
                console.error("No se recibió respuesta del servidor:", error.request);
            } else {
                // Errores que ocurrieron durante la configuración de la solicitud
                console.error("Error al configurar la solicitud:", error.message);
            }

            console.error("Detalles completos del error:", error.toJSON());
        }

        // await axios.post('https://api.example.com/registro', formData);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Nuevo Estudiante</Text>
            <Formik
                initialValues={{
                    nombre: '',
                    apellido: '',
                    cedula: '',
                    email: '',
                    password: '',
                    fecha_nacimiento: '',
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
                {({ handleChange, handleBlur, handleSubmit, setFieldValue, values, errors, touched }) => (
                    <>
                        <Text>Nombres:</Text>
                        <TextInput
                            style={styles.input}
                            onChangeText={text => {
                                if (text.length <= 30) {
                                    handleChange('nombre')(text)
                                }
                            }}
                            onBlur={handleBlur('nombre')}
                            value={values.nombre}
                            placeholder="Ingresa tu nombre"
                        />
                        {touched.nombre && errors.nombre && <Text style={styles.error}>{errors.nombre}</Text>}

                        <Text>Apellidos:</Text>
                        <TextInput
                            style={styles.input}
                            onChangeText={text => {
                                if (text.length <= 30) {

                                    handleChange('apellido')(text)
                                }
                            }}
                            onBlur={handleBlur('apellido')}
                            value={values.apellido}
                            placeholder="Ingresa tu apellido"
                        />
                        {touched.apellido && errors.apellido && <Text style={styles.error}>{errors.apellido}</Text>}

                        <Text>Cédula:</Text>
                        <TextInput
                            style={styles.input}
                            onChangeText={text => {
                                if (text.length <= 10) {

                                    handleChange('cedula')(text)
                                }
                            }}
                            onBlur={handleBlur('cedula')}
                            value={values.cedula}
                            placeholder="Ingresa tu cédula"
                            keyboardType="numeric"
                        />
                        {touched.cedula && errors.cedula && <Text style={styles.error}>{errors.cedula}</Text>}

                        <Text>Correo Institucional:</Text>
                        <TextInput
                            style={styles.input}
                            onChangeText={text => {
                                if (text.length <= 30) {
                                    handleChange('email')(text)
                                }
                            }}
                            onBlur={handleBlur('email')}
                            value={values.email}
                            placeholder="Ingresa tu correo"
                        />
                        {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}

                        <Text>Contraseña:</Text>
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Ingresa tu contraseña"
                                secureTextEntry={!passwordVisible} // Cambia la visibilidad
                                onChangeText={handleChange('password')}
                                value={values.password}
                            />
                        </View>
                        <View style={styles.checkboxContainer}>
                            <Text style={styles.helperText}>
                                {passwordVisible ? "Contraseña visible" : "Contraseña oculta"}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setPasswordVisible(!passwordVisible)} // Alterna la visibilidad
                                style={styles.checkbox}>
                                <View style={passwordVisible ? styles.checkboxChecked : styles.checkboxUnchecked} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.label}>Fecha de Nacimiento:</Text>
                        <TouchableOpacity
                            style={styles.customButton}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={styles.buttonText}>Seleccionar Fecha</Text>
                        </TouchableOpacity>

                        {/* Aquí va el DateTimePicker si se está mostrando */}
                        {showDatePicker && (
                            <DateTimePicker
                                value={values.fecha_nacimiento ? new Date(values.fecha_nacimiento).setHours(0, 0, 0, 0) : new Date()}
                                mode="date"
                                display="default"
                                maximumDate={new Date()}
                                onChange={(event, fecha_nacimiento) => handleChangeDate(event, fecha_nacimiento, setFieldValue)}
                            />
                        )}
                        {/* <Button title="Seleccionar Fecha" onPress={() => setShowDatePicker(true)} />
                        {showDatePicker && (
                            <DateTimePicker
                                value={values.date ? new Date(values.date) : new Date()}
                                mode="date"
                                display="default"
                                maximumDate={new Date()} // No permite fechas futuras
                                onChange={(event, date) => handleChangeDate(event, date, setFieldValue)}
                            />
                        )}
                        {values.date && <Text style={styles.selectedDate}>Fecha seleccionada: {formatDate(values.date)}</Text>}
                        {touched.date && errors.date && <Text style={styles.error}>{errors.date}</Text>} */}
                        {values.fecha_nacimiento && <Text style={styles.selectedDate}>Fecha seleccionada: {formatDate(values.fecha_nacimiento)}</Text>}
                        {touched.fecha_nacimiento && errors.fecha_nacimiento && <Text style={styles.error}>{errors.fecha_nacimiento}</Text>}

                        <Text>Dirección:</Text>
                        <TextInput
                            style={styles.input}
                            onChangeText={text => {
                                if (text.length <= 30) {
                                    handleChange('direccion')(text)
                                }
                            }}
                            onBlur={handleBlur('direccion')}
                            value={values.direccion}
                            placeholder="Ingresa tu dirección"
                        />
                        {touched.direccion && errors.direccion && <Text style={styles.error}>{errors.direccion}</Text>}

                        <Text>Ciudad:</Text>
                        <TextInput
                            style={styles.input}
                            onChangeText={text => {
                                if (text.length <= 30) {
                                    handleChange('ciudad')(text)
                                }
                            }}
                            onBlur={handleBlur('ciudad')}
                            value={values.ciudad}
                            placeholder="Ingresa tu ciudad"
                        />
                        {touched.ciudad && errors.ciudad && <Text style={styles.error}>{errors.ciudad}</Text>}

                        <Text>Teléfono:</Text>
                        <TextInput
                            style={styles.input}
                            onChangeText={text => {
                                if (text.length <= 10) {
                                    handleChange('telefono')(text);
                                }
                            }}
                            onBlur={handleBlur('telefono')}
                            value={values.telefono}
                            placeholder="Ingresa tu teléfono"
                            keyboardType="numeric"
                        />
                        {touched.telefono && errors.telefono && <Text style={styles.error}>{errors.telefono}</Text>}
                        <TouchableOpacity
                            style={styles.customButton}
                            onPress={() => requestCameraPermission(setFieldValue)}
                        >
                            <Text style={styles.buttonText}>Capturar Imagen</Text>
                        </TouchableOpacity>

                        {/* Mostrar imagen capturada */}
                        {selectedImage && (
                            <Image source={{ uri: selectedImage }} style={styles.image} />
                        )}
                        {/* <Button
                            title="Capturar Imagen"
                            onPress={() => requestCameraPermission(setFieldValue)}
                        />

                        {selectedImage && (
                            <Image
                                source={{ uri: selectedImage }}
                                style={styles.image}
                            />
                        )}

                        {touched.image && errors.image && <Text style={styles.error}>{errors.image}</Text>} */}

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleSubmit}
                        >
                            <Text style={styles.buttonText}>Enviar</Text>
                        </TouchableOpacity>
                    </>
                )}
            </Formik>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    container: {
        padding: 20,
        flexGrow: 1, // Ensures that the container stretches to fill available space
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginVertical: 10,
        borderRadius: 5,
        backgroundColor: "#fff",
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
        backgroundColor: '#4CAF50',  // Puedes cambiar el color de fondo aquí
        borderRadius: 5,
        borderWidth: 1,  // Esto es para agregar un borde
        borderColor: '#ccc',  // Color del borde
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    customButton: {
        backgroundColor: '#007BFF', // Color de fondo
        padding: 10, // Espaciado dentro del botón
        borderRadius: 5, // Bordes redondeados
        borderWidth: 1, // Ancho del borde
        borderColor: '#0056b3', // Color del borde
        alignItems: 'center', // Alinear el texto al centro
        justifyContent: 'center',
        marginVertical: 10, // Espaciado vertical
    },
});
