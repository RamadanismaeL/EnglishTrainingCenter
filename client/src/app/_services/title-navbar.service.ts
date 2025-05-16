import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface BreadcrumbItem {
  label: string;
  url?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class TitleNavbarService {
  private storageKey = 'breadcrumb_data';
  private _breadcrumbs$ = new BehaviorSubject<BreadcrumbItem[]>(this.getInitialTitle());
  breadcrumbs$ = this._breadcrumbs$.asObservable();

  // Para acessar o valor atual
  getBreadcrumbs(): BreadcrumbItem[] {
    return this._breadcrumbs$.getValue();
  }

  setBreadcrumbs(breadcrumbs: BreadcrumbItem[]) {
    this.clear();
    this._breadcrumbs$.next(breadcrumbs);
    sessionStorage.setItem(this.storageKey, JSON.stringify(breadcrumbs));
  }

  private clear() {
    this._breadcrumbs$.next([]);
    sessionStorage.removeItem(this.storageKey);
  }

  private getInitialTitle(): BreadcrumbItem[] {
    const data = sessionStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  addBreadcrumb(breadcrumb: BreadcrumbItem) {
    const current = this._breadcrumbs$.getValue();
    const exists = current.find(b => b.label === breadcrumb.label);

    if (!exists) {
      const updated = [...current, breadcrumb];
      this._breadcrumbs$.next(updated);
      sessionStorage.setItem(this.storageKey, JSON.stringify(updated));
    }
  }
}
