import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, Modal } from "react-native";
import { API_URL_BACKEND } from '@env';
import { jwtDecode } from 'jwt-decode';
import Toast from "react-native-toast-message";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";


export default function RegistrarAsistencias() {
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: "#f4f4f4",
        },
        title: {
            fontSize: 24,
            padding: 20,
            fontWeight: "bold",
            textAlign: "center",
            color: "#666666",
        },
        tableContainer: {
            marginBottom: 20,
        },
        tableHeader: {
            flexDirection: "row",
            justifyContent: "flex-start",
            padding: 10,
            backgroundColor: "#003366", // Azul oscuro
            borderRadius: 5,
        },
        headerText: {
            color: "#fff", // Letras blancas
            fontWeight: "bold",
            fontSize: 14,
            width: 70,  // Ancho de cada columna (ajustable según necesidad)
            textAlign: "center",
        },
        headertableText: {
            color: "#fff", // Letras blancas
            fontWeight: "bold",
            fontSize: 14,
            width: 125,  // Ancho de cada columna (ajustable según necesidad)
            textAlign: "center",
        },
        tableRow: {
            flexDirection: "row",
            justifyContent: "flex-start",
            padding: 10,
            backgroundColor: "#fff",
            borderBottomWidth: 1,
            borderBottomColor: "#ccc",
        },
        rowText: {
            fontSize: 14,
            width: 125,  // Ancho de cada columna (ajustable según necesidad)
            textAlign: "center",
        },
        button: {
            backgroundColor: "#cc0605", // Rojo
            paddingVertical: 15,
            borderRadius: 10,
            alignItems: "center",
            alignSelf: "center",
            width: "50%", // Tamaño del botón
        },
        buttonText: {
            color: "#fff", // Letras blancas
            fontSize: 16,
            fontWeight: "bold",
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
        barNavicon: {
            width: 30,
            height: 30,
            resizeMode: 'contain',
        },
        card: {
            backgroundColor: '#3373bd',
            flex: 1,
            margin: 10,
            padding: 30,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 1.41,
            elevation: 2,
            width: '95%', // Ajustado para una columna
            alignSelf: 'center', // Centra la tarjeta

        },
        highlight: {
            backgroundColor: '#FFEBB0',
        },
        cardText: {
            fontSize: 16,
            color: '#fff',
            fontWeight: 'bold',
            textAlign: 'center',
        },
        grid: {
            paddingHorizontal: 10,
            paddingVertical: 10,
        },
        description: {
            fontSize: 14,
            textAlign: 'center',
            color: "#666666",
        },
    });
    const [cursos, setCursos] = useState([]);
    const navigation = useNavigation();
    const { logout } = useContext(AuthContext);
    const handleLogout = async () => {
        await logout();  // Llamar la función logout del contexto
        navigation.navigate("Iniciar Sesión");  // Navegar a la pantalla de inicio de sesión
    };
    const updateCursos = async () => {
        const token = await AsyncStorage.getItem('userToken');
        console.log("token obtenido en context docente", token);
        const decode = jwtDecode(token);
        const idDocente = decode.id
        console.log("ruta", `${API_URL_BACKEND}/curso/visualizar`);

        try {
            const response = await axios.post(`${API_URL_BACKEND}/curso/visualizar`, {
                docenteId: idDocente
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.status === 200) {
                setCursos(response.data); // Actualizamos el estado de cursos
                console.log("cursitos", response.data);

                Toast.show({
                    type: "success",
                    text1: "Cursos Encontrados",
                });
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                Toast.show({
                    type: "error",
                    text1: "No se encontraron cursos",
                });
            } else {
                Toast.show({
                    type: "error",
                    text1: `Error`,
                });
            }
            console.log("Error al obtener los cursos:", error);
        }
    };
    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.card, item.highlight && styles.highlight]}
            onPress={() => verificarFechaRegistro(item)}
        >
            <Text style={styles.cardText}>{item.materia}</Text>
        </TouchableOpacity>
    );

    const verificarFechaRegistro = async (item) => {
        const token = await AsyncStorage.getItem('userToken');
        console.log("datos item: ", item);


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
            // Realiza la consulta para obtener las actuaciones
            const response = await axios.post(`${API_URL_BACKEND}/actuacion/visualizar`, {
                materia: item.materia,
                paralelo: item.paralelo,
                semestre: item.semestre
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const actuaciones = response.data; // Obtén los datos de la respuesta
            console.log("Actuaciones obtenidas:", actuaciones);

            // Busca si la fecha actual existe en alguna de las `fecha_actuaciones`
            const fechaEncontrada = actuaciones.some(actuacion =>
                actuacion.fecha_actuaciones.includes(fechaActual)
            );

            if (fechaEncontrada) {
                // Muestra una notificación si la fecha actual ya está registrada
                Toast.show({
                    type: "error",
                    text1: "Las actuaciones con la fecha actual ya fueron registradas"
                });
            } else {
                // Navega al módulo si la fecha actual no está registrada
                navigation.navigate("Detalle Registro Actuacion", {
                    materia: item.materia,
                    paralelo: item.paralelo,
                    semestre: item.semestre
                });
            }
        } catch (error) {
            const status = error.response.status;
            if (status === 400) {
                Toast.show({
                    type: "error",
                    text1: "No Existen Estudiantes Registrados en la Materia"
                })
                console.log("No Existen Estudiantes Registrados en la Materia:", error);
            } else {
                console.log("Error al verificar fecha de registro:", error);
            }
        }
    };
    useEffect(() => {
        updateCursos();
        // verificarFechaRegistro();
    }, []);
    
    const obtenerFechaActual = () => {
        const ahora = new Date();
        const anio = ahora.getFullYear();
        const mes = String(ahora.getMonth() + 1).padStart(2, '0'); // Meses van de 0 a 11
        const dia = String(ahora.getDate()).padStart(2, '0');
        return `${dia}/${mes}/${anio}`;
    };
    const fechaActual = obtenerFechaActual();
    console.log("Fecha actual:", fechaActual);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Actuaciones</Text>
            <Text style={styles.description}>
                Este módulo te permite registrar actuaciones de los estudiantes presentes en la fecha {fechaActual}
            </Text>
            <Toast />
            <FlatList
                data={cursos}
                renderItem={renderItem}
                keyExtractor={item => item.materia.toString()}
                numColumns={1}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.grid}
            />
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Modulos')}>
                    <Image source={require('../icons/inicio.png')} style={styles.barNavicon} />
                    <Text style={styles.navText}>Inicio</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Ver Actuaciones')}>
                    <Image source={require('../icons/asistencias.png')} style={styles.barNavicon} />
                    <Text style={styles.navText}>Actuaciones</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => handleLogout()}>
                    <Image source={require('../icons/cerrarsesion.png')} style={styles.barNavicon} />
                    <Text style={styles.navText}>Cerrar Sesión</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
