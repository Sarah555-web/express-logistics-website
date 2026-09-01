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

sender_email:
    document.getElementById("senderEmail").value.trim(),

receiver_email:
    document.getElementById("receiverEmail").value.trim(),

receiver_address:
    document.getElementById("receiverAddress").value.trim(),

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
        document.getElementById("estimatedDelivery").value,

    shipping_cost:
        Number(document.getElementById("shippingCost").value) || 0,

    amount_paid:
        Number(document.getElementById("amountPaid").value) || 0,

    payment_method:
        document.getElementById("paymentMethod").value,

    payment_type:
        document.getElementById("paymentType").value,

    payment_status:
        document.getElementById("paymentStatus").value,

    currency:
        document.getElementById("currency").value
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
// Calculate remaining balance automatically

function calculateBalance() {

    const shippingCost =
        Number(document.getElementById("shippingCost").value) || 0;

    const amountPaid =
        Number(document.getElementById("amountPaid").value) || 0;

    const balance =
        shippingCost - amountPaid;

    document.getElementById("balance").value =
        Math.max(balance, 0).toFixed(2);
}


document
    .getElementById("shippingCost")
    .addEventListener("input", calculateBalance);


document
    .getElementById("amountPaid")
    .addEventListener("input", calculateBalance);
    /* =========================
   PROFESSIONAL RECEIPT
========================= */

const receiptButton = document.getElementById("receiptButton");

