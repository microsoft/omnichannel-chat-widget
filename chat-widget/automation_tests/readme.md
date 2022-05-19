# How to run playwright testcases against your environment

Lets say you have an environment. You want to run a set of playwright testcases on that environment for debugging or verifying that they work. 
Below is the list of steps needed to set up the pipeline to run tests against your environment.

## Parameters

### test categories: This enables us to run tests at various granularities:
- run a single test by specifing its name. eg: get-chat-token.spec.ts
- run tests in a specific folder. eg: live-chat2/queue-position

### update testsuite for this run: check this if you want to update your testsuite's testcase outcomes based on the run

### Run admin simulator: check this if you want to run admin simulator to populate data in the org

## KeyVault integration with pipeline
- Make sure you have your secrets (necessary to run tests) in a keyvault. eg: oc-test-ocrpenv-nam-vt
- You need to create a variable group where the required secrets are retrieved and automatically added as pipeline variables. 
eg: https://dev.azure.com/dynamicscrm/OneCRM/_library?itemType=VariableGroups&view=VariableGroupView&variableGroupId=1022&path=ocrpenv-vault

## Set Pipeline variables in YAML
Set org specific config in the pipeline variables in YAML task.
Here: https://dev.azure.com/dynamicscrm/OneCRM/_git/CRM.Omnichannel.ServiceIntegration?path=/src/.pipelines%2Fazure-pipelines.yml

AgentEmails: is a list (in order) of all the agents that are needed. These will map to the agent indices in the JSON file you pass.


## To populate the result of run 
For reference: https://dev.azure.com/dynamicscrm/OneCRM/_testPlans/execute?planId=1102798&suiteId=2279054
Add PAT token in variables.
