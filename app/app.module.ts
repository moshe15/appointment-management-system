@NgModule({
  declarations: [
    // הסר את AppComponent ו-NewAppointmentComponent מכאן
  ],
  imports: [
    // ... existing code ...
    // הוסף את הקומפוננטות העצמאיות כאן במקום
    AppComponent,
    NewAppointmentComponent,
  ],
  // ... existing code ...
  bootstrap: [] // הסר את AppComponent מכאן
})
export class AppModule { } 