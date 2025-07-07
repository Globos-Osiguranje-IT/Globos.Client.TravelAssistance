import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class GlobalScriptsService {

  constructor(@Inject(DOCUMENT) private document: Document,
    private metaService: Meta
  ) { }

  injectGtag() {
    // Avoid duplicates
    if (this.document.getElementById('gtag-js')) return;

    // 1. Add the async gtag JS script
    const gtagScript = this.document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-PG2WFQ4NVY';
    gtagScript.id = 'gtag-js';
    this.document.head.insertBefore(gtagScript, this.document.head.firstChild);

    // 2. Add the inline gtag config script
    const inlineScript = this.document.createElement('script');
    inlineScript.id = 'gtag-inline';
    inlineScript.text = `
      window.dataLayer = window.dataLayer || [];
      function gtag() { dataLayer.push(arguments); }
      gtag('js', new Date());
      gtag('config', 'G-PG2WFQ4NVY');
    `;
    this.document.head.insertBefore(inlineScript, this.document.head.firstChild?.nextSibling || null);

    // Avoid duplicates
    if (this.document.getElementById('gtag-jsAW')) return;

    //3. Add the async gtag JS script for analytics
    const gtagScriptAW = this.document.createElement('script');
    gtagScriptAW.async = true;
    gtagScriptAW.src = 'https://www.googletagmanager.com/gtag/js?id=AW-457183751';
    gtagScriptAW.id = 'gtag-jsAW';
    this.document.head.insertBefore(gtagScriptAW, this.document.head.firstChild);

    //4. Add the inline gtag config script for analytics
    const inlineScriptAW = this.document.createElement('script');
    inlineScriptAW.id = 'gtag-inlineAW';
    inlineScriptAW.text = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'AW-457183751');
    `;
    this.document.head.insertBefore(inlineScriptAW, this.document.head.firstChild?.nextSibling || null);
  }

  injectMetaDescription() {
    this.metaService.updateTag({
      name: 'description',
      content: 'Putno osiguranje. Osigurajte se za vreme putovanja u inostranstvo putem interneta – brzo, sigurno. Naša online polisa putnog osiguranja pruža vam potpunu zaštitu tokom vaših avantura.'
    });

    // this.metaService.updateTag({
    //   name: 'google-site-verification',
    //   content: 'KwULXKocOPmy4Xz2sNxmK3xff0lcu86JKDfqNALAPiM'
    // });
    // const existingMeta = this.document.querySelector('meta[name="google-site-verification"]');
    // if (!existingMeta) {
    //   const meta = this.document.createElement('meta');
    //   meta.name = 'google-site-verification';
    //   meta.content = 'KwULXKocOPmy4Xz2sNxmK3xff0lcu86JKDfqNALAPiM';
    //   this.document.head.appendChild(meta);
    // }
  }
}
