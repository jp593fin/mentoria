"use strict";

/*
 * Pega aquí la URL de la implementación pública de Google Apps Script.
 * Ejemplo: https://script.google.com/macros/s/XXXXXXXX/exec
 */
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzrs3o-Ve4Gx68IQmwb5r4JUCytLdX-Qi_3wwQ-hixzJD5YDXe5xJBOwDdn79c1FeuO/exec";

const STORAGE_KEY = "cuestionario_mentoria_v1";
const KIT_URL = "https://app.kit.com/forms/10246836/subscriptions";
const SEND_TIMEOUT_MS = 10000;

const questions = [
  {
    id: "nombre",
    type: "text",
    title: "¿Cómo te llamas?",
    required: true,
    inputType: "text",
    autocomplete: "name"
  },
  {
    id: "correo",
    type: "text",
    title: "¿Cuál es tu correo?",
    required: true,
    inputType: "email",
    autocomplete: "email"
  },
  {
    id: "pais",
    type: "choice",
    title: "¿En qué país vives?",
    required: true,
    options: ["México", "Ecuador", "España", "Estados Unidos", "Argentina", "Colombia", "Perú", "Chile", "Otro"],
    conditionalField: {
      id: "pais_otro",
      title: "¿Cuál?",
      required: true
    }
  },
  {
    id: "whatsapp",
    type: "text",
    title: "¿Tu WhatsApp?",
    help: "Con código de país. Opcional.",
    required: false,
    inputType: "tel",
    autocomplete: "tel"
  },
  {
    id: "nivel",
    type: "choice",
    title: "¿Qué nivel te interesa?",
    required: true,
    options: [
      {
        value: "Arranque",
        title: "Arranque · $90",
        subtitle: "Sesión de 60 min, plan escrito y un seguimiento en la semana 4."
      },
      {
        value: "Acompañamiento 90 días",
        title: "Acompañamiento 90 días · $225",
        subtitle: "Sesión de 90 min, plan escrito, dos seguimientos, un mensaje por semana y revisión al día 90."
      },
      {
        value: "No sé, recomiéndame",
        title: "No sé, recomiéndame",
        subtitle: "Con tus respuestas te digo cuál te conviene."
      }
    ]
  },
  {
    id: "objetivo",
    type: "choice",
    title: "¿Cuál es tu objetivo principal?",
    required: true,
    options: ["Crear patrimonio a largo plazo", "Generar ingresos", "Proteger mis ahorros", "Otro"],
    optionalField: {
      id: "objetivo_secundario",
      title: "¿Hay otro objetivo que también quieras trabajar? (Opcional)",
      required: false
    },
    conditionalField: {
      id: "objetivo_otro",
      title: "¿Cuál?",
      required: true
    }
  },
  {
    id: "plazo",
    type: "choice",
    title: "¿En cuántos años necesitarás este dinero?",
    required: true,
    options: ["Menos de 3", "3 a 10", "Más de 10"]
  },
  {
    id: "ahorros",
    type: "choice",
    title: "¿Cuánto tienes ahorrado y listo para invertir? (USD)",
    help: "Usa rangos; no necesito cifras exactas.",
    required: true,
    options: ["Menos de $1,000", "$1,000 a menos de $5,000", "$5,000 a $20,000", "Más de $20,000"]
  },
  {
    id: "aporte_mensual",
    type: "choice",
    title: "¿Cuánto podrías aportar cada mes? (USD)",
    required: true,
    options: ["Nada por ahora", "Más de $0 y menos de $100", "$100 a $300", "Más de $300"]
  },
  {
    id: "fondo_emergencia",
    type: "choice",
    title: "¿Tienes ahorros aparte para emergencias (3 meses de gastos o más)?",
    required: true,
    options: ["Sí", "No"]
  },
  {
    id: "deuda_cara",
    type: "choice",
    title: "¿Tienes deudas con intereses altos, como tarjetas de crédito?",
    required: true,
    options: ["Sí", "No"]
  },
  {
    id: "experiencia",
    type: "choice",
    title: "¿Has invertido antes?",
    required: true,
    options: ["Nunca", "Solo depósitos a plazo fijo", "Bolsa o fondos", "Otro"],
    conditionalField: {
      id: "experiencia_otro",
      title: "¿Cuál?",
      required: true
    }
  },
  {
    id: "broker",
    type: "choice",
    title: "¿Tienes cuenta en un bróker?",
    required: true,
    options: ["No", "En proceso", "Sí"],
    conditionalField: {
      id: "broker_cual",
      title: "¿En cuál?",
      required: true,
      showWhen: "Sí"
    }
  },
  {
    id: "envio_dinero",
    type: "text",
    title: "¿Cómo piensas enviar dinero al exterior para invertir?",
    help: "Si aún no lo sabes, escribe «No sé»; lo vemos en la sesión.",
    required: false,
    inputType: "text"
  },
  {
    id: "freno",
    type: "multiple",
    title: "¿Qué te ha frenado hasta ahora para empezar a invertir?",
    help: "Elige una o dos opciones. Si ya marcaste dos, desmarca una para cambiarla.",
    required: true,
    maxChoices: 2,
    options: [
      "No sé por dónde empezar",
      "Me preocupa perder dinero",
      "No sé qué bróker usar",
      "Me falta tiempo para investigar",
      "Otro"
    ],
    conditionalField: {
      id: "freno_otro",
      title: "¿Qué más te ha frenado?",
      required: true
    }
  },
  {
    id: "caida_20",
    type: "choice",
    title: "Tu portafolio cae 20% en un mes. ¿Qué harías?",
    help: "No hay respuesta correcta; esto define tu perfil.",
    required: true,
    options: ["Vendería todo", "Vendería una parte", "No haría nada", "Compraría más"]
  },
  {
    id: "expectativa",
    type: "textarea",
    title: "¿Qué esperas lograr con la mentoría? (Opcional)",
    help: "Con una frase basta. Por ejemplo: «Quiero salir con un plan y saber cómo hacer mi primera inversión».",
    required: false
  },
  {
    id: "confirmacion",
    type: "confirmation",
    title: "Antes de enviar",
    required: true
  }
];

