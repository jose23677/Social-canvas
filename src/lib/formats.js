export const FORMATS = {
  square: { label: '1:1', width: 1080, height: 1080, display: 500 },
  portrait: { label: '4:5', width: 1080, height: 1350, display: 500 },
  story: { label: '9:16', width: 1080, height: 1920, display: 500 },
  landscape: { label: '16:9', width: 1920, height: 1080, display: 500 },
}

export function getDisplayDimensions(formatKey, maxSize = 500) {
  const f = FORMATS[formatKey]
  if (!f) return { width: maxSize, height: maxSize }
  const ratio = f.width / f.height
  if (ratio >= 1) {
    return { width: maxSize, height: Math.round(maxSize / ratio) }
  } else {
    return { width: Math.round(maxSize * ratio), height: maxSize }
  }
}

export const FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
  'Playfair Display', 'Oswald', 'Raleway', 'Nunito',
  'Poppins', 'Source Sans Pro', 'PT Sans', 'Ubuntu',
  'Merriweather', 'Josefin Sans', 'Bebas Neue',
]

export const FONT_WEIGHTS = [
  { label: 'Regular', value: 'normal' },
  { label: 'Medium', value: '500' },
  { label: 'SemiBold', value: '600' },
  { label: 'Bold', value: 'bold' },
  { label: 'ExtraBold', value: '800' },
]
