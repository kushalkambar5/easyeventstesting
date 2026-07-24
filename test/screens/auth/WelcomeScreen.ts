import BaseScreen from '../BaseScreen';

class WelcomeScreen extends BaseScreen {
    private get getStartedButton() {
        return $('android.widget.Button');
    }

    public async clickGetStarted() {
        const btn = await this.getStartedButton;
        await btn.waitForDisplayed({ timeout: 10000 });
        await btn.click();
        await browser.pause(3000);
    }
}

export default new WelcomeScreen();
