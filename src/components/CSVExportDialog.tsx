import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { saveDocuments } from '@react-native-documents/picker';
import RNFS from 'react-native-fs';
import { useTheme } from '../ThemeContext';

export type CSVRow = Record<string, string | number | boolean | null | undefined>;

type CSVExportDialogProps = {
  visible: boolean;
  title?: string;
  rows: CSVRow[];
  filename?: string;
  onClose: () => void;
};

const PRESET_SEPARATORS = [
  { label: ';', value: ';' },
  { label: ',', value: ',' },
  { label: 'Tab', value: '\t' },
  { label: '|', value: '|' },
];

const escapeCsvValue = (value: unknown, separator: string) => {
  const text = String(value ?? '');
  const sanitized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const needsQuotes = sanitized.includes(separator) || sanitized.includes('"') || sanitized.includes('\n') || sanitized.includes(',');

  if (!needsQuotes) {
    return sanitized;
  }

  return `"${sanitized.replace(/"/g, '""')}"`;
};

export const buildCSVContent = (items: CSVRow[], separator: string) => {
  if (!items || items.length === 0) {
    return '';
  }

  const keys = Object.keys(items[0]);
  const header = keys.join(separator);

  const body = items.map((row) =>
    keys.map((key) => escapeCsvValue(row[key], separator)).join(separator)
  );

  return [header, ...body].join('\n');
};

const normalizeExportFilename = (rawName: string) => {
  const baseName = (rawName || 'vocabulary.csv').trim();
  const sanitized = baseName.replace(/[^a-zA-Z0-9._ -]/g, '-');
  const withoutTrailingDots = sanitized.replace(/[.]+$/g, '');

  if (withoutTrailingDots.toLowerCase().endsWith('.csv')) {
    return withoutTrailingDots;
  }

  return `${withoutTrailingDots || 'vocabulary'}.csv`;
};

export const generateUniqueExportFilename = async (rawName: string = 'vocabulary.csv') => {
  const exportsDir = `${RNFS.DocumentDirectoryPath}/csv_exports`;
  await RNFS.mkdir(exportsDir);

  const safeName = normalizeExportFilename(rawName);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_');
  const randomSuffix = Math.random().toString(36).slice(2, 8);

  const [name, extension = 'csv'] = safeName.split(/\.(?=[^.]+$)/);
  const baseStem = (name || 'vocabulary').replace(/\s+/g, '_');

  let candidate = `${baseStem}_${timestamp}_${randomSuffix}.${extension}`;
  let counter = 1;

  while (await RNFS.exists(`${exportsDir}/${candidate}`)) {
    candidate = `${baseStem}_${timestamp}_${randomSuffix}_${counter}.${extension}`;
    counter += 1;
  }

  return candidate;
};

const resolveExportDirectory = () => {
  const preferred = RNFS.DownloadDirectoryPath || RNFS.DocumentDirectoryPath;
  return preferred || `${RNFS.DocumentDirectoryPath}/csv_exports`;
};

export const saveCSVFile = async (content: string, filename: string, targetDirectory?: string) => {
  const exportsDir = targetDirectory || resolveExportDirectory();
  await RNFS.mkdir(exportsDir);
  const outputPath = `${exportsDir.replace(/\/+$/, '')}/${filename}`;
  await RNFS.writeFile(outputPath, content, 'utf8');
  return outputPath;
};

export const CSVExportDialog: React.FC<CSVExportDialogProps> = ({
  visible,
  title = 'Export CSV',
  rows,
  filename = 'export.csv',
  onClose,
}) => {
  const { theme } = useTheme();
  const [separator, setSeparator] = useState<string>(';' );
  const [customSeparator, setCustomSeparator] = useState('');

  const activeSeparator = useMemo(() => {
    if (separator === 'custom') {
      return customSeparator || ';';
    }

    return separator;
  }, [customSeparator, separator]);

  const handleExport = async () => {
    if (!rows || rows.length === 0) {
      Alert.alert('Nothing to export', 'Your vocabulary is empty.');
      return;
    }

    try {
      const uniqueFilename = await generateUniqueExportFilename(filename);
      const content = buildCSVContent(rows, activeSeparator);
      const tempDir = `${RNFS.TemporaryDirectoryPath}/csv_exports`;
      await RNFS.mkdir(tempDir);
      const tempFilePath = `${tempDir}/${uniqueFilename}`;
      await RNFS.writeFile(tempFilePath, content, 'utf8');

      const result = await saveDocuments({
        sourceUris: [tempFilePath.startsWith('file://') ? tempFilePath : `file://${tempFilePath}`],
        fileName: uniqueFilename,
        mimeType: 'text/csv',
        copy: true,
      });

      const savedFile = result?.[0];
      Alert.alert('CSV saved', savedFile?.uri ? `Saved to: ${savedFile.uri}` : 'The file was exported.');
    } catch (error) {
      Alert.alert('Export cancelled', 'The save operation was cancelled.');
    } finally {
      onClose();
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles(theme).backdrop}>
        <View style={styles(theme).card}>
          <Text style={styles(theme).title}>{title}</Text>

          <Text style={styles(theme).label}>Separator</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles(theme).separatorRow}>
            {PRESET_SEPARATORS.map((item) => (
              <Pressable
                key={item.value}
                onPress={() => setSeparator(item.value)}
                style={[
                  styles(theme).chip,
                  separator === item.value && styles(theme).chipSelected,
                ]}
              >
                <Text style={[
                  styles(theme).chipText,
                  separator === item.value && styles(theme).chipTextSelected,
                ]}>
                  {item.label}
                </Text>
              </Pressable>
            ))}

            <Pressable
              onPress={() => setSeparator('custom')}
              style={[
                styles(theme).chip,
                separator === 'custom' && styles(theme).chipSelected,
              ]}
            >
              <Text style={[
                styles(theme).chipText,
                separator === 'custom' && styles(theme).chipTextSelected,
              ]}>Custom</Text>
            </Pressable>
          </ScrollView>

          {separator === 'custom' && (
            <View style={styles(theme).customInputWrap}>
              <Text style={styles(theme).label}>Custom delimiter</Text>
              <TextInput
                value={customSeparator}
                onChangeText={setCustomSeparator}
                style={styles(theme).input}
                placeholder="e.g. ; , | :"
                maxLength={2}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          )}

          <Text style={styles(theme).hint}>
            Default: ;  •  Selected: {activeSeparator ? JSON.stringify(activeSeparator) : 'custom'}
          </Text>

          <View style={styles(theme).actions}>
            <Pressable onPress={onClose} style={[styles(theme).button, styles(theme).secondaryButton]}>
              <Text style={styles(theme).secondaryButtonText}>Cancel</Text>
            </Pressable>

            <Pressable onPress={handleExport} style={[styles(theme).button, styles(theme).primaryButton]}>
              <Text style={styles(theme).primaryButtonText}>Export</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = (theme: any) => StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.header,
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'column',
    gap: 8,
    marginBottom: 14,
  },
  locationPath: {
    color: theme.colors.text,
    fontSize: 12,
    lineHeight: 18,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  separatorRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 6,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text,
  },
  chipTextSelected: {
    color: theme.colors.onPrimary,
  },
  customInputWrap: {
    marginTop: 12,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: theme.colors.text,
  },
  hint: {
    marginTop: 12,
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 18,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    minWidth: 100,
    alignItems: 'center',
  },
  locationButton: {
    minWidth: 0,
    alignSelf: 'flex-start',
  },
  secondaryButton: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  primaryButtonText: {
    color: theme.colors.onPrimary,
    fontWeight: '700',
  },
});
