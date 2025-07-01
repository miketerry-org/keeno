function focusFirstFormInput() {
  // Delay to ensure Alpine-AJAX has finished updating DOM
  setTimeout(() => {
    const firstInput = document.querySelector(
      "main form input, main form textarea, main form select"
    );
    if (firstInput) {
      firstInput.focus();
    }
  }, 0);
}

document.addEventListener("DOMContentLoaded", focusFirstFormInput);
document.addEventListener("alpine:ajax:after", focusFirstFormInput);
