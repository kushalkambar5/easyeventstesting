import WelcomeScreen from '../../screens/auth/WelcomeScreen';
import SignupScreen from '../../screens/auth/SignupScreen';
import OnboardingScreen from '../../screens/auth/OnboardingScreen';
import HomeScreen from '../../screens/home/HomeScreen';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function loginIfNecessary() {
    console.log("Checking if onboarding or welcome screen is active...");
    const getStartedBtn = $('android.widget.Button');
    const isWelcome = await getStartedBtn.waitForDisplayed({ timeout: 5000 }).catch(() => false);
    if (!isWelcome) {
        console.log("Welcome screen not detected. Assuming already logged in.");
        return;
    }

    console.log("Welcome screen detected. Clicking GET STARTED...");
    await WelcomeScreen.clickGetStarted();

    // Check if the Signup screen is displayed
    const googleTextSelector = $('android=new UiSelector().textContains("google")');
    const isSignupScreen = await googleTextSelector.waitForDisplayed({ timeout: 5000 }).catch(() => false);

    if (isSignupScreen) {
        console.log("Signup screen detected. Clicking Signin with google...");
        await SignupScreen.clickSignInWithGoogle();
    } else {
        console.log("Signup screen was bypassed. Checking next state...");
    }

    const gmailId = process.env.GMAIL_ID || "";
    const accountSelector = $(`android=new UiSelector().text("${gmailId}")`);
    const phoneInputSelector = $('//android.widget.EditText[@resource-id="RNE__Input__text-input" and @text="Enter phone number"]');

    console.log("Waiting for Google account chooser or phone input screen...");
    await browser.waitUntil(async () => {
        return (await accountSelector.isDisplayed()) || (await phoneInputSelector.isDisplayed());
    }, {
        timeout: 20000,
        timeoutMsg: 'Neither Google account chooser nor phone input screen appeared'
    });

    if (await accountSelector.isDisplayed()) {
        console.log(`Google account chooser detected. Clicking on account: ${gmailId}`);
        await accountSelector.click();
    }

    // Check if onboarding phone input screen appears
    console.log("Checking if onboarding (phone input) screen appears...");
    let isOnboarding = false;
    try {
        await phoneInputSelector.waitForDisplayed({ timeout: 10000 });
        isOnboarding = true;
    } catch (e) {
        console.log("Phone input/onboarding screen did not appear.");
    }

    if (isOnboarding) {
        console.log("Entering phone number and requesting OTP...");
        await OnboardingScreen.loginWithPhone();
    }
}

describe('Home Screen - Events Post Interaction', function () {
    it('should show share option on clicking 3-dots and hide it on clicking cancel', async function () {
        this.timeout(240000);

        const packageName = 'com.easy_eventz.development';
        
        console.log(`Closing app: ${packageName}`);
        await browser.terminateApp(packageName);
        await browser.pause(2000);
        
        console.log(`Launching app freshly: ${packageName}`);
        await browser.activateApp(packageName);
        await browser.pause(5000);

        // Run login flow if necessary
        await loginIfNecessary();

        // Verify first post card is displayed
        console.log("Checking if first post card is displayed...");
        const postCard = await HomeScreen.firstPostCard;
        await postCard.waitForDisplayed({ timeout: 20000 });
        expect(await postCard.isDisplayed()).toBe(true);

        // Click the three dots button
        await HomeScreen.clickThreeDots();
        await browser.pause(2000);

        // Verify share button and cancel button are displayed
        console.log("Checking if share button and cancel button are displayed...");
        const shareBtn = await HomeScreen.shareButton;
        const cancelBtn = await HomeScreen.cancelButton;

        await shareBtn.waitForDisplayed({ timeout: 10000 });
        await cancelBtn.waitForDisplayed({ timeout: 10000 });

        expect(await shareBtn.isDisplayed()).toBe(true);
        expect(await cancelBtn.isDisplayed()).toBe(true);

        // Click cancel button
        await HomeScreen.clickCancel();

        // Verify share button disappears
        console.log("Verifying that share button disappears...");
        await shareBtn.waitForDisplayed({ reverse: true, timeout: 10000 });
        expect(await shareBtn.isDisplayed()).toBe(false);
    });
});
