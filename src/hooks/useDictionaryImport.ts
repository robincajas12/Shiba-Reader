import { useState } from 'react';
import { Alert } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { unzip } from 'react-native-zip-archive';
import RNFS from 'react-native-fs';
import { dbEngine } from '../db/engine';
import { TermBankEntry } from '../db/schemas/Term';

export const useDictionaryImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState('');
  const termRepository = dbEngine.getRepository('TermBankEntryRepository');

  const importFromZip = async () => {
    try {
      // 1. Seleccionar archivo
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.zip],
      });

      setIsImporting(true);
      setProgress('Extrayendo archivo...');

      // 2. Rutas temporales
      const tempPath = `${RNFS.TemporaryDirectoryPath}/dic_import_${Date.now()}`;
      await RNFS.mkdir(tempPath);

      // 3. Descomprimir
      await unzip(result.uri, tempPath);
      setProgress('Buscando bancos de términos...');

      // 4. Leer archivos term_bank_*.json
      const files = await RNFS.readDir(tempPath);
      const termBankFiles = files.filter(f => f.name.startsWith('term_bank_'));

      if (termBankFiles.length === 0) {
        throw new Error('No se encontraron archivos term_bank en el ZIP.');
      }

      let totalInserted = 0;

      for (let i = 0; i < termBankFiles.length; i++) {
        const file = termBankFiles[i];
        setProgress(`Procesando archivo ${i + 1} de ${termBankFiles.length}...`);

        const content = await RNFS.readFile(file.path, 'utf8');
        const rawEntries = JSON.parse(content);

        // Transformar al formato de nuestra DB
        const entities: TermBankEntry[] = rawEntries.map((entry: any, index: number) => ({
          term: entry[0],
          reading: entry[1],
          definition_tags: entry[2] || '',
          deinflection_rules: entry[3] || '',
          score: entry[4] || 0,
          glossary: JSON.stringify(entry[5]),
          sequence: entry[6] || 0,
          entry_tags: entry[7] || '',
        }));

        // Insertar en lotes de 1000
        const BATCH_SIZE = 1000;
        const batches: TermBankEntry[][] = [];
        for (let j = 0; j < entities.length; j += BATCH_SIZE) {
          batches.push(entities.slice(j, j + BATCH_SIZE));
        }

        await termRepository.insertBatchMany(batches);
        totalInserted += entities.length;
      }

      // 5. Limpiar temporales
      await RNFS.unlink(tempPath);

      setIsImporting(false);
      setProgress('');
      Alert.alert('Éxito', `Se han importado ${totalInserted} entradas correctamente.`);

    } catch (err) {
      setIsImporting(false);
      setProgress('');
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled the picker');
      } else {
        console.error(err);
        Alert.alert('Error', (err as Error).message || 'Error al importar el diccionario');
      }
    }
  };

  return {
    importFromZip,
    isImporting,
    progress
  };
};
