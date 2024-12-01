import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import React, { useState, useEffect, Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Modal, TextInput } from 'react-native';
import { API_URL_BACKEND } from '@env';
// import { Permissions } from "expo";
import { PermissionsAndroid } from 'react-native';

import Voice from '@react-native-voice/voice';
import Toast from 'react-native-toast-message';

// Función para obtener la fecha actual en formato deseado
const obtenerFechaActual = () => {
    const ahora = new Date();
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    return ahora.toLocaleDateString('es-ES', opciones); // Cambia 'es-ES' según el idioma deseado
};

export default function DetalleActuaciones() {
    const navigation = useNavigation();
    const route = useRoute();
    const { materia, paralelo, semestre } = route.params; // Obtenemos el ID de la materia desde la navegación

    const [actuaciones, setActuaciones] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [descripcion, setDescripcion] = useState('');
    const [currentEstudiante, setCurrentEstudiante] = useState(null);
    const [escuchando, setEscuchando] = useState(false);
    const [idsActuaciones, setIdsActuaciones] = useState([]);
    const [idsEstudiantesupdate, setIdsestudiantesUpdate] = useState([]);
    const [actuacionesParaActualizar, setActuacionesparaActualizar] = useState([]);

    const handleMicrophonePress = async () => {
        try {
            // Solicitar permisos de micrófono en Android
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                {
                    title: "Permiso para grabar audio",
                    message: "La aplicación necesita acceder al micrófono para grabar audio.",
                    buttonNeutral: "Pregúntame después",
                    buttonNegative: "Cancelar",
                    buttonPositive: "Aceptar"
                }
            );

            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("Permiso de micrófono concedido");
                // Iniciar o detener la grabación según el estado de `escuchando`
                escuchando ? stopListening() : startListening();
            } else {
                console.log("Permiso de micrófono no concedido");
            }
        } catch (err) {
            console.warn(err);
        }
    };


    const updateAsistentes = async (materia, paralelo, semestre) => {

        const obtenerFechaActual = () => {
            const ahora = new Date();
            const anio = ahora.getFullYear();
            const mes = String(ahora.getMonth() + 1).padStart(2, '0'); // Meses van de 0 a 11
            const dia = String(ahora.getDate()).padStart(2, '0');
            return `${dia}/${mes}/${anio}`;
        };
        const fechaActual = obtenerFechaActual();
        console.log("Fecha actual:", fechaActual);

        try {
            const token = await AsyncStorage.getItem("userToken")
            const response = await axios.post(`${API_URL_BACKEND}/actuacion/listar-estudiantes`, {
                materia: materia,
                paralelo: paralelo,
                semestre: semestre
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            // Agregar la propiedad 'cantiactuacionesactuales' inicializada en 0
            const dataConCantActuaciones = response.data.map((item) => ({
                ...item,
                cantiactuacionesactuales: 0,
                descripciones: [],
            }));
            console.log("Datos Asistentes completo: ", dataConCantActuaciones.map((item) => item.fecha));
            console.log("Datos Asistentes completo: ", dataConCantActuaciones.fecha);

            // Filtrar los datos que coinciden con la fecha actual
            const datosConFechaActual = dataConCantActuaciones.filter(data =>
                data.fecha.includes(fechaActual)
            );
            console.log("comparacion: ", datosConFechaActual);


            if (datosConFechaActual.length > 0) {
                // Si hay coincidencias, actualizamos 'actuaciones'
                setActuaciones(datosConFechaActual);
            } else {
                console.log("No se encontraron datos con la fecha actual, no se actualizarán actuaciones.");
            }
        } catch (error) {
            console.log("Error al obtener estudiantes presentes", error);

        }
    }
    useEffect(() => {
        updateAsistentes(materia, paralelo, semestre);
        console.log("Este es el id recibido de materia", materia);

    }, [materia]);

    useEffect(() => {
        Voice.onSpeechStart = onSpeechStart;
        Voice.onSpeechEnd = stopListening;
        Voice.onSpeechResults = onSpeechResults;
        Voice.onSpeechError = error => console.log('onSpeechError:', error);

        return () => {
            Voice.destroy().then(Voice.removeAllListeners);
        }
    }, [actuaciones]);

    useEffect(() => {
        console.log("Actuaciones actualizadas:", actuaciones);
        obtenerIDparaActualizar();
    }, [actuaciones]);


    const onSpeechStart = event => {
        console.log("Empezando grabación...: ", event);

    }

    const onSpeechResults = (event) => {
        const text = event.value[0];
        console.log("Grabacion", text);

        setDescripcion(text);
    };

    const startListening = async () => {
        setEscuchando(true);
        try {
            await Voice.start('es-MX');
            console.log("Grabación iniciada");
        } catch (error) {
            console.log("Error al empezar a grabar:", error);
        }
    };

    const stopListening = async () => {
        try {
            await Voice.stop();
            Voice.removeAllListeners();
            setEscuchando(false);
        } catch (error) {
            console.log("Error al detener la grabación a grabar: ", error);
        }
    }

    // Función para aumentar actuación de un estudiante
    const aumentarActuacion = (id) => {
        setActuaciones((prevActuaciones) =>
            prevActuaciones.map((item) =>
                item.estudiante._id === id && item.cantiactuacionesactuales < 5
                    ? { ...item, cantiactuacionesactuales: item.cantiactuacionesactuales + 1 }
                    : item
            )
        );
    };

    // Función para disminuir actuación de un estudiante
    const disminuirActuacion = (id) => {
        setActuaciones(prevActuaciones =>
            prevActuaciones.map(item =>
                item.estudiante._id === id && item.cantiactuacionesactuales > 0 ? { ...item, cantiactuacionesactuales: item.cantiactuacionesactuales - 1 } : item
            )
        );
    };

    // Función para añadir actuación a todos los estudiantes
    const añadirActuacionATodos = () => {
        setActuaciones(prevActuaciones =>
            prevActuaciones.map(item =>
                item.cantiactuacionesactuales < 5
                    ? { ...item, cantiactuacionesactuales: item.cantiactuacionesactuales + 1 }
                    : item
            )
        );
    };

    const abrirModal = (estudiante) => {
        if (estudiante.descripciones.length >= 3) {
            alert("Este estudiante ya tiene 3 descripciones.");
            return;
        }
        setCurrentEstudiante(estudiante);
        setModalVisible(true);
    };

    const cerrarModal = () => {
        setModalVisible(false);
    };

    const guardarDescripcion = () => {
        if (!descripcion.trim()) {
            alert("La descripción no puede estar vacia")
        } else {

            console.log("Actuaciones a actualizar:", actuaciones);
            console.log("texto proximo a ser guardado: ", descripcion);
            console.log("id de estudiante actualizar: ", currentEstudiante.estudiante._id);
            console.log("mapeo1", actuaciones.map(item =>
                item.estudiante._id));

            console.log("Comparacion mapeo", actuaciones.map(item =>
                item.estudiante._id === currentEstudiante.estudiante._id));
            console.log("datos:", actuaciones.map(item => item.descripciones.length));


            setActuaciones(prevActuaciones =>
                prevActuaciones.map(item =>
                    item.estudiante._id === currentEstudiante.estudiante._id
                        ? {
                            ...item,
                            descripciones: item.descripciones.length < 3
                                ? [...item.descripciones, descripcion]
                                : item.descripciones,
                        }
                        : item
                )
            );
            cerrarModal();
            setDescripcion('');
        }
    };

    const GuardaryRegresar = async () => {
        const token = await AsyncStorage.getItem('userToken');
        const obtenerFechaActual = () => {
            const ahora = new Date();
            const anio = ahora.getFullYear();
            const mes = String(ahora.getMonth() + 1).padStart(2, '0'); // Meses van de 0 a 11
            const dia = String(ahora.getDate()).padStart(2, '0');
            return `${dia}/${mes}/${anio}`;
        };

        const fechaActual = obtenerFechaActual();
        console.log("Fecha formateada:", fechaActual);

        console.log("actu en guardar", actuacionesParaActualizar);

        const actuaciones = actuacionesParaActualizar;
        const datosEnvio = {
            materia: materia,
            paralelo: paralelo,
            semestre: semestre,
            fecha: fechaActual,
            actuaciones
        };
        console.log("datos del body: ", datosEnvio);
        console.log("Cuerpo enviado al backend:", JSON.stringify(datosEnvio, null, 2));


        try {
            const secondresponse = await axios.put(`${API_URL_BACKEND}/actuacion/actualizar`, datosEnvio, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log(secondresponse.data);
            Toast.show({
                type: "success",
                text1: secondresponse.data.msg
            })
            setTimeout(() => {
                Toast.hide(); // Esto cerrará el Toast después de 3 segundos
            }, 3000);
            navigation.goBack();
        } catch (error) {
            console.log("Error al realizar la actualización en base", error);
            Toast.show({
                type: "success",
                text1: "Error al realizar la actualización en base"
            })
            setTimeout(() => {
                Toast.hide(); // Esto cerrará el Toast después de 3 segundos
            }, 3000);
        }
    };

    const obtenerIDparaActualizar = async () => {
        const token = await AsyncStorage.getItem('userToken');
        try {
            const response = await axios.post(`${API_URL_BACKEND}/actuacion/visualizar`, {
                materia: materia,
                paralelo: paralelo,
                semestre: semestre
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log("obtener id para actualizar", response.data);
            setIdsActuaciones(response.data.map(item => item._id));
            setIdsestudiantesUpdate(response.data.map(item => item.estudiante));
            console.log("Ids de todas las actuaciones de todos los estudiantes del curso: ", idsActuaciones);
            console.log("Ids de todaos los estudiantes del curso: ", idsEstudiantesupdate);
            // console.log(actuaciones);
            // console.log(actuaciones.estudiante._id);
            console.log(actuaciones.map(item => item.estudiante._id));

            //Comparando los IDs de actuaciones con los estudiantes a actualizar
            const actuacionesconsul = actuaciones.filter(item => idsEstudiantesupdate.includes(item.estudiante._id.toString())).map(item => ({
                id: idsActuaciones[idsEstudiantesupdate.indexOf(item.estudiante._id.toString())],
                cantidad_actuaciones: item.cantiactuacionesactuales || "0",
                descripciones: item.descripciones || []
            }));
            setActuacionesparaActualizar(actuacionesconsul)

            console.log("obtener id de actuaciones segun est presentes:", actuacionesParaActualizar);

        } catch (error) {
            console.log("Error al obtener IDs de actuaciones para actualizacion", error);

        }
    };



    const renderItem = ({ item }) => (
        <View style={styles.tableRow}>
            <Text style={styles.tableCell}>{item.estudiante.nombre} {item.estudiante.apellido}</Text>
            <Text style={styles.tableCell}>{item.cantiactuacionesactuales}</Text>
            <View style={styles.actionsCell}>
                {/* Botón para disminuir actuación */}
                <TouchableOpacity onPress={() => disminuirActuacion(item.estudiante._id)}>
                    <Image
                        source={require('../icons/disminuir.png')}
                        style={styles.icon}
                    />
                </TouchableOpacity>

                {/* Botón para aumentar actuación */}
                <TouchableOpacity onPress={() => aumentarActuacion(item.estudiante._id)}>
                    <Image
                        source={require('../icons/aumentar.png')}
                        style={styles.icon}
                    />
                </TouchableOpacity>

                {/* Botón del micrófono o acción */}
                <TouchableOpacity onPress={() => abrirModal(item)}>
                    <Image
                        source={require('../icons/microfono.png')}
                        style={styles.icon}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Toast />
            <Text style={styles.title}>Detalle Actuaciones</Text>
            <Text style={styles.fecha}>{obtenerFechaActual()}</Text>
            {actuaciones.length === 0 ? (
                <Text style={styles.noDataText}>No existen Registros con la fecha Actual, verifica el Registro de Asistencias</Text>
            ) : (<>
                <View style={styles.table}>
                    <View style={[styles.tableRow, styles.tableHeaderRow]}>
                        <Text style={styles.tableHeader}>Estudiantes</Text>
                        <Text style={styles.tableHeader}>Actuaciones</Text>
                        <Text style={styles.tableHeader}>Acciones</Text>
                    </View>
                    <FlatList
                        data={actuaciones}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.estudiante._id.toString()}
                        contentContainerStyle={{ flexGrow: 1 }}
                    />
                </View>

                {/* Botones de acción */}
                <TouchableOpacity style={styles.buttonAction} onPress={añadirActuacionATodos}>
                    <Text style={styles.buttonText}>Añadir Actuación a todos los estudiantes</Text>
                </TouchableOpacity>
            </>)}
            {actuaciones.length === 0 ? (
                <TouchableOpacity style={styles.buttonActiontres} onPress={async () => { navigation.goBack(); }}>
                    <Text style={styles.buttonText}>Regresar</Text>
                </TouchableOpacity>
            ) : (<>
                <TouchableOpacity style={styles.buttonActiondos} onPress={async () => { await GuardaryRegresar() }}>
                    <Text style={styles.buttonText}>Guardar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonActiontres} onPress={async () => { navigation.goBack(); }}>
                    <Text style={styles.buttonText}>Regresar</Text>
                </TouchableOpacity>
            </>
            )}

            <Modal visible={modalVisible} animationType='slide' transparent={true} onRequestClose={cerrarModal}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Añadir Descripción</Text>
                        <Text style={styles.counterText}>
                            Número de Descripciones {currentEstudiante ? currentEstudiante.descripciones.length + 1 : 1}/3
                        </Text>
                        <View style={styles.textBoxContainer}>
                            <View style={styles.textBox}>
                                <TextInput
                                    value={descripcion}
                                    onChangeText={setDescripcion}
                                    placeholder='Descripción de maximo 20 caracteres'
                                    multiline={true}
                                    style={styles.textInput}
                                    maxLength={30}
                                />
                            </View>
                            <TouchableOpacity style={styles.micButton} onPress={handleMicrophonePress}>
                                <Image source={require('../icons/microfono.png')} style={styles.icon} />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.addButton} onPress={guardarDescripcion}>
                            <Text style={styles.addButtonText}>Añadir</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.retocederfondo} onPress={cerrarModal}>
                            <Text style={styles.addButtonText}>Cancelar</Text>
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
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
    },
    fecha: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
        marginBottom: 20,
    },
    table: {
        flex: 1,
        borderRadius: 15,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        padding: 10,
    },
    tableRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        width: '100%',
    },
    tableHeaderRow: {
        backgroundColor: '#4A90E2',
        borderRadius: 10,
    },
    tableHeader: {
        flex: 1,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
    },
    tableCell: {
        flex: 1,
        textAlign: 'center',
        fontSize: 16,
        color: '#333',
    },
    actionsCell: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flex: 1,
    },
    icon: {
        width: 30,   // Tamaño de los iconos
        height: 30,
    },
    buttonAction: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#4A90E2',
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    buttonActiondos: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#00C853',
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    buttonActiontres: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#e52510',
        borderRadius: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        marginBottom: 15,
        fontWeight: 'bold',
    },
    textBoxContainer: {
        width: '100%',
        height: 200,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    textBox: {
        width: '90%',
        height: '80%',
        backgroundColor: '#f9f9f9',
        padding: 10,
        borderRadius: 5,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
    },
    micButton: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: '#4A90E2',
        padding: 10,
        borderRadius: 30,
    },
    addButton: {
        marginTop: 20,
        backgroundColor: '#4A90E2',
        padding: 15,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    retocederfondo: {
        marginTop: 20,
        backgroundColor: '#e52510',
        padding: 15,
        borderRadius: 10,
        width: '50%',
        alignItems: 'center',
    },
    noDataText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'gray',
        textAlign: 'center',
        marginVertical: 20,
    },
    counterText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 10,
        color: '#666',
    },
});