const state = {
  currentIndex: 0,
  answers: {},
  started: false,
  sending: false,
  submitted: false,
  honeypot: ""
};

const elements = {
  startScreen: document.getElementById("start-screen"),
  questionScreen: document.getElementById("question-screen"),
  finalScreen: document.getElementById("final-screen"),
  resumeScreen: document.getElementById("resume-screen"),
  startButton: document.getElementById("start-button"),
  resumeButton: document.getElementById("resume-button"),
  restartButton: document.getElementById("restart-button"),
  questionForm: document.getElementById("question-form"),
  questionContent: document.getElementById("question-content"),
  formError: document.getElementById("form-error"),
  backButton: document.getElementById("back-button"),
  nextButton: document.getElementById("next-button"),
  progressArea: document.getElementById("progress-area"),
  progressLabel: document.getElementById("progress-label"),
  progressBar: document.getElementById("progress-bar"),
  finalContent: document.getElementById("final-content"),
  website: document.getElementById("website")
};

document.addEventListener("DOMContentLoaded", initialize);

function initialize() {
  elements.startButton.addEventListener("click", startNew);
  elements.resumeButton.addEventListener("click", resumeSaved);
  elements.restartButton.addEventListener("click", startNew);
  elements.questionForm.addEventListener("submit", handleSubmit);
  elements.backButton.addEventListener("click", goBack);

  const saved = loadSavedState();

  if (saved && saved.answers && Object.keys(saved.answers).length > 0) {
    state.answers = saved.answers;
    // Conserva como «Otro» las respuestas del antiguo campo de texto.
    if (typeof state.answers.freno === "string" && state.answers.freno.trim()) {
      state.answers.freno_otro = state.answers.freno;
      state.answers.freno = ["Otro"];
    }
    const visible = getVisibleQuestions();
    state.currentIndex = Math.max(0, Math.min(
      Number.isInteger(saved.currentIndex) ? saved.currentIndex : 0,
      visible.length - 1
    ));
    // El rango anterior incluía un límite ambiguo. Pide elegirlo de nuevo.
    for (const [id, previousRange] of [
      ["ahorros", "$1,000 a $5,000"],
      ["aporte_mensual", "Hasta $100"]
    ]) {
      if (state.answers[id] === previousRange) {
        delete state.answers[id];
        state.currentIndex = Math.min(state.currentIndex, visible.findIndex(question => question.id === id));
      }
    }
    elements.startScreen.hidden = true;
    elements.resumeScreen.hidden = false;
  }
}

