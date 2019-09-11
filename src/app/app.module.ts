import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";

import { AppComponent } from "./app.component";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, MatSlideToggleModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
