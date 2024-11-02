import { Component, inject, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { KeycloakAngularCapacitorService } from '@edgeflare/keycloak-angular-capacitor';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { KeycloakService } from 'keycloak-angular';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  public labels = ['Connexion', 'Deconnexion'];
  profile: any = null;
  private activatedRoute = inject(ActivatedRoute);
  constructor(
    private keycloakService: KeycloakService,
    private router: Router,
    private zone: NgZone
  ) {
    // this.kc.init();
  }
  ngOnInit(): void {
    // let authConfig: AuthConfig = {
    //   issuer: "http://192.168.1.2:9090/realms/ec2lt",
    //   redirectUri: "http://localhost:8100",
    //   clientId: 'gps-mobile-app',
    //   responseType: 'code',
    //   scope: 'openid profile email offline_access',
    //   // Revocation Endpoint must be set manually when using Keycloak
    //   // See: https://github.com/manfredsteyer/angular-oauth2-oidc/issues/794
    //   revocationEndpoint: "http://192.168.1.2:9090/realms/ec2lt/protocol/openid-connect/revoke",
    //   showDebugInformation: true,
    //   requireHttps: false
    // }
    // this.oauthService.configure(authConfig);
    //TODO: For the presentation config for a domain, keycloak doesnt work over ip
    //TODO: ionic cap build ou ionic cap sync pour sync dans l'app
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      let url = new URL(event.url);
      if (url.host != 'login') {
        // Only interested in redirects to myschema://login
        return;
      }
      this.zone.run(() => {
        //   // Building a query param object for Angular Router
        const queryParams: Params = {};
        for (const [key, value] of url.searchParams.entries()) {
          queryParams[key] = value;
        }

        // Add query params to current route
        this.router
          .navigate([], {
            relativeTo: this.activatedRoute,
            queryParams: queryParams,
            queryParamsHandling: 'merge', // remove to replace all query params by provided
          })
          .then((navigateResult) => {
            // After updating the route, trigger login in oauthlib and
            this.login();
          });
      });
      this.loadUserProfile();
    });
    this.loadUserProfile();
  }
  // Optional. Can be called in whichever component the KeycloakAngularCapacitorService is injected

  login() {
    // this.kc.login();
    this.keycloakService.login().then((res) => {
      console.log(res);
    });
    // this.oauthService.loadDiscoveryDocumentAndLogin()
    // .then(loadDiscoveryDocumentAndLoginResult => {
    //   console.log("loadDiscoveryDocumentAndLogin", loadDiscoveryDocumentAndLoginResult);
    // })
    // .catch(error => {
    //   console.error("loadDiscoveryDocumentAndLogin", error);
    // });
  }

  logout() {
    // this.kc.logout();
    this.keycloakService.logout().then((res) => {});
  }

  loadUserProfile() {
    // this.keycloakService.loadUserProfile
    // this.oauthService.
    this.keycloakService.loadUserProfile().then((response) => {
      this.profile = response;
      console.log(response);
    });
  }
  do_action(label: string) {
    switch (label) {
      case 'Connexion':
        this.login();
        break;
      case 'Deconnexion':
        this.logout();
        break;

      default:
        break;
    }
  }
}
