import { Component, OnInit } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

interface UserData {
  id: number;
  name: string;
  phone: string;
  idNumber: string;
  picture: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="form-container">
      <h2>User Information Form</h2>
      <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="name">Name:</label>
          <input type="text" id="name" formControlName="name">
          <div class="error-message" *ngIf="userForm.get('name')?.errors?.['required'] && userForm.get('name')?.touched">
            Name is required
          </div>
        </div>

        <div class="form-group">
          <label for="phone">Phone:</label>
          <input type="text" id="phone" formControlName="phone">
          <div class="error-message" *ngIf="userForm.get('phone')?.errors?.['required'] && userForm.get('phone')?.touched">
            Phone is required
          </div>
          <div class="error-message" *ngIf="userForm.get('phone')?.errors?.['pattern'] && userForm.get('phone')?.touched">
            Please enter a valid phone number
          </div>
        </div>

        <div class="form-group">
          <label for="idNumber">ID Number:</label>
          <input type="text" id="idNumber" formControlName="idNumber">
          <div class="error-message" *ngIf="userForm.get('idNumber')?.errors?.['required'] && userForm.get('idNumber')?.touched">
            ID Number is required
          </div>
        </div>

        <div class="form-group">
          <label for="picture">Picture:</label>
          <input type="file" id="picture" (change)="onFileSelected($event)" accept="image/jpeg,image/png">
          <div class="error-message" *ngIf="!isValidFileType">
            Please select a valid image file (JPEG, JPG, or PNG)
          </div>
        </div>

        <button type="submit" [disabled]="!userForm.valid || !selectedFile">
          {{ editIndex === -1 ? 'Save' : 'Update' }}
        </button>
        <button type="button" *ngIf="editIndex !== -1" (click)="cancelEdit()">Cancel</button>
      </form>

      <div class="table-container" *ngIf="userData.length > 0">
        <h3>User Records</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>ID Number</th>
              <th>Picture</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of userData; let i = index">
              <td>{{ user.name }}</td>
              <td>{{ user.phone }}</td>
              <td>{{ user.idNumber }}</td>
              <td><img [src]="user.picture" class="thumbnail" alt="User picture"></td>
              <td class="action-buttons">
                <button class="edit-button" (click)="editUser(i)">Edit</button>
                <button class="delete-button" (click)="deleteUser(i)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class App implements OnInit {
  userForm: FormGroup;
  userData: UserData[] = [];
  selectedFile: File | null = null;
  isValidFileType = true;
  editIndex = -1;

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      idNumber: ['', Validators.required]
    });
  }

  ngOnInit() {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      this.isValidFileType = validTypes.includes(file.type);
      
      if (this.isValidFileType) {
        this.selectedFile = file;
      } else {
        this.selectedFile = null;
      }
    }
  }

  onSubmit() {
    if (this.userForm.valid && this.selectedFile && this.isValidFileType) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const userData: UserData = {
          id: Date.now(),
          name: this.userForm.value.name,
          phone: this.userForm.value.phone,
          idNumber: this.userForm.value.idNumber,
          picture: e.target?.result as string
        };

        if (this.editIndex === -1) {
          this.userData.push(userData);
        } else {
          this.userData[this.editIndex] = userData;
          this.editIndex = -1;
        }

        this.userForm.reset();
        this.selectedFile = null;
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  editUser(index: number) {
    const user = this.userData[index];
    this.userForm.patchValue({
      name: user.name,
      phone: user.phone,
      idNumber: user.idNumber
    });
    this.editIndex = index;
  }

  deleteUser(index: number) {
    this.userData.splice(index, 1);
  }

  cancelEdit() {
    this.editIndex = -1;
    this.userForm.reset();
    this.selectedFile = null;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}

bootstrapApplication(App);