function startNew() {
  state.answers = {};
  state.currentIndex = 0;
  state.started = true;
  state.submitted = false;
  state.sending = false;
  clearSavedState();
  showQuestionScreen();
}

function resumeSaved() {
  state.started = true;
  elements.resumeScreen.hidden = true;
  showQuestionScreen();
}

function showQuestionScreen() {
  elements.startScreen.hidden = true;
  elements.resumeScreen.hidden = true;
  elements.finalScreen.hidden = true;
  elements.questionScreen.hidden = false;
  elements.progressArea.hidden = false;
  renderQuestion();
}

function getVisibleQuestions() {
  return questions.filter((question) => {
    if (question.id === "envio_dinero") {
      return state.answers.broker !== "Sí";
    }
    return true;
  });
}

function getCurrentQuestion() {
  const visible = getVisibleQuestions();
  return visible[state.currentIndex] || visible[visible.length - 1];
}

function renderQuestion() {
  const visible = getVisibleQuestions();

  if (state.currentIndex >= visible.length) {
    state.currentIndex = visible.length - 1;
  }

  const question = getCurrentQuestion();
  const position = visible.indexOf(question) + 1;

  elements.progressLabel.textContent = `Pregunta ${position} de ${visible.length}`;
  elements.progressBar.style.width = `${(position / visible.length) * 100}%`;
  elements.backButton.hidden = position === 1;
  elements.formError.hidden = true;
  elements.questionContent.innerHTML = "";

  const wrapper = document.createElement("div");

  const number = document.createElement("div");
  number.className = "question-number";
  number.textContent = `Pregunta ${position}`;
  wrapper.appendChild(number);

  const title = document.createElement("h1");
  title.className = "question-title";
  title.textContent = question.title;
  wrapper.appendChild(title);

  if (question.help) {
    const help = document.createElement("p");
    help.className = "question-help";
    help.id = "question-help";
    help.textContent = question.help;
    wrapper.appendChild(help);
  }

  if (question.type === "choice") {
    renderChoiceQuestion(wrapper, question);
  } else if (question.type === "multiple") {
    renderMultipleQuestion(wrapper, question);
  } else if (question.type === "confirmation") {
    renderConfirmationQuestion(wrapper);
  } else {
    renderTextQuestion(wrapper, question);
  }

  elements.questionContent.appendChild(wrapper);
  updateNextButton();
  saveProgress();

  requestAnimationFrame(() => {
    const firstFocusable = wrapper.querySelector(".option[tabindex='0']") ||
      wrapper.querySelector("input, textarea, button");
    if (firstFocusable) firstFocusable.focus();
  });
}

function renderChoiceQuestion(wrapper, question) {
  const list = document.createElement("div");
  list.className = "option-list";
  list.setAttribute("role", "radiogroup");
  list.setAttribute("aria-label", question.title);
  const selectedValue = state.answers[question.id];

  question.options.forEach((option, index) => {
    const optionValue = typeof option === "string" ? option : option.value;
    const optionTitle = typeof option === "string" ? option : option.title;
    const optionSubtitle = typeof option === "string" ? "" : option.subtitle;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "option";
    button.dataset.value = optionValue;
    button.setAttribute("role", "radio");
    button.setAttribute("aria-checked", String(state.answers[question.id] === optionValue));
    button.tabIndex = selectedValue === optionValue || (!selectedValue && index === 0) ? 0 : -1;

    if (state.answers[question.id] === optionValue) {
      button.classList.add("selected");
    }

    const optionText = document.createElement("span");
    optionText.className = "option-title";
    optionText.textContent = optionTitle;
    button.appendChild(optionText);

    if (optionSubtitle) {
      const subtitle = document.createElement("span");
      subtitle.className = "option-subtitle";
      subtitle.textContent = optionSubtitle;
      button.appendChild(subtitle);
    }

    button.addEventListener("click", () => selectChoice(question, optionValue));

    button.addEventListener("keydown", (event) => {
      const buttons = [...list.querySelectorAll(".option")];
      const current = buttons.indexOf(button);

      if (event.key === "ArrowDown" || event.key === "ArrowRight") {
        event.preventDefault();
        buttons[(current + 1) % buttons.length].focus();
      }

      if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
        event.preventDefault();
        buttons[(current - 1 + buttons.length) % buttons.length].focus();
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectChoice(question, optionValue);
      }
    });

    list.appendChild(button);
  });

  wrapper.appendChild(list);

  if (question.conditionalField) {
    const conditional = question.conditionalField;
    const visible =
      state.answers[question.id] === "Otro" ||
      state.answers[question.id] === conditional.showWhen;

    if (visible) {
      renderConditionalTextField(wrapper, conditional);
    }
  }
  if (question.optionalField) {
    renderConditionalTextField(wrapper, question.optionalField);
  }
}

