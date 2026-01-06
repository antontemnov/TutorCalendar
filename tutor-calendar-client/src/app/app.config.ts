import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { DateAdapter, NAV_DATE_LOCALE } from '../core/date-adapter';
import { MomentDateAdapter } from '../core/moment-adapter/moment-date-adapter';
import { NAV_DATE_FORMATS } from '../core/date-formats';
import { NAV_MOMENT_DATE_FORMATS } from '../core/moment-adapter/moment-date-formats';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimations(),
    importProvidersFrom(
      AngularFireModule.initializeApp(environment.firebaseConfig)
    ),
    {
      provide: NAV_DATE_LOCALE,
      useValue: 'ru-RU'
    },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [NAV_DATE_LOCALE]
    },
    {
      provide: NAV_DATE_FORMATS,
      useValue: NAV_MOMENT_DATE_FORMATS
    }
  ]
};