if (receiptButton) {

    receiptButton.addEventListener("click", async function () {

        const token =
            localStorage.getItem("supabase_access_token");

        if (!token) {
            window.location.href = "login.html";
            return;
        }

        /*
        Get the tracking number from the
        success message after creating shipment
        */

        const messageElement =
            document.getElementById("adminMessage");

        const message =
            messageElement
                ? messageElement.textContent
                : "";

        const match =
            message.match(/EXL-\d{4}-\d+/);

        if (!match) {

            alert(
                "Please create a shipment first, then generate the receipt."
            );

            return;
        }

        const trackingNumber = match[0];


        try {

            /*
            Fetch the COMPLETE shipment record
            */

            const response = await fetch(
                `${SUPABASE_URL}/rest/v1/shipments?tracking_number=eq.${encodeURIComponent(trackingNumber)}&select=*`,
                {
                    method: "GET",

                    headers: {
                        "apikey": SUPABASE_KEY,
                        "Authorization": `Bearer ${token}`
                    }
                }
            );


            const shipments =
                await response.json();


            if (!response.ok || !shipments.length) {

                throw new Error(
                    "Unable to find the shipment."
                );

            }


            const shipment =
                shipments[0];


            /* =========================
               RECEIPT INFORMATION
            ========================= */

            const receiptNumber =
                "EXL-REC-" +
                Date.now();

            const receiptDate =
                new Date().toLocaleString();


            /* =========================
               PAYMENT CALCULATIONS
            ========================= */

            const shippingCost =
                Number(shipment.shipping_cost) || 0;

            const amountPaid =
                Number(shipment.amount_paid) || 0;

            const balance =
                Math.max(
                    shippingCost - amountPaid,
                    0
                );

            const currency =
                shipment.currency || "EUR";


            /* =========================
               SAFE DISPLAY FUNCTION
            ========================= */

            function display(value) {

                if (
                    value === null ||
                    value === undefined ||
                    value === ""
                ) {
                    return "—";
                }

                return String(value)
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");
            }


            function formatDate(date) {

                if (!date) {
                    return "—";
                }

                const parsed =
                    new Date(date);

                if (isNaN(parsed)) {
                    return display(date);
                }

                return parsed.toLocaleDateString(
                    undefined,
                    {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    }
                );
            }


            function money(amount) {

                return `${display(currency)} ${Number(amount).toFixed(2)}`;

            }


            /*
            Open receipt in a new window
            */

            const receiptWindow =
                window.open(
                    "",
                    "_blank"
                );


            if (!receiptWindow) {

                alert(
                    "Please allow pop-ups in your browser."
                );

                return;
            }


            /* =========================
               RECEIPT HTML
            ========================= */

            receiptWindow.document.write(`

<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
>

<title>
    Express Logistics Limited - Shipment Receipt
</title>


<style>

* {
    box-sizing: border-box;
}


body {

    margin: 0;

    padding: 35px 15px;

    background: #eef3f8;

    color: #10233f;

    font-family:
        Arial,
        Helvetica,
        sans-serif;

    line-height: 1.5;
}


/* =========================
   RECEIPT
========================= */

.receipt {

    width: 100%;

    max-width: 850px;

    margin: auto;

    background: #ffffff;

    border-radius: 18px;

    overflow: hidden;

    box-shadow:
        0 20px 60px rgba(
            7,
            27,
            53,
            0.15
        );
}


/* =========================
   HEADER
========================= */

.receipt-header {

    background:
        linear-gradient(
            135deg,
            #071b35,
            #124b76
        );

    color: white;

    padding: 32px 40px;

    display: flex;

    justify-content: space-between;

    align-items: center;

    gap: 25px;
}


.brand {

    display: flex;

    align-items: center;

    gap: 15px;
}


.logo {

    width: 58px;

    height: 58px;

    border-radius: 14px;

    background:
        linear-gradient(
            135deg,
            #ff7900,
            #ffb13b
        );

    display: flex;

    align-items: center;

    justify-content: center;

    font-size: 27px;

    font-weight: 900;

    box-shadow:
        0 8px 20px
        rgba(
            255,
            121,
            0,
            0.30
        );
}


.brand h1 {

    margin: 0;

    font-size: 21px;

    letter-spacing: 1px;
}


.brand p {

    margin: 3px 0 0;

    color: #ff9a27;

    font-size: 10px;

    font-weight: 700;

    letter-spacing: 2px;
}


.receipt-label {

    text-align: right;
}


.receipt-label h2 {

    margin: 0;

    font-size: 25px;

    color: white;
}


.receipt-label p {

    margin: 5px 0 0;

    color: #c8d8e8;

    font-size: 11px;
}


/* =========================
   RECEIPT BODY
========================= */

.receipt-body {

    padding: 38px 40px 45px;
}


/* =========================
   META
========================= */

.meta-grid {

    display: grid;

    grid-template-columns:
        repeat(2, 1fr);

    gap: 12px;

    margin-bottom: 30px;
}


.meta-card {

    background: #f5f8fc;

    border: 1px solid #e5ebf2;

    border-radius: 10px;

    padding: 14px 16px;
}


.meta-card span {

    display: block;

    color: #8491a1;

    font-size: 10px;

    text-transform: uppercase;

    letter-spacing: 0.7px;

    margin-bottom: 4px;
}


.meta-card strong {

    font-size: 13px;

    color: #10233f;
}


/* =========================
   SECTIONS
========================= */

.section {

    margin-top: 30px;
}


.section-title {

    display: flex;

    align-items: center;

    gap: 10px;

    margin-bottom: 12px;

    padding-bottom: 9px;

    border-bottom:
        2px solid #edf1f5;
}


.section-title-icon {

    width: 30px;

    height: 30px;

    border-radius: 8px;

    background: #fff1df;

    display: flex;

    align-items: center;

    justify-content: center;

    font-size: 15px;
}


.section-title h3 {

    margin: 0;

    font-size: 16px;

    color: #10233f;
}


/* =========================
   INFORMATION GRID
========================= */

.info-grid {

    display: grid;

    grid-template-columns:
        repeat(2, 1fr);

    border:
        1px solid #e7edf3;

    border-radius: 10px;

    overflow: hidden;
}


.info-item {

    padding: 13px 15px;

    border-bottom:
        1px solid #e7edf3;

    background: white;
}


.info-item:nth-child(odd) {

    border-right:
        1px solid #e7edf3;
}


.info-item:nth-last-child(-n+2) {

    border-bottom: none;
}


.info-item label {

    display: block;

    color: #8996a7;

    font-size: 10px;

    text-transform: uppercase;

    letter-spacing: 0.5px;

    margin-bottom: 3px;
}


.info-item strong {

    display: block;

    color: #172c48;

    font-size: 13px;

    word-break: break-word;
}


/* =========================
   FULL WIDTH INFO
========================= */

.full-info {

    grid-column: 1 / -1;

    border-right: none !important;
}


/* =========================
   STATUS
========================= */

.status-badge {

    display: inline-block;

    padding: 5px 11px;

    border-radius: 20px;

    background: #fff1df;

    color: #e76f00;

    font-size: 11px;

    font-weight: 800;
}


/* =========================
   PAYMENT
========================= */

.payment-box {

    border:
        1px solid #e4eaf1;

    border-radius: 12px;

    overflow: hidden;
}


.payment-row {

    display: flex;

    justify-content: space-between;

    align-items: center;

    gap: 20px;

    padding: 14px 17px;

    border-bottom:
        1px solid #edf1f5;

    font-size: 13px;
}


.payment-row:last-child {

    border-bottom: none;
}


.payment-row span {

    color: #65768b;
}


.payment-row strong {

    color: #172c48;
}


.payment-total {

    background: #f5f8fc;

    font-size: 15px;
}


.payment-paid {

    background: #f1faf5;
}


.payment-paid strong {

    color: #21834f;
}


.payment-balance {

    background: #fff6eb;

    padding: 18px 17px;

    font-size: 17px;
}


.payment-balance span {

    color: #b45b00;

    font-weight: 700;
}


.payment-balance strong {

    color: #e76f00;

    font-size: 19px;
}


/* =========================
   FOOTER
========================= */

.receipt-footer {

    margin-top: 35px;

    padding-top: 25px;

    border-top:
        1px solid #e5ebf2;

    text-align: center;

    color: #7c8999;

    font-size: 11px;

    line-height: 1.7;
}


.receipt-footer strong {

    color: #10233f;
}


.receipt-footer .thank-you {

    color: #ff7900;

    font-size: 14px;

    font-weight: 800;

    margin-bottom: 5px;
}


/* =========================
   PRINT BUTTON
========================= */

.print-button {

    display: block;

    margin: 30px auto 0;

    padding: 13px 28px;

    border: none;

    border-radius: 8px;

    background: #ff7900;

    color: white;

    cursor: pointer;

    font-size: 13px;

    font-weight: 800;

    box-shadow:
        0 8px 20px
        rgba(
            255,
            121,
            0,
            0.22
        );
}


.print-button:hover {

    background: #e86c00;
}


/* =========================
   MOBILE
========================= */

@media (max-width: 650px) {

    body {

        padding: 10px;
    }


    .receipt-header {

        padding: 25px 22px;

        flex-direction: column;

        align-items: flex-start;
    }


    .receipt-label {

        text-align: left;
    }


    .receipt-body {

        padding: 25px 20px 35px;
    }


    .meta-grid {

        grid-template-columns: 1fr;
    }


    .info-grid {

        grid-template-columns: 1fr;
    }


    .info-item:nth-child(odd) {

        border-right: none;
    }


    .info-item:nth-last-child(-n+2) {

        border-bottom:
            1px solid #e7edf3;
    }


    .info-item:last-child {

        border-bottom: none;
    }


    .payment-row {

        align-items: flex-start;

        flex-direction: column;

        gap: 4px;
    }

}


/* =========================
   PRINT
========================= */

@media print {

    body {

        padding: 0;

        background: white;
    }


    .receipt {

        max-width: none;

        border-radius: 0;

        box-shadow: none;
    }


    .print-button {

        display: none;
    }


    @page {

        margin: 10mm;
    }

}

</style>

</head>


<body>


<div class="receipt">


<!-- =========================
     HEADER
========================= -->

<header class="receipt-header">

    <div class="brand">

        <div class="logo">
            EL
        </div>

        <div>

            <h1>
                Express Logistics Limited
            </h1>

            <p>
                GLOBAL LOGISTICS & DELIVERY
            </p>

        </div>

    </div>


    <div class="receipt-label">

        <h2>
            PAYMENT RECEIPT
        </h2>

        <p>
            Official Shipment Document
        </p>

    </div>

</header>


<div class="receipt-body">


<!-- =========================
     RECEIPT META
========================= -->

<div class="meta-grid">

    <div class="meta-card">

        <span>
            Receipt Number
        </span>

        <strong>
            ${display(receiptNumber)}
        </strong>

    </div>


    <div class="meta-card">

        <span>
            Date Issued
        </span>

        <strong>
            ${display(receiptDate)}
        </strong>

    </div>


    <div class="meta-card">

        <span>
            Tracking Number
        </span>

        <strong>
            ${display(shipment.tracking_number)}
        </strong>

    </div>


    <div class="meta-card">

        <span>
            Shipment Status
        </span>

        <strong>
            <span class="status-badge">
                ${display(shipment.status)}
            </span>
        </strong>

    </div>

</div>


<!-- =========================
     SENDER INFORMATION
========================= -->

<section class="section">

    <div class="section-title">

        <div class="section-title-icon">
            👤
        </div>

        <h3>
            Sender Information
        </h3>

    </div>


    <div class="info-grid">

        <div class="info-item">

            <label>
                Full Name
            </label>

            <strong>
                ${display(shipment.sender_name)}
            </strong>

        </div>


        <div class="info-item">

            <label>
                Phone Number
            </label>

            <strong>
                ${display(shipment.sender_phone)}
            </strong>

        </div>


        <div class="info-item full-info">

            <label>
                Email Address
            </label>

            <strong>
                ${display(shipment.sender_email)}
            </strong>

        </div>

    </div>

</section>


<!-- =========================
     RECEIVER INFORMATION
========================= -->

<section class="section">

    <div class="section-title">

        <div class="section-title-icon">
            📦
        </div>

        <h3>
            Receiver Information
        </h3>

    </div>


    <div class="info-grid">

        <div class="info-item">

            <label>
                Full Name
            </label>

            <strong>
                ${display(shipment.receiver_name)}
            </strong>

        </div>


        <div class="info-item">

            <label>
                Phone Number
            </label>

            <strong>
                ${display(shipment.receiver_phone)}
            </strong>

        </div>


        <div class="info-item full-info">

            <label>
                Email Address
            </label>

            <strong>
                ${display(shipment.receiver_email)}
            </strong>

        </div>


        <div class="info-item full-info">

            <label>
                Home / Delivery Address
            </label>

            <strong>
                ${display(shipment.receiver_address)}
            </strong>

        </div>

    </div>

</section>


<!-- =========================
     SHIPMENT INFORMATION
========================= -->

<section class="section">

    <div class="section-title">

        <div class="section-title-icon">
            🚚
        </div>

        <h3>
            Shipment Information
        </h3>

    </div>


    <div class="info-grid">

        <div class="info-item">

            <label>
                Origin
            </label>

            <strong>
                ${display(shipment.origin)}
            </strong>

        </div>


        <div class="info-item">

            <label>
                Destination
            </label>

            <strong>
                ${display(shipment.destination)}
            </strong>

        </div>


        <div class="info-item">

            <label>
                Current Location
            </label>

            <strong>
                ${display(shipment.current_location)}
            </strong>

        </div>


        <div class="info-item">

            <label>
                Weight
            </label>

            <strong>
                ${shipment.weight !== null &&
                  shipment.weight !== undefined &&
                  shipment.weight !== ""
                    ? display(shipment.weight) + " kg"
                    : "—"}
            </strong>

        </div>


        <div class="info-item">

            <label>
                Estimated Delivery
            </label>

            <strong>
                ${formatDate(
                    shipment.estimated_delivery
                )}
            </strong>

        </div>


        <div class="info-item">

            <label>
                Shipment Registration Date
            </label>

            <strong>
                ${formatDate(
                    shipment.created_at
                )}
            </strong>

        </div>


        <div class="info-item full-info">

            <label>
                Shipment Description
            </label>

            <strong>
                ${display(shipment.description)}
            </strong>

        </div>

    </div>

</section>


<!-- =========================
     PAYMENT INFORMATION
========================= -->

<section class="section">

    <div class="section-title">

        <div class="section-title-icon">
            💳
        </div>

        <h3>
            Payment Information
        </h3>

    </div>


    <div class="payment-box">


        <div class="payment-row">

            <span>
                Currency
            </span>

            <strong>
                ${display(currency)}
            </strong>

        </div>


        <div class="payment-row">

            <span>
                Payment Method
            </span>

            <strong>
                ${display(
                    shipment.payment_method
                )}
            </strong>

        </div>


        <div class="payment-row">

            <span>
                Payment Type
            </span>

            <strong>
                ${display(
                    shipment.payment_type
                )}
            </strong>

        </div>


        <div class="payment-row">

            <span>
                Payment Status
            </span>

            <strong>
                ${display(
                    shipment.payment_status
                )}
            </strong>

        </div>


        <div class="payment-row payment-total">

            <span>
                Total Shipping Cost
            </span>

            <strong>
                ${money(shippingCost)}
            </strong>

        </div>


        <div class="payment-row payment-paid">

            <span>
                Amount Paid
            </span>

            <strong>
                ${money(amountPaid)}
            </strong>

        </div>


        <div class="payment-row payment-balance">

            <span>
                Balance Remaining
            </span>

            <strong>
                ${money(balance)}
            </strong>

        </div>


    </div>

</section>


<!-- =========================
     FOOTER
========================= -->

<div class="receipt-footer">

    <div class="thank-you">
        Thank you for choosing Express Logistics Limited
    </div>

    <p>
        This receipt confirms the shipment and payment
        information recorded in our logistics management
        system.
    </p>

    <p>
        <strong>
            Express Logistics Limited
        </strong>
        — Global Logistics & Delivery
    </p>

    <p>
        Tracking Number:
        <strong>
            ${display(shipment.tracking_number)}
        </strong>
    </p>

</div>


<button
    class="print-button"
    onclick="window.print()"
>
    🖨 Print / Save Receipt
</button>


</div>

</div>


</body>

</html>

            `);


            receiptWindow.document.close();


        } catch (error) {

            console.error(
                "Receipt error:",
                error
            );

            alert(
                error.message ||
                "Unable to generate receipt."
            );

        }

    });

}
// =========================================
// CUSTOMER SUPPORT ADMIN
// =========================================

