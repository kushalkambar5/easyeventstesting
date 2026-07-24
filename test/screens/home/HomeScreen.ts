import BaseScreen from '../BaseScreen';

class HomeScreen extends BaseScreen {
    /**
     * The first event post card on the home screen.
     */
    public get firstPostCard() {
        return $('//android.view.ViewGroup[@index="0"]');
    }

    /**
     * The 3-dots option button inside the first post card.
     */
    public get threeDotsButton() {
        return $('//android.view.ViewGroup[@index="0"]//android.widget.Button[@index="3"]');
    }

    /**
     * The share button on the overlay menu.
     */
    public get shareButton() {
        return $('//android.view.ViewGroup[@index="4"]');
    }

    /**
     * The cancel button on the overlay menu.
     */
    public get cancelButton() {
        return $('//android.widget.TextView[@index="0" or contains(@text, "Cancel") or contains(@text, "cancel") or contains(@text, "CANCEL")]');
    }

    /**
     * Clicks the 3-dots button on the first post card.
     */
    public async clickThreeDots() {
        console.log("Waiting for and clicking the 3-dots button on the first post card...");
        const btn = await this.threeDotsButton;
        await btn.waitForDisplayed({ timeout: 15000 });
        await btn.click();
    }

    /**
     * Clicks the cancel button on the overlay menu.
     */
    public async clickCancel() {
        console.log("Waiting for and clicking the cancel button...");
        const btn = await this.cancelButton;
        await btn.waitForDisplayed({ timeout: 15000 });
        await btn.click();
    }
}

export default new HomeScreen();
