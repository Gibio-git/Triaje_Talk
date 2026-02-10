# 🏥 Documentación Técnica: Triaje_Talk

# 1. Descripción General
Triaje_Talk es una aplicación web interactiva (SPA) diseñada para la clasificación rápida de pacientes en entornos de salud. Su objetivo es determinar la urgencia médica mediante un algoritmo de puntos que evalúa datos demográficos, factores de riesgo y síntomas específicos.

El sistema destaca por ofrecer dos caminos al usuario:

Triaje Estructurado: Selección de síntomas por categorías con cálculo automático de puntos.

Triaje Narrativo: Un campo de texto libre para que el paciente explique su situación, conectándose vía webhook con servicios de procesamiento externo (IA/n8n).

# 2. Arquitectura de Archivos y Diseño
El proyecto se basa en una separación clara de responsabilidades:

index.html: Define el flujo de "hojas" (pasos). Utiliza contenedores vacíos que se rellenan dinámicamente para mantener el código limpio.

style.css (Estilo Clínico Pro): Implementa una interfaz profesional mediante:

CSS Grid: Los síntomas secundarios se organizan en dos columnas para maximizar el espacio visual.

Jerarquía Visual: Uso de barras laterales azules (border-left) y tarjetas con sombras para diferenciar categorías.

Diseño Responsivo: Adaptación automática a una sola columna en dispositivos móviles.

scripts.js: Gestiona la navegación, el cálculo de puntos y la interactividad.

sintomas.json: Actúa como la base de datos centralizada de síntomas y baremos de puntuación.

# 3. Lógica del Sistema de Puntuación
El puntaje de peligro se calcula de forma dinámica y reactiva mediante la función calculateScore(), sumando tres factores principales:

Edad (Baremo Dinámico): Los puntos se asignan según rangos definidos en el JSON (ej. recién nacidos o adultos mayores reciben una base de puntos más alta).

Estado de Riesgo: Se suman puntos adicionales por condiciones como el embarazo.

Selección Jerárquica:

Síntoma Padre: Activar una categoría (ej: Respiratorio) suma un puntaje base.

Síntoma Hijo: Especificar el síntoma (ej: Cianosis) suma puntos críticos adicionales.

# 4. Cómo realizar cambios futuros

Para mantener o escalar el sistema sin romper la lógica principal, sigue estas guías:

Agregar un síntoma: Solo edita sintomas.json. Crea una nueva llave con el prefijo p_ (ej: p_piel) y añade sus puntos y sub-síntomas. El script detectará el prefijo y lo dibujará automáticamente en la interfaz "Clínico Pro".

Cambiar la urgencia: Ajusta los valores de score directamente en el archivo JSON. El sistema recalcula los totales en tiempo real, por lo que no necesitas modificar ni una línea de JavaScript para ajustar la sensibilidad médica del test.

Modificar colores de Triaje: Si decides que el nivel "Rojo" debe ser más difícil de alcanzar, busca la función mostrarResultados() en scripts.js y ajusta los umbrales numéricos en las condiciones if/else (por ejemplo, subir el límite de 40 a 50 puntos).
