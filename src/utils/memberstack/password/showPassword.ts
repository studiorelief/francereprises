// <!-- 💙 MEMBERSCRIPT #45 v0.2 💙 SHOW AND HIDE PASSWORD -->

export function showPassword() {
  document.querySelectorAll("[ms-code-password='transform']").forEach(function (button) {
    button.addEventListener('click', transform);
  });

  let isPassword = true;

  function transform() {
    const passwordInputs = document.querySelectorAll(
      "[data-ms-member='password'], [data-ms-member='new-password'], [data-ms-member='current-password']"
    );

    passwordInputs.forEach(function (myInput) {
      // const inputType = myInput.getAttribute('type');

      if (isPassword) {
        myInput.setAttribute('type', 'text');
      } else {
        myInput.setAttribute('type', 'password');
      }
    });

    isPassword = !isPassword;
  }
}
