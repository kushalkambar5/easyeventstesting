import BaseScreen from '../BaseScreen';
import * as dotenv from 'dotenv';

dotenv.config();

class OnboardingScreen extends BaseScreen {
    private get phoneInput() {
        return $('//android.widget.EditText[@resource-id="RNE__Input__text-input" and @text="Enter phone number"]');
    }

    private get getOtpButton() {
        return $('android.widget.Button');
    }

    /**
     * Enters the phone number from .env and clicks the "GET OTP" button.
     */
    public async loginWithPhone() {
        const phone = process.env.PHONE_NO;
        if (!phone) {
            throw new Error('PHONE_NO is not defined in .env');
        }

        const input = await this.phoneInput;
        await input.waitForDisplayed({ timeout: 10000 });
        await input.setValue(phone);

        const btn = await this.getOtpButton;
        await btn.waitForDisplayed({ timeout: 10000 });
        await btn.click();
    }
}

export default new OnboardingScreen();
