import RNFS from 'react-native-fs';
import { unzip } from 'react-native-zip-archive';
import { Platform } from 'react-native';

const DB_NAME = 'ippodake.ringo.database.db';
const ZIP_NAME = 'ippodake.ringo.database.zip';

export const bootstrapDatabase = async (onProgress?: (msg: string) => void) => {
  if (Platform.OS !== 'android') return;

  // En Android, op-sqlite guarda las bases de datos en la carpeta 'databases'
  // RNFS.DocumentDirectoryPath suele ser '.../files', así que lo ajustamos
  const dbDir = `${RNFS.DocumentDirectoryPath.replace('files', 'databases')}`;
  const dbPath = `${dbDir}/${DB_NAME}`;

  const exists = await RNFS.exists(dbPath);

  if (!exists) {
    onProgress?.('Preparando base de datos por primera vez...');
    console.log('Base de datos no encontrada, iniciando descompresión...');

    // Asegurar que el directorio existe
    await RNFS.mkdir(dbDir);

    const tempZipPath = `${RNFS.TemporaryDirectoryPath}/${ZIP_NAME}`;

    onProgress?.('Copiando archivos del sistema...');
    // Copiar desde assets de Android a carpeta temporal
    await RNFS.copyFileAssets(ZIP_NAME, tempZipPath);

    onProgress?.('Descomprimiendo base de datos...');
    // Descomprimir el contenido directamente en el directorio de la DB
    // Importante: El zip debe contener el archivo .db directamente o ajustarse aquí
    await unzip(tempZipPath, dbDir);

    // Limpiar zip temporal
    await RNFS.unlink(tempZipPath);
    onProgress?.('Base de datos instalada.');
    console.log('Base de datos instalada correctamente desde Assets.');
  } else {
    console.log('La base de datos ya existe.');
  }
};
