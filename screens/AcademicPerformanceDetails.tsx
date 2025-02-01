import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL_BACKEND } from '@env';

export default function DetallesActuaciones() {
    const [fechas, setFechas] = useState([]);
    const [detalles, setDetalles] = useState([]);
    const [totalactuaciones, setTotalactuaciones] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDescriptions, setSelectedDescriptions] = useState([]);
    const route = useRoute();
    const navigation = useNavigation();
    const { materia, paralelo, semestre } = route.params;

    const obtenerActuaciones = async (materia, paralelo, semestre) => {
        const token = await AsyncStorage.getItem("userToken");
        try {
            const response = await axios.post(`${API_URL_BACKEND}/estudiante/visualizar-actuaciones`, {
                materia: materia,
                paralelo: paralelo,
                semestre: semestre
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setFechas(response.data.fecha_actuaciones);
            setDetalles(response.data.descripciones);
            console.log("datitos", response.data.descripciones);
            setTotalactuaciones(response.data.cantidad_actuaciones);

        } catch (error) {
            console.log("Error al obtener actuaciones:", error);
        }
    };

    useEffect(() => {
        obtenerActuaciones(materia, paralelo, semestre);
    }, []);

    const handleDescriptionPress = (index) => {
        const descripciones = detalles[index];
        console.log("Presionado:", detalles[index]);
        console.log("Presionado:", detalles.length);

        if (descripciones && descripciones.length > 0) {
            setSelectedDescriptions(descripciones);
            setModalVisible(true);
        }
    };

    const renderItem = ({ item, index }) => (
        <View style={styles.tableRow}>
            <Text style={styles.tableCelldos}>{item}</Text>
            <TouchableOpacity
                style={[
                    styles.tableCellButton,
                    detalles[index] && detalles[index].length > 0 ? styles.verButton : styles.sinButton
                ]}
                onPress={() => handleDescriptionPress(index)}
                disabled={!detalles[index] || detalles[index].length === 0}
            >
                <Text style={styles.buttonTextdos}>
                    {detalles[index] && detalles[index].length > 0 ? 'Ver Descripción' : 'Sin Descripción'}
                </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Detalle Actuaciones{"\n"} Semestre {semestre}</Text>
            {fechas.length === 0 ? ( // Condición para verificar si no hay datos
                <Text style={styles.noDataText}>No existen registros de actuaciones en este curso</Text>
            ) : (

                <View style={styles.tableContainer}>
                    <View style={styles.tabledos}>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.headerText, { width: '50%' }]}>Fecha</Text>
                            <Text style={[styles.headerText, { width: '50%' }]}>Descripciones</Text>
                        </View>
                        <FlatList
                            data={fechas}
                            renderItem={({ item, index }) => (
                                <View style={styles.tableRow}>
                                    <Text style={[styles.tableCell, { width: '50%' }]}>{item}</Text>
                                    <TouchableOpacity
                                        style={[
                                            styles.tableCellButton,
                                            detalles[index] && detalles[index].length > 0 ? styles.verButton : styles.sinButton
                                        ]}
                                        onPress={() => handleDescriptionPress(index)}
                                        disabled={!detalles[index] || detalles[index].length === 0}
                                    >
                                        <Text style={styles.buttonText}>
                                            {detalles[index] && detalles[index].length > 0 ? 'Ver Descripción' : 'Sin Descripción'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            keyExtractor={(item, index) => index.toString()}
                            style={styles.flatList}
                        />
                    </View>

                    <View style={styles.totalContainer}>
                        <Text style={styles.totalText}>Actuaciones Durante el Semestre: {totalactuaciones}</Text>
                    </View>
                </View>
            )}

            <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                <Text style={styles.buttonText}>Regresar</Text>
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContent}>
                        <Text style={[styles.modalTitle, { textAlign: 'center' }]}>Descripciones</Text>
                        <View style={styles.table}>
                            <View style={[styles.tableRow, styles.tableHeaderRow]}>
                                <Text style={[styles.tableHeaderdos, { width: '100%' }, { flex: 1, textAlign: 'center', color: '#333', fontWeight: 'bold', }]}>Detalles</Text>
                            </View>
                            {selectedDescriptions.length > 0 ? (
                                Array.isArray(selectedDescriptions) ? (
                                    selectedDescriptions.map((descripcion, index) => (
                                        <View key={index} style={styles.tableRow}>
                                            <Text style={[styles.tableCell, { width: '100%' }]}>{descripcion}</Text>
                                        </View>
                                    ))
                                ) : (
                                    <View style={styles.tableRow}>
                                        <Text style={[styles.tableCell, { width: '100%' }]}>{selectedDescriptions}</Text>
                                    </View>
                                )
                            ) : (
                                <View style={styles.tableRow}>
                                    <Text style={[styles.tableCell, { width: '100%' }]}>Sin descripciones</Text>
                                </View>
                            )}
                        </View>

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.buttonText}>Cerrar</Text>
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
        padding: 20,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
        color: "#666666",
    },
    link: {
        color: '#4A90E2',
        fontWeight: 'bold',
    },
    noLink: {
        color: '#ccc',
    },
    button: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#4A90E2',
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    modalBackground: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    tabledos: {
        width: '100%',
        marginVertical: 10,
    },
    tableRowdos: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    tableHeaderRow: {
        backgroundColor: '#4A90E2',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,

    },
    tableHeaderdos: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,

    },
    tableCelldos: {
        fontSize: 14,
        color: '#333',
        textAlign: 'left',
    },
    closeButton: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#cc0605',
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
    },
    buttonTextdos: {
        color: '#fff',
        fontSize: 16,
    },
    noDataText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'gray',
        textAlign: 'center',
        marginVertical: 20,
    },
    tableContainer: {
        flex: 1,
        marginHorizontal: 10,
        marginVertical: 15,
    },
    table: {
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#4A90E2',
        padding: 12,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    headerText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        padding: 12,
    },
    tableCell: {
        textAlign: 'center',
        fontSize: 15,
        color: "#666666",
    },
    tableCellButton: {
        padding: 8,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        width: '45%',
        alignSelf: 'center',
    },
    verButton: {
        backgroundColor: '#00C853',
    },
    sinButton: {
        backgroundColor: '#FF1744',
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    flatList: {
        maxHeight: '80%',
    },
    totalContainer: {
        backgroundColor: '#4A90E2',
        padding: 12,
        borderRadius: 10,
        marginTop: 10,
    },
    totalText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center',
    },
});
