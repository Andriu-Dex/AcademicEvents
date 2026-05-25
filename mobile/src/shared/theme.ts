export const theme = {
    colors: {
        utaPrimary: "#8a1538",
        utaSecondary: "#630f28",
        utaAccent: "#ffd700",
        primary: "#8a1538",
        primaryDark: "#5f1027",
        primaryHover: "#6a102c",
        primaryLight: "rgba(138, 21, 56, 0.12)",
        primaryLighter: "rgba(138, 21, 56, 0.06)",
        bgPrimary: "#ffffff",
        bgSecondary: "#f5f7fa",
        bgTertiary: "#edf1f7",
        bgElevated: "#ffffff",
        bgCard: "#ffffff",
        // Backwards-compatible aliases
        surface: "#ffffff",
        surfaceAlt: "#f5f7fa",
        bgHover: "#edf1f7",
        textPrimary: "#1a1f2e",
        // alias expected by some components
        text: "#1a1f2e",
        textSecondary: "#6b7280",
        textTertiary: "#9ca3af",
        textInverse: "#ffffff",
        onPrimary: "#ffffff",
        borderPrimary: "#e8ecf2",
        // alias for older screens
        border: "#e8ecf2",
        borderSecondary: "#d1d5db",
        borderLight: "#f0f2f7",
        success: "#10b981",
        successLight: "rgba(16, 185, 129, 0.1)",
        warning: "#f59e0b",
        warningLight: "rgba(245, 158, 11, 0.1)",
        error: "#ef4444",
        errorLight: "rgba(239, 68, 68, 0.1)",
        tabBarBg: "#ffffff",
        tabBarBorder: "#f0f2f5",
        /* Semantic tokens (area-specific) */
        /* Auth (login / register) */
        authBackground: "#ffffff",
        authCardBackground: "#ffffff",
        authPrimary: "#8a1538",
        authPrimaryText: "#ffffff",

        /* Navbar */
        navbarBackground: "transparent",
        navbarBrandBg: "rgba(255,255,255,0.10)",
        navbarControlBg: "rgba(255,255,255,0.18)",

        /* Home */
        homeGradientStart: "#f8eff2",
        homeGradientEnd: "#ffffff",
        heroTextHigh: "rgba(255,255,255,0.96)",
        heroTextMedium: "rgba(255,255,255,0.95)",

        /* Events */
        eventCardBg: "#ffffff",
        eventAccentBorderLight: "rgba(138,21,56,0.15)",
        primary22: "rgba(138,21,56,0.22)",
        eventImageOverlayDark: "rgba(26,31,46,0.78)",
        /* Report colors */
        reportIndigo: "#6366f1",
        reportCyan: "#0ea5e9",

        /* Overlays */
        overlayWhite10: "rgba(255,255,255,0.10)",
        overlayWhite15: "rgba(255,255,255,0.15)",
        overlayWhite18: "rgba(255,255,255,0.18)",
        overlayWhite20: "rgba(255,255,255,0.20)",
        overlayWhite22: "rgba(255,255,255,0.22)",
        overlayWhite85: "rgba(255,255,255,0.85)",
        overlayBlack50: "rgba(0,0,0,0.5)",
        overlayBlack45: "rgba(10,5,15,0.45)",
        overlayBlack55: "rgba(0,0,0,0.55)",
        primaryOpaque85: "rgba(138, 21, 56, 0.85)",
        overlayBlack18: "rgba(0,0,0,0.18)",
        overlayBlack22: "rgba(0,0,0,0.22)",
        overlayWhite90: "rgba(255,255,255,0.9)",
        /* Additional precise alpha tokens used across screens */
        overlayWhite08: "rgba(255,255,255,0.08)",
        overlayWhite14: "rgba(255,255,255,0.14)",
        overlayWhite16: "rgba(255,255,255,0.16)",
        overlayWhite30: "rgba(255,255,255,0.3)",
        overlayWhite55: "rgba(255,255,255,0.55)",
        overlayWhite76: "rgba(255,255,255,0.76)",
        overlayWhite86: "rgba(255,255,255,0.86)",
        overlayWhite88: "rgba(255,255,255,0.88)",
        overlayWhite24: "rgba(255,255,255,0.24)",
        overlayWhite32: "rgba(255,255,255,0.32)",
        overlayWhite50: "rgba(255,255,255,0.5)",
        overlayWhite12: "rgba(255,255,255,0.12)",
        overlayWhite82: "rgba(255,255,255,0.82)",
        /* Additional error / black overlay tokens */
        error20: "rgba(239,68,68,0.2)",
        error08: "rgba(239,68,68,0.08)",
        overlayBlack65: "rgba(0,0,0,0.65)",
        overlayBlack68: "rgba(10,15,28,0.68)",

        /* Profiles (student / admin) */
        profileCardBg: "#ffffff",
        profileTextPrimary: "#1a1f2e",

        /* Admin / Reporting panels */
        adminPanelBg: "#ffffff",
        adminPanelFooterBg: "#111827",

        /* Error / Danger */
        errorBgLight: "#fff6f6",
        errorBorderLight: "#fecaca",
        errorTextStrong: "rgba(185, 28, 28, 0.85)",
        /* Success borders */
        successBorder: "#86efac",
    },
    // Legacy / convenience aliases expected by some screens
    fontSize: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 20,
    },
    gradients: {
        primary: ["#8a1538", "#5f1027"] as const,
        header: ["#8a1538", "#6e0e2d"] as const,
        hero: ["rgba(138, 21, 56, 0.96)", "rgba(80, 10, 30, 0.98)"] as const,
        home: ["#f8eff2", "#ffffff"] as const,
        card: ["#f8f9fc", "#eef1f7"] as const,
        surface: ["#ffffff", "#f9fafb"] as const,
    },
    shadow: {
        xs: {
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 1 },
            elevation: 1,
        },
        sm: {
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 3 },
            elevation: 3,
        },
        md: {
            shadowColor: "#000",
            shadowOpacity: 0.12,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 6 },
            elevation: 6,
        },
        lg: {
            shadowColor: "#000",
            shadowOpacity: 0.18,
            shadowRadius: 28,
            shadowOffset: { width: 0, height: 10 },
            elevation: 10,
        },
        primary: {
            shadowColor: "#8a1538",
            shadowOpacity: 0.3,
            shadowRadius: 22,
            shadowOffset: { width: 0, height: 8 },
            elevation: 8,
        },
        tab: {
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: -4 },
            elevation: 12,
        },
    },
    radius: {
        xs: 6,
        sm: 12,
        md: 18,
        lg: 24,
        xl: 32,
        full: 999,
    },
    spacing: {
        xs: 4,
        sm: 10,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
    },
    font: {
        title: "System",
        body: "System",
    },
    sizes: {
        inputHeight: 52,
        buttonHeight: 52,
        tabBarHeight: 68,
        headerHeight: 60,
        iconBtn: 44,
    },
    // Provide a few color aliases used across the app to keep older components working
    // These map to the semantic tokens already defined in `colors`.
    // Example: tokens.colors.surface -> tokens.colors.bgCard
    // Added to avoid breaking changes when screens reference older token names.
    // Note: keep in sync with colors above when adjusting palettes.
    // (kept at root for backwards compatibility where code expects tokens.colors.*)
    // No runtime behavior changes, just aliases.
};
