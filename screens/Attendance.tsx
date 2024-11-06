import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, Modal } from "react-native";
import Toast from "react-native-toast-message";
import { API_URL_BACKEND } from '@env';


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
            marginBottom: 20,
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
            paddingHorizontal: 20,
        },
        row: {
            justifyContent: 'space-between',
        },
        modalContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        modalContent: {
            backgroundColor: '#fff',
            padding: 20,
            borderRadius: 10,
            width: '80%',
            alignItems: 'center',
        },
        closeButton: {
            backgroundColor: '#cc0605',
            padding: 10,
            borderRadius: 5,
            marginTop: 20,
        },
        closeButtonText: {
            color: '#fff',
            fontWeight: 'bold',
        },
        scrollView: {
            maxHeight: 200,
            width: '100%',
        },
    });






    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMateria, setSelectedMateria] = useState(null);
    const [selectedParalelo, setSelectedParalelo] = useState(null);
    const [cursos, setCursos] = useState([]);
    const [asistencias, setAsistencias] = useState([]);
    const [estadoAsistencias, setEstadoasistencias] = useState([]);

    const updateCursos = async () => {
        const token = await AsyncStorage.getItem("userToken")

        try {
            const response = await axios.get(`${API_URL_BACKEND}/estudiante/visualizar-cursos`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setCursos(response.data.informacionCursos)
        } catch (error) {
            if (error.response && error.response.status === 404) {
                Toast.show({
                    type: "error",
                    text1: "No se encontraron cursos",
                });
            } else {
                Toast.show({
                    type: "error",
                    text1: "Error",
                });
            }
            console.log("Error al obtener los cursos:", error);
        }
    };


    //Llamar las asistencias despues de llamar los cursos
    const updateAsistencias = async () => {
        const token = await AsyncStorage.getItem("userToken")
        try {
            const response = await axios.post(`${API_URL_BACKEND}/estudiante/visualizar-asistencias`, {
                materia: selectedMateria,
                paralelo: selectedParalelo
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            setAsistencias(response.data.fecha_asistencias)
            setEstadoasistencias(response.data.estado_asistencias)
            
        } catch (error) {
            console.log("Error al encontrar asistencias", error);

        }
    }



    // Llamar a updateCursos cuando el componente se monta
    useEffect(() => {
        updateCursos();
    }, []);
    useEffect(() => {
        if (selectedMateria && selectedParalelo) {
            updateAsistencias();
        }
    }, [selectedMateria, selectedParalelo]);



    // const asistencias = {
    //     'Química': [
    //         { fecha: '02-10-2024', estado: 'Presente' },
    //         { fecha: '03-10-2024', estado: 'Presente' },
    //         { fecha: '04-10-2024', estado: 'Presente' },
    //         { fecha: '05-10-2024', estado: 'Ausente' },
    //         { fecha: '02-10-2024', estado: 'Presente' },
    //         { fecha: '03-10-2024', estado: 'Presente' },
    //         { fecha: '04-10-2024', estado: 'Presente' },
    //         { fecha: '05-10-2024', estado: 'Ausente' },
    //     ],
    //     'Matemáticas': [
    //         { fecha: '02-10-2024', estado: 'Presente' },
    //         { fecha: '03-10-2024', estado: 'Presente' },
    //         { fecha: '04-10-2024', estado: 'Presente' },
    //         { fecha: '05-10-2024', estado: 'Ausente' },
    //     ],
    //     'Física': [
    //         { fecha: '02-10-2024', estado: 'Presente' },
    //         { fecha: '03-10-2024', estado: 'Presente' },
    //         { fecha: '04-10-2024', estado: 'Presente' },
    //         { fecha: '05-10-2024', estado: 'Ausente' },
    //     ],
    // };
    const navigation = useNavigation();
    const renderItem = ({ item }) => (
        <TouchableOpacity style={[styles.card, item.highlight && styles.highlight]} onPress={() => { setSelectedMateria(item.materia); setSelectedParalelo(item.paralelo); setModalVisible(true) }}>
            <Text style={styles.cardText}>{item.materia}</Text>
        </TouchableOpacity>
    );


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Asistencias</Text>
            <FlatList
                data={cursos}
                renderItem={renderItem}
                keyExtractor={item => item.materia.toString()}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.grid}
            />
            <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.title}>{selectedMateria} - Asistencias</Text>
                        <View style={styles.tableHeader}>
                            <Text style={styles.headertableText}>Fecha</Text>
                            <Text style={styles.headertableText}>Asistencias</Text>
                        </View>
                        <ScrollView style={styles.scrollView}>
                            {/* {asistencias[selectedMateria]?.map((asistencia, index) => (
                                <View key={index} style={styles.tableRow}>
                                    <Text style={styles.rowText}>{asistencia.fecha_asistencias}</Text>
                                    <Text style={styles.rowText}>{asistencia.estado_asistencias}</Text>
                                </View>
                            ))} */}
                            {asistencias.map((fecha, index) => (
                                <View key={index} style={styles.tableRow}>
                                    <Text style={styles.rowText}>{fecha}</Text>
                                    <Text style={styles.rowText}>{estadoAsistencias[index]}</Text>
                                </View>
                            ))}

                        </ScrollView>
                        <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                            <Text style={styles.closeButtonText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>

                </View>

            </Modal>
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