import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { MqttService } from 'ngx-mqtt';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage implements OnInit {
  public folder!: string;
  private activatedRoute = inject(ActivatedRoute);
  profile: KeycloakProfile | null = null;

  constructor(
    private keycloakService: KeycloakService,
    private _mqttService: MqttService
  ) {}

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id') as string;

    // const printCurrentPosition = async () => {
    this.keycloakService.loadUserProfile().then((response) => {
      this.profile = response;
      console.log(response);
      setInterval(() => {
        Geolocation.getCurrentPosition({ enableHighAccuracy: false }).then(
          (coordinates: any) => {
            this.callBackwatchPosition(coordinates);
          }
        );
      }, 10000);
    });
  }
  callBackwatchPosition(data: any, err?: any) {
    this.publishCoords(data);
    if (err) {
      console.log('Watch Current position error:', err);
    }
  }
  publishCoords(data: any) {
    // gps_data,device_id=1234 latitude=37.7749,longitude=-122.4194,altitude=10
    console.log({
      latitude: data.coords.latitude,
      longitude: data.coords.longitude,
      altitude: data.coords.altitude,
      name: this.profile?.email,
      value: this.profile?.id,
    });
    console.log(
      `gps_data,device_id=1234 latitude=${data.coords.latitude},longitude=${data.coords.longitude},altitude=${data.coords.altitude} ${data.timestamp}`
    );
    this._mqttService
      .publish(
        'Topic/GPS',
        JSON.stringify({
          latitude: data.coords.latitude,
          longitude: data.coords.longitude,
          altitude: data.coords.altitude,
          name: this.profile?.email,
          value: this.profile?.id,
        })
      )
      .subscribe((response) => {
        console.log(response);
      });
  }
}
