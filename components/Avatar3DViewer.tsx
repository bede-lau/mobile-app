import { useState, useEffect, useCallback } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@/constants/theme';

interface Avatar3DViewerProps {
  glbUrl: string;
  onLoadError?: () => void;
}

function LoadingFallback() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Loading 3D model...</Text>
    </View>
  );
}

export default function Avatar3DViewer({ glbUrl, onLoadError }: Avatar3DViewerProps) {
  const [isReady, setIsReady] = useState(false);
  const [libsAvailable, setLibsAvailable] = useState<boolean | null>(null);
  const [Scene3D, setScene3D] = useState<React.ComponentType<{ glbUrl: string; onError: () => void }> | null>(null);

  const handleError = useCallback(() => {
    onLoadError?.();
  }, [onLoadError]);

  // Only check and load 3D libraries when this component actually mounts
  useEffect(() => {
    let cancelled = false;

    const load3DScene = async () => {
      try {
        const { Canvas, useFrame, useLoader } = require('@react-three/fiber/native');
        const { GLTFLoader } = require('three/examples/jsm/loaders/GLTFLoader');
        const THREE = require('three');
        const React = require('react');

        if (cancelled) return;
        setLibsAvailable(true);

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

        if (!cancelled) {
          setScene3D(() => Scene3DComponent);
          setIsReady(true);
        }
      } catch (e) {
        console.warn('[Avatar3DViewer] 3D libraries not available:', e);
        if (!cancelled) {
          setLibsAvailable(false);
          handleError();
        }
      }
    };

    load3DScene();
    return () => { cancelled = true; };
  }, [handleError]);

  if (libsAvailable === false) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>3D viewer unavailable</Text>
      </View>
    );
  }

  if (!isReady || !Scene3D) {
    return <LoadingFallback />;
  }

  return (
    <View style={styles.container}>
      <Scene3D glbUrl={glbUrl} onError={handleError} />
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
