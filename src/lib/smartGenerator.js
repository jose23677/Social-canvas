// ── Generador inteligente de carruseles sin API externa ────────────────────
// Genera 10 slides profesionales basado en el tema del usuario.
// 100% local, instantáneo, sin API key ni registro.

const SLIDE_STRUCTURE = [
  { type: 'cover',      role: 'hook' },
  { type: 'educational', role: 'what' },
  { type: 'educational', role: 'how' },
  { type: 'benefits',   role: 'benefits' },
  { type: 'myths',      role: 'myths' },
  { type: 'timeline',   role: 'timeline' },
  { type: 'stat',       role: 'results' },
  { type: 'preventive', role: 'who' },
  { type: 'trust',      role: 'trust' },
  { type: 'cta',        role: 'cta' },
]

function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function detectCategory(topic) {
  const t = topic.toLowerCase()
  if (/botox|toxina|botulínica|neuromodulador/i.test(t)) return 'botox'
  if (/rellen|filler|hialurónico|dermal/i.test(t)) return 'filler'
  if (/prp|plasma|plaqueta/i.test(t)) return 'prp'
  if (/bioestimulador|colágeno|sculptra|radiesse/i.test(t)) return 'bioestimulador'
  if (/hidratación|moisturi|hidrafacial/i.test(t)) return 'hidratacion'
  if (/peel|peeling|exfoliac/i.test(t)) return 'peeling'
  if (/laser|láser|depilac/i.test(t)) return 'laser'
  if (/skincare|cuidado.*piel|rutina/i.test(t)) return 'skincare'
  if (/lifting|tensor|hilo|thread/i.test(t)) return 'lifting'
  return 'general'
}

function getTopicShort(topic) {
  // Extract main subject (first 3-4 words)
  return topic.split(/[\s,;.]+/).slice(0, 4).join(' ')
}

