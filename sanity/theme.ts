import { buildLegacyTheme } from "sanity";

const legacyTheme = buildLegacyTheme({
  "--black": "#0b1016",
  "--white": "#f4f0e9",
  "--brand-primary": "#dac79e",
  "--component-bg": "#0b1016",
  "--component-text-color": "#f4f0e9",
  "--default-button-color": "#1c1d23",
  "--default-button-primary-color": "#dac79e",
  "--default-button-success-color": "#dac79e",
  "--default-button-warning-color": "#e5dac2",
  "--default-button-danger-color": "#c4b38e",
  "--focus-color": "#dac79e",
  "--gray-base": "#1c1d23",
  "--gray": "#5c6773",
  "--main-navigation-color": "#0b1016",
  "--main-navigation-color--inverted": "#f4f0e9",
  "--state-info-color": "#dac79e",
  "--state-success-color": "#dac79e",
  "--state-warning-color": "#e5dac2",
  "--state-danger-color": "#c4b38e",
});

export const neuroAtlasTheme: typeof legacyTheme = {
  ...legacyTheme,
  color: {
    ...legacyTheme.color,
    light: legacyTheme.color!.light!,
    dark: legacyTheme.color!.light!,
  },
};
