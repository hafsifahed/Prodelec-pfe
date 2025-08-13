import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Input } from '@angular/core';
import MetisMenu from 'metismenujs';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UsersService } from 'src/app/core/services/user.service';
import { Action, Permission, Resource } from 'src/app/core/models/role.model';
import { MENU } from './menu';
import { MenuItem } from './menu.model';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, AfterViewInit {
  @ViewChild('componentRef') scrollRef: any;
  @ViewChild('sideMenu') sideMenu!: ElementRef;

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

  private loadPermissionProfile(): void {
    this.usersService.getPermissionProfile().subscribe({
      next: (userData) => {
        this.user = userData;
        if (this.user.role) {
          this.initialize(this.user.role);
        } else {
          this.initialize({ permissions: [] });
        }
        setTimeout(() => this._initMetisMenu(), 100);
      },
      error: (error) => {
        console.error('Error fetching user profile', error);
        this.errorMessage = 'Failed to load user profile. Please try again later.';
      }
    });
  }

  initialize(role: { name?: string; permissions: Permission[] }): void {
    const userRole: string | undefined = role?.name;
    const userPermissions = role?.permissions || [];

    if (!userPermissions.length) {
      this.menuItems = MENU;
      return;
    }

    const hasAccess = (item: MenuItem): boolean => {
      if (item.accessOnly === 'CLIENT' && (!userRole || !userRole.startsWith('CLIENT'))) {
        return false;
      }
      if (item.accessOnly === 'WORKER' && userRole?.startsWith('CLIENT')) {
        return false;
      }

      if (!item.rolePermissions || item.rolePermissions.length === 0) {
        return true;
      }

      return item.rolePermissions.some(menuPerm => {
        const hasPermission = userPermissions.some(userPerm =>
          userPerm.resource === menuPerm.resource &&
          (
            userPerm.actions.includes(Action.MANAGE) ||
            menuPerm.actions.some((a: Action) => userPerm.actions.includes(a))
          )
        );

        if (hasPermission) return true;

        return menuPerm.roles?.length
          ? !!(userRole && menuPerm.roles.includes(userRole as any))
          : false;
      });
    };

    const filterMenu = (items: MenuItem[]): MenuItem[] => {
      return items
        .map(item => {
          let filteredSubItems: MenuItem[] = [];
          if (item.subItems) {
            filteredSubItems = filterMenu(item.subItems);
          }

          if (hasAccess(item) || filteredSubItems.length > 0) {
            const newItem = { ...item };
            if (filteredSubItems.length > 0) {
              newItem.subItems = filteredSubItems;
            } else {
              delete newItem.subItems;
            }
            return newItem;
          }

          return null;
        })
        .filter((item): item is MenuItem => item !== null);
    };

    this.menuItems = filterMenu(MENU);
  }

  hasItems(item: MenuItem): boolean {
    return !!(item.subItems && item.subItems.length > 0);
  }

  private _initMetisMenu() {
    if (this.menu) this.menu.dispose();
    
    if (this.sideMenu?.nativeElement) {
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
    const currentPath = window.location.pathname;
    
    Array.from(links).forEach((link: any) => {
      if (link.pathname === currentPath) {
        let parent = link.parentElement;
        while (parent && parent.id !== 'side-menu') {
          parent.classList.add('mm-active');
          if (parent.tagName === 'UL') parent.classList.add('mm-show');
          parent = parent.parentElement;
        }
        link.classList.add('active');
      }
    });
  }

  private _scrollElement() {
    setTimeout(() => {
      const activeEls = document.getElementsByClassName('mm-active');
      if (activeEls.length > 0 && this.scrollRef?.SimpleBar) {
        const currentPosition = activeEls[0]['offsetTop'];
        if (currentPosition > 500) {
          this.scrollRef.SimpleBar.getScrollElement().scrollTop = currentPosition + 300;
        }
      }
    }, 300);
  }
}