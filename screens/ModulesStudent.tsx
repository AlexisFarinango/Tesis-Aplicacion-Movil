import { useNavigation } from '@react-navigation/native';
import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
//importo Contexto
import { AuthContext } from '../context/AuthContext';


const data = [
    { id: 1, title: 'Perfil', icon: require('../icons/perfil.png'), screen: 'Perfil' },
    { id: 2, title: 'Ver Cursos', icon: require('../icons/cursos.png'), screen: 'Ver Cursos' },
    { id: 3, title: 'Ver Asistencias', icon: require('../icons/asistencias.png'), screen: 'Ver Asistencias' },
    { id: 4, title: 'Ver Actuaciones', icon: require('../icons/actuaciones.png'), screen: 'Ver Actuaciones' },

];

export default function ModulosEstudiantes() {
    const {userData, logout} = useContext(AuthContext);
    console.log("Esta es la Data en modulos: ",userData);
    


    const navigation = useNavigation();
    
    const renderItem = ({ item }) => (
        <TouchableOpacity style={[styles.card, item.highlight && styles.highlight]} onPress={() => navigation.navigate(item.screen)}>
            <Image source={item.icon} style={styles.icon} />
            <Text style={styles.cardText}>{item.title}</Text>
        </TouchableOpacity>
    );

    // Función para cerrar sesión
    const handleLogout = async () => {
        await logout();  // Llamar la función logout del contexto
        navigation.navigate("Iniciar Sesion");  // Navegar a la pantalla de inicio de sesión
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bienvenido {userData?.nombre}</Text>
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={styles.row}
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
                <TouchableOpacity style={styles.navItem} onPress={()=>handleLogout()}>
                    <Image source={require('../icons/cerrarsesion.png')} style={styles.barNavicon} />
                    <Text style={styles.navText}>Cerrar Sesión</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F8F8',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 20,
    },
    grid: {
        paddingHorizontal: 20,
    },
    row: {
        justifyContent: 'space-between',
    },
    card: {
        backgroundColor: '#FFF',
        flex: 1,
        margin: 10,
        padding: 20,
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
        marginTop: 10,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    cardSubText: {
        fontSize: 14,
        color: '#777',
        textAlign: 'center',
        marginTop: 5,
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
    activeNav: {
        backgroundColor: '#FFEBB0',
        borderRadius: 10,
        padding: 5,
    },
    activeText: {
        color: '#FFD700',
    },
    icon: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
    },
    barNavicon: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
    },
});
