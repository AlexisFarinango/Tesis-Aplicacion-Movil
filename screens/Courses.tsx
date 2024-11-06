import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { API_URL_BACKEND } from '@env';
import Toast from "react-native-toast-message";

export default function Materias() {
    const navigation = useNavigation();
    const [cursoCodigo, setCursoCodigo] = useState('');
    const [cursos, setCursos] = useState([]); // Inicializamos como un array vacío

    // Función para obtener y actualizar los cursos del estudiante
    const updateCursos = async () => {
        const token = await AsyncStorage.getItem('userToken');
        try {
            const response = await axios.get(`${API_URL_BACKEND}/estudiante/visualizar-cursos`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.status === 200) {
                setCursos(response.data.informacionCursos); // Actualizamos el estado de cursos
                Toast.show({
                    type: "success",
                    text1: "Cursos Encontrados",
                });
            }
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

    // Llamar a updateCursos cuando el componente se monta
    useEffect(() => {
        updateCursos();
    }, []);

    // Función para registrar un curso nuevo
    const agregarCurso = async () => {
        const token = await AsyncStorage.getItem('userToken');
        try {
            const response = await axios.post(`${API_URL_BACKEND}/estudiante/ingresar-codigo`, {
                codigo: cursoCodigo || ""
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                Toast.show({
                    type: "success",
                    text1: "Curso Asignado con éxito",
                });
                updateCursos(); // Actualizamos la lista de cursos después de registrar uno nuevo
            }

        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Hubo un problema revisa el codigo",
            });
            console.log("Error al registrar en el curso:", error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Cursos Asignados</Text>

            <Toast />
            <TextInput
                style={styles.input}
                placeholder="Ingresa el Código del Curso"
                value={cursoCodigo}
                onChangeText={setCursoCodigo}
            />

            <TouchableOpacity style={styles.addButton} onPress={agregarCurso}>
                <Text style={styles.addButtonText}>Añadir Curso</Text>
            </TouchableOpacity>

            <ScrollView style={styles.cursosContainer}>
                {cursos.map((curso, index) => (
                    <View key={index} style={styles.cursoCard}>
                        <Text style={styles.cursoNombre}>{curso.materia}</Text>
                        <Text style={styles.cursoInfo}>Paralelo: {curso.paralelo}</Text>
                        <Text style={styles.cursoInfo}>Docente: {curso.docente.nombre} {curso.docente.apellido}</Text>
                    </View>
                ))}
            </ScrollView>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F6F9',
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#DDD',
        fontSize: 16,
        marginBottom: 15,
    },
    addButton: {
        backgroundColor: '#007BFF',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    addButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cursosContainer: {
        flex: 1,
    },
    cursoCard: {
        backgroundColor: '#FFF',
        padding: 20,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    },
    cursoNombre: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    cursoInfo: {
        fontSize: 16,
        color: '#666',
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
});