const CATEGORY_DATA = {
  botox: {
    what: 'proteína neuromoduladora purificada que bloquea temporalmente las señales nerviosas hacia los músculos faciales',
    how: 'microinyecciones precisas en puntos anatómicos específicos relajan el músculo y suavizan las arrugas de expresión',
    duration: '4 a 6 meses',
    recovery: '15 a 30 minutos, sin tiempo de recuperación',
    stat: '95%',
    statLabel: 'satisfacción en pacientes tratados',
    myths: [
      { myth: '"Deja la cara congelada"', truth: 'La técnica moderna preserva tus expresiones naturales al 100%.' },
      { myth: '"Solo es para personas mayores"', truth: 'El botox preventivo desde los 25 años es la estrategia más efectiva.' },
      { myth: '"Es peligroso"', truth: 'Aprobado por la FDA con más de 20 años de evidencia clínica.' },
      { myth: '"Duele mucho"', truth: 'Agujas ultrafinas 30G. La mayoría siente solo una leve presión.' },
    ],
    timeline: [
      { day: 'Día 1', title: 'Tratamiento completado', desc: 'Actividad normal inmediata. Leve enrojecimiento que desaparece en horas.' },
      { day: 'Día 3–4', title: 'Primeros efectos', desc: 'La musculatura comienza a relajarse gradualmente.' },
      { day: 'Día 7', title: 'Efecto visible', desc: 'Las arrugas se suavizan notablemente.' },
      { day: 'Día 14', title: 'Resultado óptimo', desc: 'Tu mejor versión. Natural y luminosa.' },
    ],
    imagePrompts: {
      cover: 'elegant woman 35 years natural glowing skin champagne background editorial Vogue Beauty portrait photorealistic',
      educational: 'minimal facial anatomy diagram golden lines medical aesthetics illustration premium',
      benefits: 'close-up woman radiant skin rested expression natural beauty luxury editorial',
      myths: 'elegant confident woman calm expression luxury premium dark background',
      trust: 'luxury medical clinic doctor gloved hands precision treatment premium atmosphere',
    },
  },
  filler: {
    what: 'gel biocompatible de ácido hialurónico que restaura volumen, hidratación y define contornos faciales de forma natural',
    how: 'inyecciones estratégicas en zonas específicas que reponen volumen perdido y mejoran la armonía facial',
    duration: '12 a 18 meses',
    recovery: '30 a 45 minutos, mínimos hematomas temporales',
    stat: '12–18',
    statLabel: 'meses de duración promedio',
    myths: [
      { myth: '"Queda antinatural"', truth: 'Con técnica experta el resultado es completamente natural e imperceptible.' },
      { myth: '"Es permanente"', truth: 'Es 100% reversible y biodegradable. El cuerpo lo absorbe naturalmente.' },
      { myth: '"Hincha mucho"', truth: 'La inflamación es mínima y desaparece en 24-48 horas.' },
      { myth: '"Solo para labios"', truth: 'Trata pómulos, ojeras, mentón, líneas de marioneta y más.' },
    ],
    timeline: [
      { day: 'Día 1', title: 'Post-tratamiento', desc: 'Posible leve inflamación. Resultado visible desde el primer día.' },
      { day: 'Día 3', title: 'Estabilización', desc: 'El producto se integra al tejido. Inflamación desaparece.' },
      { day: 'Día 7', title: 'Resultado real', desc: 'El volumen final se aprecia con claridad.' },
      { day: 'Día 30', title: 'Resultado óptimo', desc: 'Total integración. Resultado natural y duradero.' },
    ],
    imagePrompts: {
      cover: 'elegant woman perfect facial contours natural lips champagne lighting editorial beauty luxury',
      educational: 'hyaluronic acid molecular structure medical illustration gold premium minimal',
      benefits: 'woman beautiful facial harmony volume natural beauty luxury skincare editorial',
      myths: 'elegant woman before after natural enhancement luxury medical aesthetic',
      trust: 'luxury medical clinic injection technique precision doctor premium',
    },
  },
  general: {
    what: 'tratamiento médico-estético de última generación diseñado para mejorar tu bienestar y apariencia de forma segura y natural',
    how: 'protocolo personalizado aplicado por especialistas con técnica avanzada, adaptado a tu anatomía y objetivos específicos',
    duration: '6 a 12 meses',
    recovery: 'mínima o ninguna, retoma tus actividades de inmediato',
    stat: '97%',
    statLabel: 'de satisfacción en pacientes',
    myths: [
      { myth: '"Es muy arriesgado"', truth: 'Procedimientos certificados con perfil de seguridad excepcional.' },
      { myth: '"Los resultados se ven artificiales"', truth: 'Con técnica experta los resultados son completamente naturales.' },
      { myth: '"Solo es vanidad"', truth: 'Es una inversión en tu bienestar, autoestima y calidad de vida.' },
      { myth: '"Es muy costoso"', truth: 'Existen planes de tratamiento accesibles para cada presupuesto.' },
    ],
    timeline: [
      { day: 'Sesión 1', title: 'Evaluación y tratamiento', desc: 'Diagnóstico personalizado y primera sesión.' },
      { day: '1 semana', title: 'Primeros resultados', desc: 'Cambios iniciales visibles y perceptibles.' },
      { day: '1 mes', title: 'Evolución notable', desc: 'Mejora significativa y progresiva.' },
      { day: '3 meses', title: 'Resultado completo', desc: 'Resultado final. Natural, duradero y satisfactorio.' },
    ],
    imagePrompts: {
      cover: 'elegant woman natural beauty premium aesthetic clinic champagne lighting editorial luxury Vogue',
      educational: 'medical aesthetic treatment illustration premium minimal gold clean',
      benefits: 'beautiful woman radiant skin confident smile luxury lifestyle editorial',
      myths: 'elegant confident woman luxury premium aesthetic dark background',
      trust: 'luxury medical aesthetic clinic professional doctor premium atmosphere',
    },
  },
}

// Fill any missing category from general
const CAT = (cat) => ({ ...CATEGORY_DATA.general, ...(CATEGORY_DATA[cat] || {}) })

