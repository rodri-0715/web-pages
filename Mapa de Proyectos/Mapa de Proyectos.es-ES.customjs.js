/* ==========================================================================
   MAPA DE PROYECTOS EICS (2016-2026)
   Cada proyecto ahora trae: canton, lat, lon (en vez de x, y a mano).
   Las coordenadas x, y del SVG se calculan solas a partir de lat/lon.
   Guardar este archivo como UTF-8.
   ========================================================================== */
 
// ---------- Configuración ----------
const DEBUG_PUNTOS = true;       // true = avisa en consola (F12) si un punto cae fuera de su provincia
const SEPARACION_PUNTOS = 11;    // separación (unidades SVG) entre puntos que comparten ubicación
const CR_EXTENT = { lonMin: -85.95, lonMax: -82.55, latMin: 8.04, latMax: 11.22 }; // límites de Costa Rica
 
// Si los puntos salen corridos de forma pareja, descomente esto para calibrar a mano:
// const CALIBRACION_MANUAL = { x0: 7, y0: 0, ancho: 641, alto: 611 };
const CALIBRACION_MANUAL = null;
 
// Atajo para escribir cada proyecto en una sola línea
const P = (id, provincia, nombre, tipo, ano, canton, lat, lon) =>
  ({ id, provincia, nombre, tipo, ano, canton, lat, lon });
 
