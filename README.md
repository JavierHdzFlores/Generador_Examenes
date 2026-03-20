# 🧠 Generador de Exámenes Inteligente

Bienvenido al repositorio del **Generador de Exámenes**, una aplicación web full-stack diseñada para evaluar conocimientos sobre diversas áreas de interés mediante la generación automática de preguntas utilizando Inteligencia Artificial.

## 📖 Descripción del Proyecto

Este sistema permite a los estudiantes poner a prueba sus conocimientos resolviendo cuestionarios generados dinámicamente. Utiliza la **API de Google Gemini** para crear un banco de preguntas y respuestas precisas sobre temas específicos. Además, el sistema gestiona cuentas de usuario, registra el historial de calificaciones y permite la administración completa del banco de preguntas.

## 🚀 Características Principales

* **Generación con IA:** Integración con Google Gemini API para crear preguntas de opción múltiple con sus respectivas respuestas y distractores.
* **Gestión de Usuarios:** Sistema de registro y página de Login.
* **CRUD de Preguntas y Respuestas:** Interfaz para que los administradores puedan crear, leer, actualizar y eliminar elementos del banco de preguntas.
* **CRUD de Puntajes:** Registro automático de las calificaciones obtenidas por los usuarios al finalizar un examen, con capacidad de visualización de historial.

## 🛠️ Stack Tecnológico (Propuesto)

* **Frontend:** React.js / Vite (con Tailwind CSS para estilos rápidos).
* **Backend:** Node.js con Express (o Python con FastAPI).
* **Base de Datos:** PostgreSQL (Base de datos relacional).
* **Inteligencia Artificial:** Google Gemini 1.5 API.
* **Testing (Fase 2):** Playwright (E2E) y Jest/Vitest (Unitarias).

## 📂 Estructura del Repositorio

El repositorio está organizado en fases de entrega:

* `/propuesta`: Contiene los entregables de la primera fase de diseño (Modelo de Base de Datos, Propuesta de API Restful y Mockups/Pantallas). Consulta el `README.md` dentro de esa carpeta para ver los detalles técnicos.
* `/frontend`: (Próximamente) Código fuente de la interfaz de usuario.
* `/backend`: (Próximamente) Código fuente de la API y conexión a la base de datos.

## 👥 Equipo de Desarrollo

Proyecto desarrollado para el 3er Parcial por:
*[Hernandez Flores Javier]
*[Gonzalez Giron Luis Eduardo]
*[Suárez Dolores Miguel]


---
*Nota: La implementación en vivo, video demostrativo y pruebas automatizadas (Playwright) se entregarán en la siguiente fase (23 de marzo).*
