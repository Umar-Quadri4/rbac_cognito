// const AWS = require('aws-sdk');
// const crypto = require('crypto');
// require('dotenv').config();
 
// const cognito = new AWS.CognitoIdentityServiceProvider();
// const sns = new AWS.SNS(); // Initialize Amazon SNS
 
// // Function to generate OTP
// const generateOTP = () => {
//     // Generate a 6-digit random OTP
//     return Math.floor(100000 + Math.random() * 900000);
// };
 
 
 
// // Function to send HTTP response
// const sendResponse = (statusCode, body) => {
//     return {
//         statusCode: statusCode,
//         body: JSON.stringify(body),
//         headers: {
//             'Content-Type': 'application/json'
//         }
//     };
// };
 
// // Function to sign in the user
// module.exports.signIn = async (event) => {
//     try {
//         const { mobileNumber } = JSON.parse(event.body);
 
//         // Check if the user is already registered
//         const userExists = await checkUserExists(mobileNumber);
 
//         if (!userExists) {
//             // Return error response if user is not registered
//             return sendResponse(404, { message: 'User does not exist' });
//         }
 
//         // Verify OTP for returning users
//         const otp = await generateAndVerifyOTP(mobileNumber);
//         const userData = {
//             username: 'umar',
//             userId: '1@1'
//         };
 
//         // Return success response with user data
//         return sendResponse(200, { message: 'User signed in successfully', user: userData });
//     } catch (error) {
//         console.error('Error signing in:', error);
//         return sendResponse(500, { message: 'Error signing in', error: error.message });
//     }
// };
 
// // Function to check if the user is already registered
// const checkUserExists = async (mobileNumber) => {
//     try {
//         const searchParams = {
//             UserPoolId: process.env.COGNITO_USER_POOL_ID,
//             Filter: `phone_number = "${mobileNumber}"`,
//             Limit: 1
//         };
//         const searchResult = await cognito.listUsers(searchParams).promise();
//         return searchResult.Users.length > 0;
//     } catch (error) {
//         throw new Error('Error checking user existence: ' + error.message);
//     }
// };
 
// // Function to register a new user with the provided mobile number and OTP
// const registerUser = async (mobileNumber, otp) => {
//     try {
//         const userParams = {
//             UserPoolId: process.env.COGNITO_USER_POOL_ID,
//             Username: `user@${crypto.randomBytes(4).toString('hex')}`, // Dummy username
//             UserAttributes: [
//                 {
//                     Name: 'phone_number',
//                     Value: mobileNumber
//                 },
//                 {
//                     Name: 'custom:otp',
//                     Value: otp.toString()
//                 }
//             ],
//             MessageAction: "SUPPRESS"
//         };
//         await cognito.adminCreateUser(userParams).promise();
//     } catch (error) {
//         throw new Error('Error registering user: ' + error.message);
//     }
// };
 
// // Function to generate and verify OTP for returning users
// const generateAndVerifyOTP = async (mobileNumber) => {
//     try {
//         // Check if the user is already registered
//         const userExists = await checkUserExists(mobileNumber);
//         let otp;
 
//         if (userExists) {
//             // Generate OTP for returning users
//             otp = generateOTP();
//         } else {
//             // Register new user with OTP for first-time sign-in
//             otp = generateOTP();
//             await registerUser(mobileNumber, otp);
//         }
 
//         // Send OTP to the user's mobile number via SMS using Amazon SNS
//         const snsParams = {
//             Message: `Your OTP is: ${otp}`,
//             PhoneNumber: mobileNumber,
//         };
//         await sns.publish(snsParams).promise();
 
//         // Return OTP
//         return otp;
//     } catch (error) {
//         throw new Error('Error generating and verifying OTP: ' + error.message);
//     }
// };







const AWS = require('aws-sdk');
const crypto = require('crypto');
require('dotenv').config();
const jwt = require('jsonwebtoken'); // Import JWT library

const cognito = new AWS.CognitoIdentityServiceProvider();
const sns = new AWS.SNS(); // Initialize Amazon SNS

// Function to generate OTP
const generateOTP = () => {
    // Generate a 6-digit random OTP
    return Math.floor(100000 + Math.random() * 900000);
};

// Function to send HTTP response
const sendResponse = (statusCode, body) => {
    return {
        statusCode: statusCode,
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    };
};

// Function to sign in the user
module.exports.signIn = async (event) => {
    try {
        const { mobileNumber } = JSON.parse(event.body);

        // Verify OTP for returning users
        const otp = await generateAndVerifyOTP(mobileNumber);
        const userData = {
            username: 'umar',
            userId: '1@1'
        };

        // Generate JWT token
        const token = generateToken(userData); // Generate token

        // Return success response with user data and token
        return sendResponse(200, { 
            message: 'User signed in successfully', 
            user: userData,
            token: token // Include token in the response
        });
    } catch (error) {
        console.error('Error signing in:', error);
        return sendResponse(500, { message: 'Error signing in', error: error.message });
    }
};

// Function to generate JWT token
const generateToken = (userData) => {
    const token = jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '1h' }); // Generate token with expiration time
    return token;
};

// Function to register a new user with the provided mobile number and OTP
const registerUser = async (mobileNumber, otp) => {
    try {
        const userParams = {
            UserPoolId: process.env.COGNITO_USER_POOL_ID,
            Username: `user@${crypto.randomBytes(4).toString('hex')}`, // Dummy username
            UserAttributes: [
                {
                    Name: 'phone_number',
                    Value: mobileNumber
                },
                {
                    Name: 'custom:otp',
                    Value: otp.toString()
                }
            ],
            MessageAction: "SUPPRESS"
        };
        await cognito.adminCreateUser(userParams).promise();
    } catch (error) {
        throw new Error('Error registering user: ' + error.message);
    }
};

// Function to generate and send OTP for sign-in
const generateAndVerifyOTP = async (mobileNumber) => {
    try {
        // Generate a new OTP
        const otp = generateOTP();
        
        // Register new user with OTP for first-time sign-in
        await registerUser(mobileNumber, otp);
        
        // Send OTP to the user's mobile number via SMS using Amazon SNS
        const snsParams = {
            Message: `Your OTP is: ${otp}`,
            PhoneNumber: mobileNumber,
        };
        await sns.publish(snsParams).promise();
        
        // Return OTP
        return otp;
    } catch (error) {
        throw new Error('Error generating and sending OTP: ' + error.message);
    }
};