const proyectosData = {
  "Alajuela": {
    descripcion: "Zona de influencia principal del Campus Tecnológico Local San Carlos (CTLSC). Concentra proyectos de extensión rural, desarrollo turístico comunitario, manejo hídrico, robótica educativa e investigaciones sobre educación en lenguas.",
    proyectos: [
      P("ala-1", "Alajuela", "Manejo participativo del riesgo y vulnerabilidad de los acueductos rurales de Santa Rita de Florencia y el asentamiento El Futuro de La Tigra", "Extensión", "2016-2017", "San Carlos", 10.39, -84.55),
      P("ala-2", "Alajuela", "Diseño e implementación de un programa de inglés especializado en turismo en Bajos del Toro Amarillo", "Extensión", "2016-2017", "Sarchí", 10.2229, -84.2876),
      P("ala-3", "Alajuela", "Generación de capacidades para el turismo rural sostenible en Bajos del Toro Amarillo", "Extensión", "2016-2017", "Sarchí", 10.2229, -84.2876),
      P("ala-4", "Alajuela", "Fortalecimiento de habilidades comunicativas y tradición oral en Bajos del Toro Amarillo", "Extensión", "2016-2017", "Sarchí", 10.2229, -84.2876),
      P("ala-5", "Alajuela", "Educación no formal para la conservación del recurso hídrico en Santa Rita y El Futuro de La Tigra", "Extensión", "2016-2017", "San Carlos", 10.39, -84.55),
      P("ala-6", "Alajuela", "Fortalecimiento de capacidades locales en Boca San Carlos, Boca Tapada y Boca Cureña", "Extensión", "2017", "San Carlos", 10.70, -84.18), // VERIFICAR: Boca Cureña es de Sarapiquí (Heredia)
      P("ala-8", "Alajuela", "Dinámicas comunitarias de la comunidad de Caño Negro", "Extensión", "2018-2019", "Los Chiles", 10.88, -84.78),
      P("ala-10", "Alajuela", "Fortalecimiento de habilidades de inglés en ADECOFIM", "Extensión", "2022-2023", "San Carlos", 10.60, -84.40), // San Jorge de Cutris
      P("ala-11", "Alajuela", "Innovación y valorización agroalimentaria y turística en Upala, Guatuso y Los Chiles (CONARE)", "Extensión", "2022-2023", "Upala, Guatuso y Los Chiles", 10.87, -84.86), // punto central de los 3 cantones
      P("ala-13", "Alajuela", "Metodologías STEAM para enseñanza de ciudades sostenibles con robótica en Upala", "Extensión", "2023-2024", "Upala", 10.90, -85.02),
      P("ala-15", "Alajuela", "Atlas participativo de percepciones territoriales infantiles en el cantón central de Alajuela", "Extensión", "2025-2027", "Alajuela", 10.0163, -84.2140),
      P("ala-16", "Alajuela", "Avifauna y sostenibilidad: estrategia de conciencia ambiental en finca La Balsa, San Ramón y CTLSC", "Extensión", "2026", "San Carlos", 10.364, -84.511), // CTLSC
      P("ala-17", "Alajuela", "Metodología para cuantificar el efecto de la actividad turística en el recurso hídrico", "Investigación", "2016-2017", "Sarchí", 10.2229, -84.2876), // VERIFICAR: sin lugar en el título
      P("ala-18", "Alajuela", "GeoTorotur: Geomática utilizando Toro DB Aplicada al turismo", "Investigación", "2018-2019", "San Carlos", 10.364, -84.511), // VERIFICAR: sin lugar en el título
      P("ala-19", "Alajuela", "Modelo para evaluación de competitividad en hospedajes de la Región Huetar Norte (CST / ISO 9001)", "Investigación", "2018-2019", "San Carlos", 10.364, -84.511), // VERIFICAR: regional
      P("ala-20", "Alajuela", "Intelitur: Innovación Tecnológica para destinos turísticos inteligentes", "Investigación", "2019-2020", "San Carlos", 10.364, -84.511), // VERIFICAR: sin lugar en el título
      P("ala-22", "Alajuela", "Percepciones de la educación a distancia en docentes de inglés de primaria (San Carlos)", "Investigación", "2021-2022", "San Carlos", 10.3242, -84.4286), // Ciudad Quesada
      P("ala-23", "Alajuela", "Percepciones de educación combinada en docentes de inglés de primaria (Norte-Norte)", "Investigación", "2022-2023", "Upala, Guatuso y Los Chiles", 10.87, -84.86), // Norte-Norte = Upala, Guatuso, Los Chiles
      P("ala-25", "Alajuela", "Monitoreo participativo de aves silvestres en finca La Balsa y relación con producción agropecuaria", "Investigación", "2024-2025", "San Carlos", 10.364, -84.511), // CTLSC
      P("ala-26", "Alajuela", "Evaluación del valor económico de la sostenibilidad en MIPYMES turísticas de la Región Huetar Norte", "Investigación", "2025", "San Carlos", 10.364, -84.511), // VERIFICAR: regional
      P("ala-27", "Alajuela", "Percepciones sobre enseñanza de ética y filosofía en el Colegio Científico de San Carlos", "Investigación", "2025-2026", "San Carlos", 10.364, -84.511),
      P("ala-28", "Alajuela", "Análisis de experiencias de educación en pandemia y pospandemia en docentes de inglés de primaria", "Investigación", "2025-2026", "San Carlos", 10.364, -84.511), // VERIFICAR: sin lugar en el título
      P("ala-29", "Alajuela", "Bienestar socioemocional y rol del género en docentes de inglés de secundaria en Costa Rica", "Investigación", "2026-2027", "San Carlos", 10.364, -84.511), // VERIFICAR: alcance nacional
      P("ala-30", "Alajuela", "Percepciones de estudiantes de Ingeniería en Agronomía sobre bienestar animal en la Región Huetar Norte", "Investigación", "2027-2028", "San Carlos", 10.364, -84.511)
    ]
  },
  "Heredia": {
    descripcion: "Proyectos en el cantón de Sarapiquí (La Virgen y Puerto Viejo) vinculados al turismo rural y la enseñanza del inglés, además de iniciativas de cooperación académica e investigativa en redes universitarias.",
    proyectos: [
      P("ala-7", "Heredia", "Fortalecimiento del emprendedurismo de COOPROTURS R.L. (San Ramón, La Virgen, Sarapiquí)", "Extensión", "2017-2018", "Sarapiquí", 10.39, -84.12),
      P("ala-9", "Heredia", "Diagnóstico de necesidades de inglés en Cooproturs R.L. (Sarapiquí)", "Extensión", "2020", "Sarapiquí", 10.39, -84.12),
      P("ala-12", "Heredia", "Fortalecimiento de competencias de inglés de Cooproturs R.L. para turismo rural", "Extensión", "2022-2024", "Sarapiquí", 10.39, -84.12),
      P("ala-14", "Heredia", "Fortalecimiento lingüístico para emprendimientos turísticos de Cooproturs R.L. y comunidad", "Extensión", "2025", "Sarapiquí", 10.39, -84.12),
      P("ala-21", "Heredia", "Estudio de caso de 5 mujeres en San Ramón de la Virgen de Sarapiquí: Turismo rural y empoderamiento", "Investigación", "2021-2022", "Sarapiquí", 10.39, -84.12),
      P("ala-24", "Heredia", "Percepciones de retorno a la presencialidad en docentes de inglés de primaria (Sarapiquí)", "Investigación", "2023-2024", "Sarapiquí", 10.47, -83.99), // Puerto Viejo de Sarapiquí
      P("her-1", "Heredia", "Red interinstitucional de apoyo a la docencia e investigación sociohumanística", "Investigación", "2024-2026", "Heredia", 9.9981, -84.1198) // VERIFICAR: sin lugar en el título
    ]
  },
  "Limón": {
    descripcion: "Región Caribe y territorios indígenas de Talamanca. Incluye proyectos de turismo sostenible en Talamanca, el centro de capacitación indígena Iriria Alakölpa ú y proyectos con juventudes en el territorio Cabécar.",
    proyectos: [
      P("lim-1", "Limón", "Prácticas sostenibles de turismo, tratamiento de aguas y residuos en albergues de Talamanca", "Extensión", "2016-2017", "Talamanca", 9.62, -82.83),
      P("lim-2", "Limón", "Mejoramiento de la calidad de los servicios turísticos de Talamanca", "Extensión", "2017", "Talamanca", 9.66, -82.75),
      P("lim-3", "Limón", "Centro de Capacitación Iriria Alakölpa ú: Alternativa indígena para el desarrollo rural comunitario", "Extensión", "2022-2024", "Talamanca", 9.47, -82.95), // Amubri
      P("lim-4", "Limón", "Juventudes, territorios y cosmovisión: Derechos humanos e innovación en Chinakichá, Talamanca", "Extensión", "2024", "Talamanca", 9.52, -83.05) // VERIFICAR: ubicación aproximada de Chinakichá
    ]
  },
  "Guanacaste": {
    descripcion: "Zona Chorotega. Proyectos orientados a la gestión y valorización del patrimonio histórico y cultural urbano.",
    proyectos: [
      P("gua-1", "Guanacaste", "Línea base para la gestión sostenible del Centro Histórico de la ciudad de Liberia", "Extensión", "2020-2021", "Liberia", 10.6346, -85.4377)
    ]
  },
  "Cartago": {
    descripcion: "Sede Central, área de influencia regional (cantones de Alvarado y La Unión) y territorio indígena Cabécar de Turrialba (Alto Pacuare y Chirripó). Proyectos de oratoria docente, escritura académica, soberanía alimentaria y energía en escuelas indígenas.",
    proyectos: [
      P("car-1", "Cartago", "Actualización de estrategias de oratoria para docentes de I y II Ciclo en Alvarado y La Unión", "Extensión", "2025-2026", "Alvarado y La Unión", 9.89, -83.80), // punto en Alvarado (Pacayas)
      P("car-2", "Cartago", "Percepciones de estudiantes universitarios STEM sobre escritura académica y la IA generativa", "Investigación", "2027", "Cartago", 9.856, -83.912), // TEC Cartago
      P("lim-5", "Cartago", "La autodeterminación del pueblo Alto Pacuare (territorio Cabécar) para la soberanía alimentaria", "Extensión", "2025-2026", "Turrialba", 9.80, -83.55), // Alto Pacuare
      P("lim-6", "Cartago", "Diagnóstico de los sistemas de energía en 3 escuelas del territorio Cabécar en Chirripó", "Extensión", "2026", "Turrialba", 9.78, -83.42), // Chirripó
      P("sj-8", "Cartago", "Energía, autonomía y educación: Autonomía energética en pueblos indígenas del territorio Cabécar", "Extensión", "2027-2029", "Turrialba", 9.78, -83.42) // VERIFICAR: asumido en Chirripó
    ]
  },
  "San José": {
    descripcion: "Proyectos de alcance nacional, cooperación interinstitucional e iniciativas tecnológicas de bioalfabetización y turismo inteligente.",
    proyectos: [
      P("sj-1", "San José", "Información aumentada de áreas silvestres protegidas de Costa Rica", "Extensión", "2022-2023", "San José", 9.9281, -84.0907), // VERIFICAR: alcance nacional
      P("sj-2", "San José", "Destinos turísticos inteligentes: TICs aplicadas al turismo (Fondo Unión Europea / ADELANTE 2)", "Extensión", "2023-2025", "San José", 9.9281, -84.0907), // VERIFICAR
      P("sj-3", "San José", "Factores que influyen en el comportamiento del turista costarricense y ecuatoriano postpandemia", "Extensión", "2023-2025", "San José", 9.9281, -84.0907), // VERIFICAR
      P("sj-4", "San José", "NatureAR: Bioalfabetizando visitantes de Áreas Silvestres Protegidas usando realidad aumentada", "Extensión", "2024-2026", "San José", 9.9281, -84.0907), // VERIFICAR
      P("sj-5", "San José", "Euro-MexiCoR Hub on ecotourism for rural communities' development (MEXECO)", "Extensión", "2024-2027", "San José", 9.9281, -84.0907), // VERIFICAR
      P("sj-6", "San José", "CultureXR: alfabetización cultural y fomento del turismo en CR mediante tecnología inmersiva", "Extensión", "2025-2027", "San José", 9.9281, -84.0907), // VERIFICAR
      P("sj-7", "San José", "Fortalecimiento de la plataforma NatureAR para bioalfabetización y ciencia ciudadana", "Extensión", "2027-2029", "San José", 9.9281, -84.0907) // VERIFICAR
    ]
  },
  "Puntarenas": {
    descripcion: "Proyectos de extensión y fortalecimiento vinculados a la Red interinstitucional y zonas de influencia costera e insular.",
    proyectos: [
      P("pun-1", "Puntarenas", "Agroecología desde los servicios de extensión rural", "Extensión", "2024-2025", "Puntarenas", 9.99, -84.71) // VERIFICAR: sin lugar en el título
    ]
  }
};
 
