import { Controller, Sse } from "@nestjs/common";
import { MonzoSyncService } from "./monzo-sync.service";
import { Observable } from "rxjs";

@Controller('monzo')
export class MonzoController {

  constructor(
    private readonly monzoSyncService: MonzoSyncService, 
  ) {}
  
  @Sse('sync')
  sync(): Observable<MessageEvent> {
    return new Observable((subscriber) => {
      this.monzoSyncService.initialFullFetch((progress) => {
        subscriber.next({ data: progress } as MessageEvent);// TODO: clean up typing fix
      })
      .then(() => {
        subscriber.next({ data: { stage: "completed" } } as MessageEvent);// TODO: clean up typing fix
      })
      .catch((err) => {
        subscriber.error(err);
      });
    });
  }
}