function renderMultipleQuestion(wrapper, question) {
  const group = document.createElement("div");
  group.className = "confirmations";
  group.setAttribute("role", "group");
  group.setAttribute("aria-label", question.title);
  group.setAttribute("aria-describedby", "question-help");
  wrapper.appendChild(group);

  const details = document.createElement("div");
  const otherInput = renderConditionalTextField(details, question.conditionalField);
  wrapper.appendChild(details);

  const checkboxes = question.options.map((option) => {
    const label = document.createElement("label");
    label.className = "checkbox-label";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = question.id;
    checkbox.value = option;
    const text = document.createElement("span");
    text.textContent = option;
    label.appendChild(checkbox);
    label.appendChild(text);
    group.appendChild(label);
    return checkbox;
  });

  function refreshSelection() {
    const selected = Array.isArray(state.answers[question.id]) ? state.answers[question.id] : [];
    for (const checkbox of checkboxes) {
      checkbox.checked = selected.includes(checkbox.value);
      checkbox.disabled = !checkbox.checked && selected.length >= question.maxChoices;
    }
    details.hidden = !selected.includes("Otro");
    otherInput.disabled = details.hidden;
    updateNextButton();
  }

  for (const checkbox of checkboxes) {
    checkbox.addEventListener("change", () => {
      state.answers[question.id] = checkboxes
        .filter(item => item.checked)
        .map(item => item.value);
      refreshSelection();
      saveProgress();
    });
  }
  refreshSelection();
}

function renderConditionalTextField(wrapper, field) {
  const label = document.createElement("label");
  label.className = "field-label";
  label.htmlFor = field.id;
  label.textContent = field.title;
  wrapper.appendChild(label);

  const input = document.createElement("input");
  input.className = "text-input";
  input.id = field.id;
  input.name = field.id;
  input.type = "text";
  input.value = state.answers[field.id] || "";
  input.required = field.required;
  if (field.id === "objetivo_secundario") input.maxLength = 300;
  input.addEventListener("input", () => {
    state.answers[field.id] = input.value;
    saveProgress();
    updateNextButton();
  });

  wrapper.appendChild(input);
  return input;
}

function renderTextQuestion(wrapper, question) {
  const label = document.createElement("label");
  label.className = "field-label";
  label.htmlFor = question.id;
  label.textContent = question.title;
  label.hidden = true;
  wrapper.appendChild(label);

  const field = question.type === "textarea"
    ? document.createElement("textarea")
    : document.createElement("input");

  field.className = question.type === "textarea" ? "text-area" : "text-input";
  field.id = question.id;
  field.name = question.id;
  field.required = question.required;
  if (question.help) field.setAttribute("aria-describedby", "question-help");
  field.value = state.answers[question.id] || "";

  if (question.type !== "textarea") {
    field.type = question.inputType || "text";
    if (question.autocomplete) field.autocomplete = question.autocomplete;
  }

  field.addEventListener("input", () => {
    state.answers[question.id] = field.value;
    saveProgress();
    updateNextButton();
  });

  wrapper.appendChild(field);
}

function renderConfirmationQuestion(wrapper) {
  const confirmations = document.createElement("div");
  confirmations.className = "confirmations";

  const values = [
    {
      id: "confirmacion_educativa",
      text: "Entiendo que la mentoría es educativa, que toda inversión conlleva riesgo y que yo tomo y ejecuto mis propias decisiones."
    },
    {
      id: "confirmacion_verdad",
      text: "Mis respuestas son verdaderas según mi mejor conocimiento."
    }
  ];

  values.forEach((item) => {
    const label = document.createElement("label");
    label.className = "checkbox-label";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = item.id;
    input.checked = state.answers[item.id] === true;

    input.addEventListener("change", () => {
      state.answers[item.id] = input.checked;
      saveProgress();
      updateNextButton();
    });

    const text = document.createElement("span");
    text.textContent = item.text;

    label.appendChild(input);
    label.appendChild(text);
    confirmations.appendChild(label);
  });

  wrapper.appendChild(confirmations);
}