let provinciaActual = null;
let filtroGlobalTipo = 'extension';
let filtroProvinciaTipo = 'extension';
let calibracion = null;
 
// ==========================================================================
//  PROYECCIÓN lat/lon -> coordenadas del SVG
// ==========================================================================
 
// Usa el tamaño real de los paths de provincias para ajustar la escala del mapa.
function calibrarMapa() {
  if (CALIBRACION_MANUAL) { calibracion = CALIBRACION_MANUAL; return; }
 
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  document.querySelectorAll(".provincia-path").forEach(function(path) {
    const b = path.getBBox();
    x0 = Math.min(x0, b.x);
    y0 = Math.min(y0, b.y);
    x1 = Math.max(x1, b.x + b.width);
    y1 = Math.max(y1, b.y + b.height);
  });
 
  if (!isFinite(x0) || (x1 - x0) < 100) {
    // Respaldo si no se pudo medir el SVG
    calibracion = { x0: 7, y0: 0, ancho: 641, alto: 611 };
  } else {
    calibracion = { x0: x0, y0: y0, ancho: x1 - x0, alto: y1 - y0 };
  }
}
 
function proyectar(lat, lon) {
  return {
    x: calibracion.x0 + ((lon - CR_EXTENT.lonMin) / (CR_EXTENT.lonMax - CR_EXTENT.lonMin)) * calibracion.ancho,
    y: calibracion.y0 + ((CR_EXTENT.latMax - lat) / (CR_EXTENT.latMax - CR_EXTENT.latMin)) * calibracion.alto
  };
}
 
