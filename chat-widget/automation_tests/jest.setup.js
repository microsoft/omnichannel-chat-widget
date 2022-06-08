// DotEnv allows local variables for process.env
/* eslint-disable @typescript-eslint/no-var-requires */
require("dotenv").config();
// timeout for waiting for a specific test to complete.
/* eslint-disable @typescript-eslint/no-var-requires */
require("dotenv").config();
jest.setTimeout((process.env.TestTimeoutMinutes || 10) * 60 * 1000);
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
jest.retryTimes(process.env.TestRetryCount || 0);
if (!process.env.Verbose) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    console.log = function (data) {};
}
