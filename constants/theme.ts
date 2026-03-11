import { Platform, TextStyle, ViewStyle } from 'react-native';

// ─── Colors ──────────────────────────────────────────────────────────────────
// Vintage-Typewriter warm beige / gold palette
export const colors = {
  // Primary palette — editorial dark
  primary: '#1A1A1A',
  primaryLight: '#3A3A3A',
  primaryMuted: '#5A5A5A',

  // Background — warm beige
  background: '#F6F3EE',
  backgroundSecondary: '#EDE9E3',
  surface: '#FAF8F4',
  surfaceElevated: '#FDFCF8',

  // Gold — remapped to primary (no more warm gold in the UI)
  gold: '#1A1A1A',
  goldLight: '#3A3A3A',
  goldHover: '#0A0A0A',

  // Secondary
  secondary: '#1A1A1A',

  // Accent — vermillion (errors/destructive only)
  accent: '#E63946',
  accentLight: '#FDE8EA',
  accentDark: '#B82D38',

  // Text
  textPrimary: '#1A1A1A',
  textSecondary: '#6B665F', // Darkened for better contrast
  textTertiary: '#6B665F', // Darkened for better contrast
  textInverse: '#FAF8F4',
  textAccent: '#1A1A1A',

  // Borders
  border: '#E8E4DE',
  borderLight: '#F0ECE6',
  borderDark: '#D5D0C8',

  // Status
  success: '#5A8A6A',
  warning: '#E6A817',
  error: '#E63946',
  info: '#2563EB',

  // Overlay
  overlay: 'rgba(26, 26, 26, 0.5)',
  overlayLight: 'rgba(26, 26, 26, 0.3)',

  // Skeleton
  skeleton: '#E8E4DE',
  skeletonHighlight: '#F0ECE6',

  // Tab bar
  tabActive: '#1A1A1A',
  tabInactive: '#B5B0A8',
} as const;

// ─── Typography ──────────────────────────────────────────────────────────────
// Display: Serif (Playfair Display) — for headlines, hero text
// Body: Sans-serif (DM Sans) — for body, UI elements

export const fontFamily = {
  serifRegular: 'PlayfairDisplay-Regular',
  serifMedium: 'PlayfairDisplay-Medium',
  serifSemiBold: 'PlayfairDisplay-SemiBold',
  serifBold: 'PlayfairDisplay-Bold',
  sansRegular: 'DMSans-Regular',
  sansMedium: 'DMSans-Medium',
  sansSemiBold: 'DMSans-SemiBold',
  sansBold: 'DMSans-Bold',
} as const;

export const typography = {
  // Display — editorial headlines
  displayLarge: {
    fontFamily: fontFamily.serifBold,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1.5,
    fontWeight: '700',
  } as TextStyle,
  displayMedium: {
    fontFamily: fontFamily.serifBold,
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -1,
    fontWeight: '700',
  } as TextStyle,
  displaySmall: {
    fontFamily: fontFamily.serifSemiBold,
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.8,
    fontWeight: '600',
  } as TextStyle,

  // Headings
  headingLarge: {
    fontFamily: fontFamily.serifSemiBold,
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.5,
    fontWeight: '600',
  } as TextStyle,
  headingMedium: {
    fontFamily: fontFamily.serifMedium,
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.3,
    fontWeight: '500',
  } as TextStyle,
  headingSmall: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: -0.2,
    fontWeight: '600',
  } as TextStyle,

  // Body
  bodyLarge: {
    fontFamily: fontFamily.sansRegular,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
    fontWeight: '400',
  } as TextStyle,
  bodyMedium: {
    fontFamily: fontFamily.sansRegular,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
    fontWeight: '400',
  } as TextStyle,
  bodySmall: {
    fontFamily: fontFamily.sansRegular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.1,
    fontWeight: '400',
  } as TextStyle,

  // Labels / UI
  labelLarge: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontWeight: '600',
  } as TextStyle,
  labelMedium: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontWeight: '500',
  } as TextStyle,
  labelSmall: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '500',
  } as TextStyle,

  // Captions
  caption: {
    fontFamily: fontFamily.sansRegular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.2,
    fontWeight: '400',
  } as TextStyle,

  // Small caps (editorial style tags)
  smallCaps: {
    fontFamily: fontFamily.sansMedium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontWeight: '500',
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
