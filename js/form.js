// Form del sopralluogo: validazione lato client e messaggio di conferma.
// Nessun dato viene inviato: non c'è fetch e il form usa method="dialog".

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-sopralluogo");
  const success = document.getElementById("form-success");
  if (!form || !success) return;

  // Disattiva i fumetti di errore del browser: mostriamo messaggi nostri, in italiano
  form.noValidate = true;

  const fields = Array.from(form.querySelectorAll("input"));

  // Sceglie il messaggio in base al tipo di errore (testi negli attributi data-msg-*)
  function errorMessage(field) {
    if (field.validity.valueMissing) return field.dataset.msgMissing;
    if (!field.validity.valid) return field.dataset.msgInvalid;
    return "";
  }

  // Controlla un campo e aggiorna messaggio e stato aria-invalid
  function checkField(field) {
    const message = errorMessage(field) || "";
    const errorBox = document.getElementById(field.getAttribute("aria-describedby"));
    errorBox.textContent = message;
    field.setAttribute("aria-invalid", message ? "true" : "false");
    return message === "";
  }

  // Dopo il primo errore, il messaggio sparisce appena il campo viene corretto
  fields.forEach((field) => {
    const eventName = field.type === "checkbox" ? "change" : "input";
    field.addEventListener(eventName, () => {
      if (field.getAttribute("aria-invalid") === "true") checkField(field);
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const invalid = fields.filter((field) => !checkField(field));
    if (invalid.length > 0) {
      invalid[0].focus();
      return;
    }

    // Qui un sito reale invierebbe i dati a un server. Noi mostriamo solo la conferma.
    form.hidden = true;
    success.hidden = false;
    success.focus();
  });
});
