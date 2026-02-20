import { Routes } from '@angular/router';
import { Main } from './main/main';
import { Admin } from './admin/admin';

export const routes: Routes = [
    { path: '', component: Main },
    { path: 'admin', component: Admin }
];