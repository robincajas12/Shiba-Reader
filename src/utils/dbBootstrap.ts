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
    onProgress?.('Preparing database for first use...');
    console.log('Database not found, starting extraction...');

    // Asegurar que el directorio existe
    await RNFS.mkdir(dbDir);

    const tempZipPath = `${RNFS.TemporaryDirectoryPath}/${ZIP_NAME}`;

    onProgress?.('Copying system files...');
    // Copy from Android assets to a temporary folder
    await RNFS.copyFileAssets(ZIP_NAME, tempZipPath);

    onProgress?.('Extracting database...');
    // Descomprimir el contenido directamente en el directorio de la DB
    // Importante: El zip debe contener el archivo .db directamente o ajustarse aquí
    await unzip(tempZipPath, dbDir);

    // Clean up temporary zip
    await RNFS.unlink(tempZipPath);
    onProgress?.('Database installed.');
    console.log('Database installed successfully from assets.');
  } else {
    console.log('Database already exists.');
  }
};
