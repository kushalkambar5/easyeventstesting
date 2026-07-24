import WelcomeScreen from '../../screens/auth/WelcomeScreen';
import SignupScreen from '../../screens/auth/SignupScreen';
import OnboardingScreen from '../../screens/auth/OnboardingScreen';
import HomeScreen from '../../screens/home/HomeScreen';
import GoogleSignInScreen from '../../screens/auth/GoogleSignInScreen';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

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
    const emailInputSelector = $('android=new UiSelector().resourceId("identifierId")');
    const skipBtnSelector = $('android=new UiSelector().text("SKIP")');
    const phoneInputSelector = $('//android.widget.EditText[@resource-id="RNE__Input__text-input" and @text="Enter phone number"]');

    console.log("Waiting for Google account chooser, Sign-in screen, or Phone input screen...");
    let screenState = "";
    await browser.waitUntil(async () => {
        if (await accountSelector.isDisplayed()) {
            screenState = "chooser";
            return true;
        }
        if ((await emailInputSelector.isDisplayed()) || (await skipBtnSelector.isDisplayed())) {
            screenState = "login";
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
        timeout: 30000,
        timeoutMsg: 'Neither Google account chooser, Sign-in screen, phone input screen, nor Home screen appeared'
    });

    console.log(`Detected screen state after signup: ${screenState}`);
    if (screenState === "home") {
        console.log("Navigated to Home screen directly.");
        return;
    }

    if (screenState === "chooser") {
        console.log(`Google account chooser detected. Clicking on account: ${gmailId}`);
        await accountSelector.click();
    } else if (screenState === "login") {
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
        console.log("Entering phone number and requesting OTP...");
        await OnboardingScreen.loginWithPhone();
    } else {
        console.log("Onboarding screen not detected. Verifying if we landed on the home page...");
        await homeHeader.waitForDisplayed({ timeout: 25000 });
        console.log("Successfully landed on the home screen!");
    }
}

async function ensureOnHomeScreen() {
    const homeHeader = $('android=new UiSelector().text("Easy Events")');
    if (await homeHeader.isDisplayed()) {
        console.log("Already on Home screen.");
        return;
    }

    // Check if we are on the Welcome screen or Google Signup screen already
    const getStartedBtn = $('android=new UiSelector().text("GET STARTED")');
    const googleTextSelector = $('android=new UiSelector().textContains("google")');
    if (await getStartedBtn.isDisplayed() || await googleTextSelector.isDisplayed()) {
        console.log("Not on Home screen, but Welcome/Signup screen is already displayed. Proceeding to login directly...");
        await loginIfNecessary();
        return;
    }

    console.log("Not on Home screen. Relaunching app to recover state...");
    const packageName = 'com.easy_eventz.development';
    await browser.terminateApp(packageName);
    await browser.pause(2000);
    await browser.activateApp(packageName);
    await browser.pause(5000);
    await loginIfNecessary();
}

async function scrollDown() {
    console.log("Scrolling down...");
    try {
        const scrollableElement = $('android=new UiSelector().scrollable(true)');
        await scrollableElement.waitForDisplayed({ timeout: 10000 });
        await browser.execute('mobile: scroll', {
            elementId: await scrollableElement.elementId,
            direction: 'down'
        });
    } catch (err: any) {
        console.log(`mobile:scroll failed: ${err.message}. Using pointer swipe...`);
        // Swipe up to scroll down
        await browser.action('pointer')
            .move({ duration: 0, x: 500, y: 1500 })
            .down({ button: 0 })
            .move({ duration: 1000, x: 500, y: 500 })
            .up({ button: 0 })
            .perform();
    }
    await browser.pause(2000);
}

