import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../ThemeContext';

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}) => {
  const { theme } = useTheme();

  if (!visible) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles(theme).backdrop}>
        <View style={styles(theme).card}>
          <Text style={styles(theme).title}>{title}</Text>
          <Text style={styles(theme).message}>{message}</Text>

          <View style={styles(theme).buttonRow}>
            <Pressable
              onPress={onCancel}
              style={[styles(theme).button, styles(theme).cancelButton]}
            >
              <Text style={styles(theme).cancelText}>{cancelText}</Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              style={[
                styles(theme).button,
                destructive ? styles(theme).destructiveButton : styles(theme).confirmButton,
              ]}
            >
              <Text style={styles(theme).confirmText}>{confirmText}</Text>
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
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.colors.surface,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    color: theme.colors.header,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
  },
  message: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minWidth: 94,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelText: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
  },
  destructiveButton: {
    backgroundColor: theme.colors.error,
  },
  confirmText: {
    color: theme.colors.onPrimary,
    fontWeight: '700',
  },
});
