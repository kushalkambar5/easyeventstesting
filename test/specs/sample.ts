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
        const emailInputText = await $('id=identifierId');

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

        // Fill in email
        await emailInputText.setValue("kushalbkambar@gmail.com");
        console.log("Email filled");

        // Click NEXT button to submit email
        const nextButton2 = await $('android=new UiSelector().text("NEXT")');
        await nextButton2.waitForDisplayed({ timeout: 20000 });
        await nextButton2.click();
        console.log("NEXT clicked after entering email");
    });
});