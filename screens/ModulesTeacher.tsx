import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL_BACKEND } from '@env'

const data = [
    { id: 1, title: 'Registrar Actuaciones', icon: require('../icons/asistencias.png'), screen:'Ver Actuaciones'},
];

export default function ModulosDocentes() {
    const navigation = useNavigation();
    const renderItem = ({ item }) => (
        <TouchableOpacity style={[styles.card, item.highlight && styles.highlight]} onPress={()=>navigation.navigate(item.screen)}>
            <Image source={item.icon} style={styles.icon} />
            <Text style={styles.cardText}>{item.title}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bienvenido Byron Loarte</Text>
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
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

