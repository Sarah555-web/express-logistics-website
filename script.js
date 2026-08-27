const SUPABASE_URL = "https://uxcfvlbnrwcqfeudmpbg.supabase.co";

const SUPABASE_KEY = "sb_publishable_nx4pj0hDQ11jqMXCc3xexQ_a3-Lcbfq";


async function trackShipment() {

    const trackingNumber = document
        .getElementById("trackingNumber")
        .value
        .trim();

    const loading = document.getElementById("loading");
    const error = document.getElementById("error");
    const result = document.getElementById("shipmentResult");

    // Clear previous messages
    error.classList.add("hidden");
    result.classList.add("hidden");

    if (!trackingNumber) {
        error.textContent = "Please enter a tracking number.";
        error.classList.remove("hidden");
        return;
    }

    loading.classList.remove("hidden");

    try {

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/shipments?tracking_number=eq.${encodeURIComponent(trackingNumber)}&select=*`,
            {
                method: "GET",
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`
                }
            }
        );

        if (!response.ok) {
            throw new Error("Unable to connect to the shipment database.");
        }

        const shipments = await response.json();

        loading.classList.add("hidden");

        if (shipments.length === 0) {

            error.textContent =
                "Shipment not found. Please check your tracking number.";

            error.classList.remove("hidden");

            return;
        }

        const shipment = shipments[0];
loadShipmentHistory(shipment.id);
        document.getElementById("resultTracking").textContent =
            shipment.tracking_number;

        document.getElementById("resultStatus").textContent =
            shipment.status;
updateTimeline(shipment.status);
        document.getElementById("resultSender").textContent =
            shipment.sender_name;

        document.getElementById("resultReceiver").textContent =
            shipment.receiver_name;

        document.getElementById("resultOrigin").textContent =
            shipment.origin;

        document.getElementById("resultDestination").textContent =
            shipment.destination;
document.getElementById("resultOrigin").textContent =
    shipment.origin;

document.getElementById("resultDestination").textContent =
    shipment.destination;

        document.getElementById("resultLocation").textContent =
            shipment.current_location;

      const statusBadge =
    document.getElementById("resultStatus");

statusBadge.textContent =
    shipment.status;

statusBadge.className =
    "status-badge status-" +
    shipment.status
        .toLowerCase()
        .replace(/\s+/g, "-");
    
    document.getElementById("resultWeight").textContent =
            shipment.weight + " kg";

        document.getElementById("resultDescription").textContent =
            shipment.description;

        document.getElementById("resultDelivery").textContent =
            formatDate(shipment.estimated_delivery);

        result.classList.remove("hidden");

    } catch (errorMessage) {

        loading.classList.add("hidden");

        error.textContent =
            errorMessage.message;

        error.classList.remove("hidden");
    }
}

function updateTimeline(currentStatus) {

    const statusOrder = [
        "Registered",
        "Picked Up",
        "In Transit",
        "At Facility",
        "Out for Delivery",
        "Delivered"
    ];

    const currentIndex = statusOrder.indexOf(currentStatus);

    const steps = document.querySelectorAll(".timeline-step");

    steps.forEach((step, index) => {

        step.classList.remove("completed");
        step.classList.remove("active");

        if (index < currentIndex) {
            step.classList.add("completed");
        }

        if (index === currentIndex) {
            step.classList.add("active");
        }

    });
}
function formatDate(dateString) {

    if (!dateString) {
        return "Not available";
    }

    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}
async function loadShipmentHistory(shipmentId) {

    const historyContainer =
        document.getElementById("shipmentHistory");

    if (!historyContainer) {
        return;
    }

    historyContainer.innerHTML =
        "<p>Loading shipment history...</p>";


    try {

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/shipment_events?shipment_id=eq.${encodeURIComponent(shipmentId)}&order=created_at.desc`,
            {
                method: "GET",

                headers: {
                    "Content-Type": "application/json",
                    "apikey": SUPABASE_KEY
                }
            }
        );


        if (!response.ok) {
            throw new Error("Unable to load shipment history.");
        }


        const events = await response.json();


        if (!events.length) {

            historyContainer.innerHTML =
                "<p>No shipment history available yet.</p>";

            return;
        }


        historyContainer.innerHTML =
            events.map(event => {

                const date =
                    new Date(event.created_at);

                return `
                    <div class="history-item">

                        <div class="history-dot"></div>

                        <div class="history-content">

                            <h3>
                                ${event.status}
                            </h3>

                            <p>
                                📍 ${event.location}
                            </p>

                            <p>
                                ${event.description || ""}
                            </p>

                            <small>
                                ${date.toLocaleString()}
                            </small>

                        </div>

                    </div>
                `;

            }).join("");


    } catch (error) {

        historyContainer.innerHTML =
            `<p>${error.message}</p>`;

    }
}
const printTrackingButton =
    document.getElementById("printTrackingButton");

if (printTrackingButton) {

    printTrackingButton.addEventListener("click", function () {
        window.print();
    });

}
