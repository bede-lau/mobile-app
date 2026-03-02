import { Platform, TextStyle, ViewStyle } from 'react-native';

// ─── Colors ──────────────────────────────────────────────────────────────────
export const colors = {
  // Primary palette — editorial near-black
  primary: '#0A0A0A',
  primaryLight: '#1A1A1A',
  primaryMuted: '#3A3A3A',

  // Background
  background: '#FAFAF7',
  backgroundSecondary: '#F2F1ED',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  // Accent — vermillion
  accent: '#E63946',
  accentLight: '#FDE8EA',
  accentDark: '#B82D38',

  // Secondary accent — emerald
  secondary: '#2D6A4F',
  secondaryLight: '#E8F5ED',
  secondaryDark: '#1B4332',

  // Text
  textPrimary: '#0A0A0A',
  textSecondary: '#6B6B6B',
  textTertiary: '#9B9B9B',
  textInverse: '#FAFAF7',
  textAccent: '#E63946',

  // Borders
  border: '#E5E5E0',
  borderLight: '#F0F0EB',
  borderDark: '#CCCCCC',

  // Status
  success: '#2D6A4F',
  warning: '#E6A817',
  error: '#E63946',
  info: '#2563EB',

  // Overlay
  overlay: 'rgba(10, 10, 10, 0.5)',
  overlayLight: 'rgba(10, 10, 10, 0.3)',

  // Skeleton
  skeleton: '#E5E5E0',
  skeletonHighlight: '#F0F0EB',

  // Tab bar
  tabActive: '#0A0A0A',
  tabInactive: '#9B9B9B',
} as const;

// ─── Typography ──────────────────────────────────────────────────────────────
// Display: Serif (Playfair Display) — for headlines, hero text
// Body: Sans-serif (DM Sans) — for body, UI elements

export const fontFamily = {
  serifRegular: 'PlayfairDisplay_400Regular',
  serifMedium: 'PlayfairDisplay_500Medium',
  serifSemiBold: 'PlayfairDisplay_600SemiBold',
  serifBold: 'PlayfairDisplay_700Bold',
  sansRegular: 'DMSans_400Regular',
  sansMedium: 'DMSans_500Medium',
  sansSemiBold: 'DMSans_600SemiBold',
  sansBold: 'DMSans_700Bold',
} as const;

export const typography = {
  // Display — editorial headlines
  displayLarge: {
    fontFamily: fontFamily.serifBold,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1.5,
  } as TextStyle,
  displayMedium: {
    fontFamily: fontFamily.serifBold,
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -1,
  } as TextStyle,
  displaySmall: {
    fontFamily: fontFamily.serifSemiBold,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.8,
  } as TextStyle,

  // Headings
  headingLarge: {
    fontFamily: fontFamily.serifSemiBold,
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.5,
  } as TextStyle,
  headingMedium: {
    fontFamily: fontFamily.serifMedium,
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.3,
  } as TextStyle,
  headingSmall: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: -0.2,
  } as TextStyle,

  // Body
  bodyLarge: {
    fontFamily: fontFamily.sansRegular,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
  } as TextStyle,
  bodyMedium: {
    fontFamily: fontFamily.sansRegular,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  } as TextStyle,
  bodySmall: {
    fontFamily: fontFamily.sansRegular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.1,
  } as TextStyle,

  // Labels / UI
  labelLarge: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  } as TextStyle,
  labelMedium: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  } as TextStyle,
  labelSmall: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  } as TextStyle,

  // Captions
  caption: {
    fontFamily: fontFamily.sansRegular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.2,
  } as TextStyle,

  // Small caps (editorial style tags)
  smallCaps: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  } as TextStyle,
} as const;

// ─── Spacing ─────────────────────────────────────────────────────────────────
// 4px base grid
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

// ─── Border Radius ───────────────────────────────────────────────────────────
// Sharp editorial corners
export const radius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  full: 9999,
} as const;

// ─── Touch Targets ───────────────────────────────────────────────────────────
export const hitSlop = { top: 12, bottom: 12, left: 12, right: 12 };
export const MIN_TOUCH_TARGET = 48;

// ─── Shadows ─────────────────────────────────────────────────────────────────
export const shadows = {
  none: {} as ViewStyle,
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
    },
    android: { elevation: 1 },
    default: {},
  }) as ViewStyle,
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
    },
    android: { elevation: 3 },
    default: {},
  }) as ViewStyle,
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    android: { elevation: 6 },
    default: {},
  }) as ViewStyle,
} as const;

// ─── Animation ───────────────────────────────────────────────────────────────
export const animation = {
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 0.8,
  },
  springBouncy: {
    damping: 10,
    stiffness: 200,
    mass: 0.6,
  },
  timing: {
    fast: 150,
    normal: 250,
    slow: 400,
  },
} as const;

// ─── Layout ──────────────────────────────────────────────────────────────────
export const layout = {
  screenPadding: spacing.md,
  cardPadding: spacing.md,
  sectionGap: spacing.lg,
  tabBarHeight: 56,
  headerHeight: 56,
} as const;
