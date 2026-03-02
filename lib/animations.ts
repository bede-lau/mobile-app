import {
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  SharedValue,
} from 'react-native-reanimated';
import { animation } from '@/constants/theme';

// Like button bounce animation
export function animateLikeBounce(scale: SharedValue<number>) {
  'worklet';
  scale.value = withSequence(
    withSpring(1.4, animation.springBouncy),
    withSpring(1, animation.spring)
  );
}

// Cart badge pop animation
export function animateCartBadgePop(scale: SharedValue<number>) {
  'worklet';
  scale.value = withSequence(
    withSpring(1.3, animation.springBouncy),
    withSpring(1, animation.spring)
  );
}

// Onboarding slide in from right
export function animateSlideIn(translateX: SharedValue<number>) {
  'worklet';
  translateX.value = 300;
  translateX.value = withSpring(0, animation.spring);
}

// Confidence count-up animation
export function animateCountUp(
  value: SharedValue<number>,
  target: number,
  duration: number = 800
) {
  'worklet';
  value.value = withTiming(target, { duration });
}

// Fade-in with slight upward movement
export function animateFadeInUp(
  opacity: SharedValue<number>,
  translateY: SharedValue<number>,
  delay: number = 0
) {
  'worklet';
  opacity.value = withDelay(delay, withTiming(1, { duration: animation.timing.normal }));
  translateY.value = withDelay(delay, withSpring(0, animation.spring));
}

// Scanner progress ring rotation
export function animateProgressRing(
  rotation: SharedValue<number>,
  targetDegrees: number
) {
  'worklet';
  rotation.value = withSpring(targetDegrees, {
    damping: 20,
    stiffness: 100,
  });
}
