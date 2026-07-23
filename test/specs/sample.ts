describe('Sample', () => {
    it('Sample test case', async () => {

        // Your existing first button
        const getStartedButton = await $('android.widget.Button');
        await getStartedButton.waitForDisplayed({ timeout: 10000 });
        await getStartedButton.click();

        // Google sign-in button
        const signinWithGoogleButton = await $('android.widget.Button');
        await signinWithGoogleButton.waitForDisplayed({ timeout: 10000 });
        await signinWithGoogleButton.click();

        // Give Google Play Services time to open
        await browser.pause(3000);

        // Debug: which app/activity does Appium think is active?
        console.log(
            "PACKAGE:",
            await browser.getCurrentPackage()
        );

        console.log(
            "ACTIVITY:",
            await browser.getCurrentActivity()
        );

        // Check if "SKIP" button exists (indicating "Sign in with ease" screen)
        const skipButton = await $('android=new UiSelector().text("SKIP")');
        const emailInputText = await $('android=new UiSelector().resourceId("identifierId")');

        // Wait for either the SKIP button or the Email Input field to appear
        await browser.waitUntil(async () => {
            return (await skipButton.isDisplayed()) || (await emailInputText.isDisplayed());
        }, {
            timeout: 30000,
            timeoutMsg: 'Neither SKIP button nor Email input field appeared'
        });

        if (await skipButton.isDisplayed()) {
            console.log("Sign in with ease screen detected. Clicking SKIP...");
            await skipButton.click();
            
            // Diagnostics loop
            console.log("Starting diagnostics loop after SKIP click...");
            for (let i = 1; i <= 15; i++) {
                await browser.pause(1000);
                const pkg = await browser.getCurrentPackage();
                const act = await browser.getCurrentActivity();
                console.log(`Diagnostic Step ${i}: Package = ${pkg}, Activity = ${act}`);
                
                // Check if element is displayed
                const isEmailDisplayed = await emailInputText.isDisplayed();
                console.log(`Diagnostic Step ${i}: Email input displayed = ${isEmailDisplayed}`);
                
                if (isEmailDisplayed) {
                    console.log(`Email input appeared at step ${i}!`);
                    break;
                }
            }
        } else {
            console.log("Direct Sign-in screen detected.");
        }

        // Wait for Email input field to appear (fallback/guarantee)
        await emailInputText.waitForDisplayed({ timeout: 15000 });
        await emailInputText.click();
        await browser.pause(1000);
        await emailInputText.clearValue();
        await emailInputText.setValue("rohitbabarohitbaba2006@gmail.com");
        console.log("Email filled");

        // Click NEXT button to submit email
        const nextButton2 = await $('android=new UiSelector().text("NEXT")');
        await nextButton2.waitForDisplayed({ timeout: 20000 });
        await nextButton2.click();
        console.log("NEXT clicked after entering email");

        // Wait for Password input field to appear (using XPath with @password="true" to avoid matching the email field)
        const passwordInput = await $('//android.widget.EditText[@password="true"]');
        await passwordInput.waitForDisplayed({ timeout: 20000 });
        await passwordInput.click();
        await browser.pause(1000);
        await passwordInput.clearValue();
        await passwordInput.setValue("Rohit@2007");
        console.log("Password filled");

        // Click NEXT button to submit password
        const nextButton3 = await $('android=new UiSelector().text("NEXT")');
        await nextButton3.waitForDisplayed({ timeout: 15000 });
        await nextButton3.click();
        console.log("NEXT clicked after entering password");

        // Wait for either the "Use another phone or computer..." option or "I agree" button to appear
        const useAnotherOption = await $('android=new UiSelector().description("Use another phone or computer to finish signing in")');
        const iAgreeButton = await $('android=new UiSelector().text("I agree")');

        console.log("Waiting for verification option or 'I agree' button...");
        await browser.waitUntil(async () => {
            return (await useAnotherOption.isDisplayed()) || (await iAgreeButton.isDisplayed());
        }, {
            timeout: 30000,
            timeoutMsg: "Neither 'Use another phone...' option nor 'I agree' button appeared after password submission"
        });

        if (await useAnotherOption.isDisplayed()) {
            console.log("'Use another phone or computer to finish signing in' option detected. Clicking it...");
            await useAnotherOption.click();
        } else {
            console.log("Direct 'I agree' screen detected (skipped/bypassed verification screen).");
        }

        // Wait for the "I agree" button to appear and click it
        console.log("Waiting for 'I agree' button to be displayed...");
        await iAgreeButton.waitForDisplayed({ timeout: 120000 });
        await iAgreeButton.click();
        console.log("Clicked 'I agree' button");

        // Wait for the "Skip" button on the "Set a home address" screen (appears after 10-15 seconds of loading)
        const skipHomeAddressButton = await $('android=new UiSelector().text("Skip")');
        await skipHomeAddressButton.waitForDisplayed({ timeout: 30000 });
        await skipHomeAddressButton.click();
        console.log("Clicked 'Skip' on the Set a home address screen");

        // Wait for the "Don't back up" button on the "Back up your device" screen
        const dontBackupButton = await $('android=new UiSelector().text("Don\'t back up")');
        await dontBackupButton.waitForDisplayed({ timeout: 20000 });
        await dontBackupButton.click();
        console.log("Clicked 'Don\'t back up' button");

        // Brief pause to observe success/next screen
        await browser.pause(5000);
    });
});