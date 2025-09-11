export default class VisualTestReporter {
    constructor(globalConfig, options) {
        this._globalConfig = globalConfig;
        this._options = options;
    }

    onTestResult(test, testResult) {
        if (testResult.numFailingTests > 0) {
            console.log("\n🚨 VISUAL TEST FAILURES DETECTED 🚨\n");
            
            testResult.testResults.forEach((result) => {
                if (result.status === "failed") {
                    console.log(`❌ Test: ${result.ancestorTitles.join(" > ")} > ${result.title}`);
                    console.log(`   File: ${test.path}`);
                    
                    result.failureMessages.forEach((message, index) => {
                        console.log(`   Failure ${index + 1}:`);
                        console.log(`   ${message.split("\n")[0]}`); // First line of error
                    });
                    console.log("");
                }
            });
        }
    }

    onRunComplete(contexts, results) {
        if (results.numFailedTests > 0) {
            console.log("\n📊 VISUAL TEST SUMMARY:");
            console.log(`   Total Failed Tests: ${results.numFailedTests}`);
            console.log(`   Failed Test Suites: ${results.numFailedTestSuites}`);
            console.log("   Check the artifacts for screenshots and diffs\n");
        }
    }
}
