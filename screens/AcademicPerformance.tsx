import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, Modal } from "react-native";
import { API_URL_BACKEND } from '@env';
import Toast from "react-native-toast-message";


export default function Asistencias() {
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
            fontSize: 16,
            textAlign: 'center',
        },
    });



    const [cursos, setCursos] = useState([]);
    const [selectedMateria, setSelectedMateria] = useState(null);
    const [selectedParalelo, setSelectedParalelo] = useState(null);
    const [selectedSemestre, setSelectedSemestre] = useState(null);

    // const data = [
    //     { id: 1, title: 'Química', screen:'Detalles Actuaciones'},
    //     { id: 2, title: 'Matemáticas',screen:'Detalles Actuaciones'},
    //     { id: 3, title: 'Física', screen:'Detalles Actuaciones'},
    // ];

    const updateCursos = async () => {
        const token = await AsyncStorage.getItem("userToken");
        try {
            const response = await axios.get(`${API_URL_BACKEND}/estudiante/visualizar-cursos`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setCursos(response.data.informacionCursos)
            console.log("Información actuaciones cursos:", response.data.informacionCursos);

        } catch (error) {
            console.log("No se pudo cargar los cursos", error);
            Toast.show({
                type: "error",
                text1: "No se encontraron cursos",
                text2: "Registrate en un Curso"
            });

        }
    }

    // Llamar a updateCursos cuando el componente se monta
    useEffect(() => {
        updateCursos();
    }, []);


    const navigation = useNavigation();
    const renderItem = ({ item }) => (
        <TouchableOpacity style={[styles.card, item.highlight && styles.highlight]} onPress={() => navigation.navigate("Detalles Actuaciones", { materia: item.materia, paralelo: item.paralelo, semestre: item.semestre })}>
            <Text style={styles.cardText}>{item.materia}</Text>
        </TouchableOpacity>
    );


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Actuaciones</Text>
            <Text style={styles.description}>
                Este módulo te permite ver las actuaciones y descripciones en los cursos registrados
            </Text>
            <Toast />
            <FlatList
                data={cursos}
                renderItem={renderItem}
                keyExtractor={item => item.materia.toString()}
                numColumns={1}
                contentContainerStyle={styles.grid}
            />
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
        </View>
    );
}
