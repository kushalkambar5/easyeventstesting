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
        return $('//android.view.ViewGroup[android.widget.TextView[@text="Share"]]');
    }

    /**
     * The cancel button on the overlay menu (close icon).
     */
    public get cancelButton() {
        return $('//android.view.ViewGroup[@content-desc="Close menu"]/android.widget.TextView');
    }

    /**
     * The system share sheet content preview text.
     */
    public get shareSheetPreviewText() {
        return $('//android.widget.TextView[@resource-id="com.android.intentresolver:id/content_preview_text"]');
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
     * Clicks the share button on the overlay menu.
     */
    public async clickShare() {
        console.log("Waiting for and clicking the share button...");
        const btn = await this.shareButton;
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
