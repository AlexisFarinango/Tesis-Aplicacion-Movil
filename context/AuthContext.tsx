import React, { createContext, useState, useEffect, ReactNode, FC } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL_BACKEND } from '@env'
import { jwtDecode } from 'jwt-decode';

interface UserData {
  _id: string;
  nombre: string;
  apellido: string;
  cedula: string;
  ciudad: string;
  direccion: string;
  email: string;
  fecha_nacimiento: Date;
  fotografia: string;
  telefono: string;
}

interface AuthContextType {
  user: any;
  userData: UserData | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Crear el contexto
export const AuthContext = createContext<AuthContextType | undefined>(undefined);



export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // const [user, setUser] = useState(""); // Aquí se guarda la decodificación del token (rol e ID)
  const [userData, setUserData] = useState<UserData | null>(null); // Aquí los datos completos del usuario
  const [loading, setLoading] = useState(true); // Estado de carga inicial
 
  
  
  
  const datosusuario= async()=>{
    const token = await AsyncStorage.getItem("userToken")
    const user = jwtDecode(token)
    if (user.rol == "estudiante") {
      try {
        console.log("Este es el token", token);
        
        const response = await axios.get(`${API_URL_BACKEND}/estudiante/perfil`, {
            headers: {
                'Authorization': `Bearer ${token}` // Inserta el token en los headers como Bearer
            }
        });
        console.log("DATOS CONFIRMADOS: ",user);
        
        console.log("Esto es la data del usuario",response.data);
        setUserData(response.data); // Guardar la información decodificada
      } catch (error) {
        console.log("error al obtener datos",error);
      }
    } else {
      console.log("DATOS CONFIRMADOS: ",user);
      console.log("Del docente no se obtienen datos");
      
    }
  }
  useEffect(() => {
    const checkToken = async () => {
      // const storedToken = await AsyncStorage.getItem('userToken');
      // // console.log("token obtenido en context",storedToken);
      // // const decode = jwtDecode(storedToken);
      // // setUser(decode)
      
      // if (storedToken) {
      //   const decoded = jwtDecode(storedToken);
      //   setUser(decoded);
        
      // }
      datosusuario();
      
      setLoading(false);
    };

    checkToken();
  }, []);
  const login = async(token:string)=>{
    try {
      await AsyncStorage.setItem('userToken',token);
      // const decoded = jwtDecode(token)
      // setUser(decoded)
      datosusuario();
    } catch (error) {
      console.log("Fallo al iniciar sesión",error);
      
    }
    
  }

  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    console.log(await AsyncStorage.getItem('userToken'));
    // if(await AsyncStorage.getItem('userToken')==null){
    //   setUser("")
    // }
    // console.log("usuario",user);
    
    console.log("Token elimindado");
    
    // setUser(null);
    // setUserData(null); // Limpiar datos del usuario
    // Asegúrate de eliminar el token del encabezado de axios si es necesario
  };
  return (
    <AuthContext.Provider value={{ userData,login, logout, loading, datosusuario }}>
      {children}
    </AuthContext.Provider>
  );
  
}
