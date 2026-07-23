import BaseScreen from '../BaseScreen';

class GoogleSignInScreen extends BaseScreen {
    private get skipButton() {
        return $('android=new UiSelector().text("SKIP")');
    }

    private get emailInput() {
        return $('android=new UiSelector().resourceId("identifierId")');
    }

    private get nextButton() {
        return $('android=new UiSelector().text("NEXT")');
    }

    private get passwordInput() {
        return $('//android.widget.EditText[@password="true"]');
    }

    private get useAnotherOption() {
        return $('android=new UiSelector().description("Use another phone or computer to finish signing in")');
    }

    private get iAgreeButton() {
        return $('android=new UiSelector().text("I agree")');
    }

    private get skipHomeAddressButton() {
        return $('android=new UiSelector().text("Skip")');
    }

    private get dontBackupButton() {
        return $('android=new UiSelector().text("Don\'t back up")');
    }

    /**
     * Performs the full Google Sign-In authentication flow.
     * @param email Google account email
     * @param password Google account password
     */
    public async login(email: string, password: string) {
        // Give Google Play Services time to open
        await browser.pause(3000);

        console.log("PACKAGE:", await browser.getCurrentPackage());
        console.log("ACTIVITY:", await browser.getCurrentActivity());

        const skipBtn = await this.skipButton;
        const emailField = await this.emailInput;

        // Wait for either the SKIP button or the Email Input field to appear
        await browser.waitUntil(async () => {
            return (await skipBtn.isDisplayed()) || (await emailField.isDisplayed());
        }, {
            timeout: 30000,
            timeoutMsg: 'Neither SKIP button nor Email input field appeared'
        });

        if (await skipBtn.isDisplayed()) {
            console.log("Sign in with ease screen detected. Clicking SKIP...");
            await skipBtn.click();
            
            // Diagnostics loop
            console.log("Starting diagnostics loop after SKIP click...");
            for (let i = 1; i <= 15; i++) {
                await browser.pause(1000);
                const pkg = await browser.getCurrentPackage();
                const act = await browser.getCurrentActivity();
                console.log(`Diagnostic Step ${i}: Package = ${pkg}, Activity = ${act}`);
                
                const isEmailDisplayed = await emailField.isDisplayed();
                console.log(`Diagnostic Step ${i}: Email input displayed = ${isEmailDisplayed}`);
                
                if (isEmailDisplayed) {
                    console.log(`Email input appeared at step ${i}!`);
                    break;
                }
            }
        } else {
            console.log("Direct Sign-in screen detected.");
        }

        // Wait for Email input field to appear and fill it
        await emailField.waitForDisplayed({ timeout: 15000 });
        await emailField.click();
        await browser.pause(1000);
        await emailField.clearValue();
        await emailField.setValue(email);
        console.log("Email filled");

        // Click NEXT button
        const nextBtn = await this.nextButton;
        await nextBtn.waitForDisplayed({ timeout: 20000 });
        await nextBtn.click();
        console.log("NEXT clicked after entering email");

        // Wait for Password input field to appear and fill it
        const passwordField = await this.passwordInput;
        await passwordField.waitForDisplayed({ timeout: 20000 });
        await passwordField.click();
        await browser.pause(1000);
        await passwordField.clearValue();
        await passwordField.setValue(password);
        console.log("Password filled");

        // Click NEXT button after entering password
        const nextBtnPass = await this.nextButton;
        await nextBtnPass.waitForDisplayed({ timeout: 15000 });
        await nextBtnPass.click();
        console.log("NEXT clicked after entering password");

        // Wait for either the "Use another phone or computer..." option or "I agree" button to appear
        const useAnotherOpt = await this.useAnotherOption;
        const agreeBtn = await this.iAgreeButton;

        console.log("Waiting for verification option or 'I agree' button...");
        await browser.waitUntil(async () => {
            return (await useAnotherOpt.isDisplayed()) || (await agreeBtn.isDisplayed());
        }, {
            timeout: 30000,
            timeoutMsg: "Neither 'Use another phone...' option nor 'I agree' button appeared after password submission"
        });

        if (await useAnotherOpt.isDisplayed()) {
            console.log("'Use another phone or computer to finish signing in' option detected. Clicking it...");
            await useAnotherOpt.click();
        } else {
            console.log("Direct 'I agree' screen detected (skipped/bypassed verification screen).");
        }

        // Wait for the "I agree" button to appear and click it
        console.log("Waiting for 'I agree' button to be displayed...");
        await agreeBtn.waitForDisplayed({ timeout: 120000 });
        await agreeBtn.click();
        console.log("Clicked 'I agree' button");

        // Wait for the "Skip" button on the "Set a home address" screen
        const skipHomeAddr = await this.skipHomeAddressButton;
        await skipHomeAddr.waitForDisplayed({ timeout: 30000 });
        await skipHomeAddr.click();
        console.log("Clicked 'Skip' on the Set a home address screen");

        // Wait for the "Don't back up" button on the "Back up your device" screen
        const dontBackup = await this.dontBackupButton;
        await dontBackup.waitForDisplayed({ timeout: 20000 });
        await dontBackup.click();
        console.log("Clicked 'Don\'t back up' button");

        // Brief pause to observe success/next screen
        await browser.pause(5000);
    }
}

export default new GoogleSignInScreen();
