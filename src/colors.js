import { alpha, darken, lighten } from '@instructure/ui-themeable/lib/utils/color'

const ucColors = {
  maroon: '#800000',
  dkGray: '#767676',
  ltGray: '#D6D6CE',
  yellow1: '#FFA319',
  yellow2: '#FFB547',
  yellow3: '#CC8214',
  orange1: '#C16622',
  orange2: '#D49464',
  orange3: '#9A5324',
  red1: '#8F3931',
  red2: '#B1746F',
  red3: '#642822',
  ltGreen1: '#8A9045',
  ltGreen2: '#ADB17D',
  ltGreen3: '#616530',
  dkGreen1: '#58593F',
  dkGreen2: '#8A8B79',
  dkGreen3: '#3E3E23',
  blue1: '#155F83',
  blue2: '#5B8FA8',
  blue3: '#0F425C',
  violet1: '#350E20',
  violet2: '#725663',
  cyan: '#47B5FF',
  magenta: '#FF3399'

  // text: '#222'
}

const baseColors = {
  brand: lighten(ucColors.blue1, 10),
  electric: lighten(ucColors.blue1, 10),
  shamrock: lighten(ucColors.ltGreen1, 5),
  barney: lighten(ucColors.violet1, 10),
  crimson: lighten(ucColors.red1, 10),
  fire: lighten(ucColors.orange1, 10),
  licorice: darken(ucColors.dkGray, 30),
  oxford: darken(ucColors.dkGray, 20),
  ash: lighten(ucColors.dkGray, 5),
  slate: lighten(ucColors.dkGray, 5),
  tiara: ucColors.ltGray,
  porcelain: lighten(ucColors.ltGray, 10),
  white: '#FFFFFF'

}

export const colors = {
  ...ucColors,
  ...baseColors,

  textDarkest: baseColors.licorice,
  textDark: baseColors.ash,
  textLight: baseColors.porcelain,
  textLightest: baseColors.white,

  textBrand: baseColors.brand,
  textAlert: baseColors.barney,
  textInfo: baseColors.brand,
  textSuccess: baseColors.shamrock,
  textDanger: baseColors.crimson,
  textWarning: baseColors.fire,

  backgroundDarkest: baseColors.licorice,
  backgroundDark: baseColors.ash,
  backgroundMedium: baseColors.tiara,
  backgroundLight: baseColors.porcelain,
  backgroundLightest: baseColors.white,

  backgroundBrand: baseColors.brand,
  backgroundBrandSecondary: baseColors.oxford,
  backgroundAlert: baseColors.barney,
  backgroundInfo: baseColors.brand,
  backgroundSuccess: baseColors.shamrock,
  backgroundDanger: baseColors.crimson,
  backgroundWarning: baseColors.fire,

  borderLightest: baseColors.white,
  borderLight: baseColors.porcelain,
  borderMedium: baseColors.tiara,
  borderDark: baseColors.ash,
  borderDarkest: baseColors.licorice,

  borderBrand: baseColors.brand,
  borderAlert: baseColors.barney,
  borderInfo: baseColors.brand,
  borderSuccess: baseColors.shamrock,
  borderDanger: baseColors.crimson,
  borderWarning: baseColors.fire,

  borderDebug: baseColors.crimson
}

// from https://github.com/instructure/instructure-ui/blob/master/packages/ui-themes/src/canvas/base/index.js
const brandVariables = {
  'ic-brand-primary': colors.textBrand,
  'ic-brand-font-color-dark': colors.textDarkest,

  'ic-link-color': colors.textBrand,
  'ic-link-decoration': 'none',

  'ic-brand-button--primary-bgd': colors.backgroundBrand,
  'ic-brand-button--primary-text': colors.textLightest,
  'ic-brand-button--secondary-bgd': colors.backgroundDarkest,
  'ic-brand-button--secondary-text': colors.textLightest,

  'ic-brand-global-nav-bgd': colors.backgroundBrandSecondary,
  'ic-global-nav-link-hover': colors.backgroundDarkest,
  'ic-brand-global-nav-ic-icon-svg-fill': colors.textLightest,
  'ic-brand-global-nav-ic-icon-svg-fill--active': colors.textBrand,
  'ic-brand-global-nav-menu-item__text-color': colors.textLightest,
  'ic-brand-global-nav-menu-item__text-color--active': colors.textBrand
}

export const themeOverrides = {
  ...brandVariables,

  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"'
  },
  colors: colors
}

export const axisStyle = {
  text: {fill: colors.textDark, fontWeight: 400, fontSize: '10pt'},
  title: {fill: colors.textDark, fontWeight: 400, fontSize: '10pt'}
}

export default colors
