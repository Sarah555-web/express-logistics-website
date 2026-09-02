/* =========================================
   EXPRESS LOGISTICS LIMITED
   CUSTOMER SUPPORT CHAT
========================================= */

const SUPPORT_SUPABASE_URL =
    "https://uxcfvlbnrwcqfeudmpbg.supabase.co";

const SUPPORT_SUPABASE_KEY =
    "sb_publishable_nx4pj0hDQ11jqMXCc3xexQ_a3-Lcbfq";


const supportClient =
    window.supabase.createClient(
        SUPPORT_SUPABASE_URL,
        SUPPORT_SUPABASE_KEY
    );


let currentConversation = null;


/* =========================================
   GET / CREATE ANONYMOUS CUSTOMER
========================================= */

async function ensureSupportUser() {

    const {
        data: {
            session
        }
    } = await supportClient.auth.getSession();

    if (session) {
        return session;
    }

    const {
        data,
        error
    } = await supportClient.auth.signInAnonymously();

    if (error) {
        throw error;
    }

    return data.session;
}


/* =========================================
   WAIT FOR PAGE
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        const supportButton =
            document.getElementById(
                "supportChatButton"
            );


        const supportBox =
            document.getElementById(
                "supportChatBox"
            );


        const closeButton =
            document.getElementById(
                "closeSupportChat"
            );


        const startButton =
            document.getElementById(
                "startSupportChat"
            );


        const customerInfo =
            document.getElementById(
                "supportCustomerInfo"
            );


        const messageArea =
            document.getElementById(
                "supportMessageArea"
            );


        const customerNameInput =
            document.getElementById(
                "supportCustomerName"
            );


        const trackingInput =
            document.getElementById(
                "supportTrackingNumber"
            );


        const messageInput =
            document.getElementById(
                "supportMessageInput"
            );


        const sendButton =
            document.getElementById(
                "sendSupportMessage"
            );


        const messagesBox =
            document.getElementById(
                "supportChatMessages"
            );


        /* =================================
           OPEN CHAT
        ================================= */

        if (supportButton && supportBox) {

            supportButton.addEventListener(
                "click",
                function () {

                    supportBox.classList.add(
                        "active"
                    );

                }
            );

        }


        /* =================================
           CLOSE CHAT
        ================================= */

        if (closeButton && supportBox) {

            closeButton.addEventListener(
                "click",
                function () {

                    supportBox.classList.remove(
                        "active"
                    );

                }
            );

        }

/* =================================
   START CHAT
================================= */

if (startButton) {

    startButton.addEventListener(
        "click",
        async function () {

            const customerName =
                customerNameInput.value.trim();

            const trackingNumber =
                trackingInput.value.trim();


            if (!customerName) {

                alert("Please enter your name.");

                return;

            }


            startButton.disabled = true;

            startButton.textContent =
                "Connecting...";


            try {

                /* Get authenticated anonymous user */

                const supportUser =
                    await ensureSupportUser();


                if (!supportUser) {

                    throw new Error(
                        "Unable to create support session."
                    );

                }


                /* Create conversation */

                const {
    data,
    error
} = await supportClient
    .rpc(
        "create_support_conversation",
        {
            p_customer_name:
                customerName,

            p_tracking_number:
                trackingNumber || ""
        }
    );

if (error) {
    throw error;
}


                if (error) {

                    throw error;

                }


                currentConversation = data;
                listenForAdminReplies();

                /* Hide customer information */

                customerInfo.style.display =
                    "none";


                /* Show chat area */

                messageArea.classList.remove(
                    "hidden"
                );


                /* Welcome message */

                messagesBox.innerHTML = `

                    <div class="support-welcome-message">

                        Hello ${customerName}! 👋

                        <br><br>

                        You are now connected to
                        Express Logistics Support.

                        <br><br>

                        Please type your message below.

                    </div>

                `;


                startButton.textContent =
                    "Start Chat";


                startButton.disabled =
                    false;

            } catch (error) {

                console.error(
                    "Support error:",
                    error
                );


                alert(
                    error.message ||
                    "Unable to start support chat."
                );


                startButton.disabled =
                    false;


                startButton.textContent =
                    "Start Chat";

            }

        }
    );

}


        /* =================================
           SEND MESSAGE
        ================================= */

        async function sendMessage() {

            if (!currentConversation) {

                return;

            }


            const message =
                messageInput.value.trim();


            if (!message) {

                return;

            }


            try {


                const {
    data: {
        session
    }
} =
    await supportClient.auth.getSession();


                if (!session) {

                    throw new Error(
                        "Support session expired."
                    );

                }


                const {
    data,
    error
} = await supportClient
    .rpc(
        "send_support_message",
        {
            p_conversation_id:
                currentConversation.id,

            p_message:
                message,

            p_customer_name:
                messageInput
                    ? customerNameInput.value.trim()
                    : ""
        }
    );

if (error) {
    throw error;
}
// Send email notification without changing the existing support chat
try {
    await fetch(
        "https://uxcfvlbnrwcqfeudmpbg.supabase.co/functions/v1/swift-task",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: customerNameInput.value.trim(),
                email: "sarahsoreng555@gmail.com",
                message: message
            })
        }
    );
} catch (emailError) {
    console.error(
        "Email notification error:",
        emailError
    );
}





        


                messageInput.value = "";


                displayMessage(
                    "You",
                    message
                );


            } catch (error) {

                console.error(
                    "Message error:",
                    error
                );


                alert(
                    error.message ||
                    "Unable to send message."
                );

            }

        }


        /* =================================
           DISPLAY MESSAGE
        ================================= */

        function displayMessage(
            sender,
            message
        ) {

            const messageElement =
                document.createElement(
                    "div"
                );


            messageElement.style.background =
                sender === "You"
                    ? "#dbeafe"
                    : "#ffffff";


            messageElement.style.padding =
                "10px";


            messageElement.style.marginBottom =
                "8px";


            messageElement.style.borderRadius =
                "10px";


            messageElement.innerHTML = `

                <strong>
                    ${sender}
                </strong>

                <br>

                ${message}

            `;


            messagesBox.appendChild(
                messageElement
            );


            messagesBox.scrollTop =
                messagesBox.scrollHeight;

        }


        /* =================================
           SEND BUTTON
        ================================= */

        if (sendButton) {

            sendButton.addEventListener(
                "click",
                sendMessage
            );

        }

        /* =================================
           REAL-TIME ADMIN REPLIES
        ================================= */

        function listenForAdminReplies() {

            if (!currentConversation) {
                return;
            }

            supportClient
                .channel(
                    "customer-support-" +
                    currentConversation.id
                )
                .on(
                    "postgres_changes",
                    {
                        event: "INSERT",
                        schema: "public",
                        table: "support_messages",
                        filter:
                            "conversation_id=eq." +
                            currentConversation.id
                    },
                    function (payload) {

                        const message =
                            payload.new;

                        /* Only display admin messages */

                        if (
                            message.sender_type ===
                            "admin"
                        ) {

                            displayMessage(
                                "Support",
                                message.message
                            );

                        }

                    }
                )
                .subscribe();

        }
        /* =================================
           ENTER TO SEND
        ================================= */

        if (messageInput) {

            messageInput.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter"
                    ) {

                        event.preventDefault();

                        sendMessage();

                    }

                }
            );

        }

    }
);