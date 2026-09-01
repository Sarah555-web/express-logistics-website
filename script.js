/* =========================================
   EXPRESS LOGISTICS LIMITED
   CUSTOMER TRACKING
========================================= */

const SUPABASE_URL =
    "https://uxcfvlbnrwcqfeudmpbg.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_nx4pj0hDQ11jqMXCc3xexQ_a3-Lcbfq";


/* =========================================
   TRACK SHIPMENT
========================================= */

async function trackShipment() {

    const trackingInput =
        document.getElementById("trackingNumber");

    const loading =
        document.getElementById("loading");

    const errorBox =
        document.getElementById("error");

    const result =
        document.getElementById("shipmentResult");


    if (!trackingInput) {
        return;
    }


    const trackingNumber =
        trackingInput.value.trim();


    if (!trackingNumber) {

        if (errorBox) {

            errorBox.textContent =
                "Please enter a tracking number.";

            errorBox.classList.remove("hidden");

        }

        if (result) {
            result.classList.add("hidden");
        }

        return;
    }


    /* Hide previous result */

    if (errorBox) {
        errorBox.classList.add("hidden");
    }

    if (result) {
        result.classList.add("hidden");
    }

    if (loading) {
        loading.classList.remove("hidden");
    }


    try {

        const response =
            await fetch(
                `${SUPABASE_URL}/rest/v1/shipments?tracking_number=eq.${encodeURIComponent(trackingNumber)}&select=*`,
                {
                    method: "GET",

                    headers: {
                        "apikey": SUPABASE_KEY
                    }
                }
            );


        const shipments =
            await response.json();


        if (!response.ok) {

            throw new Error(
                shipments.message ||
                shipments.hint ||
                "Unable to track shipment."
            );

        }


        if (
            !shipments ||
            shipments.length === 0
        ) {

            throw new Error(
                "Shipment not found. Please check your tracking number."
            );

        }


        const shipment =
            shipments[0];


        /* =================================
           DISPLAY SHIPMENT INFORMATION
        ================================= */

        setText(
            "resultTracking",
            shipment.tracking_number
        );

        setText(
            "resultStatus",
            shipment.status || "Pending"
        );

        setText(
            "resultSender",
            shipment.sender_name || "-"
        );

        setText(
            "resultReceiver",
            shipment.receiver_name || "-"
        );

        setText(
            "resultOrigin",
            shipment.origin || "-"
        );

        setText(
            "resultDestination",
            shipment.destination || "-"
        );

        setText(
            "resultLocation",
            shipment.current_location || "-"
        );

        setText(
            "resultWeight",
            shipment.weight
                ? shipment.weight + " kg"
                : "-"
        );

        setText(
            "resultDescription",
            shipment.description || "-"
        );

        setText(
            "resultDelivery",
            formatDate(
                shipment.estimated_delivery
            )
        );


        /* =================================
           STATUS BADGE
        ================================= */

        const statusElement =
            document.getElementById(
                "resultStatus"
            );


        if (statusElement) {

            statusElement.className =
                "status-badge";

            statusElement.classList.add(
                getStatusClass(
                    shipment.status
                )
            );

        }


        /* =================================
           UPDATE TIMELINE
        ================================= */

        updateTimeline(
            shipment.status
        );


        /* =================================
           SHOW RESULT
        ================================= */

        if (result) {
            result.classList.remove("hidden");
        }


        /* =================================
           LOAD SHIPMENT HISTORY
        ================================= */

        loadShipmentHistory(
            shipment.tracking_number
        );


        /* Scroll to result */

        if (result) {

            setTimeout(function () {

                result.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }, 100);

        }


    } catch (error) {

        console.error(
            "Tracking error:",
            error
        );


        if (errorBox) {

            errorBox.textContent =
                error.message ||
                "Unable to track shipment.";

            errorBox.classList.remove(
                "hidden"
            );

        }

        if (result) {
            result.classList.add("hidden");
        }

    } finally {

        if (loading) {
            loading.classList.add("hidden");
        }

    }

}


/* =========================================
   HELPER — SET TEXT
========================================= */

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (element) {

        element.textContent =
            value ?? "-";

    }

}


/* =========================================
   FORMAT DATE
========================================= */

function formatDate(dateValue) {

    if (!dateValue) {
        return "-";
    }


    const date =
        new Date(dateValue);


    if (isNaN(date.getTime())) {
        return dateValue;
    }


    return date.toLocaleDateString(
        undefined,
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );

}


/* =========================================
   STATUS CLASS
========================================= */

