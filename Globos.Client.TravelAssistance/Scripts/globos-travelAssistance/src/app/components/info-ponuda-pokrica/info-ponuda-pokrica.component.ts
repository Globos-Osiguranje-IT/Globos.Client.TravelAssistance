import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-info-ponuda-pokrica',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './info-ponuda-pokrica.component.html',
  styleUrl: './info-ponuda-pokrica.component.scss'
})
export class InfoPonudaPokricaComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public data: { pnp : number | string}) {}
}
