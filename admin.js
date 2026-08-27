const SUPABASE_URL = "https://uxcfvlbnrwcqfeudmpbg.supabase.co";

const SUPABASE_KEY = "sb_publishable_nx4pj0hDQ11jqMXCc3xexQ_a3-Lcbfq";


async function checkAdminLogin() {

    const token =
        localStorage.getItem("supabase_access_token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {

        const response = await fetch(
            `${SUPABASE_URL}/auth/v1/user`,
            {
                method: "GET",

                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error("Session expired");
        }

    } catch (error) {

        localStorage.removeItem("supabase_access_token");
        localStorage.removeItem("supabase_refresh_token");

        window.location.href = "login.html";
    }
}


checkAdminLogin(); 
document
    .getElementById("shipmentForm")
    .addEventListener("submit", async function (event) {

        event.preventDefault();

        const message =
            document.getElementById("adminMessage");

        const token =
            localStorage.getItem("supabase_access_token");

        if (!token) {
            window.location.href = "login.html";
            return;
        }

        const shipment = {

            sender_name:
                document.getElementById("senderName").value.trim(),

            sender_phone:
                document.getElementById("senderPhone").value.trim(),

            receiver_name:
                document.getElementById("receiverName").value.trim(),

            receiver_phone:
                document.getElementById("receiverPhone").value.trim(),

            origin:
                document.getElementById("origin").value.trim(),

            destination:
                document.getElementById("destination").value.trim(),

            current_location:
                document.getElementById("currentLocation").value.trim(),

            status:
                document.getElementById("status").value,

            weight:
                Number(document.getElementById("weight").value),

            description:
                document.getElementById("description").value.trim(),

            estimated_delivery:
                document.getElementById("estimatedDelivery").value
        };


        try {

            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/shipments`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "apikey": SUPABASE_KEY,
                        "Authorization": `Bearer ${token}`,
                        "Prefer": "return=representation"
                    },

                    body: JSON.stringify(shipment)
                }
            );


            const data = await response.json();


            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.hint ||
                    "Unable to create shipment."
                );
            }


            message.textContent =
                "Shipment created successfully! Tracking number: " +
                data[0].tracking_number;

            message.classList.remove("hidden");


            document
                .getElementById("shipmentForm")
                .reset();


        } catch (error) {

            message.textContent =
                error.message;

            message.classList.remove("hidden");

        }

    });
    document
    .getElementById("updateShipmentForm")
    .addEventListener("submit", async function (event) {

        event.preventDefault();

        const message =
            document.getElementById("updateMessage");

        const token =
            localStorage.getItem("supabase_access_token");

        if (!token) {
            window.location.href = "login.html";
            return;
        }

        const trackingNumber =
            document
                .getElementById("updateTrackingNumber")
                .value
                .trim();

        const status =
            document
                .getElementById("updateStatus")
                .value;

        const currentLocation =
            document
                .getElementById("updateLocation")
                .value
                .trim();


        try {

            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/shipments?tracking_number=eq.${encodeURIComponent(trackingNumber)}`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type": "application/json",
                        "apikey": SUPABASE_KEY,
                        "Authorization": `Bearer ${token}`,
                        "Prefer": "return=representation"
                    },

                    body: JSON.stringify({
                        status: status,
                        current_location: currentLocation
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.hint ||
                    "Unable to update shipment."
                );
            }


            if (!data || data.length === 0) {
                throw new Error(
                    "Shipment not found. Check the tracking number."
                );
            }


            message.textContent =
                "Shipment updated successfully!";

            message.classList.remove("hidden");


        } catch (error) {

            message.textContent =
                error.message;

            message.classList.remove("hidden");

        }

    });
   async function loadShipments() {

    const shipmentList =
        document.getElementById("shipmentList");

    if (!shipmentList) {
        return;
    }

    const token =
        localStorage.getItem("supabase_access_token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    shipmentList.innerHTML = `
        <tr>
            <td colspan="4">
                Loading shipments...
            </td>
        </tr>
    `;

    try {

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/shipments?select=tracking_number,receiver_name,status,current_location&order=created_at.desc`,
            {
                method: "GET",

                headers: {
                    "Content-Type": "application/json",
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const shipments = await response.json();

        if (!response.ok) {
            throw new Error(
                shipments.message ||
                shipments.hint ||
                "Unable to load shipments."
            );
        }

        if (!shipments.length) {

            shipmentList.innerHTML = `
                <tr>
                    <td colspan="4">
                        No shipments found.
                    </td>
                </tr>
            `;

            return;
        }

        shipmentList.innerHTML =
            shipments.map(shipment => `
                
                <tr>

                    <td>
    <button
        type="button"
        class="tracking-link"
        onclick="selectShipment('${shipment.tracking_number}')"
    >
        ${shipment.tracking_number}
    </button>
</td>

                    <td>
                        ${shipment.receiver_name}
                    </td>

                    <td>
                        ${shipment.status}
                    </td>

                    <td>
                        ${shipment.current_location}
                    </td>

                </tr>

            `).join("");

    } catch (error) {

        shipmentList.innerHTML = `
            <tr>
                <td colspan="4">
                    ${error.message}
                </td>
            </tr>
        `;

    }
}


loadShipments(); 
async function selectShipment(trackingNumber) {

    const token =
        localStorage.getItem("supabase_access_token");

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/shipments?tracking_number=eq.${encodeURIComponent(trackingNumber)}&select=tracking_number,status,current_location`,
            {
                method: "GET",

                headers: {
                    "Content-Type": "application/json",
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const shipments = await response.json();

        if (!response.ok) {
            throw new Error(
                shipments.message ||
                "Unable to load shipment."
            );
        }

        if (!shipments.length) {
            alert("Shipment not found.");
            return;
        }

        const shipment = shipments[0];

        document.getElementById(
            "updateTrackingNumber"
        ).value = shipment.tracking_number;

        document.getElementById(
            "updateStatus"
        ).value = shipment.status;

        document.getElementById(
            "updateLocation"
        ).value = shipment.current_location;

        document.getElementById(
            "updateTrackingNumber"
        ).scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    } catch (error) {

        alert(error.message);

    }
}
const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {

    logoutButton.addEventListener("click", function () {

        localStorage.removeItem("supabase_access_token");
        localStorage.removeItem("supabase_refresh_token");

        window.location.href = "login.html";

    });

}