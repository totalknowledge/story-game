import { Component } from '@angular/core';
import { Player } from "../player/player";
import { Header } from "../header/header";
import { Enemies } from "../enemies/enemies";
import { ConsoleComponent } from "../console/console";

@Component({
  selector: 'app-main',
  imports: [Player, Header, Enemies, ConsoleComponent],
  templateUrl: './main.html',
  styleUrl: './main.css',
})
export class Main {

}
