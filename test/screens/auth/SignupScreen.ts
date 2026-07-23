import BaseScreen from '../BaseScreen';

class SignupScreen extends BaseScreen {
    private get signinWithGoogleButton() {
        return $('android.widget.Button');
    }

    public async clickSignInWithGoogle() {
        const btn = await this.signinWithGoogleButton;
        await btn.waitForDisplayed({ timeout: 10000 });
        await btn.click();
    }
}

export default new SignupScreen();