// Calcula x, y de los proyectos visibles. Los que comparten ubicación se abren en espiral.
function posicionarProyectos(lista) {
  const grupos = {};
  lista.forEach(function(p) {
    const clave = p.lat.toFixed(2) + "," + p.lon.toFixed(2);
    (grupos[clave] = grupos[clave] || []).push(p);
  });
 
  Object.keys(grupos).forEach(function(clave) {
    const grupo = grupos[clave];
    grupo.forEach(function(p, i) {
      const base = proyectar(p.lat, p.lon);
      if (i === 0) {
        p.x = base.x;
        p.y = base.y;
      } else {
        const radio = SEPARACION_PUNTOS * Math.sqrt(i);
        const angulo = i * 2.39996; // ángulo áureo
        p.x = base.x + radio * Math.cos(angulo);
        p.y = base.y + radio * Math.sin(angulo);
      }
    });
  });
}
 
// Avisa en consola si algún punto base cae fuera de la silueta de su provincia.
function verificarPuntos() {
  if (!DEBUG_PUNTOS) return;
  const fuera = [];
 
  Object.keys(proyectosData).forEach(function(nombreProv) {
    const paths = document.querySelectorAll('.provincia-path[title="' + nombreProv + '"]');
    proyectosData[nombreProv].proyectos.forEach(function(p) {
      const base = proyectar(p.lat, p.lon);
      let dentro = false;
      paths.forEach(function(path) {
        if (path.isPointInFill && path.isPointInFill(new DOMPoint(base.x, base.y))) dentro = true;
      });
      if (!dentro) fuera.push(p.id + " (" + p.canton + ", " + nombreProv + ")");
    });
  });
 
  if (fuera.length) {
    console.warn("Puntos fuera de su provincia en el SVG (revisar lat/lon):", fuera);
  } else {
    console.log("Todos los puntos caen dentro de su provincia.");
  }
}
 
