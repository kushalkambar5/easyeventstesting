import WelcomeScreen from '../../screens/auth/WelcomeScreen';
import SignupScreen from '../../screens/auth/SignupScreen';
import GoogleSignInScreen from '../../screens/auth/GoogleSignInScreen';

describe('Sign Up / Login with Google', () => {
    it('should complete the signup/login flow using Google Sign-in', async () => {
        // Click Get Started button on onboarding screen
        await WelcomeScreen.clickGetStarted();

        // Click Sign in with Google button on signup screen
        await SignupScreen.clickSignInWithGoogle();

        // Perform Google Login
        await GoogleSignInScreen.login(
            "rohitbabarohitbaba2006@gmail.com",
            "Rohit@2007"
        );
    });
});
