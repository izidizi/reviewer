import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppNavbarComponent } from '../../components/navbar/navbar';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, AppNavbarComponent],
  templateUrl: './main.layout.html',
  styleUrl: './main.layout.scss',
})
export class AppMainLayout {}