export function generateSmartCarousel({ topic, brand, tone }) {
  const cat = detectCategory(topic)
  const data = CAT(cat)
  const topicShort = getTopicShort(topic)
  const doctor = brand?.doctor || 'Dr. Nombre'
  const handle = brand?.handle || '@tuclínica'
  const whatsapp = brand?.whatsapp || ''
  const specialty = brand?.specialty || 'Medicina Estética'

  const TONE_BODY = {
    educational:  (s) => `${s} Basado en evidencia clínica y años de experiencia médica.`,
    aspirational: (s) => `${s} Descubre cómo miles de pacientes han transformado su confianza.`,
    trust:        (s) => `${s} Tu seguridad es nuestra prioridad absoluta en cada procedimiento.`,
    conversion:   (s) => `${s} Agenda hoy y comienza tu transformación esta misma semana.`,
  }
  const wrapTone = TONE_BODY[tone] || TONE_BODY.educational

  const imageBase = data.imagePrompts || CATEGORY_DATA.general.imagePrompts

  const slides = [
    // 1. COVER
    {
      id: 1, type: 'cover', isDark: true, bgColor: '#0C2530',
      imagePrompt: imageBase.cover,
      imageStyle: 'luxury',
      elements: {
        label: 'MEDICINA ESTÉTICA PREMIUM',
        headline: ['Todo lo que', `debes saber sobre`, capitalize(topicShort)],
        accent: `Guía médica completa · ${specialty}`,
        cta: 'Desliza para descubrir →',
        handle,
      },
    },
    // 2. QUÉ ES
    {
      id: 2, type: 'educational', isDark: false, bgColor: '#F7F3EE',
      imagePrompt: imageBase.educational,
      imageStyle: 'illustration',
      elements: {
        label: '01 / FUNDAMENTOS',
        headline: [`¿Qué es el`, capitalize(topicShort) + '?'],
        accent: 'Ciencia y precisión médica',
        body: wrapTone(`El ${topicShort} es una ${data.what}.`),
        bullets: [
          'Técnica avanzada y mínimamente invasiva',
          'Resultados naturales y progresivos',
          'Procedimiento certificado y seguro',
          `Duración: ${data.duration}`,
        ],
      },
    },
    // 3. CÓMO FUNCIONA
    {
      id: 3, type: 'educational', isDark: false, bgColor: '#F7F3EE',
      imagePrompt: imageBase.educational,
      imageStyle: 'cinematic',
      elements: {
        label: '02 / PROCEDIMIENTO',
        headline: ['¿Cómo', 'funciona?'],
        accent: 'Técnica de precisión médica',
        body: wrapTone(`El tratamiento consiste en ${data.how}.`),
        bullets: [
          `Duración del procedimiento: ${data.recovery}`,
          'Evaluación médica personalizada previa',
          'Técnica adaptada a tu anatomía única',
          'Seguimiento post-tratamiento incluido',
        ],
      },
    },
    // 4. BENEFICIOS
    {
      id: 4, type: 'benefits', isDark: false, bgColor: '#F7F3EE',
      imagePrompt: imageBase.benefits,
      imageStyle: 'instagram',
      elements: {
        label: '03 / BENEFICIOS',
        headline: ['6 razones para', 'elegir este', 'tratamiento'],
        accent: 'Resultados documentados clínicamente',
        benefits: [
          { icon: '✦', title: 'Resultados naturales', desc: 'Tu expresión y personalidad se mantienen intactas.' },
          { icon: '✦', title: 'Sin cirugía', desc: 'Sin cicatrices ni tiempo de recuperación prolongado.' },
          { icon: '✦', title: 'Procedimiento rápido', desc: data.recovery },
          { icon: '✦', title: 'Duración garantizada', desc: `Resultados que duran ${data.duration}.` },
          { icon: '✦', title: 'Reversible', desc: 'El cuerpo procesa el tratamiento naturalmente.' },
          { icon: '✦', title: 'Alta satisfacción', desc: `${data.stat} ${data.statLabel}.` },
        ],
      },
    },
    // 5. MITOS
    {
      id: 5, type: 'myths', isDark: true, bgColor: '#0C2530',
      imagePrompt: imageBase.myths || imageBase.cover,
      imageStyle: 'cinematic',
      elements: {
        label: '04 / MITOS VS REALIDAD',
        headline: ['Mitos que', 'frenan tu', 'decisión'],
        accent: 'La verdad basada en evidencia médica',
        myths: data.myths,
      },
    },
    // 6. TIMELINE
    {
      id: 6, type: 'timeline', isDark: false, bgColor: '#F7F3EE',
      imagePrompt: 'minimal golden timeline dots lines champagne background luxury medical aesthetic illustration',
      imageStyle: 'illustration',
      elements: {
        label: '05 / EVOLUCIÓN',
        headline: ['¿Cuándo verás', 'los resultados?'],
        accent: 'Cronología exacta del tratamiento',
        timeline: data.timeline,
      },
    },
    // 7. ESTADÍSTICAS
    {
      id: 7, type: 'stat', isDark: false, bgColor: '#E8D5BE',
      imagePrompt: 'abstract luxury medical statistics golden numbers champagne background premium minimal',
      imageStyle: 'illustration',
      elements: {
        label: '06 / RESULTADOS',
        headline: ['Números que', 'hablan por', 'sí solos'],
        statNumber: data.stat,
        statLabel: data.statLabel,
        accent: 'Evidencia clínica respaldada',
        body: wrapTone(`Con ${data.duration} de duración promedio, el ${topicShort} es una de las inversiones más rentables en medicina estética.`),
        factors: [
          { name: data.stat, desc: data.statLabel },
          { name: data.duration, desc: 'de duración promedio' },
        ],
      },
    },
    // 8. PARA QUIÉN ES
    {
      id: 8, type: 'preventive', isDark: false, bgColor: '#F7F3EE',
      imagePrompt: imageBase.benefits + ' young elegant woman confident smile',
      imageStyle: 'luxury',
      elements: {
        label: '07 / IDEAL PARA TI SI...',
        headline: ['¿Es este', 'tratamiento', 'para ti?'],
        accent: 'Candidatos ideales según criterio médico',
        body: wrapTone(`El ${topicShort} está indicado para personas que buscan resultados naturales y duraderos sin recurrir a procedimientos quirúrgicos.`),
        bullets: [
          'Quieres mejorar tu apariencia de forma natural',
          'Buscas resultados sin cirugía ni cicatrices',
          'Valoras tu tiempo con procedimientos rápidos',
          'Deseas una inversión a largo plazo en tu bienestar',
        ],
        quote: 'La mejor versión de ti misma puede verse completamente natural.',
      },
    },
    // 9. CONFIANZA
    {
      id: 9, type: 'trust', isDark: false, bgColor: '#F7F3EE',
      imagePrompt: imageBase.trust,
      imageStyle: 'cinematic',
      elements: {
        label: '08 / POR QUÉ ELEGIRNOS',
        headline: ['Tu seguridad', 'es nuestra', 'prioridad'],
        accent: 'Estándares médicos internacionales',
        pillars: [
          { title: 'EVALUACIÓN\nPERSONALIZADA', desc: 'Historia clínica completa y diagnóstico facial individualizado.' },
          { title: 'TÉCNICA\nCERTIFICADA', desc: 'Formación avalada internacionalmente con años de experiencia.' },
          { title: 'SEGUIMIENTO\nGARANTIZADO', desc: 'Control post-tratamiento incluido en cada sesión.' },
        ],
        credentials: [
          'Médico especializado en medicina estética',
          'Productos certificados de marcas reconocidas',
          'Instalaciones con estándares internacionales',
        ],
        quote: '"La diferencia entre un resultado natural y uno artificial es la mano del médico."',
        doctor,
      },
    },
    // 10. CTA
    {
      id: 10, type: 'cta', isDark: true, bgColor: '#0C2530',
      imagePrompt: 'elegant woman luxury spa reception golden champagne teal premium medical clinic invitation',
      imageStyle: 'luxury',
      elements: {
        label: 'TU PRÓXIMO PASO',
        headline: ['Tu mejor versión', 'te está', 'esperando.'],
        subheadline: 'AGENDA TU VALORACIÓN PERSONALIZADA',
        accent: 'Sin compromiso · 100% personalizada · Cupos limitados',
        bullets: [
          '✦ Evaluación facial completa sin costo',
          '✦ Plan de tratamiento a tu medida',
          '✦ Seguimiento médico incluido',
        ],
        ctaInstagram: handle,
        ctaWhatsapp: whatsapp,
        trust: 'Reserva tu espacio hoy — los cupos son limitados',
        doctor,
        specialty,
      },
    },
  ]

  const caption = `¿Tenías alguno de estos mitos sobre el ${topicShort}? 👇

El tratamiento correcto, con el médico correcto, cambia todo.

Agenda tu valoración personalizada — sin compromiso.
👉 ${handle}${whatsapp ? ` · WhatsApp: ${whatsapp}` : ''}

#MedicinaEstética #${topicShort.replace(/\s+/g, '')} #${specialty.replace(/\s+/g, '')} #TratamientoFacial #ResultadosNaturales #BellezaReal`

  return {
    slides,
    meta: {
      topic: capitalize(topicShort),
      hook: `Todo lo que debes saber sobre ${topicShort}`,
      caption,
      hashtags: ['MedicinaEstética', topicShort.replace(/\s+/g, ''), 'ResultadosNaturales', 'BellezaReal'],
    },
  }
}
