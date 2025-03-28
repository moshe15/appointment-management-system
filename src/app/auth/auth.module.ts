import { NgModule } from '@angular/core';
import { AuthRoutingModule } from './auth-routing.module';

@NgModule({
  imports: [
    AuthRoutingModule
  ],
  exports: [
    AuthRoutingModule
  ]
})
export class AuthModule { } 