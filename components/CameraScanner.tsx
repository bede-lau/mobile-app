import { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  AppState,
  AppStateStatus,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { useAvatarStore } from '@/store/avatarStore';
import { colors, typography, spacing, radius } from '@/constants/theme';

const TOTAL_CAPTURES = 12;
const CAPTURE_ANGLES = [
  'Front', 'Front-Right', 'Right', 'Back-Right',
  'Back', 'Back-Left', 'Left', 'Front-Left',
  'Arms Up Front', 'Arms Up Side', 'T-Pose Front', 'T-Pose Side',
];

export default function CameraScanner() {
  const { t } = useTranslation();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const { setScanStatus, addCapturedImage, capturedImages, startProcessing } = useAvatarStore();

  const [currentCapture, setCurrentCapture] = useState(0);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const captureScale = useSharedValue(1);

  // Handle screen focus - only mount camera when screen is focused
  useFocusEffect(
    useCallback(() => {
      console.log('[CameraScanner] Screen focused - activating camera');
      setIsCameraActive(true);
      setCameraError(null);
      setIsCameraReady(false);

      return () => {
        console.log('[CameraScanner] Screen blurred - deactivating camera');
        setIsCameraActive(false);
        setIsCameraReady(false);
      };
    }, [])
  );

  // Handle app state changes (background/foreground)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        console.log('[CameraScanner] App became active - reactivating camera');
        setIsCameraActive(true);
        setCameraError(null);
      } else {
        console.log('[CameraScanner] App went to background - deactivating camera');
        setIsCameraActive(false);
        setIsCameraReady(false);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // Camera lifecycle handlers
  const handleCameraReady = useCallback(() => {
    console.log('[CameraScanner] Camera is ready');
    setIsCameraReady(true);
    setCameraError(null);
  }, []);

  const handleMountError = useCallback((error: { message: string }) => {
    console.error('[CameraScanner] Camera mount error:', error);
    setCameraError(error.message || 'Failed to initialize camera');
    Alert.alert(
      t('common.error'),
      `Camera initialization failed: ${error.message}. If using an emulator, ensure webcam is properly configured in AVD settings.`
    );
  }, [t]);

  const capturedCount = capturedImages.length;
  const isComplete = capturedCount >= TOTAL_CAPTURES;

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current || isComplete) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Animate capture button
      captureScale.value = withSequence(
        withSpring(0.8, { damping: 10 }),
        withSpring(1, { damping: 10 })
      );

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (photo) {
        addCapturedImage(photo.uri);
        setCurrentCapture((c) => c + 1);

        if (capturedCount + 1 >= TOTAL_CAPTURES) {
          // All captures done, start processing
          setScanStatus('uploading');
          startProcessing();
        }
      }
    } catch (error) {
      console.error('Capture error:', error);
      Alert.alert(t('common.error'), t('scanner.captureError'));
    }
  }, [capturedCount, isComplete, addCapturedImage, setScanStatus, startProcessing, captureScale, t]);

  const captureAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: captureScale.value }],
  }));

  // Permission not granted
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>{t('scanner.loadingPermissions')}</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Ionicons name="camera-outline" size={64} color={colors.textTertiary} />
        <Text style={styles.permissionTitle}>{t('scanner.permissionRequired')}</Text>
        <Text style={styles.permissionText}>{t('scanner.permissionExplain')}</Text>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>{t('scanner.grantPermission')}</Text>
        </Pressable>
      </View>
    );
  }

  // Show camera error state
  if (cameraError) {
    return (
      <View style={styles.container}>
        <Ionicons name="warning-outline" size={64} color={colors.error || '#FF6B6B'} />
        <Text style={styles.permissionTitle}>Camera Error</Text>
        <Text style={styles.permissionText}>{cameraError}</Text>
        <Text style={styles.permissionText}>
          If using an Android emulator, try:{'\n'}
          1. Cold boot the emulator{'\n'}
          2. Set both cameras to "Webcam0" in AVD settings{'\n'}
          3. Restart the app
        </Text>
        <Pressable style={styles.permissionButton} onPress={() => setCameraError(null)}>
          <Text style={styles.permissionButtonText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  // Camera not active (screen not focused or app in background)
  if (!isCameraActive) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Preparing camera...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="front"
        onCameraReady={handleCameraReady}
        onMountError={handleMountError}
      >
        {/* Loading indicator while camera initializes */}
        {!isCameraReady && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.loadingText}>Initializing camera...</Text>
          </View>
        )}
        
        {/* Guide overlay */}
        <View style={styles.overlay}>
          {/* Progress */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {capturedCount} / {TOTAL_CAPTURES}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(capturedCount / TOTAL_CAPTURES) * 100}%` },
                ]}
              />
            </View>
          </View>

          {/* Current pose instruction */}
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionTitle}>
              {isComplete ? t('scanner.allCaptured') : CAPTURE_ANGLES[currentCapture]}
            </Text>
            <Text style={styles.instructionText}>
              {isComplete
                ? t('scanner.processing')
                : t('scanner.poseInstruction', { angle: CAPTURE_ANGLES[currentCapture] })}
            </Text>
          </View>

          {/* Body outline guide */}
          <View style={styles.bodyGuide}>
            <View style={styles.bodyOutline} />
          </View>

          {/* Capture button */}
          <View style={styles.captureContainer}>
            <Animated.View style={captureAnimatedStyle}>
              <Pressable
                style={[styles.captureButton, isComplete && styles.captureButtonDisabled]}
                onPress={handleCapture}
                disabled={isComplete}
              >
                <View style={styles.captureInner} />
              </Pressable>
            </Animated.View>
          </View>

          {/* Thumbnail strip of captured images */}
          {capturedCount > 0 && (
            <View style={styles.thumbnailStrip}>
              {Array.from({ length: Math.min(capturedCount, 4) }).map((_, i) => (
                <View key={i} style={styles.thumbnailDot} />
              ))}
              {capturedCount > 4 && (
                <Text style={styles.thumbnailMore}>+{capturedCount - 4}</Text>
              )}
            </View>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: spacing.lg,
    paddingTop: 60,
    paddingBottom: 40,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressText: {
    ...typography.labelLarge,
    color: colors.textInverse,
    marginBottom: spacing.sm,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  progressBar: {
    width: '60%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  instructionContainer: {
    alignItems: 'center',
  },
  instructionTitle: {
    ...typography.headingLarge,
    color: colors.textInverse,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  instructionText: {
    ...typography.bodyMedium,
    color: colors.textInverse,
    textAlign: 'center',
    marginTop: spacing.sm,
    opacity: 0.8,
  },
  bodyGuide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bodyOutline: {
    width: 200,
    height: 350,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 100,
    borderStyle: 'dashed',
  },
  captureContainer: {
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.textInverse,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.textInverse,
  },
  thumbnailStrip: {
    position: 'absolute',
    bottom: 120,
    left: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  thumbnailDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  thumbnailMore: {
    ...typography.caption,
    color: colors.textInverse,
    marginLeft: spacing.xs,
  },
  message: {
    ...typography.bodyMedium,
    color: colors.textInverse,
  },
  permissionTitle: {
    ...typography.headingMedium,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  permissionText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    marginTop: spacing.lg,
  },
  permissionButtonText: {
    ...typography.labelLarge,
    color: colors.textInverse,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.textInverse,
    marginTop: spacing.md,
  },
});
