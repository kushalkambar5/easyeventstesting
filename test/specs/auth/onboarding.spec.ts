import WelcomeScreen from '../../screens/auth/WelcomeScreen';
import SignupScreen from '../../screens/auth/SignupScreen';
import OnboardingScreen from '../../screens/auth/OnboardingScreen';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

describe('Phone Number Onboarding / Login', () => {
    it('should close the app, launch it freshly, sign in with Google, and request OTP', async () => {
        const packageName = 'com.easy_eventz.development';
        
        console.log(`Closing app: ${packageName}`);
        await browser.terminateApp(packageName);
        await browser.pause(2000);
        
        console.log(`Launching app freshly: ${packageName}`);
        await browser.activateApp(packageName);
        await browser.pause(3000);

        // Click "GET STARTED" button on Welcome Screen
        console.log("Clicking GET STARTED...");
        await WelcomeScreen.clickGetStarted();

        // Click "Signin with google" on Signup Screen
        console.log("Clicking Signin with google...");
        await SignupScreen.clickSignInWithGoogle();

        // Check if Google Account Chooser appears, or if we go directly to the phone input screen
        const gmailId = process.env.GMAIL_ID || "";
        const accountSelector = $(`android=new UiSelector().text("${gmailId}")`);
        const phoneInputSelector = $('android=new UiSelector().resourceId("RNE__Input__text-input")');

        console.log("Waiting for Google account chooser or onboarding screen...");
        await browser.waitUntil(async () => {
            return (await accountSelector.isDisplayed()) || (await phoneInputSelector.isDisplayed());
        }, {
            timeout: 20000,
            timeoutMsg: 'Neither Google account chooser nor phone input screen appeared after 20s'
        });

        if (await accountSelector.isDisplayed()) {
            console.log(`Google account chooser detected. Clicking on account: ${gmailId}`);
            await accountSelector.click();
        } else {
            console.log("Directly navigated to phone input screen.");
        }

        // Enter phone number and click GET OTP
        console.log("Entering phone number and requesting OTP...");
        await OnboardingScreen.loginWithPhone();
    });
});