// ==========================================================================
//  ZOOM AUTOMÁTICO: el viewBox se calcula con el tamaño real de la provincia
// ==========================================================================
 
// Vista nacional: ajusta el viewBox al tamaño real del mapa para que quede centrado en el cuadro
function viewBoxNacional() {
  const m = 20; // margen
  return (calibracion.x0 - m) + " " + (calibracion.y0 - m) + " " +
         (calibracion.ancho + 2 * m) + " " + (calibracion.alto + 2 * m);
}
 
function aplicarVistaNacional() {
  document.getElementById("mapa-svg-principal").setAttribute("viewBox", viewBoxNacional());
}
 
function calcularViewBox(nombreProvincia) {
  const paths = document.querySelectorAll('.provincia-path[title="' + nombreProvincia + '"]');
  if (!paths.length) return viewBoxNacional();
 
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  paths.forEach(function(path) {
    const b = path.getBBox();
    x0 = Math.min(x0, b.x);
    y0 = Math.min(y0, b.y);
    x1 = Math.max(x1, b.x + b.width);
    y1 = Math.max(y1, b.y + b.height);
  });
 
  const margen = 25;
  return (x0 - margen) + " " + (y0 - margen) + " " + (x1 - x0 + 2 * margen) + " " + (y1 - y0 + 2 * margen);
}
 
function aplicarZoomProvincia(nombreProvincia) {
  document.getElementById("mapa-svg-principal").setAttribute("viewBox", calcularViewBox(nombreProvincia));
}
 
