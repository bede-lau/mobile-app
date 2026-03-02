// Web fallback - Camera not available on web
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '@/constants/theme';

export default function CameraScanner() {
  return (
    <View style={styles.container}>
      <Ionicons name="camera-outline" size={64} color={colors.textTertiary} />
      <Text style={styles.title}>Camera Not Available</Text>
      <Text style={styles.message}>
        Body scanning requires camera access which is only available on the mobile app.
        Please use the iOS or Android app to create your 3D avatar.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  title: {
    ...typography.headingMedium,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  message: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    maxWidth: 300,
  },
});
