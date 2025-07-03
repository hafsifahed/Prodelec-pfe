import { Component, OnInit } from '@angular/core';
import { EventService } from '../../core/services/event.service';
import { CookieService } from 'ngx-cookie-service';

import { LAYOUT_WIDTH, SIDEBAR_TYPE, TOPBAR, LAYOUT_MODE } from '../layouts.model';

@Component({
  selector: 'app-rightsidebar',
  templateUrl: './rightsidebar.component.html',
  styleUrls: ['./rightsidebar.component.scss']
})
export class RightsidebarComponent implements OnInit {

  isVisible: string;
  attribute: string;

  width: string;
  sidebartype: string;
  mode: string;
  topbar: string;

  constructor(
    private eventService: EventService,
    private cookieService: CookieService
  ) { }

  ngOnInit() {
    // Charger les valeurs depuis les cookies si elles existent, sinon utiliser les valeurs par défaut
    this.width = this.cookieService.get('layout_width') || LAYOUT_WIDTH;
    this.sidebartype = this.cookieService.get('sidebar_type') || SIDEBAR_TYPE;
    this.topbar = this.cookieService.get('topbar') || TOPBAR;
    this.mode = this.cookieService.get('layout_mode') || LAYOUT_MODE;

    this.attribute = document.body.getAttribute('data-layout');
    const vertical = document.getElementById('is-layout');
    if (vertical != null) {
      vertical.setAttribute('checked', 'true');
    }
    if (this.attribute == 'horizontal') {
      vertical.removeAttribute('checked');
    }

    // Diffuser les valeurs chargées au démarrage
    this.eventService.broadcast('changeWidth', this.width);
    this.eventService.broadcast('changeSidebartype', this.sidebartype);
    this.eventService.broadcast('changeTopbar', this.topbar);
    this.eventService.broadcast('changeMode', this.mode);
  }

  /**
   * Hide the sidebar
   */
  public hide() {
    document.body.classList.remove('right-bar-enabled');
  }

  /**
   * Change Topbar
   */
  changeTopbar(topbar: string) {
    this.topbar = topbar;
    this.cookieService.set('topbar', topbar, 365); // Sauvegarde dans cookie 1 an
    this.eventService.broadcast('changeTopbar', topbar);
  }

  /**
   * Change the layout onclick
   * @param layout Change the layout
   */
  changeLayout(layout) {
    if (layout.target.checked == true) {
      this.cookieService.set('layout_mode', 'vertical', 365);
      this.eventService.broadcast('changeLayout', 'vertical');
    } else {
      this.cookieService.set('layout_mode', 'horizontal', 365);
      this.eventService.broadcast('changeLayout', 'horizontal');
    }
  }

  changeWidth(width: string) {
    this.width = width;
    this.cookieService.set('layout_width', width, 365);
    this.eventService.broadcast('changeWidth', width);
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 0);
  }

  changeSidebartype(sidebar: string) {
    this.sidebartype = sidebar;
    this.cookieService.set('sidebar_type', sidebar, 365);
    this.eventService.broadcast('changeSidebartype', sidebar);
  }

  changeMode(themeMode: string) {
    this.mode = themeMode;
    this.cookieService.set('layout_mode', themeMode, 365);
    this.eventService.broadcast('changeMode', themeMode);
  }
}
