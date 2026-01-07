import {ConnectionPositionPair, Overlay, OverlayConfig, OverlayRef} from '@angular/cdk/overlay';
import {ComponentRef, ElementRef, Injectable, Injector} from '@angular/core';
import {TimetablePreview} from '../components/timetable/timetable-preview';
import {ComponentPortal} from '@angular/cdk/portal';
import {Slot} from '../components/timetable/timetable-column';
import {Time, TimeRange} from '../components/timetable/model/time-model';
import {TimelineService} from './timeline.service';

export class PreviewData {
  constructor(readonly preview: Slot,
              readonly datekeys: Array<number>) {
  }
}

export class TimetablePreviewOverlayRef {
  constructor(private overlayRef: OverlayRef) { }

  close(): void {
    this.overlayRef.detach();
  }
}

@Injectable({providedIn: 'root'})
export class TimetablePreviewService {

  private _previewRef: TimetablePreviewOverlayRef;

  private _previewFixedTime: Time;

  private _overlayRef: OverlayRef;

  private _columnsContainerRef: ElementRef<HTMLElement>;

  private _timelineRef: ElementRef<HTMLElement>;

  private _component: TimetablePreview;

  private _preview: Slot;

  private _datekeysPreview: number[];

  private _containerRef: ComponentRef<TimetablePreview>;

  private _containerPortal: ComponentPortal<TimetablePreview>;

  constructor(private injector: Injector,
              private overlay: Overlay,
              private readonly timelineService: TimelineService) { }

  bind(datekeys: number[], columnsContainerRef: ElementRef<HTMLElement>, timelineRef: ElementRef<HTMLElement>) {
    if (!datekeys || !columnsContainerRef) {
      return;
    }

    this._datekeysPreview = datekeys;
    this._columnsContainerRef = columnsContainerRef;
    this._timelineRef = timelineRef;
  }

  drawPreview(datekey: number, time: Time, title?: string) {
    const preview = this._preview ?? new Slot(
      title,
      TimeRange.empty,
      null);

    this._previewFixedTime = this._previewFixedTime ?? time;

    const directionAsc = this._previewFixedTime.toCompareValue() < preview.timeRange.end?.toCompareValue();

    preview.timeRange = new TimeRange(
      this._previewFixedTime,
      time);

    const topOffset = directionAsc ?
      preview.position?.top :
      this.timelineService.getTopOffset(this._timelineRef, preview.timeRange.start);

    const height = this.timelineService.getTopOffset(this._timelineRef, preview.timeRange.end) - topOffset;

    preview.position = {
      datekey,
      top: topOffset,
      height
    };

    this.attachPreview(preview);
  }

  setPreview(preview: Slot) {
    const topOffset = this.timelineService.getTopOffset(this._timelineRef, preview.timeRange.start);

    const height = this.timelineService.getTopOffset(this._timelineRef, preview.timeRange.end) - topOffset;

    preview.position = {
      datekey: preview.position.datekey,
      top: topOffset,
      height
    };

    this.attachPreview(preview);
  }

  getPreview(dateKey: number): Slot {
    return this._component._getPreviewSlot(dateKey)[0];
  }

  cleanupPreview() {
    this._preview = null;
    this._previewFixedTime = null;

    this._containerRef.destroy();
    this._containerRef = null;
    this._previewRef.close();
    this._previewRef = null;
    this._component = null;
  }

  dispose() {
      this.cleanupPreview();

      this._datekeysPreview = null;
      this._columnsContainerRef = null;
      this._timelineRef = null;
  }

  private attachPreview(preview: Slot) {
    if (!preview) {
      return;
    }

    this._preview = preview;

    if (!this._overlayRef) {
      this._overlayRef = this.createOverlay();
    }

    if (!this._component) {
      this._previewRef = new TimetablePreviewOverlayRef(this._overlayRef);
      const injector = this.createInjector(new PreviewData(preview, this._datekeysPreview), this._previewRef);
      this._component = this.createTimetablePreviewComponent(this._overlayRef, injector);
    } else {
      this._component.preview = preview;
    }
  }

  private createInjector(previewData: PreviewData, previewRef: TimetablePreviewOverlayRef): Injector {
    return Injector.create({ providers: [
        { provide: PreviewData, useValue: previewData },
        { provide: TimetablePreviewOverlayRef, useValue: previewRef }
      ]});
  }

  private createOverlay() {
    const overlayConfig = this.getOverlayConfig();
    return this.overlay.create(overlayConfig);
  }

  private getOverlayConfig(): OverlayConfig {
    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo(this._columnsContainerRef)
      .withPositions(this.getPositions())
      .withPush(false);

    return new OverlayConfig({
      scrollStrategy: this.overlay.scrollStrategies.block(),
      positionStrategy
    });
  }

  private createTimetablePreviewComponent(overlayRef: OverlayRef, injector: Injector): TimetablePreview {
    this._containerPortal = new ComponentPortal(TimetablePreview, null, injector);

    this._containerRef = overlayRef.attach(this._containerPortal);

    return this._containerRef.instance;
  }

  private getPositions(): ConnectionPositionPair[] {
    return [
      {
        originX: 'start',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'top',
        panelClass: 'w-100'
      }
    ];
  }


}