function selectChoice(question, value) {
  state.answers[question.id] = value;

  if (question.conditionalField) {
    const conditional = question.conditionalField;
    const shouldClear =
      value !== "Otro" &&
      value !== conditional.showWhen;

    if (shouldClear) {
      delete state.answers[conditional.id];
    }
  }

  renderQuestion();
}

function handleSubmit(event) {
  event.preventDefault();

  if (!validateCurrentQuestion(true)) return;
  goNext();
}

function validateCurrentQuestion(showError = true) {
  const question = getCurrentQuestion();
  let message = "";

  if (question.type === "multiple") {
    message = validateMultipleAnswer(question);
  }

  if (question.type === "choice") {
    if (!state.answers[question.id]) {
      message = "Selecciona una opción para continuar.";
    } else if (question.conditionalField) {
      const conditional = question.conditionalField;
      const visible =
        state.answers[question.id] === "Otro" ||
        state.answers[question.id] === conditional.showWhen;

      if (visible && !String(state.answers[conditional.id] || "").trim()) {
        message = "Completa este campo para continuar.";
      }
    }
  }

  if (question.type === "text" || question.type === "textarea") {
    const value = String(state.answers[question.id] || "").trim();

    if (question.required && !value) {
      message = "Completa este campo para continuar.";
    }

    if (question.id === "correo" && value && !isValidEmail(value)) {
      message = "Escribe un correo válido para continuar.";
    }
  }

  if (question.type === "confirmation") {
    if (
      state.answers.confirmacion_educativa !== true ||
      state.answers.confirmacion_verdad !== true
    ) {
      message = "Marca las dos casillas para poder enviar tus respuestas.";
    }
  }

  if (showError) {
    elements.formError.textContent = message;
    elements.formError.hidden = !message;
  }

  return !message;
}

function updateNextButton() {
  const question = getCurrentQuestion();

  if (!question) return;

  if (question.type === "confirmation") {
    elements.nextButton.textContent = "Enviar";
    elements.nextButton.disabled =
      state.answers.confirmacion_educativa !== true ||
      state.answers.confirmacion_verdad !== true ||
      state.sending;
    return;
  }

  elements.nextButton.textContent = "Siguiente";
  elements.nextButton.disabled =
    question.required && !hasCurrentValue(question);
}

function hasCurrentValue(question) {
  if (question.type === "multiple") return !validateMultipleAnswer(question);

  if (question.type === "choice") {
    if (!state.answers[question.id]) return false;

    if (question.conditionalField) {
      const conditional = question.conditionalField;
      const visible =
        state.answers[question.id] === "Otro" ||
        state.answers[question.id] === conditional.showWhen;

      if (visible && !String(state.answers[conditional.id] || "").trim()) {
        return false;
      }
    }

    return true;
  }

  if (question.type === "confirmation") {
    return (
      state.answers.confirmacion_educativa === true &&
      state.answers.confirmacion_verdad === true
    );
  }

  return Boolean(String(state.answers[question.id] || "").trim());
}

function validateMultipleAnswer(question) {
  const selected = state.answers[question.id];
  if (!Array.isArray(selected) || selected.length === 0 || selected.length > question.maxChoices) {
    return "Elige una o dos opciones para continuar.";
  }
  if (selected.includes("Otro") && !getAnswer(question.conditionalField.id).trim()) {
    return "Cuéntame qué más te ha frenado para continuar.";
  }
  return "";
}

function goNext() {
  if (!validateCurrentQuestion(true)) return;

  const visible = getVisibleQuestions();

  if (state.currentIndex < visible.length - 1) {
    state.currentIndex += 1;
    renderQuestion();
    return;
  }

  submitAnswers();
}

function goBack() {
  const visible = getVisibleQuestions();

  if (state.currentIndex > 0) {
    state.currentIndex -= 1;
    renderQuestion();
  }
}

