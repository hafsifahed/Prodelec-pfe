import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Input, OnChanges } from '@angular/core';
import MetisMenu from 'metismenujs';
import { Router, NavigationEnd } from '@angular/router';

import { MENU } from './menu';
import { MenuItem, RolePermissions } from './menu.model';
import { TranslateService } from '@ngx-translate/core';
import { UsersService } from 'src/app/core/services/user.service';
import { Action } from 'src/app/core/models/role.model';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('componentRef') scrollRef;
  @ViewChild('sideMenu') sideMenu: ElementRef;

  @Input() isCondensed = false;

  menu: any;
  menuItems: MenuItem[] = [];
  user: any;
  errorMessage = '';

  constructor(
    private router: Router,
    public translate: TranslateService,
    private usersService: UsersService
  ) {
    // Réagir aux changements de route pour mettre à jour le menu actif et scroll
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this._activateMenuDropdown();
        this._scrollElement();
      }
    });
  }

  ngOnInit() {
    this.loadPermissionProfile();
  }

  ngAfterViewInit() {
    this._initMetisMenu();
  }

  ngOnChanges() {
    if (this.menu) {
      this.menu.dispose();
    }
    setTimeout(() => {
      this._initMetisMenu();
    }, 100);
  }

  private loadPermissionProfile(): void {
    this.usersService.getPermissionProfile().subscribe({
      next: (userData) => {
        this.user = userData;
        if (this.user.role) {
          this.initialize(this.user.role);
        } else {
          this.initialize({ permissions: [] });
        }
        // Après chargement, initialise MetisMenu
        setTimeout(() => this._initMetisMenu(), 100);
      },
      error: (error) => {
        console.error('Error fetching user profile', error);
        this.errorMessage = 'Failed to load user profile. Please try again later.';
      }
    });
  }

  initialize(role: { name?: string; permissions: RolePermissions[] }): void {
    const userRole: string | undefined = role?.name;

    if (!role?.permissions?.length) {
      this.menuItems = MENU;
      return;
    }

    this.menuItems = MENU.filter(item =>
      !item.rolePermissions?.length ||
      item.rolePermissions.some(menuPerm => {
        const roleOK =
          !menuPerm.roles?.length ||
          (userRole && menuPerm.roles.includes(userRole as any));
        if (!roleOK) return false;
        return role.permissions.some(userPerm =>
          userPerm.resource === menuPerm.resource &&
          (
            userPerm.actions.includes(Action.MANAGE) ||
            menuPerm.actions.some(a => userPerm.actions.includes(a))
          )
        );
      })
    );
  }

  hasItems(item: MenuItem): boolean {
    return !!(item.subItems && item.subItems.length > 0);
  }

  private _initMetisMenu() {
    if (this.menu) {
      this.menu.dispose();
    }
    if (this.sideMenu && this.sideMenu.nativeElement) {
      this.menu = new MetisMenu(this.sideMenu.nativeElement);
      this._activateMenuDropdown();
      this._scrollElement();
    }
  }

  private _removeAllClass(className: string) {
    const els = document.getElementsByClassName(className);
    while (els.length > 0) {
      els[0].classList.remove(className);
    }
  }

  private _activateMenuDropdown() {
    this._removeAllClass('mm-active');
    this._removeAllClass('mm-show');

    const links = document.getElementsByClassName('side-nav-link-ref');
    const paths = Array.from(links).map((el: any) => el.pathname);
    let itemIndex = paths.indexOf(window.location.pathname);

    if (itemIndex === -1) {
      const strIndex = window.location.pathname.lastIndexOf('/');
      const item = window.location.pathname.substr(0, strIndex);
      itemIndex = paths.indexOf(item);
    }

    const menuItemEl = itemIndex !== -1 ? links[itemIndex] : null;

    if (menuItemEl) {
      menuItemEl.classList.add('active');
      let parentEl = menuItemEl.parentElement;

      while (parentEl && parentEl.id !== 'side-menu') {
        parentEl.classList.add('mm-active');
        if (parentEl.tagName === 'UL') {
          parentEl.classList.add('mm-show');
        }
        parentEl = parentEl.parentElement;
      }
    }
  }

  private _scrollElement() {
    setTimeout(() => {
      const activeEls = document.getElementsByClassName('mm-active');
      if (activeEls.length > 0 && this.scrollRef && this.scrollRef.SimpleBar) {
        const currentPosition = activeEls[0]['offsetTop'];
        if (currentPosition > 500) {
          this.scrollRef.SimpleBar.getScrollElement().scrollTop = currentPosition + 300;
        }
      }
    }, 300);
  }
}
