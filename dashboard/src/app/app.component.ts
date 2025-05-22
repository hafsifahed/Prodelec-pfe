import { Component , OnInit} from '@angular/core';
import { UsersService } from './core/services/user.service';
import { UserStateService } from './core/services/user-state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit  {
  constructor(
          private usersService: UsersService,
                private userStateService: UserStateService

    
  ){}

  ngOnInit() {
    // document.getElementsByTagName("html")[0].setAttribute("dir", "rtl");
    const token = localStorage.getItem('token');
  if (token) {
    this.usersService.getProfile().subscribe({
      next: (user) => this.userStateService.setUser(user),
      error: () => this.userStateService.setUser(null),
    });
  }
  }
}
