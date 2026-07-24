import WelcomeScreen from '../../screens/auth/WelcomeScreen';
import SignupScreen from '../../screens/auth/SignupScreen';
import OnboardingScreen from '../../screens/auth/OnboardingScreen';
import HomeScreen from '../../screens/home/HomeScreen';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function loginIfNecessary() {
    console.log("Detecting if we are logged in or on the welcome screen...");
    const getStartedBtn = $('android=new UiSelector().text("GET STARTED")');
    const homeHeader = $('android=new UiSelector().text("Easy Events")');
    const googleTextSelector = $('android=new UiSelector().textContains("google")');

    let state = "";
    try {
        await browser.waitUntil(async () => {
            if (await getStartedBtn.isDisplayed()) {
                state = "welcome";
                return true;
            }
            if (await homeHeader.isDisplayed()) {
                state = "home";
                return true;
            }
            return false;
        }, {
            timeout: 25000,
            timeoutMsg: "Neither Welcome screen nor Home screen appeared within 25 seconds."
        });
    } catch (err: any) {
        console.log(`State detection timed out: ${err.message}. Assuming welcome screen...`);
        state = "welcome";
    }

    console.log(`Detected state: ${state}`);
    if (state === "home") {
        console.log("Already logged in and on Home screen.");
        return;
    }

    console.log("On Welcome screen. Clicking GET STARTED...");
    await WelcomeScreen.clickGetStarted();

    // Check if we went to Home Screen directly or to the Signup screen
    let afterWelcomeState = "";
    try {
        await browser.waitUntil(async () => {
            if (await homeHeader.isDisplayed()) {
                afterWelcomeState = "home";
                return true;
            }
            if (await googleTextSelector.isDisplayed()) {
                afterWelcomeState = "signup";
                return true;
            }
            return false;
        }, {
            timeout: 15000,
            timeoutMsg: "Neither Home screen nor Signup screen appeared after clicking GET STARTED."
        });
    } catch (err: any) {
        console.log(`Timeout waiting for screen after GET STARTED: ${err.message}. Assuming signup...`);
        afterWelcomeState = "signup";
    }

    console.log(`State after clicking GET STARTED: ${afterWelcomeState}`);
    if (afterWelcomeState === "home") {
        console.log("Navigated to Home screen directly after GET STARTED.");
        return;
    }

    console.log("Signup screen detected. Clicking Signin with google...");
    await SignupScreen.clickSignInWithGoogle();

    const gmailId = process.env.GMAIL_ID || "";
    const accountSelector = $(`android=new UiSelector().text("${gmailId}")`);
    const phoneInputSelector = $('//android.widget.EditText[@resource-id="RNE__Input__text-input" and @text="Enter phone number"]');

    console.log("Waiting for Google account chooser, phone input screen, or Home screen...");
    let screenState = "";
    await browser.waitUntil(async () => {
        if (await accountSelector.isDisplayed()) {
            screenState = "chooser";
            return true;
        }
        if (await phoneInputSelector.isDisplayed()) {
            screenState = "phone";
            return true;
        }
        if (await homeHeader.isDisplayed()) {
            screenState = "home";
            return true;
        }
        return false;
    }, {
        timeout: 25000,
        timeoutMsg: 'Neither Google account chooser, phone input screen, nor Home screen appeared'
    });

    console.log(`Detected screen state after signup: ${screenState}`);
    if (screenState === "home") {
        console.log("Navigated to Home screen directly.");
        return;
    }

    if (screenState === "chooser") {
        console.log(`Google account chooser detected. Clicking on account: ${gmailId}`);
        await accountSelector.click();
        
        // Wait to see if we land on Home screen or Phone input screen
        console.log("Waiting for Home screen or Phone input screen...");
        let afterChooserState = "";
        await browser.waitUntil(async () => {
            if (await homeHeader.isDisplayed()) {
                afterChooserState = "home";
                return true;
            }
            if (await phoneInputSelector.isDisplayed()) {
                afterChooserState = "phone";
                return true;
            }
            return false;
        }, {
            timeout: 20000,
            timeoutMsg: "Neither Home screen nor Phone input screen appeared after account selection."
        });

        if (afterChooserState === "home") {
            console.log("Navigated to Home screen after account selection.");
            return;
        }
    }

    // Entering phone number and requesting OTP
    console.log("Entering phone number and requesting OTP...");
    await OnboardingScreen.loginWithPhone();
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

    it('should open share sheet on clicking share and dismiss everything on tapping back', async function () {
        this.timeout(240000);

        // Click the three dots button
        await HomeScreen.clickThreeDots();
        await browser.pause(2000);

        // Click share button
        await HomeScreen.clickShare();
        await browser.pause(3000); // Wait for the system intent resolver/share sheet to appear

        // Verify share sheet preview text is displayed
        console.log("Verifying system share sheet preview text...");
        const shareSheetText = await HomeScreen.shareSheetPreviewText;
        await shareSheetText.waitForDisplayed({ timeout: 15000 });
        expect(await shareSheetText.isDisplayed()).toBe(true);

        // Assert that text contains the expected message
        const textContent = await shareSheetText.getText();
        console.log(`Share sheet text contents: "${textContent}"`);
        expect(textContent).toContain("Take a look at the memorable moments from Engagement, beautifully captured by");

        // Click hardware back button to close share sheet and overlay
        console.log("Tapping Android back button...");
        await browser.back();
        await browser.pause(3000); // Give it some time to process transitions

        // Verify both share and cancel button are not on the screen anymore
        console.log("Checking that both share and cancel buttons have disappeared...");
        const shareBtn = await HomeScreen.shareButton;
        const cancelBtn = await HomeScreen.cancelButton;

        await shareBtn.waitForDisplayed({ reverse: true, timeout: 5000 }).catch(() => {});
        await cancelBtn.waitForDisplayed({ reverse: true, timeout: 5000 }).catch(() => {});

        expect(await shareBtn.isDisplayed().catch(() => false)).toBe(false);
        expect(await cancelBtn.isDisplayed().catch(() => false)).toBe(false);
    });
});
