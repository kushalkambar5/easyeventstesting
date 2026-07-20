describe('Sample', () => {
    it("Sample test case", async () => {
        // Find the button by its class name
        const getStartedButton = await $('android.widget.Button');
        await getStartedButton.click();

        // Find the text view containing 'LETS'
        const textBox = await $('android=new UiSelector().textContains("LETS")');
        await expect(textBox).toBeDisplayed();
    });
});