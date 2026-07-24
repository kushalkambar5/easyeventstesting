import BaseScreen from '../BaseScreen';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as os from 'os';

dotenv.config();

class OnboardingScreen extends BaseScreen {
    private get phoneInput() {
        return $('//android.widget.EditText[@resource-id="RNE__Input__text-input" and @text="Enter phone number"]');
    }

    private get getOtpButton() {
        return $('android.widget.Button');
    }

    private get otpInput() {
        return $('//android.widget.EditText[@resource-id="RNE__Input__text-input" and @text="Enter 4-digit OTP"]');
    }

    private get submitButton() {
        return $('android.widget.Button');
    }

    /**
     * Enters the phone number from .env, clicks the "GET OTP" button,
     * prompts the user for the OTP, fills it, and clicks submit.
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

        // Wait for OTP input to be displayed on screen
        const otpField = await this.otpInput;
        await otpField.waitForDisplayed({ timeout: 15000 });

        // Prompt for OTP in the terminal
        const otp = await this.askOtpFromTerminal();

        // Fill in the OTP
        await otpField.setValue(otp);

        // Click submit button
        const submitBtn = await this.submitButton;
        await submitBtn.waitForDisplayed({ timeout: 10000 });
        await submitBtn.click();
    }

    /**
     * Ask user for OTP in the terminal (reads directly from the console)
     */
    private async askOtpFromTerminal(): Promise<string> {
        const isWin = os.platform() === 'win32';
        const ttyIn = isWin ? '\\\\.\\CONIN$' : '/dev/tty';
        const ttyOut = isWin ? '\\\\.\\CONOUT$' : '/dev/tty';

        console.log('\n======================================================');
        console.log('ACTION REQUIRED: Enter the OTP in the terminal window');
        console.log('======================================================');

        try {
            // Write prompt directly to console output
            const fdOut = fs.openSync(ttyOut, 'w');
            fs.writeSync(fdOut, '\nEnter the 4-digit OTP: ');
            fs.closeSync(fdOut);

            // Read directly from console input
            const fdIn = fs.openSync(ttyIn, 'r');
            const buffer = Buffer.alloc(1024);
            const bytesRead = fs.readSync(fdIn, buffer, 0, 1024, null);
            fs.closeSync(fdIn);

            const otp = buffer.toString('utf8', 0, bytesRead).trim();
            if (otp) return otp;
        } catch (err: any) {
            console.warn('Could not read from TTY/CONIN$ directly:', err.message);
        }

        // Fallback using standard process.stdin in case of errors
        const readline = require('readline');
        return new Promise((resolve) => {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            rl.question('\nEnter the 4-digit OTP: ', (answer: string) => {
                rl.close();
                resolve(answer.trim());
            });
        });
    }
}

export default new OnboardingScreen();
