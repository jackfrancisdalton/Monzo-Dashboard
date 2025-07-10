import { Controller, Sse } from "@nestjs/common";
import { MonzoSyncService } from "./monzo-sync.service";
import { Observable } from "rxjs";
import { MonzoSyncProgressUpdateEvent } from "@repo/monzo-types";

@Controller('monzo')
export class MonzoController {
  constructor(
    private readonly monzoSyncService: MonzoSyncService,
  ) {}

  @Sse('sync')
  sync(): Observable<MonzoSyncProgressUpdateEvent> {
    return new Observable((subscriber) => {
      const onProgress = (progress) => {
        subscriber.next({
          data: {
            taskName: progress.taskName,
            taskStage: progress.taskStage,
            syncedCount: progress.syncedCount,
          },
        });
      };

      this.monzoSyncService.initialFullFetch(onProgress)
        .then(() => {
          subscriber.next({ data: { taskName: 'fullSync', taskStage: "completed" } });
        })
        .catch((err) => {
          subscriber.error(err);
        });
    });
  }
}