async function submitAnswers() {
  if (state.sending) return;

  state.sending = true;
  elements.nextButton.textContent = "Enviando…";
  elements.nextButton.disabled = true;
  elements.backButton.disabled = true;
  elements.formError.hidden = true;

  const recommendation = calculateRecommendation();
  const payload = buildPayload(recommendation);
  const honeypot = elements.website.value.trim();

  if (honeypot) {
    clearSavedState();
    state.submitted = true;
    showFinal(payload, recommendation.explicacion);
    return;
  }

  const kitPromise = sendToKit(payload);
  const appsScriptPromise = sendToAppsScript(payload);

  const results = await Promise.allSettled([
    withTimeout(kitPromise, SEND_TIMEOUT_MS),
    withTimeout(appsScriptPromise, SEND_TIMEOUT_MS)
  ]);

  const appsScriptResult = results[1];

  if (appsScriptResult.status === "rejected") {
    state.sending = false;
    elements.backButton.disabled = false;
    elements.nextButton.textContent = "Enviar";
    elements.nextButton.disabled = false;
    elements.formError.innerHTML =
      "No pudimos enviar tus respuestas. Escríbeme a " +
      "<a href=\"mailto:finanzas@juanvotruba.com\">finanzas@juanvotruba.com</a>.";
    elements.formError.hidden = false;

    const retry = document.createElement("button");
    retry.type = "button";
    retry.className = "button button-secondary";
    retry.textContent = "Reintentar";
    retry.style.marginTop = "12px";
    retry.addEventListener("click", submitAnswers);
    elements.formError.appendChild(document.createElement("br"));
    elements.formError.appendChild(retry);
    return;
  }

  clearSavedState();
  state.submitted = true;
  showFinal(payload, recommendation.explicacion);
}

function buildPayload(recommendation) {
  return {
    fecha: new Date().toISOString(),
    nombre: getAnswer("nombre"),
    correo: getAnswer("correo"),
    pais: getAnswer("pais"),
    pais_otro: getAnswer("pais_otro"),
    whatsapp: getAnswer("whatsapp"),
    nivel: getAnswer("nivel"),
    objetivo: getAnswer("objetivo"),
    objetivo_otro: getAnswer("objetivo_otro"),
    plazo: getAnswer("plazo"),
    ahorros: getAnswer("ahorros"),
    aporte_mensual: getAnswer("aporte_mensual"),
    fondo_emergencia: getAnswer("fondo_emergencia"),
    deuda_cara: getAnswer("deuda_cara"),
    experiencia: getAnswer("experiencia"),
    experiencia_otro: getAnswer("experiencia_otro"),
    broker: getAnswer("broker"),
    broker_cual: getAnswer("broker_cual"),
    envio_dinero: getAnswer("envio_dinero"),
    freno: formatFreno(),
    caida_20: getAnswer("caida_20"),
    expectativa: getAnswer("expectativa"),
    estado: recommendation.estado,
    motivos: recommendation.motivos,
    sugerencia: recommendation.sugerencia,
    website: elements.website.value.trim(),
    objetivo_secundario: getAnswer("objetivo_secundario").trim()
  };
}

function formatFreno() {
  const selected = getAnswer("freno");
  if (!Array.isArray(selected)) return selected;
  return selected.map(option => option === "Otro"
    ? `Otro: ${getAnswer("freno_otro").trim()}`
    : option
  ).join(" · ");
}

function calculateRecommendation() {
  const motivos = [];

  if (state.answers.fondo_emergencia === "No") {
    motivos.push("sin fondo de emergencia");
  }

  if (state.answers.deuda_cara === "Sí") {
    motivos.push("deuda con intereses altos");
  }

  if (state.answers.plazo === "Menos de 3") {
    motivos.push("plazo menor a 3 años");
  }

  if (motivos.length > 0) {
    return {
      estado: "NO LISTO",
      motivos,
      sugerencia: ""
    };
  }

  if (state.answers.nivel === "Arranque") {
    return {
      estado: "LISTO",
      motivos: [],
      sugerencia: "Arranque"
    };
  }

  if (state.answers.nivel === "Acompañamiento 90 días") {
    return {
      estado: "LISTO",
      motivos: [],
      sugerencia: "Acompañamiento 90 días"
    };
  }

  const ahorrosAmplios =
    state.answers.ahorros === "$5,000 a $20,000" ||
    state.answers.ahorros === "Más de $20,000";

  const principianteEnBolsaOFondos =
    state.answers.experiencia === "Nunca" ||
    state.answers.experiencia === "Solo depósitos a plazo fijo";

  const principianteConAporte =
    principianteEnBolsaOFondos &&
    (state.answers.aporte_mensual === "$100 a $300" ||
      state.answers.aporte_mensual === "Más de $300");

  return {
    estado: "LISTO",
    motivos: [],
    sugerencia:
      ahorrosAmplios || principianteConAporte
        ? "Acompañamiento 90 días"
        : "Arranque",
    explicacion: ahorrosAmplios
      ? "Por el monto que ya tienes ahorrado, te propongo un plan con varios seguimientos."
      : principianteConAporte
        ? "Como estás empezando en bolsa o fondos y puedes aportar al menos $100 al mes, te propongo apoyo durante tus primeros pasos."
        : "Por tu combinación de ahorro, aporte mensual y experiencia, una sesión inicial y un seguimiento son un buen punto de partida."
  };
}

async function sendToKit(payload) {
  const formData = new FormData();
  formData.append("email_address", payload.correo);
  formData.append("first_name", payload.nombre);
  formData.append("fields[pais]", payload.pais === "Otro" ? "Otro" : payload.pais);

  const kitLevel = {
    "Arranque": "Arranque",
    "Acompañamiento 90 días": "90 días",
    "No sé, recomiéndame": "No sé"
  }[payload.nivel] || "";

  formData.append("fields[nivel_mentoria]", kitLevel);

  await fetch(KIT_URL, {
    method: "POST",
    mode: "no-cors",
    body: formData
  });
}

async function sendToAppsScript(payload) {
  if (!APPS_SCRIPT_URL.trim()) {
    throw new Error("APPS_SCRIPT_URL no está configurada.");
  }

  await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(payload)
  });
}

function showFinal(payload, explicacion) {
  elements.questionScreen.hidden = true;
  elements.progressArea.hidden = true;
  elements.finalScreen.hidden = false;
  elements.finalContent.innerHTML = "";

  const firstName = getFirstName(payload.nombre);
  const title = document.createElement("h1");
  title.textContent = `¡Listo, ${firstName}!`;
  elements.finalContent.appendChild(title);

  const message = document.createElement("p");
  message.className = "final-message";

  if (payload.estado === "NO LISTO") {
    message.textContent =
      "Gracias por tu sinceridad. Antes de invertir en bolsa conviene resolver primero:";
    elements.finalContent.appendChild(message);

    const list = document.createElement("ul");
    list.className = "reason-list";

    payload.motivos.forEach((motivo) => {
      const item = document.createElement("li");
      item.textContent = motivo;
      list.appendChild(item);
    });

    elements.finalContent.appendChild(list);

    const closing = document.createElement("p");
    closing.className = "final-message";
    closing.textContent =
      "Te escribo en menos de 24 horas hábiles con los pasos para llegar ahí.";
    elements.finalContent.appendChild(closing);
  } else {
    const planMessage = payload.nivel === "No sé, recomiéndame"
      ? `Por tus respuestas, te sugiero ${payload.sugerencia}. ${explicacion}`
      : `Elegiste ${payload.nivel}.`;
    message.textContent =
      planMessage + " " +
      "Te confirmo por correo en menos de 24 horas hábiles y coordinamos la fecha de tu sesión.";
    elements.finalContent.appendChild(message);

    const priceBox = document.createElement("div");
    priceBox.className = "price-box";
    priceBox.textContent =
      "Precios de lanzamiento hasta el 31 de diciembre de 2026: " +
      "Arranque $90 · Acompañamiento 90 días $225. " +
      "Si empiezas con Arranque, puedes pasarte a Acompañamiento en los 30 días siguientes " +
      "a tu sesión inicial pagando solo la diferencia ($135).";
    elements.finalContent.appendChild(priceBox);
  }

  const note = document.createElement("p");
  note.className = "final-note";
  note.textContent =
    "Revisa tu correo (y la carpeta de spam) en las próximas horas.";
  elements.finalContent.appendChild(note);
}

function getAnswer(key) {
  return state.answers[key] == null ? "" : state.answers[key];
}

function getFirstName(fullName) {
  return String(fullName || "").trim().split(/\s+/)[0] || "ahí";
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function withTimeout(promise, milliseconds) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Tiempo de espera agotado.")), milliseconds);
    })
  ]);
}

function saveProgress() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        currentIndex: state.currentIndex,
        answers: state.answers
      })
    );
  } catch (_error) {
    // La aplicación continúa funcionando aunque el navegador bloquee localStorage.
  }
}

function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
}

function clearSavedState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (_error) {
    // No interrumpir el flujo si localStorage no está disponible.
  }
}
