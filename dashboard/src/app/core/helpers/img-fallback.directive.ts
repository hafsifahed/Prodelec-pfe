import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'img[appImgFallback]'
})
export class ImgFallbackDirective {
  @Input() fallbackSrc: string = 'assets/images/companies/img-6.png';

  constructor(private el: ElementRef<HTMLImageElement>) {}

  @HostListener('error')
  onError() {
    this.el.nativeElement.src = this.fallbackSrc;
  }
}
