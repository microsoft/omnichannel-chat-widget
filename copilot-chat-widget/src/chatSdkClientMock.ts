export class ChatSdkClientMock {
        public acsUserId = '8:acs:fdfc4788-34f7-4174-b3a9-ab7e9a80b1d8_00000010-e913-a983-eef0-8b3a0d00088b';
        public acsUserId2 = '8:acs:fdfc4788-34f7-4174-b3a9-ab7e9a80b1d8_00000010-e913-a983-eef0-8b3a0d000000';
        public chatThreadId = 'fakeConversationId';
        public chatThreadId2 = 'fakeConversationId2';
        public fakeChatThreadClient;
        public fakeChatClient;
        public logger;
        public featureOptions;
        public acsAdapter;

        public constructor() {
            this.fakeChatThreadClient = this.initThreadClient();
            this.fakeChatClient = this.initMockChatClient();
            this.logger = {
                logEvent: (level: any, event: any) => {
                    console.log('level: ', level, ' event: ', event);
                }
            };
            this.featureOptions = {
                enableAdaptiveCards: false, // Whether to enable adaptive card payload in adapter(which will convert content payload into a json string)
                enableThreadMemberUpdateNotification: false, // Whether to enable chat thread member join/leave notification
                enableLeaveThreadOnWindowClosed: false, // Whether to remove user on browser close event
                enableSenderDisplayNameInTypingNotification: false, // Whether to send sender display name in typing notification
                historyPageSizeLimit: 1, // History messages's size limit per page. Off by default if no size limit provided
                egressMiddleware: [],
                ingressMiddleware: []
            };
            this.acsAdapter = this.initAdapter();
        }

        public initThreadClient() {
            const fakeChatThreadClient = {
            getProperties: (options: any) => {
                console.log('fakeChatThreadClient: getProperties: options: ', options);
                const fakeChatThreadProperties = {
                id: 'fakeChatThreadProperties_id',
                topic: 'fakeChatThreadProperties_topic',
                createdOn: Date.now()
                };
                return Promise.resolve(fakeChatThreadProperties);
            },
            updateTopic: (topic: any, options: any) => {
                console.log('fakeChatThreadClient: updateTopic: topic: ', topic, ' options: ', options);
                return Promise.resolve();
            },
            sendMessage: (request: any, options: any) => {
                const fakeSendChatMessageResult = {
                id: 'fakeSendChatMessageResult_success'
                };
                console.log('fakeChatThreadClient: sendMessage: request: ', request, options);
                const receiptMessage = {
                threadId: this.chatThreadId,
                sender: {
                    id: this.acsUserId,
                    communicationUserId: this.acsUserId,
                    createdOn: new Date(),
                    ChatMessageId: 'fakeInbountMessage_0_ChatMessageId'
                },
                senderDisplayName: options.senderDisplayName,
                createdOn: new Date(),
                metadata: {
                    clientActivityId: options.metadata.clientActivityId
                },
                message: request.content
                };
                setTimeout(() => {
                console.log("echo called");
                (window as any).sendACSMessage(receiptMessage);
                }, 2*1000);
                return Promise.resolve(fakeSendChatMessageResult);
            },
            getMessage: (messageId: any, options: any) => {
                const fakeChatMessage = {
                id: 'fakeChatMessage_id',
                type: 'text',
                sequenceId: 'fakeChatMessage_sequenceId',
                version: 'fakeChatMessage_version',
                content: {
                    message: 'fakeChatMessage_fake_message',
                    topic: 'fakeChatMessage_fake_topic'
                },
                createdOn: Date.now(),
                sender: {
                    communicationUserId: 'fakeChatMessage_fake_communicationUserId'
                },
                senderDisplayName: 'fakeChatMessage_fake_senderDisplayName'
                };
                console.log('fakeChatThreadClient: getMessage:', messageId, options);
                return Promise.resolve(fakeChatMessage);
            },
            listMessages: (options: any) => {
                console.log('fakeChatThreadClient: listMessages: options: ', options);
                const fakeListChatMessage = {
                id: 'fakeListChatMessage_id',
                type: 'text',
                sequenceId: 'fakeListChatMessage_sequenceId',
                version: 'fakeListChatMessage_version',
                content: {
                    message: 'fakeListChatMessage_fake_message',
                    topic: 'fakeListChatMessage_fake_topic'
                },
                createdOn: new Date(),
                sender: {
                    communicationUserId: 'fakeListChatMessage_fake_communicationUserId'
                },
                senderDisplayName: 'fakeListChatMessage_fake_senderDisplayName'
                };
                const fakePagedAsyncIterableIterator = {
                byPage: () => {
                    return {
                    next: () => {
                        return Promise.resolve({
                        value: [fakeListChatMessage]
                        });
                    }
                    };
                }
                };

                return fakePagedAsyncIterableIterator;
            },
            addParticipants: (request: any, options: any) => {
                console.log('fakeChatThreadClient: addParticipants: request: ', request, options);
                return Promise.resolve({});
            },
            sendTypingNotification: (options: any) => {
                console.log('fakeChatThreadClient: sendTypingNotification: options: ', options);
                return Promise.resolve();
            }
            };
            return fakeChatThreadClient;
        }


    public getAMSHandler() {
        const fakeFileManager = {
          uploadFiles: (files: any) => {
            console.log('upload files: ', files);
            return Promise.resolve([]);
          },
          downloadFiles: () => {
            console.log('download files: ');
            return Promise.resolve([]);
          },
          updatePermissions: (file: any, permission: any) => {
            console.log('download files: ', file, ' permission: ', permission);
            return Promise.resolve();
          },
          getFileIds: (metadata: any) => {
            console.log('getFileIds called: ', metadata);
            return undefined;
          },
          createFileIdProperty: (fileIds: any) => {
            console.log('createFileIdProperty called: ', fileIds);
            return null;
          },
          getFileMetadata: (metadata: any) => {
            console.log('getFileMetadata called: ', metadata);
            return undefined;
          },
          createFileMetadataProperty: (metadata: any) => {
            console.log('createFileMetadataProperty called: ', metadata);
            return { recordKey: 'record_value' };
          }
        };
        return fakeFileManager;
    }

    public initMockChatClient() {
        const fakeChatClient = {
          getChatThreadClient: (threadId : any) => {
            console.log('getChatThreadClient invoked with: ', threadId);
            return this.fakeChatThreadClient;
          },
          createChatThread: (request: any, options: any) => {
            console.log('SHOULD NOT BE CALLED: createChatThread invoked with: ', request, options);
            return Promise.resolve(); //should be a type of CreateChatThreadResult
          },
          startRealtimeNotifications: () => {
            console.log('startRealtimeNotifications invoked ');
            return Promise.resolve();
          },
          on: (event: any, listenerFunc: any) => {
            console.log('fake chat client ON called: event: ', event, ' listenerFunc: ', listenerFunc);
            if (event === 'chatMessageReceived') {
              (window as any).sendACSMessage = listenerFunc;
            }
          },
          off: (event: any, listenerFunc: any) => {
            console.log('fake chat client OFF called: event: ', event, ' listenerFunc: ', listenerFunc);
          }
        };
        return fakeChatClient;
    }

    public getChatClient() {
        return this.fakeChatClient;
    }

    

    public initAdapter() {
          const acsAdapter = (window as any)['ChatAdapter'].createACSAdapter(
          'eyJhbGciOiJSUzI1NiIsImtpZCI6IjEwNCIsIng1dCI6IlJDM0NPdTV6UENIWlVKaVBlclM0SUl4Szh3ZyIsInR5cCI6IkpXVCJ9.eyJza3lwZWlkIjoiYWNzOmZkZmM0Nzg4LTM0ZjctNDE3NC1iM2E5LWFiN2U5YTgwYjFkOF8wMDAwMDAxMC1lOTEzLWE5ODMtZWVmMC04YjNhMGQwMDA4OGIiLCJzY3AiOjE3OTIsImNzaSI6IjE2NTI1NTMwNjAiLCJleHAiOjE2NTI2Mzk0NjAsImFjc1Njb3BlIjoiY2hhdCIsInJlc291cmNlSWQiOiJmZGZjNDc4OC0zNGY3LTQxNzQtYjNhOS1hYjdlOWE4MGIxZDgiLCJpYXQiOjE2NTI1NTMwNjB9.wC9EnpBnT518eY4aZe194QpGygCQAwhVEskqFmJ2SfQmuVzNuEyYzkRCR1b_5a1AphgqtXx5YIGdKYzk99U-YJnRpAwBfqtw8YCfcFFb-agGRrqKhkUXO9RCE1RXzNTFO8vzQECFwB6gSU9dnCdphwr3yFWhMJaK8r_nHGPQsW2QEZj-Hy-i2s1yMI_nsMnHU6tDBu5pGXBrQ0yWRDIHSGgcC4ueWqkueI1jbLnuHZm8FjCAVECJjt0IMNbZ0eUoPwBGWJ-Tws_e8Z0sRo_EIRY2TksfdliFYANBo83BNVB8eRKVWqt9FQ8yGDhg1-achPAxrNob7jkOM3icueYR8w',
          this.acsUserId,
          this.chatThreadId,
          'fakeACSEnvUrl',
          this.getAMSHandler(),
          'fakeDisplayname',
          this.fakeChatClient,
          this.logger,
          this.featureOptions
        );
        return acsAdapter;
    }

    public getAcsAdapter() {
        return this.acsAdapter;
    }
}
