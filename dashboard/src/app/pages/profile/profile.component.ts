import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/core/models/auth.models';
import { UserStateService } from 'src/app/core/services/user-state.service';
import { UsersService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  errorMessage = '';

  title = 'Profile';

  breadcrumbItems = [
    { label: 'Accueil', active: false },
    { label: 'Profile', active: true }
  ];

  constructor(private usersService: UsersService,
    private userStateService: UserStateService
  ) {}

  ngOnInit(): void {
      this.userStateService.user$.subscribe(user => {
      this.user = user;
    });
  }

}
