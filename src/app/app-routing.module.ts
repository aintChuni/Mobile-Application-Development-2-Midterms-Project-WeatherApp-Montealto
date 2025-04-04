import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Tab1Page } from './tab1/tab1.page';
import { Tab2Page } from './tab2/tab2.page';

const routes: Routes = [
  { path: '', redirectTo: 'tab1', pathMatch: 'full' },
  { path: 'tab1', component: Tab1Page },
  { path: 'tab2', component: Tab2Page },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
