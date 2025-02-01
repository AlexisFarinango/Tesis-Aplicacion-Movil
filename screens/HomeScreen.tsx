import { useNavigation } from "@react-navigation/native";
import React, { useRef, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, Dimensions } from 'react-native';


const { width } = Dimensions.get('window');

const slides = [
    {
        key: '1',
        title: 'Gestión de Perfil',
        description: 'Una aplicación que te permite gestionar tu perfil estudiantil rápida y sencillamente.',
        image: require('../icons/splashuno.png'),
    },
    {
        key: '2',
        title: 'Registro de Actuaciones',
        description: 'Registro de Actuaciones práctico con la opción de agregar descripciones fácilmente mediante comandos de voz.',
        image: require('../icons/splashdos.png'),
    },
    {
        key: '3',
        title: 'Visualización de Asistencias',
        description: 'Visualización rápida y sencilla de asistencias y actuaciones de los estudiantes.',
        image: require('../icons/splashtres.png'),
    }
];

export default function HomeScreen() {
    const navigation = useNavigation();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef();

    const handleScroll = (event) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(index);
    };

    const handleNavigate = async() => {
        if (currentIndex === slides.length - 1) {
            navigation.navigate('Iniciar Sesión');
        } else {
            flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
        }
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={slides}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                ref={flatListRef}
                keyExtractor={(item) => item.key}
                renderItem={({ item }) => (
                    <View style={styles.splashScreen}>
                        <Image source={item.image} style={styles.splashImage} />
                        <Text style={styles.title}>{item.title}</Text>
                        <Text style={styles.description}>{item.description}</Text>
                    </View>
                )}
            />

            <View style={styles.dotsContainer}>
                {slides.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.dot,
                            currentIndex === index ? styles.dotActive : styles.dotInactive,
                        ]}
                    />
                ))}
            </View>


            <TouchableOpacity style={styles.button} onPress={handleNavigate}>
                <Text style={styles.buttonText}>
                    {currentIndex === slides.length - 1 ? 'Iniciar Sesión' : 'Siguiente'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    splashScreen: {
        width,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    splashImage: {
        width: "100%",
        height: "50%",
        marginBottom: 20,
        resizeMode: 'contain',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    description: {
        textAlign: 'center',
        fontSize: 16,
        color: '#555',
        marginHorizontal: 30,
        marginBottom: 30,
    },
    dotsContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 80,
        alignSelf: 'center',
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    dotActive: {
        backgroundColor: '#007BFF',
    },
    dotInactive: {
        backgroundColor: '#ccc',
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        width: '80%',
        position: 'absolute',
        bottom: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