describe('Home Screen - Events Post Interaction', function () {
    it('should complete the signup/login flow using Google Sign-in', async function () {
        this.timeout(240000);
        const packageName = 'com.easy_eventz.development';
        
        console.log(`Closing app to start clean: ${packageName}`);
        await browser.terminateApp(packageName);
        await browser.pause(2000);
        
        console.log(`Launching app freshly: ${packageName}`);
        await browser.activateApp(packageName);
        await browser.pause(3000);

        await ensureOnHomeScreen();
    });

    it('should show share option on clicking 3-dots and hide it on clicking cancel', async function () {
        this.timeout(240000);
        await ensureOnHomeScreen();

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

    it('should increase like count on click and decrease on click again', async function () {
        this.timeout(240000);
        await ensureOnHomeScreen();
        await scrollDown();

        // Verify first post card is displayed
        console.log("Checking if first post card is displayed...");
        const postCard = await HomeScreen.firstPostCard;
        await postCard.waitForDisplayed({ timeout: 20000 });
        expect(await postCard.isDisplayed()).toBe(true);

        const likeBtn = await HomeScreen.likeButton;
        await likeBtn.waitForDisplayed({ timeout: 20000 });

        // Helper to extract count from TextView children of likeBtn
        const getLikeCount = async (btn: WebdriverIO.Element) => {
            const textViews = await btn.$$('android.widget.TextView');
            for (const tv of textViews) {
                const text = await tv.getText();
                const count = parseInt(text.replace(/\D/g, ''), 10);
                if (!isNaN(count)) {
                    return count;
                }
            }
            return 0;
        };

        // If initially liked, click to unlike so we start clean
        const initialDesc = await likeBtn.getAttribute('content-desc');
        console.log(`Initial button content-desc: "${initialDesc}"`);
        if (initialDesc === 'Unlike') {
            console.log("Post is already liked. Clicking to unlike first...");
            await likeBtn.click();
            await browser.pause(2000);
        }

        // Get initial count (unliked state)
        const initialCount = await getLikeCount(likeBtn);
        console.log(`Initial unliked count: ${initialCount}`);

        // Click to like
        console.log("Clicking like button to increase count...");
        await likeBtn.click();
        await browser.pause(2000);

        // Verify count increased
        const likedCount = await getLikeCount(likeBtn);
        console.log(`Liked count: ${likedCount}`);
        expect(likedCount).toBe(initialCount + 1);

        // Verify content-desc is now Unlike
        expect(await likeBtn.getAttribute('content-desc')).toBe('Unlike');

        // Click to unlike
        console.log("Clicking like button again to decrease count...");
        await likeBtn.click();
        await browser.pause(2000);

        // Verify count decreased back
        const unlikedCount = await getLikeCount(likeBtn);
        console.log(`Unliked count: ${unlikedCount}`);
        expect(unlikedCount).toBe(initialCount);

        // Verify content-desc is now Like
        expect(await likeBtn.getAttribute('content-desc')).toBe('Like');
    });

    it('should open share sheet on clicking the post share button and dismiss on tapping back', async function () {
        this.timeout(240000);
        await ensureOnHomeScreen();
        await scrollDown();

        const postShareBtn = await HomeScreen.postShareButton;
        try {
            await postShareBtn.waitForDisplayed({ timeout: 20000 });
        } catch (err) {
            console.log("Failed to find post Share button. Dumping page source:");
            console.log(await browser.getPageSource());
            throw err;
        }
        
        // Click the post share button
        console.log("Clicking post share button...");
        await postShareBtn.click();
        await browser.pause(3000); // Wait for system share sheet

        // Verify share sheet preview text is displayed
        console.log("Verifying system share sheet preview text from post share...");
        const shareSheetText = await HomeScreen.shareSheetPreviewText;
        await shareSheetText.waitForDisplayed({ timeout: 15000 });
        expect(await shareSheetText.isDisplayed()).toBe(true);

        // Assert that text contains the expected message
        const textContent = await shareSheetText.getText();
        console.log(`Share sheet text contents: "${textContent}"`);
        expect(textContent).toContain("Take a look at the memorable moments from Engagement, beautifully captured by");

        // Click hardware back button to close share sheet
        console.log("Tapping Android back button to close share sheet...");
        await browser.back();
        await browser.pause(3000); // Give it some time to process transitions

        // Verify that the share sheet is no longer displayed
        expect(await shareSheetText.isDisplayed().catch(() => false)).toBe(false);
    });
});

