import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, Modal } from "react-native";
import { API_URL_BACKEND } from '@env';
import { jwtDecode } from 'jwt-decode';
import Toast from "react-native-toast-message";
import axios from "axios";


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
            width:125,  // Ancho de cada columna (ajustable según necesidad)
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
    });
    

    // const data = [
    //     { id: 1, title: 'Química', screen:'Detalle Registro Actuacion'},
    //     { id: 2, title: 'Matemáticas',screen:'Detalle Registro Actuacion'},
    //     { id: 3, title: 'Física', screen:'Detalle Registro Actuacion'},
    // ];
    const [cursos, setCursos] = useState([]);
    const navigation=useNavigation();
    const renderItem = ({ item }) => (
        <TouchableOpacity style={[styles.card, item.highlight && styles.highlight]} onPress={()=>navigation.navigate("Detalle Registro Actuacion", {materia: item.materia, paralelo: item.paralelo, semestre: item.semestre})}>
            <Text style={styles.cardText}>{item.materia}</Text>
        </TouchableOpacity>
    );
    const updateCursos = async () => {
        const token = await AsyncStorage.getItem('userToken');
        console.log("token obtenido en context docente",token);
        const decode = jwtDecode(token);
        const idDocente = decode.id 
        console.log("ruta",`${API_URL_BACKEND}/curso/visualizar`);
        
        try {
            const response = await axios.post(`${API_URL_BACKEND}/curso/visualizar`,{
                docenteId: idDocente
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.status === 200) {
                setCursos(response.data); // Actualizamos el estado de cursos
                console.log("cursitos",response.data);
                
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
    useEffect(() => {
        updateCursos();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Actuaciones</Text>
            <Toast />
            <FlatList
                data={cursos}
                renderItem={renderItem}
                keyExtractor={item => item.materia.toString()}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.grid}
            />
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem} onPress={()=>navigation.navigate('Modulos')}>
                    <Image source={require('../icons/inicio.png')} style={styles.barNavicon}/>
                    <Text style={styles.navText}>Inicio</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={()=>navigation.navigate('Ver Actuaciones')}>
                    <Image source={require('../icons/asistencias.png')} style={styles.barNavicon}/>
                    <Text style={styles.navText}>Actuaciones</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={()=>navigation.navigate('Iniciar Sesion')}>
                    <Image source={require('../icons/cerrarsesion.png')} style={styles.barNavicon}/>
                    <Text style={styles.navText}>Cerrar Sesión</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
