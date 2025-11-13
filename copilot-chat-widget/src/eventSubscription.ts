import { AttachmentMessageSubject } from "./attachmentMessageSubject";
import { FlightMessageSubject } from "./flightMessageSubject";
import { SimpleSubject } from "./SimpleSubject";
import { ACSMessageLocal, AttachmentUpdateMessage, ChatSDKMessage } from "./types";

export class EventSubscription {
    public ingressMessageSubject;
    public flightMessageSubject;
    public attachmentMessageSubject;
    public constructor() {
        this.ingressMessageSubject = new SimpleSubject<ACSMessageLocal[]>();
        this.flightMessageSubject = new FlightMessageSubject<ChatSDKMessage>();
        this.attachmentMessageSubject = new AttachmentMessageSubject<AttachmentUpdateMessage>
    }

    // public dispatchIngressMessage(messages: ACSMessageLocal[]) {
    //     this.ingressMessageSubject.next(messages);
    // }

    // public isIngressMessageSubscriptionStopped() {
    //     return this.ingressMessageSubject.isStopped();
    // }

    // public subscribe

    // public dispatchFlightMessage(message: ChatSDKMessage) {
    //     this.flightMessageSubject.sendFlightMessage(message);
    // }

    // public dispatchAttachmentMessage(message: AttachmentUpdateMessage) {
    //     this.attachmentMessageSubject.sendUpdate(message);
    // }
}