function getStatusClass(status) {

    if (!status) {
        return "status-pending";
    }


    const normalized =
        status
            .toLowerCase()
            .trim();


    if (
        normalized.includes("delivered")
    ) {
        return "status-delivered";
    }


    if (
        normalized.includes("out for delivery")
    ) {
        return "status-out";
    }


    if (
        normalized.includes("at facility")
    ) {
        return "status-facility";
    }


    if (
        normalized.includes("transit")
    ) {
        return "status-transit";
    }


    if (
        normalized.includes("picked")
    ) {
        return "status-picked";
    }


    if (
        normalized.includes("registered")
    ) {
        return "status-registered";
    }


    return "status-pending";

}


/* =========================================
   UPDATE TRACKING TIMELINE
========================================= */

function updateTimeline(status) {

    const steps =
        document.querySelectorAll(
            ".timeline-step"
        );


    if (!steps.length) {
        return;
    }


    const order = [
        "Registered",
        "Picked Up",
        "In Transit",
        "At Facility",
        "Out for Delivery",
        "Delivered"
    ];


    const currentIndex =
        getStatusIndex(status);


    steps.forEach(
        function (step, index) {

            step.classList.remove(
                "completed",
                "current"
            );


            if (
                index <
                currentIndex
            ) {

                step.classList.add(
                    "completed"
                );

            }


            if (
                index ===
                currentIndex
            ) {

                step.classList.add(
                    "current"
                );

            }

        }
    );

}


/* =========================================
   GET STATUS INDEX
========================================= */

function getStatusIndex(status) {

    if (!status) {
        return 0;
    }


    const normalized =
        status
            .toLowerCase()
            .trim();


    if (
        normalized.includes("delivered")
    ) {
        return 5;
    }


    if (
        normalized.includes("out for delivery")
    ) {
        return 4;
    }


    if (
        normalized.includes("facility")
    ) {
        return 3;
    }


    if (
        normalized.includes("transit")
    ) {
        return 2;
    }


    if (
        normalized.includes("picked")
    ) {
        return 1;
    }


    return 0;

}


/* =========================================
   SHIPMENT HISTORY
========================================= */

async function loadShipmentHistory(
    trackingNumber
) {

    const historyContainer =
        document.getElementById(
            "shipmentHistory"
        );


    if (!historyContainer) {
        return;
    }


    historyContainer.innerHTML = `
        <p class="history-empty">
            Loading shipment history...
        </p>
    `;


    try {

        /*
         * Try to load shipment history
         * if the shipment_history table exists.
         */

        const response =
            await fetch(
                `${SUPABASE_URL}/rest/v1/shipment_history?tracking_number=eq.${encodeURIComponent(trackingNumber)}&select=*&order=created_at.asc`,
                {
                    method: "GET",

                    headers: {
                        "apikey": SUPABASE_KEY
                    }
                }
            );


        const history =
            await response.json();


        if (!response.ok) {

            /*
             * If history table doesn't exist,
             * don't break shipment tracking.
             */

            historyContainer.innerHTML = `
                <p class="history-empty">
                    Shipment history will appear here.
                </p>
            `;

            return;

        }


        if (
            !history ||
            history.length === 0
        ) {

            historyContainer.innerHTML = `
                <p class="history-empty">
                    No shipment history available yet.
                </p>
            `;

            return;

        }


        historyContainer.innerHTML =
            history.map(
                function (item) {

                    return `
                        <div class="history-item">

                            <div class="history-dot">
                                ●
                            </div>

                            <div class="history-content">

                                <strong>
                                    ${item.status || "Shipment Update"}
                                </strong>

                                <span>
                                    ${item.location || item.current_location || ""}
                                </span>

                                <small>
                                    ${
                                        item.created_at
                                            ? formatDateTime(
                                                item.created_at
                                              )
                                            : ""
                                    }
                                </small>

                            </div>

                        </div>
                    `;

                }
            ).join("");


    } catch (error) {

        console.error(
            "History error:",
            error
        );


        historyContainer.innerHTML = `
            <p class="history-empty">
                Shipment history will appear here.
            </p>
        `;

    }

}


/* =========================================
   FORMAT DATE + TIME
========================================= */

function formatDateTime(
    dateValue
) {

    if (!dateValue) {
        return "";
    }


    const date =
        new Date(dateValue);


    if (isNaN(date.getTime())) {
        return dateValue;
    }


    return date.toLocaleString(
        undefined,
        {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =========================================
   PRINT TRACKING DETAILS
========================================= */

const printTrackingButton =
    document.getElementById(
        "printTrackingButton"
    );


if (printTrackingButton) {

    printTrackingButton.addEventListener(
        "click",
        function () {

            const result =
                document.getElementById(
                    "shipmentResult"
                );


            if (
                !result ||
                result.classList.contains("hidden")
            ) {

                alert(
                    "Please track a shipment first."
                );

                return;

            }


            window.print();

        }
    );

}


/* =========================================
   ENTER KEY TO TRACK
========================================= */

const trackingInput =
    document.getElementById(
        "trackingNumber"
    );


if (trackingInput) {

    trackingInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                trackShipment();

            }

        }
    );

}