const ADMIN_SUPPORT_URL =
    "https://uxcfvlbnrwcqfeudmpbg.supabase.co";

const ADMIN_SUPPORT_KEY =
    "sb_publishable_nx4pj0hDQ11jqMXCc3xexQ_a3-Lcbfq";
let currentAdminConversationId = null;
let currentAdminCustomerName = "";
let currentAdminTrackingNumber = "";
const adminSupportClient =
    window.supabase.createClient(
        ADMIN_SUPPORT_URL,
        ADMIN_SUPPORT_KEY
    );
   // =========================================
// LOAD CUSTOMER SUPPORT CONVERSATIONS
// =========================================

async function loadSupportConversations() {

    const container =
        document.getElementById(
            "adminSupportConversations"
        );

    if (!container) {
        return;
    }

    container.innerHTML =
        "<p>Loading conversations...</p>";

    const {
    data,
    error
} = await adminSupportClient
    .rpc("get_support_conversations");

    if (error) {

        console.error(
            "Support conversations error:",
            error
        );

        container.innerHTML =
            "<p>Unable to load conversations.</p>";

        return;
    }

    if (!data || data.length === 0) {

        container.innerHTML =
            "<p>No customer conversations yet.</p>";

        return;
    }

    container.innerHTML = "";

    data.forEach(function (conversation) {

        const item =
            document.createElement("div");

        item.className =
            "admin-support-conversation";

        item.innerHTML = `
    <strong>
        ${conversation.customer_name || "Customer"}
    </strong>

    ${
        conversation.unread_admin
            ? `<span style="
                display:inline-block;
                margin-left:8px;
                padding:3px 7px;
                border-radius:10px;
                background:#dc2626;
                color:white;
                font-size:11px;
                font-weight:bold;
            ">NEW</span>`
            : ""
    }

    <br>

    <small>
        ${conversation.tracking_number || "No tracking number"}
    </small>

    <br>

    <span>
        ${conversation.status || "open"}
    </span>
`;

item.style.cursor = "pointer";

item.addEventListener(
    "click",
    async function () {

        currentAdminConversationId =
            conversation.id;

        currentAdminCustomerName =
            conversation.customer_name || "";

        currentAdminTrackingNumber =
            conversation.tracking_number || "";


        await adminSupportClient.rpc(
            "mark_support_conversation_read",
            {
                p_conversation_id:
                    currentAdminConversationId
            }
        );


        conversation.unread_admin =
            false;


        item.innerHTML = `
            <strong>
                ${currentAdminCustomerName || "Customer"}
            </strong>

            <br>

            <small>
                ${
                    currentAdminTrackingNumber ||
                    "No tracking number"
                }
            </small>

            <br>

            <span>
                ${conversation.status || "open"}
            </span>
        `;


        loadSupportMessages(
            currentAdminConversationId,
            currentAdminCustomerName,
            currentAdminTrackingNumber
        );

    }
);

        container.appendChild(item);

    });

}


// Load conversations when admin page opens

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadSupportConversations();

    }
); 
// =========================================
// LOAD SUPPORT MESSAGES
// =========================================

async function loadSupportMessages(
    conversationId,
    customerName,
    trackingNumber
) {

    const messagesContainer =
        document.getElementById(
            "adminSupportMessages"
        );

    const customerTitle =
        document.getElementById(
            "adminSupportCustomerName"
        );

    const trackingTitle =
        document.getElementById(
            "adminSupportTracking"
        );


    if (!messagesContainer) {
        return;
    }


    customerTitle.textContent =
        customerName || "Customer";


    trackingTitle.textContent =
        trackingNumber
            ? `Tracking: ${trackingNumber}`
            : "No tracking number";


    messagesContainer.innerHTML =
        "<p>Loading messages...</p>";


    const {
        data,
        error
    } = await adminSupportClient
        .rpc(
            "get_support_messages",
            {
                p_conversation_id:
                    conversationId
            }
        );


    if (error) {

        console.error(
            "Support messages error:",
            error
        );

        messagesContainer.innerHTML =
            "<p>Unable to load messages.</p>";

        return;
    }


    if (!data || data.length === 0) {

        messagesContainer.innerHTML =
            "<p>No messages yet.</p>";

        return;
    }


    messagesContainer.innerHTML = "";


    data.forEach(function (message) {

        const messageElement =
            document.createElement("div");


        messageElement.className =
            "admin-support-message " +
            (
                message.sender_type === "customer"
                    ? "customer-message"
                    : "admin-message"
            );


        messageElement.innerHTML = `

            <div class="support-message-sender">
                ${
                    message.sender_type === "customer"
                        ? "Customer"
                        : "Admin"
                }
            </div>

            <div class="support-message-text">
                ${message.message || ""}
            </div>

            <small>
                ${
                    message.created_at
                        ? new Date(
                            message.created_at
                        ).toLocaleString()
                        : ""
                }
            </small>

        `;


        messagesContainer.appendChild(
            messageElement
        );

    });

}
// =========================================
// ADMIN SEND SUPPORT REPLY
// =========================================

const adminReplyInput =
    document.getElementById(
        "adminSupportMessageInput"
    );

const adminReplyButton =
    document.getElementById(
        "adminSendSupportMessage"
    );


if (adminReplyButton) {

    adminReplyButton.addEventListener(
        "click",
        async function () {

            const message =
                adminReplyInput.value.trim();


            if (!message) {

                alert(
                    "Please type a message."
                );

                return;

            }


            if (!currentAdminConversationId) {

                alert(
                    "Please select a conversation first."
                );

                return;

            }


            adminReplyButton.disabled =
                true;


            try {

                const {
                    data,
                    error
                } = await adminSupportClient
                    .rpc(
                        "send_admin_support_message",
                        {
                            p_conversation_id:
                                currentAdminConversationId,

                            p_message:
                                message
                        }
                    );


                if (error) {
                    throw error;
                }


                adminReplyInput.value = "";


                await loadSupportMessages(
                    currentAdminConversationId,
                    currentAdminCustomerName,
                    currentAdminTrackingNumber
                );


            } catch (error) {

                console.error(
                    "Admin reply error:",
                    error
                );

                alert(
                    error.message ||
                    "Unable to send reply."
                );

            }


            adminReplyButton.disabled =
                false;

        }
    );

}
// =========================================
// REAL-TIME SUPPORT MESSAGES
// =========================================

adminSupportClient
    .channel("admin-support-messages")
    .on(
        "postgres_changes",
        {
            event: "INSERT",
            schema: "public",
            table: "support_messages"
        },
        async function () {

            if (!currentAdminConversationId) {
                return;
            }

            await loadSupportMessages(
                currentAdminConversationId,
                currentAdminCustomerName,
                currentAdminTrackingNumber
            );

        }
    )
    .subscribe();