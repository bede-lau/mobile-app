import { useState, useEffect, useCallback } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@/constants/theme';

interface Avatar3DViewerProps {
  glbUrl: string;
  onLoadError?: () => void;
}

/**
 * Avatar3DViewer - 3D GLB model renderer using react-three-fiber
 *
 * NOTE: This component requires the following packages to be installed:
 * - expo-gl
 * - expo-three
 * - three
 * - @react-three/fiber
 *
 * If packages are not installed, the component will trigger onLoadError callback
 * and the parent component should fall back to 2D rendering.
 *
 * Install with: npx expo install expo-gl expo-three three @react-three/fiber
 */

// Check if 3D libraries are available
const check3DLibraries = (): boolean => {
  try {
    require('@react-three/fiber/native');
    require('three');
    require('expo-gl');
    return true;
  } catch {
    return false;
  }
};

const HAS_3D_LIBS = check3DLibraries();

function LoadingFallback() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Loading 3D model...</Text>
    </View>
  );
}

function NotAvailable() {
  return (
    <View style={styles.loading}>
      <Text style={styles.loadingText}>3D libraries not installed</Text>
      <Text style={styles.installHint}>
        Run: npx expo install expo-gl expo-three three @react-three/fiber
      </Text>
    </View>
  );
}

export default function Avatar3DViewer({ glbUrl, onLoadError }: Avatar3DViewerProps) {
  const [isReady, setIsReady] = useState(false);
  const [Scene3D, setScene3D] = useState<React.ComponentType<{ glbUrl: string; onError: () => void }> | null>(null);

  const handleError = useCallback(() => {
    onLoadError?.();
  }, [onLoadError]);

  // Dynamically load the 3D scene component
  useEffect(() => {
    if (!HAS_3D_LIBS) {
      console.warn('[Avatar3DViewer] 3D libraries not installed');
      handleError();
      return;
    }

    // Dynamic import to avoid TypeScript errors when packages aren't installed
    const load3DScene = async () => {
      try {
        // Create the 3D scene component dynamically
        const { Canvas, useFrame, useLoader } = require('@react-three/fiber/native');
        const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader');
        const THREE = require('three');
        const React = require('react');

        // Model component
        function Model({ url, onError }: { url: string; onError: () => void }) {
          const meshRef = React.useRef(null);
          const [loadError, setLoadError] = React.useState(false);

          let gltf: any = null;
          try {
            gltf = useLoader(GLTFLoader, url);
          } catch (e) {
            if (!loadError) {
              setLoadError(true);
              onError();
            }
          }

          useFrame((_: any, delta: number) => {
            if (meshRef.current) {
              meshRef.current.rotation.y += delta * 0.3;
            }
          });

          React.useEffect(() => {
            if (gltf?.scene) {
              const box = new THREE.Box3().setFromObject(gltf.scene);
              const center = box.getCenter(new THREE.Vector3());
              gltf.scene.position.sub(center);
              const size = box.getSize(new THREE.Vector3());
              const maxDim = Math.max(size.x, size.y, size.z);
              gltf.scene.scale.setScalar(2 / maxDim);
            }
          }, [gltf]);

          if (!gltf || loadError) return null;

          return React.createElement('group', { ref: meshRef },
            React.createElement('primitive', { object: gltf.scene })
          );
        }

        // Scene component
        function Scene3DComponent({ glbUrl: url, onError }: { glbUrl: string; onError: () => void }) {
          return React.createElement(Canvas, {
            camera: { position: [0, 0, 4], fov: 45 },
            style: { flex: 1 },
            onCreated: ({ gl }: { gl: any }) => {
              gl.setClearColor(colors.backgroundSecondary, 1);
            }
          },
            React.createElement(React.Suspense, { fallback: null },
              React.createElement('ambientLight', { intensity: 0.6 }),
              React.createElement('directionalLight', { position: [5, 5, 5], intensity: 0.8 }),
              React.createElement('directionalLight', { position: [-5, 5, -5], intensity: 0.4 }),
              React.createElement(Model, { url, onError })
            )
          );
        }

        setScene3D(() => Scene3DComponent);
        setIsReady(true);
      } catch (e) {
        console.error('[Avatar3DViewer] Failed to load 3D libraries:', e);
        handleError();
      }
    };

    load3DScene();
  }, [handleError]);

  // 3D libraries not available
  if (!HAS_3D_LIBS) {
    return <NotAvailable />;
  }

  // Still loading
  if (!isReady || !Scene3D) {
    return <LoadingFallback />;
  }

  return (
    <View style={styles.container}>
      <Scene3D glbUrl={glbUrl} onError={handleError} />

      {/* 3D badge */}
      <View style={styles.badge3D}>
        <Text style={styles.badge3DText}>3D</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.lg,
  },
  loadingText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  installHint: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  badge3D: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  badge3DText: {
    ...typography.labelSmall,
    color: colors.textInverse,
    fontWeight: '700',
  },
});