// ==========================================================================
//  EVENTOS
// ==========================================================================
document.addEventListener("DOMContentLoaded", function() {
  calibrarMapa();
  aplicarVistaNacional();
  renderizarPuntosMapaGlobal();
  verificarPuntos();
 
  const elementos = document.querySelectorAll(".provincia-path");
  elementos.forEach(function(elem) {
    elem.addEventListener("click", function() {
      elementos.forEach(e => e.classList.remove("activo"));
      this.classList.add("activo");
 
      const nombreProvincia = this.getAttribute("title");
      if (nombreProvincia && proyectosData[nombreProvincia]) {
        provinciaActual = nombreProvincia;
        filtroProvinciaTipo = filtroGlobalTipo;
 
        aplicarZoomProvincia(nombreProvincia);
        mostrarInfoProvincia(provinciaActual);
      }
    });
  });
});
 
function restablecerVistaNacional() {
  provinciaActual = null;
  document.querySelectorAll(".provincia-path").forEach(e => e.classList.remove("activo"));
  aplicarVistaNacional();
 
  document.getElementById("provincia-etiqueta").innerText = "Todas las provincias";
  document.getElementById("provincia-titulo").innerText = "Panorama Nacional de Proyectos";
  document.getElementById("provincia-descripcion").innerText = "Haga clic en cualquier provincia para hacer zoom automático en su territorio o seleccione un marcador específico.";
  document.getElementById("eics-tabs").style.display = "none";
  document.getElementById("proyectos-lista").innerHTML = '<p class="eics-visor-placeholder">Seleccione una provincia en el mapa para ver sus detalles.</p>';
 
  renderizarPuntosMapaGlobal();
}
 
function cambiarFiltroGlobal(tipo) {
  filtroGlobalTipo = tipo;
  filtroProvinciaTipo = tipo;
 
  const botonesGlobales = document.querySelectorAll('.eics-filter-btn');
  botonesGlobales.forEach(btn => btn.classList.remove('active'));
  if (tipo === 'extension') {
    botonesGlobales[0].classList.add('active');
  } else {
    botonesGlobales[1].classList.add('active');
  }
 
  renderizarPuntosMapaGlobal();
 
  if (provinciaActual) {
    mostrarInfoProvincia(provinciaActual);
  }
}
 
function cambiarFiltroProvincia(tipo) {
  filtroProvinciaTipo = tipo;
  const botones = document.querySelectorAll('.eics-tab-btn');
  botones.forEach(btn => btn.classList.remove('active'));
  if (tipo === 'extension') {
    botones[0].classList.add('active');
  } else {
    botones[1].classList.add('active');
  }
 
  if (provinciaActual) {
    renderizarListaProyectos(provinciaActual);
  }
}
 
// ==========================================================================
//  PUNTOS EN EL MAPA
// ==========================================================================
function renderizarPuntosMapaGlobal() {
  const capaPuntos = document.getElementById("capa-puntos");
  capaPuntos.innerHTML = "";
 
  // 1) Reunir los proyectos del tipo seleccionado (de todas las provincias)
  const visibles = [];
  Object.keys(proyectosData).forEach(nombreProv => {
    proyectosData[nombreProv].proyectos.forEach(p => {
      const esExtension = p.tipo.toLowerCase().includes("extensión");
      if (filtroGlobalTipo === 'extension' ? esExtension : !esExtension) {
        visibles.push(p);
      }
    });
  });
 
  // 2) Calcular posición x, y desde lat/lon
  posicionarProyectos(visibles);
 
  // 3) Dibujar
  visibles.forEach(p => {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "proyecto-punto");
    g.setAttribute("id", "punto-" + p.id);
    g.onclick = function(e) {
      e.stopPropagation();
      seleccionarProyectoYProvincia(p.provincia, p.id);
    };
 
    const circuloExt = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circuloExt.setAttribute("cx", p.x);
    circuloExt.setAttribute("cy", p.y);
    circuloExt.setAttribute("r", "8");
    circuloExt.setAttribute("class", "punto-circulo-externo");
 
    const circuloInt = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circuloInt.setAttribute("cx", p.x);
    circuloInt.setAttribute("cy", p.y);
    circuloInt.setAttribute("r", "4");
    circuloInt.setAttribute("class", "punto-circulo-interno");
 
    g.appendChild(circuloExt);
    g.appendChild(circuloInt);
    capaPuntos.appendChild(g);
  });
}
 
