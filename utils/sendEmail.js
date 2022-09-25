const axios = require("axios");

const axiosClient = axios.create({
    baseURL: "https://a.klaviyo.com/api/",
});

const sendEmail = async ({ email, link }) => {
    const token = "XSKW7R";
    const endpoint = "/track";

    const response = await axiosClient.post(
        endpoint,
        {
            token,
            event: "Reset Password",
            customer_properties: {
                $email: email,
            },
            properties: {
                link,
            },
        },
        {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        }
    );
    console.log(response.status, response.data);
    return;
};

module.exports = sendEmail;