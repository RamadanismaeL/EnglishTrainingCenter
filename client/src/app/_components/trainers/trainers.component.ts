import { Component } from '@angular/core';
import { RegisterComponent } from '../../_pages/Trainers/register/register.component';
import { TableComponent } from '../../_pages/Trainers/table/table.component';

@Component({
  standalone: true,
  selector: 'app-trainers',
  imports: [
    RegisterComponent,
    TableComponent
],
  templateUrl: './trainers.component.html',
  styleUrl: './trainers.component.scss'
})
export class TrainersComponent
{}
