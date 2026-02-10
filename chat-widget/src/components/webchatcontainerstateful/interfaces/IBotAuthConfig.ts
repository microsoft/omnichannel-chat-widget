export interface IBotAuthConfig {
    fetchBotAuthConfigRetries?: number;
    fetchBotAuthConfigRetryInterval?: number;
    /**
     * Fallback value to determine whether to show the sign-in card when the bot auth config fetch fails after all retries.
     * - `true`: Show the sign-in card to the user
     * - `false`: Hide the sign-in card
     * - `undefined`: Throw an error if the fetch fails (default behavior)
     */
    fallbackShowSignInCard?: boolean;
}
