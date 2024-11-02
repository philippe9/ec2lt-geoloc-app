import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { KEYCLOAK_CONFIG, KeycloakAngularCapacitorModule } from '@edgeflare/keycloak-angular-capacitor';

import { IMqttServiceOptions, MqttModule } from 'ngx-mqtt';
import { environment } from 'src/environments/environment';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { HttpClientModule, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
  hostname: environment.mqtt.server,
  port: environment.mqtt.port,
  protocol: "ws",
  path: '',
  connectOnCreate: true,
};
function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
      config: {
        url: 'http://192.168.1.4:9090',
        realm: 'ec2lt',
        clientId: 'gps-mobile-app',

      },
      initOptions: {
        onLoad: 'check-sso',
        // adapter: 'cordova-native',
        redirectUri:environment.production ? 'myschema://login' :'http://localhost:8100',
        enableLogging: true,
        silentCheckSsoRedirectUri:
          window.location.origin + '/assets/silent-check-sso.html'
      }
    });
}
// let authConfig: AuthConfig = {
//   issuer: "http://localhost:9090/realms/ec2lt",
//   redirectUri: "http://localhost:8100",
//   clientId: 'example-ionic-app',
//   responseType: 'code',
//   scope: 'openid profile email offline_access',
//   // Revocation Endpoint must be set manually when using Keycloak
//   // See: https://github.com/manfredsteyer/angular-oauth2-oidc/issues/794
//   revocationEndpoint: "http://localhost:9090/realms/ec2lt/protocol/openid-connect/revoke",
//   showDebugInformation: true,
//   requireHttps: false
//   }
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule,
    KeycloakAngularCapacitorModule,
    KeycloakAngularModule,
    HttpClientModule,
    // HttpClientModule,
    MqttModule.forRoot(MQTT_SERVICE_OPTIONS),
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService]
    },
    // {provide: OAuthStorage, useValue: localStorage}
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
