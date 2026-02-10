let sintomasScore = {};

// 1. CARGA INICIAL Y RENDERIZADO DINÁMICO
fetch("sintomas.json")
  .then(res => res.json())
  .then(data => {
    sintomasScore = data;
    renderizarSintomas(); // Genera la Hoja 4 automáticamente
  })
  .catch(err => console.error("Error cargando sintomas.json", err));

/**
 * Genera el HTML de la Hoja 4 basándose en el JSON.
 * Crea títulos para los padres y listas para los hijos.
 */

function renderizarSintomas() {
    const contenedor = document.getElementById('contenedor-sintomas');
    if (!contenedor) return;
    contenedor.innerHTML = ''; // Limpiar contenedor

    Object.entries(sintomasScore).forEach(([idPadre, info]) => {
        // FILTRO: Solo procesar IDs que empiecen con 'p_' y omitir config_puntajes
        if (!idPadre.startsWith('p_')) return;

        // Creamos el bloque del síntoma principal (Padre)
        const divPadre = document.createElement('div');
        divPadre.className = 'grupo-sintoma';
        divPadre.style.marginBottom = "15px";

        // Usamos la propiedad 'texto' del JSON o transformamos el ID si no existe
        const nombreMostrar = info.texto || idPadre.replace('p_', '').toUpperCase();

        divPadre.innerHTML = `
            <div class="padre-row" style="background: #f8f9fa; padding: 10px; border-radius: 5px;">
                <input type="checkbox" id="${idPadre}" onchange="toggleHijos('${idPadre}')">
                <label for="${idPadre}"><strong>${nombreMostrar}</strong></label>
            </div>
            <div id="sub_${idPadre}" class="hijos-container" style="display:none; margin-left: 30px; margin-top: 10px;">
            </div>
        `;

        contenedor.appendChild(divPadre);

        // Si el padre tiene hijos, los renderizamos dentro de su contenedor
        if (info.children) {
            const subContenedor = divPadre.querySelector(`#sub_${idPadre}`);
            Object.entries(info.children).forEach(([idHijo, infoHijo]) => {
                const nombreHijo = (typeof infoHijo === 'object' ? infoHijo.texto : idHijo.replace(/_/g, ' '));
                
                const divHijo = document.createElement('div');
                divHijo.style.marginBottom = "5px";
                divHijo.innerHTML = `
                    <input type="checkbox" id="${idHijo}" onchange="calculateScore()">
                    <label for="${idHijo}">${nombreHijo}</label>
                `;
                subContenedor.appendChild(divHijo);
            });
        }
    });
}

/**
 * Muestra/Oculta los subtítulos y recalcula el puntaje
 */
function toggleHijos(idPadre) {
    const checkboxPadre = document.getElementById(idPadre);
    const subContenedor = document.getElementById(`sub_${idPadre}`);
    
    if (subContenedor) {
        // CAMBIO: Usamos 'grid' para activar las dos columnas del CSS
        subContenedor.style.display = checkboxPadre.checked ? 'grid' : 'none';
        
        // Si desmarcamos al padre, desmarcamos automáticamente a todos los hijos
        if (!checkboxPadre.checked) {
            const hijos = subContenedor.querySelectorAll('input[type="checkbox"]');
            hijos.forEach(h => h.checked = false);
        }
    }
    // Recalcular el puntaje siempre al final
    calculateScore();
}

/**
 * Cambia entre páginas (SPA)
 */
function showPage(pageId) {
    document.querySelectorAll('.survey-page').forEach(page => {
        page.style.display = 'none';
    });
    const activePage = document.getElementById(pageId);
    if (activePage) activePage.style.display = 'block';
}

/**
 * Actualiza el slider de edad
 */
function updateEdadOutput(value) {
    const output = document.getElementById('edad-output');
    output.innerText = (value == 0) ? "< 1" : (value == 100) ? "99+" : value;
}

/**
 * CÁLCULO DE PUNTAJE (Lógica jerárquica)
 */


