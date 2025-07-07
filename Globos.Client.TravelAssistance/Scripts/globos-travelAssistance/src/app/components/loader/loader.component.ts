import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'gbs-loader',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss'
})
export class LoaderComponent {
  isLoading: boolean = false;

  showLoader() {
    this.isLoading = true;
  }

  hideLoader() {
    this.isLoading = false;
  }

  constructor(private loaderService: LoaderService) {}

  
  ngOnInit(): void {
    // Subscribe to the loader state to listen for changes
    this.loaderService.loaderState$.subscribe((state: boolean) => {
      this.isLoading = state;  // Update the isLoading variable when the loader state changes
    });
  }
}
