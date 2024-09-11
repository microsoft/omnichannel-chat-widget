import "rxjs/add/operator/share";
import "rxjs/add/observable/of";

import {  Message } from "botframework-directlinejs";
import { Observable } from "rxjs/Observable";
import MockAdapter from "./mockadapter";

export class DemoChatAdapter extends MockAdapter {
    constructor() {
        super();
        console.log("[DemoChatAdapter]");
    }

    public postActivity(activity: Message): Observable<string> {
        return super.postActivity(activity);
    }
}