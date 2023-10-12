/// The App module is the root module of the application, it is the first module to be loaded by the application.
/// It imports all the modules that the application needs.
/// It also declares all the components that the application needs.
/// Also performs error handling and error logging.
/// Also performs navigation and routing.

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
<<<<<<< HEAD
import { NgxChartsModule } from '@swimlane/ngx-charts'; // Import the NgxChartsModule
=======
>>>>>>> 1225b3da46b40bfdaf1e29b771d93d9e782770c0

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import {MatSidenavModule} from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import {MatFormFieldModule} from '@angular/material/form-field';

import { SidenavComponent } from './components/sidenav/sidenav.component';
import { MainComponent } from './components/main/main.component';


@NgModule({
  declarations: [
    AppComponent,
    SidenavComponent,
    MainComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    MatSidenavModule,
    MatListModule,
    MatFormFieldModule,
    ReactiveFormsModule,
<<<<<<< HEAD
    BrowserAnimationsModule,
    NgxChartsModule
=======
    BrowserAnimationsModule
>>>>>>> 1225b3da46b40bfdaf1e29b771d93d9e782770c0
  ],
  exports: [SidenavComponent],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }