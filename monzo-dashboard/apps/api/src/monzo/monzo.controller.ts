import { Controller, Sse } from "@nestjs/common";
import { Observable } from "rxjs";
import { MonzoSyncService } from "./monzo-sync.service";
import { MonzoSyncProgressUpdate, MonzoSyncProgressUpdateEvent } from "@repo/monzo-types";

@Controller('monzo')
export class MonzoController {
  constructor(
    private readonly monzoSyncService: MonzoSyncService,
  ) {}

  @Sse('sync-full')
  syncFull(): Observable<MonzoSyncProgressUpdateEvent> {
    return this.createSyncObservable((onProgress) =>
      this.monzoSyncService.syncFullAccount(onProgress)
    );
  }

  @Sse('incremental-sync')
  incrementalSync(): Observable<MonzoSyncProgressUpdateEvent> {
    return this.createSyncObservable((onProgress) =>
      this.monzoSyncService.incrementalSync(onProgress)
    );
  }

  private createSyncObservable(
    syncMethod: (progressCallback: (p: MonzoSyncProgressUpdate) => void) => Promise<void>
  ): Observable<MonzoSyncProgressUpdateEvent> {
    return new Observable<MonzoSyncProgressUpdateEvent>((subscriber) => {
      const onProgress = (progress: MonzoSyncProgressUpdate) => {
        subscriber.next({
          data: {
            taskName: progress.taskName,
            taskStage: progress.taskStage,
            syncedCount: progress.syncedCount,
          },
        });
      };

      (async () => {
        try {
          await syncMethod(onProgress);

          subscriber.next({
            data: {
              taskName: 'sync',
              taskStage: "completed"
            }
          });

          subscriber.complete();
        } catch (err) {
          subscriber.error(err);
        }
      })();
    });
  }
}
