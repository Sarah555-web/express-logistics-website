const SUPABASE_URL = "https://uxcfvlbnrwcqfeudmpbg.supabase.co";

const SUPABASE_KEY = "sb_publishable_nx4pj0hDQ11jqMXCc3xexQ_a3-Lcbfq";


document
    .getElementById("loginForm")
    .addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const message =
            document.getElementById("loginMessage");

        message.classList.add("hidden");

        try {

            const response = await fetch(
                `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "apikey": SUPABASE_KEY
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error_description ||
                    data.msg ||
                    "Login failed."
                );
            }

            localStorage.setItem(
                "supabase_access_token",
                data.access_token
            );

            localStorage.setItem(
                "supabase_refresh_token",
                data.refresh_token
            );

            window.location.href = "admin.html";

        } catch (error) {

            message.textContent = error.message;

            message.classList.remove("hidden");

        }

    });