function seleccionarProyectoYProvincia(nombreProvincia, proyectoId) {
  provinciaActual = nombreProvincia;
 
  document.querySelectorAll(".provincia-path").forEach(e => e.classList.remove("activo"));
  document.querySelectorAll('.provincia-path[title="' + nombreProvincia + '"]').forEach(e => e.classList.add("activo"));
 
  aplicarZoomProvincia(nombreProvincia);
 
  mostrarInfoProvincia(nombreProvincia);
  destacarProyecto(proyectoId);
}
 
// ==========================================================================
//  PANEL LATERAL
// ==========================================================================
function mostrarInfoProvincia(nombre) {
  document.getElementById("provincia-etiqueta").innerText = nombre;
  document.getElementById("provincia-titulo").innerText = "Proyectos en " + nombre;
 
  const info = proyectosData[nombre];
  if (info) {
    document.getElementById("provincia-descripcion").innerText = info.descripcion;
 
    const extensiones = info.proyectos.filter(p => p.tipo.toLowerCase().includes("extensión"));
    const investigaciones = info.proyectos.filter(p => p.tipo.toLowerCase().includes("investigación"));
 
    document.getElementById("count-ext").innerText = extensiones.length;
    document.getElementById("count-inv").innerText = investigaciones.length;
 
    document.getElementById("eics-tabs").style.display = "flex";
 
    const botonesTabs = document.querySelectorAll('.eics-tab-btn');
    botonesTabs[0].classList.remove('active');
    botonesTabs[1].classList.remove('active');
    if (filtroProvinciaTipo === 'extension') {
      botonesTabs[0].classList.add('active');
    } else {
      botonesTabs[1].classList.add('active');
    }
 
    renderizarListaProyectos(nombre);
  }
}
 
function renderizarListaProyectos(nombre) {
  const info = proyectosData[nombre];
  const contenedorLista = document.getElementById("proyectos-lista");
 
  const filtrados = info.proyectos.filter(p => {
    if (filtroProvinciaTipo === 'extension') {
      return p.tipo.toLowerCase().includes("extensión");
    } else {
      return p.tipo.toLowerCase().includes("investigación");
    }
  });
 
  let html = "";
  if (filtrados.length === 0) {
    html = `<p class="eics-visor-placeholder">No hay proyectos registrados en esta categoría para ${nombre}.</p>`;
  } else {
    filtrados.forEach(function(p) {
      let tipoClase = p.tipo.toLowerCase().includes("investigación") ? "investigacion" : "extension";
      html += `
        <div class="eics-proyectos-item" id="item-${p.id}" onclick="destacarProyecto('${p.id}')">
          <span class="eics-proyecto-nombre">${p.nombre}</span>
          <div class="eics-proyecto-detalles">
            <span class="badge-tipo ${tipoClase}">${p.tipo}</span>
            Periodo: ${p.ano} · Cantón: ${p.canton}
          </div>
        </div>`;
    });
  }
 
  contenedorLista.innerHTML = html;
}
 
function destacarProyecto(id) {
  document.querySelectorAll('.eics-proyectos-item').forEach(el => el.classList.remove('destacado'));
  document.querySelectorAll('.proyecto-punto').forEach(el => el.classList.remove('activo'));
 
  const itemLista = document.getElementById("item-" + id);
  const puntoMapa = document.getElementById("punto-" + id);
 
  if (itemLista) {
    itemLista.classList.add('destacado');
    itemLista.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
 
  if (puntoMapa) {
    puntoMapa.classList.add('activo');
  }
}