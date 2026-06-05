import { useState, useMemo } from 'react';
import { Alert } from 'react-native';
import { dbEngine } from '../db/engine';
import { TermBankEntry } from '../db/schemas/Term';
const termBank1 = require('../../dic/[JA-EN] jitendex-yomitan (2026-05-05)/term_bank_2.json');

export const useDatabaseSeeding = () => {
  const termRepository = useMemo(() => dbEngine.getRepository('TermBankEntryRepository'), []);
  const [loadingSeeding, setLoadingSeeding] = useState<boolean>(false);

const handleSeedDatabase = async () => {
  setLoadingSeeding(true);

  try {
    const existingData = await termRepository.getAll();

    if (existingData.length > 60) {
      Alert.alert(
        'Base de datos activa',
        'La base de datos ya contiene palabras.'
      );
      return;
    }

    const entities: TermBankEntry[] = termBank1.map(
      (entry: any, index: number) => ({
        id: index + 1,
        term: entry[0],
        reading: entry[1],
        definition_tags: entry[2] || '',
        deinflection_rules: entry[3] || '',
        score: entry[4] || 0,
        glossary: JSON.stringify(entry[5]),
        sequence: entry[6] || 0,
        entry_tags: entry[7] || '',
        name: entry[0],
        age: 0
      })
    );

    const BATCH_SIZE = 1000;

    const batches: TermBankEntry[][] = [];

    for (let i = 0; i < entities.length; i += BATCH_SIZE) {
      batches.push(
        entities.slice(i, i + BATCH_SIZE)
      );
    }

    await termRepository.insertBatchMany(batches);

    Alert.alert(
      'Éxito',
      `Se insertaron ${entities.length} palabras`
    );
  } catch (error) {
    console.error(error);
    Alert.alert(
      'Error',
      'Fallo al migrar los datos a SQLite.'
    );
  } finally {
    setLoadingSeeding(false);
  }
};

  const handleVerifyDatabase = async () => {
    const countData = await termRepository.getAll();
    Alert.alert('Total actual', `Palabras en la DB: ${countData.length}`);
  };

  return {
    loadingSeeding,
    handleSeedDatabase,
    handleVerifyDatabase
  };
};
