document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
      loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        try {
          const response = await fetch("/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
          });

          if (response.ok) {
            // Se o login for bem-sucedido, redirecione para a página index
            window.location.href = "/index.html";
          } else {
            // Se o login falhar, exiba a mensagem de erro
            const errorMessage = await response.text();
            displayError(errorMessage);
          }
        } catch (error) {
          console.error("Erro ao fazer login:", error);
          displayError("Ocorreu um erro ao fazer login.");
        }
      });
    }
  });

  function displayError(message) {
    const notificationArea = document.getElementById("notification-area");

    const notification = document.createElement("div");
    notification.className = "notification is-danger";
    notification.innerHTML = `
      <button class="delete"></button>
      ${message}
    `;

    notificationArea.appendChild(notification);

    notification.querySelector(".delete").addEventListener("click", () => {
      notificationArea.removeChild(notification);
    });

    setTimeout(() => {
      if (notificationArea.contains(notification)) {
        notificationArea.removeChild(notification);
      }
    }, 5000);
  }