import { Directive, ElementRef, OnInit, Renderer2, forwardRef } from '@angular/core';
import { NG_VALIDATORS, Validator, AbstractControl, ValidationErrors, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Directive({
  selector: '[appCaptcha]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Captcha),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => Captcha),
      multi: true
    }
  ]
})
export class Captcha  implements OnInit, ControlValueAccessor, Validator {

  private handle: HTMLElement | null = null;
  private track: HTMLElement | null = null;
  private resolved = false;

  private onChange = (_: any) => {};
  private onTouched = () => {};

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.renderUI();
    this.attachEvents();
  }

  // Crear el captcha visual
  private renderUI() {
    const host = this.el.nativeElement;

    this.renderer.setStyle(host, 'width', '300px');
    this.renderer.setStyle(host, 'height', '40px');
    this.renderer.setStyle(host, 'position', 'relative');
    this.renderer.setStyle(host, 'background', '#e0e0e0');
    this.renderer.setStyle(host, 'borderRadius', '4px');
    this.renderer.setStyle(host, 'userSelect', 'none');

    this.track = this.renderer.createElement('div');
    this.renderer.setStyle(this.track, 'width', '100%');
    this.renderer.setStyle(this.track, 'height', '100%');
    this.renderer.setStyle(this.track, 'position', 'absolute');

    this.handle = this.renderer.createElement('div');
    this.renderer.setStyle(this.handle, 'width', '40px');
    this.renderer.setStyle(this.handle, 'height', '100%');
    this.renderer.setStyle(this.handle, 'background', '#757575');
    this.renderer.setStyle(this.handle, 'borderRadius', '4px');
    this.renderer.setStyle(this.handle, 'position', 'absolute');
    this.renderer.setStyle(this.handle, 'left', '0');
    this.renderer.setStyle(this.handle, 'cursor', 'grab');

    const text = this.renderer.createElement('span');
    const t = this.renderer.createText('Deslizá para verificar');
    this.renderer.setStyle(text, 'position', 'absolute');
    this.renderer.setStyle(text, 'left', '50%');
    this.renderer.setStyle(text, 'top', '50%');
    this.renderer.setStyle(text, 'transform', 'translate(-50%, -50%)');
    this.renderer.setStyle(text, 'color', '#424242');
    this.renderer.appendChild(text, t);

    this.renderer.appendChild(host, this.track);
    this.renderer.appendChild(host, this.handle);
    this.renderer.appendChild(host, text);
  }

  // Manejo del arrastre
  private attachEvents() {
    if (!this.handle) return;

    let dragging = false;
    let startX = 0;

    this.renderer.listen(this.handle, 'mousedown', (e: MouseEvent) => {
      if (this.resolved) return;
      dragging = true;
      startX = e.clientX;
      this.renderer.setStyle(this.handle, 'cursor', 'grabbing');
    });

    this.renderer.listen('window', 'mousemove', (e: MouseEvent) => {
      if (!dragging || !this.handle) return;

      const delta = e.clientX - startX;
      const max = this.el.nativeElement.offsetWidth - this.handle.offsetWidth;

      const pos = Math.max(0, Math.min(delta, max));

      this.renderer.setStyle(this.handle, 'left', pos + 'px');

      if (pos >= max) {
        dragging = false;
        this.resolveCaptcha();
      }
    });

    this.renderer.listen('window', 'mouseup', () => {
      dragging = false;
      if (!this.resolved && this.handle) {
        this.renderer.setStyle(this.handle, 'left', '0px');
        this.renderer.setStyle(this.handle, 'cursor', 'grab');
      }
    });
  }

  private resolveCaptcha() {
    this.resolved = true;
    this.onChange(true);
    if (this.handle) {
      this.renderer.setStyle(this.handle, 'background', '#4caf50');
      this.renderer.setStyle(this.handle, 'cursor', 'default');
    }
  }

  writeValue(value: any): void {}
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }

  validate(control: AbstractControl): ValidationErrors | null {
    return this.resolved ? null : { captcha: true };
  }
}
