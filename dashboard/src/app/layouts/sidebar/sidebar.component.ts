import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Input, OnChanges } from '@angular/core';
import MetisMenu from 'metismenujs';
import { EventService } from '../../core/services/event.service';
import { Router, NavigationEnd } from '@angular/router';

import { HttpClient } from '@angular/common/http';

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

/**
 * Sidebar component
 */
export class SidebarComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('componentRef') scrollRef;
  @Input() isCondensed = false;
  menu: any;
  data: any;
  userType: string | null = '';
  userMail: string | null = '';
  errorMessage = '';
  menuItems: MenuItem[] = [];
  user: any;

  @ViewChild('sideMenu') sideMenu: ElementRef;

  constructor(private eventService: EventService, private router: Router,
              public translate: TranslateService,
              private http: HttpClient,
              private usersService: UsersService
  ) {
    router.events.forEach((event) => {
      if (event instanceof NavigationEnd) {
        this._activateMenuDropdown();
        this._scrollElement();
      }
    });
  }

  ngOnInit() {

    this._scrollElement();
    this._activateMenuDropdown();

    this.loadPermessionProfile();


  }
  private loadPermessionProfile(): void {
    this.usersService.getPermissionProfile().subscribe({
      next: (userData) => {
        this.user = userData;
        if (this.user.role) {
          this.initialize(this.user.role);
        } else {
          this.initialize({ permissions: [] });
        }
      },
      error: (error) => {
        console.error('Error fetching user profile', error);
        this.errorMessage = 'Failed to load user profile. Please try again later.';
      },
    });
  }
  

  ngAfterViewInit() {
    this.menu = new MetisMenu(this.sideMenu.nativeElement);
    this._activateMenuDropdown();
  }

  toggleMenu(event) {
    event.currentTarget.nextElementSibling.classList.toggle('mm-show');
  }

  ngOnChanges() {
    if (!this.isCondensed && this.sideMenu || this.isCondensed) {
      setTimeout(() => {
        this.menu = new MetisMenu(this.sideMenu.nativeElement);
      });
    } else if (this.menu) {
      this.menu.dispose();
    }
  }
  _scrollElement() {
    setTimeout(() => {
      if (document.getElementsByClassName("mm-active").length > 0) {
        const currentPosition = document.getElementsByClassName("mm-active")[0]['offsetTop'];
        if (currentPosition > 500)
        if(this.scrollRef.SimpleBar !== null)
          this.scrollRef.SimpleBar.getScrollElement().scrollTop =
            currentPosition + 300;
      }
    }, 300);
  }

  /**
   * remove active and mm-active class
   */
  _removeAllClass(className) {
    const els = document.getElementsByClassName(className);
    while (els[0]) {
      els[0].classList.remove(className);
    }
  }

  /**
   * Activate the parent dropdown
   */
  _activateMenuDropdown() {
    this._removeAllClass('mm-active');
    this._removeAllClass('mm-show');
    const links = document.getElementsByClassName('side-nav-link-ref');
    let menuItemEl = null;
    // tslint:disable-next-line: prefer-for-of
    const paths = [];
    for (let i = 0; i < links.length; i++) {
      paths.push(links[i]['pathname']);
    }
    var itemIndex = paths.indexOf(window.location.pathname);
    if (itemIndex === -1) {
      const strIndex = window.location.pathname.lastIndexOf('/');
      const item = window.location.pathname.substr(0, strIndex).toString();
      menuItemEl = links[paths.indexOf(item)];
    } else {
      menuItemEl = links[itemIndex];
    }
    if (menuItemEl) {
      menuItemEl.classList.add('active');
      const parentEl = menuItemEl.parentElement;
      if (parentEl) {
        parentEl.classList.add('mm-active');
        const parent2El = parentEl.parentElement.closest('ul');
        if (parent2El && parent2El.id !== 'side-menu') {
          parent2El.classList.add('mm-show');
          const parent3El = parent2El.parentElement;
          if (parent3El && parent3El.id !== 'side-menu') {
            parent3El.classList.add('mm-active');
            const childAnchor = parent3El.querySelector('.has-arrow');
            const childDropdown = parent3El.querySelector('.has-dropdown');
            if (childAnchor) { childAnchor.classList.add('mm-active'); }
            if (childDropdown) { childDropdown.classList.add('mm-active'); }
            const parent4El = parent3El.parentElement;
            if (parent4El && parent4El.id !== 'side-menu') {
              parent4El.classList.add('mm-show');
              const parent5El = parent4El.parentElement;
              if (parent5El && parent5El.id !== 'side-menu') {
                parent5El.classList.add('mm-active');
                const childanchor = parent5El.querySelector('.is-parent');
                if (childanchor && parent5El.id !== 'side-menu') { childanchor.classList.add('mm-active'); }
              }
            }
          }
        }
      }
    }

  }

   /* ------------- filtre du menu ------------- */
  /* ------------- filtre du menu ------------- */
initialize(role: { name?: string; permissions: RolePermissions[] }): void {
  const userRole: string | undefined = role?.name;          // nom du rôle (ex. "CLIENTADMIN")

  if (!role?.permissions?.length) {
    this.menuItems = MENU;          // pas de permissions ⇒ tout le menu (ou rien selon ta politique)
    return;
  }

  this.menuItems = MENU.filter(item =>
    /* --------------------------------------------------
       1) S’il n’y a pas de contraintes, on garde l’item
       -------------------------------------------------- */
    !item.rolePermissions?.length ||

    /* --------------------------------------------------
       2) Sinon on teste chaque contrainte déclarée
       -------------------------------------------------- */
    item.rolePermissions.some(menuPerm => {
      /* 2.a) Le rôle est-il autorisé pour cette contrainte ?           */
      /*      – Si menuPerm.roles est vide/undefined → pas de filtre    */
      /*      – Sinon le rôle de l’utilisateur doit y figurer           */
      const roleOK =
        !menuPerm.roles?.length ||
        (userRole && menuPerm.roles.includes(userRole as any));

      if (!roleOK) return false;

      /* 2.b) L’utilisateur possède-t-il la ressource + actions ?       */
      return role.permissions.some(userPerm =>
        userPerm.resource === menuPerm.resource &&
        (
          /* MANAGE = super-pouvoir                                       */
          userPerm.actions.includes(Action.MANAGE) ||
          /* Sinon il faut au moins une des actions attendues             */
          menuPerm.actions.some(a => userPerm.actions.includes(a))
        )
      );
    })
  );
}

  
  

  /**
   * Returns true or false if given menu item has child or not
   * @param item menuItem
   */
  hasItems(item: MenuItem) {
    return item.subItems !== undefined ? item.subItems.length > 0 : false;
  }

}
