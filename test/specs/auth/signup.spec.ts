import WelcomeScreen from '../../screens/auth/WelcomeScreen';
import SignupScreen from '../../screens/auth/SignupScreen';
import GoogleSignInScreen from '../../screens/auth/GoogleSignInScreen';
import OnboardingScreen from '../../screens/auth/OnboardingScreen';
import * as dotenv from "dotenv";
import * as fs from 'fs';
dotenv.config({ path: ".env" });

describe('Sign Up / Login with Google', function () {
    it('should complete the signup/login flow using Google Sign-in', async function () {
        // Set a high timeout to allow for manual OTP entry if onboarding is triggered
        this.timeout(240000);

        const packageName = 'com.easy_eventz.development';
        
        console.log(`Closing app: ${packageName}`);
        await browser.terminateApp(packageName);
        await browser.pause(2000);
        
        console.log(`Launching app freshly: ${packageName}`);
        await browser.activateApp(packageName);
        await browser.pause(3000);

        // Click Get Started button on onboarding screen
        console.log("Clicking GET STARTED...");
        await WelcomeScreen.clickGetStarted();

        // Check if the Signup screen is displayed by looking for text containing "google" (sometimes bypassed)
        console.log("Checking if Signup screen is displayed...");
        const googleTextSelector = $('android=new UiSelector().textContains("google")');
        const isSignupScreen = await googleTextSelector.waitForDisplayed({ timeout: 10000 }).catch(() => false);

        if (isSignupScreen) {
            // Click Sign in with Google button on signup screen
            console.log("Clicking Signin with google...");
            await SignupScreen.clickSignInWithGoogle();
        } else {
            console.log("Signup screen was bypassed or did not display. Checking next state directly...");
        }

        // Define selectors to check next state
        const gmailId = process.env.GMAIL_ID || "";
        const accountSelector = $(`android=new UiSelector().text("${gmailId}")`);
        const emailInputSelector = $('android=new UiSelector().resourceId("identifierId")');
        const skipBtnSelector = $('android=new UiSelector().text("SKIP")');
        const phoneInputSelector = $('//android.widget.EditText[@resource-id="RNE__Input__text-input" and @text="Enter phone number"]');

        console.log("Waiting for Google account chooser, Sign-in screen, or Phone input screen...");
        let screenDetected = "";
        try {
            await browser.waitUntil(async () => {
                if (await accountSelector.isDisplayed()) {
                    screenDetected = "chooser";
                    return true;
                }
                if ((await emailInputSelector.isDisplayed()) || (await skipBtnSelector.isDisplayed())) {
                    screenDetected = "login";
                    return true;
                }
                if (await phoneInputSelector.isDisplayed()) {
                    screenDetected = "phone";
                    return true;
                }
                return false;
            }, {
                timeout: 30000,
                timeoutMsg: 'Timeout: None of the expected screens (Account Chooser, Sign-in, or Phone input) appeared'
            });
        } catch (error) {
            const screenshotDir = './screenshots';
            if (!fs.existsSync(screenshotDir)){
                fs.mkdirSync(screenshotDir, { recursive: true });
            }
            await browser.saveScreenshot(`${screenshotDir}/timeout_error_state.png`);
            console.log("Captured error screenshot: timeout_error_state.png");
            throw error;
        }

        console.log(`Detected screen state: ${screenDetected}`);

        if (screenDetected === "chooser") {
            console.log(`Google account chooser detected. Clicking on account: ${gmailId}`);
            await accountSelector.click();
        } else if (screenDetected === "login") {
            console.log("Google Account does not exist on mobile. Performing full sign-in...");
            await GoogleSignInScreen.login(
                process.env.GMAIL_ID || "",
                process.env.GMAIL_PASSWORD || ""
            );
        } else {
            console.log("Directly navigated to phone input/onboarding screen.");
        }

        // Wait to see if we navigate to the phone input screen or go directly to the home screen
        console.log("Checking if onboarding (phone input) screen appears...");
        let isOnboarding = false;
        try {
            await phoneInputSelector.waitForDisplayed({ timeout: 15000 });
            isOnboarding = true;
        } catch (e) {
            console.log("Phone input/onboarding screen did not appear within 15 seconds.");
        }

        if (isOnboarding) {
            console.log("Onboarding screen detected. Proceeding with phone verification...");
            await OnboardingScreen.loginWithPhone();
        } else {
            console.log("Onboarding screen not detected. Verifying if we landed on the home page...");
            const currentPackage = await browser.getCurrentPackage();
            console.log(`Current Package: ${currentPackage}`);
            
            // Check that we are indeed in the development app package and not left in Play Services
            expect(currentPackage).toBe(packageName);

            // Take a screenshot to verify UI visually
            const screenshotDir = './screenshots';
            if (!fs.existsSync(screenshotDir)){
                fs.mkdirSync(screenshotDir, { recursive: true });
            }
            await browser.saveScreenshot(`${screenshotDir}/home_page_landed.png`);
            console.log("Successfully landed on the home screen!");
        }
    });
});



