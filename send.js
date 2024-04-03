const sendResponse = (statusCode, body) => {
    const response = {
        statusCode: statusCode,
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true
        }
    };
    return response;
};
 
const validateInput = (data) => {
    try {
        const { mobileNumber, otp } = JSON.parse(data);
        if (!mobileNumber || !otp || typeof mobileNumber !== 'string' || typeof otp !== 'string' || mobileNumber.length !== 10 || otp.length !== 6) {
            return false;
        }
        return true;
    } catch (error) {
        return false;
    }
};
 
module.exports = {
    sendResponse,
    validateInput
};