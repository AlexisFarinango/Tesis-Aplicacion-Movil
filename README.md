# 📌 Desarrollo de un Sistema para la Gestión de Asistencias y Actuaciones de los Estudiantes de la ESFOT por Medio de IA

## 👨‍💻 Desarrollador del Componente
**Alexis Paul Farinango Pulamarin**

## 🚀 Instalación y Ejecución
Para clonar el proyecto desde GitHub e instalar sus dependencias, sigue los siguientes pasos:

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/AlexisFarinango/Tesis-Aplicacion-Movil.git

```

### 2️⃣ Instalar dependencias
```bash
npm install
```

### 3️⃣ Configurar variables de entorno
En el archivo `.env`, coloca las credenciales del backend según las instrucciones mencionadas en el mismo archivo.

### 4️⃣ Ejecutar el proyecto
Para iniciar la aplicación en un dispositivo/emulador Android primero asegurate de que tu emulador o dispositivo este correctamente condigurado en Android Studio y ejecuta los siguientes comandos:
```bash
npm start
```
Luego, en la terminal interactiva, selecciona la opción:
```bash
a -> Run on Android device/emulator
```

## 🛠 Solución a Errores Comunes
Si experimentas problemas con `gradlew`, es probable que haya archivos en caché que necesiten ser eliminados. Sigue estos pasos:

### Limpiar Gradle y reconstruir el proyecto
```bash
cd android
./gradlew clean
cd ..
npm start
```

## 📂 Documentación detallada del proyecto de Tesis
🔹 **Tesis del Proyecto:** [Tesis-Alexis-Farinango (2) para readme.pdf](https://github.com/user-attachments/files/18630175/Tesis-Alexis-Farinango.2.para.readme.pdf)


🔹 **Video de la Funcionalidad del Proyecto:** https://youtu.be/Sjsh4A5evLI?si=hv1JkImOPnXidtxz

🔹 **Formulario 233:** [f_aa_233a_Castillo_Bedoya_Farinango-signed-signed.pdf](https://github.com/user-attachments/files/18630177/f_aa_233a_Castillo_Bedoya_Farinango-signed-signed.pdf)


---
### 📝 Notas
- Asegúrate de tener **Android Studio** configurado correctamente.
- Verifica que tu dispositivo o emulador tenga la **depuración USB activada**.
- En caso de problemas con dependencias, prueba eliminando `node_modules` y reinstalando:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

