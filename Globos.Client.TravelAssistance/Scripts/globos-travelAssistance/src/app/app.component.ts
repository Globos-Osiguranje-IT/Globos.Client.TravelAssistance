import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoaderComponent } from "./components/loader/loader.component";
import { Language, TranslateService, LanguageService } from 'ng-globos-core'
import { Translations } from './pipes/translate/data/translations';
import { filter } from 'rxjs';
import { GlobalScriptsService } from './services/global-scripts.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoaderComponent, FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  Language = Language;
  selectedLanguage: Language = Language.SR;

  constructor(
    private translateService: TranslateService,
    private languageService: LanguageService,
    private router: Router,
    private gtagService: GlobalScriptsService
  ) { }

  ngOnInit(): void {
    this.gtagService.injectGtag();
    this.gtagService.injectMetaDescription();

    // if (window.location.search.includes('_gl=')) {
    //   const cleanUrl = window.location.origin + window.location.pathname + window.location.hash;
    //   window.history.replaceState({}, document.title, cleanUrl);
    // }


    this.selectedLanguage = this.languageService.getLanguage();
    this.translateService.setTranslations(Translations)

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      window.scrollTo({ top: 0 });
    });
  }

  changeLanguage(language: Language) {
    this.languageService.setLanguage(language);
    this.selectedLanguage = language;
  }
}
