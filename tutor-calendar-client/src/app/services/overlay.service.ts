import {ConnectionPositionPair, Overlay, OverlayConfig, OverlayRef} from '@angular/cdk/overlay';
import {ComponentRef, ElementRef, Injectable, Injector, reflectComponentType, Type} from '@angular/core';
import {ComponentPortal, ComponentType} from '@angular/cdk/portal';
import {Slot} from '../components/timetable/timetable-column';

// export class PreviewData {
//   constructor(readonly preview: Slot,
//               readonly datekeys: Array<number>) {
//   }
// }
//
// export class TimetablePreviewOverlayRef {
//   constructor(private overlayRef: OverlayRef) { }
//
//   close(): void {
//     this.overlayRef.detach()
//   }
// }
//
// @Injectable({providedIn: 'root'})
// export class OverlayService<TComponent, TData> {
//
//   private _previewRef: TimetablePreviewOverlayRef
//
//   private _overlayRef: OverlayRef
//
//   private _connectedContainer: ElementRef<HTMLElement>
//
//   private _component: TComponent
//
//   private _preview: Slot
//
//   private _datekeysPreview: number[]
//
//   private _containerRef: ComponentRef<TComponent>
//
//   private _containerPortal: ComponentPortal<TComponent>
//
//   constructor(private injector: Injector,
//               private overlay: Overlay) { }
//
//   init(datekeys: number[], connectedContainer: ElementRef<HTMLElement>) {
//     if (!datekeys || !connectedContainer) {
//       return
//     }
//
//     this._datekeysPreview = datekeys
//     this._connectedContainer = connectedContainer
//   }
//
//   setPreview(preview: Slot) {
//     if (!preview) {
//       return
//     }
//
//     this._preview = preview
//
//     if (!this._overlayRef) {
//       this._overlayRef = this.createOverlay()
//     }
//
//     if (!this._component) {
//       this._previewRef = new TimetablePreviewOverlayRef(this._overlayRef)
//       const injector = this.createInjector(new PreviewData(this._preview, this._datekeysPreview), this._previewRef)
//       this._component = this.attachPreviewContainer(this._overlayRef, injector)
//     } else {
//       this._component.preview = preview
//     }
//   }
//
//   getPreview(dateKey: number): Slot {
//     return this._component._getPreviewSlot(dateKey)[0]
//   }
//
//   resetPreview() {
//     this._containerRef.destroy()
//     this._containerRef = null
//     this._previewRef.close()
//     this._previewRef = null
//     this._component = null
//   }
//
//   private createInjector(previewData: PreviewData, previewRef: TimetablePreviewOverlayRef): Injector {
//     return Injector.create({ providers: [
//         { provide: PreviewData, useValue: previewData },
//         { provide: TimetablePreviewOverlayRef, useValue: previewRef }
//       ]})
//   }
//
//   private createOverlay() {
//     const overlayConfig = this.getOverlayConfig()
//     return this.overlay.create(overlayConfig)
//   }
//
//   private getOverlayConfig(): OverlayConfig {
//     const positionStrategy = this.overlay.position()
//       .flexibleConnectedTo(this._connectedContainer)
//       .withPositions(this.getPositions())
//       .withPush(false)
//
//     return new OverlayConfig({
//       scrollStrategy: this.overlay.scrollStrategies.block(),
//       positionStrategy
//     })
//   }
//
//   private attachPreviewContainer(overlayRef: OverlayRef, injector: Injector) {
//     this._containerPortal = new ComponentPortal(TComponent, null, injector)
//
//     this._containerRef = overlayRef.attach(this._containerPortal)
//
//     return this._containerRef.instance
//   }
//
//   private getPositions(): ConnectionPositionPair[] {
//     return [
//       {
//         originX: 'start',
//         originY: 'top',
//         overlayX: 'start',
//         overlayY: 'top',
//         panelClass: 'w-100'
//       }
//     ]
//   }
// }