function calculateScore() {
    let totalScore = 0;
    const config = sintomasScore.config_puntajes; // Acceso a la nueva configuración

    if (config) {
        // 1. Puntaje por Edad Dinámico
        let edad = parseInt(document.getElementById('edad').value) || 0;
        const rangoEncontrado = config.edad.find(rango => edad >= rango.min && edad <= rango.max);
        if (rangoEncontrado) {
            totalScore += rangoEncontrado.puntos;
        }

        // 2. Embarazo Dinámico
        if (document.getElementById('emb_si').checked) {
            totalScore += config.embarazo;
        }

        // 3. Síntomas Graves Dinámico
        if (document.getElementById('sintomas_si').checked) {
            totalScore += config.graves;
        }
    }

    // 4. Síntomas Dinámicos (Padres e Hijos) - Se mantiene igual
    Object.entries(sintomasScore).forEach(([idPadre, info]) => {
        // Filtramos para no procesar la "config_puntajes" como si fuera un síntoma
        if (idPadre.startsWith('p_')) { 
            const checkPadre = document.getElementById(idPadre);
            if (checkPadre && checkPadre.checked) {
                totalScore += (info.score || 0);
                if (info.children) {
                    Object.entries(info.children).forEach(([idHijo, infoHijo]) => {
                        const checkHijo = document.getElementById(idHijo);
                        if (checkHijo && checkHijo.checked) {
                            totalScore += (infoHijo.score || 0);
                        }
                    });
                }
            }
        }
    });

    document.getElementById('score-value').innerText = totalScore;
}


/**
 * Muestra los resultados finales según el puntaje
 */
function mostrarResultados() {
    calculateScore();
    const finalScore = parseInt(document.getElementById('score-value').innerText);
    document.getElementById('final-score-value').innerText = finalScore;

    let levelText = "";
    let levelColor = "";

    if (finalScore >= 40) { levelText = "🔴 Rojo (Atención Inmediata)"; levelColor = "#e74c3c"; }
    else if (finalScore >= 20) { levelText = "🟠 Naranja (Urgencia)"; levelColor = "#e67e22"; }
    else if (finalScore >= 10) { levelText = "🟡 Amarillo (Diferable)"; levelColor = "#f1c40f"; }
    else if (finalScore >= 3) { levelText = "🟢 Verde (No Urgente)"; levelColor = "#2ecc71"; }
    else { levelText = "🔵 Azul (Consulta General)"; levelColor = "#3498db"; }

    const triageElement = document.getElementById('final-triage-level');
    triageElement.innerHTML = levelText;
    triageElement.style.color = levelColor;

    document.getElementById('score-display').style.display = 'none';
    showPage('hojaFinal');
}

/**
 * Envío de datos a n8n
 */
function enviarNarrativa() {
    const formData = {
        respondiente: document.querySelector('input[name="respondiente"]:checked')?.value || 'N/A',
        edad: document.getElementById('edad').value,
        sexo: document.querySelector('input[name="sexo"]:checked')?.value || 'N/A',
        embarazo: document.querySelector('input[name="embarazo"]:checked')?.value || 'no',
        narrativa: document.getElementById('narrativa').value,
        puntaje: document.getElementById('score-value').innerText,
        origen: "github-pages"
    };

    fetch("https://creactivehub.app.n8n.cloud/webhook/from-ghpages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
    })
    .then(() => {
        document.getElementById('narrative-buttons').style.display = 'none';
        document.getElementById('narrativa').disabled = true;
        document.getElementById('after-send-message').style.display = 'block';
    })
    .catch(err => console.error("Error al enviar:", err));
}

/**
 * Reset completo del sistema
 */
function reiniciarEncuesta() {
    document.getElementById('multiStepForm').reset();
    document.getElementById('score-display').style.display = 'block';
    document.getElementById('narrativa').disabled = false;
    document.getElementById('narrative-buttons').style.display = 'block';
    document.getElementById('after-send-message').style.display = 'none';
    
    // Ocultar todos los subcontenedores de síntomas
    document.querySelectorAll('.hijos-container').forEach(c => c.style.display = 'none');
    
    calculateScore();
    showPage('hoja1');
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => showPage('hoja1'));
const mainForm = document.getElementById('multiStepForm');
mainForm.addEventListener('change', calculateScore);
mainForm.addEventListener('input', calculateScore);