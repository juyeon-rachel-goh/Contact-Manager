import { Component, OnInit } from '@angular/core';
import {
  NgForm,
  FormControl,
  FormGroup,
  FormBuilder,
  FormArray,
} from '@angular/forms';
import { faArrowLeft, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { ContactsService } from '../contacts.service';
import { Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-new-contacts',
  templateUrl: './new-contacts.component.html',
  styleUrls: ['./new-contacts.component.css'],
})
export class NewContactsComponent implements OnInit {
  public states: string[] = [
    'Alabama',
    'Alaska',
    'Arizona',
    'Arkansas',
    'California',
    'Colorado',
    'Connecticut',
    'Delaware',
    'Florida',
    'Georgia',
    'Hawaii',
    'Idaho',
    'Illinois',
    'Indiana',
    'Iowa',
    'Kansas',
    'Kentucky',
    'Louisiana',
    'Maine',
    'Maryland',
    'Massachusetts',
    'Michigan',
    'Minnesota',
    'Mississippi',
    'Missouri',
    'Montana',
    'Nebraska',
    'Nevada',
    'New Hampshire',
    'New Jersey',
    'New Mexico',
    'New York',
    'North Carolina',
    'North Dakota',
    'Ohio',
    'Oklahoma',
    'Oregon',
    'Pennsylvania',
    'Rhode Island',
    'South Carolina',
    'South Dakota',
    'Tennessee',
    'Texas',
    'Utah',
    'Vermont',
    'Virginia',
    'Washington',
    'West Virginia',
    'Wisconsin',
    'Wyoming',
  ];
  public faTrashCan = faTrashCan;
  public faArrowLeft = faArrowLeft;
  public contactForm = this.formBuilder.group({
    firstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z\\-]+')]],
    lastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z\\-]+')]], //must be letters only
    company: [''],
    addresses: this.formBuilder.array([this.buildAddressForm()]),
    emailAddresses: this.formBuilder.array([this.buildEmailForm()]),
    phoneNumbers: this.formBuilder.array([this.buildPhoneNumberForm()]), //number only
  });
  public contact: any;
  editMode: boolean = false;
  public id = this.activatedroute.snapshot.paramMap.get('id');
  constructor(
    private activatedroute: ActivatedRoute,
    private contactsService: ContactsService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    if (this.id) {
      this.editMode = true;
      this.contact = this.contactsService
        .getContactById(this.id)
        .subscribe((data) => {
          this.contactForm.patchValue(data);
        });
      console.log(this.contact);
    } else {
      this.contactForm.valueChanges.subscribe(() => {
        console.log(this.contactForm);
      });
    }
  }

  onSubmit() {
    if (this.id) {
      this.contactsService
        .updateContact(this.id, this.contactForm.value)
        .subscribe();
      this.contactForm.reset();
      alert('Update Successful!');
    } else {
      this.contactsService
        .findDuplicateContact(this.contactForm.value)
        .subscribe((response) => {
          if (response === null) {
            {
              if (
                this.contactForm?.errors &&
                this.contactForm.hasError('isDuplicatedContact')
              ) {
                delete this.contactForm.errors['isDuplicatedContact'];
                this.contactForm.updateValueAndValidity();
              }
              console.log(this.contactForm.errors);
              this.contactsService
                .addContact(this.contactForm.value)
                .subscribe();
              this.contactForm.reset();
              alert('Submission Successful!');
            }
          } else {
            this.contactForm.setErrors(response);
            console.log(response);
          }
        });
    }
  }

  private buildAddressForm(): FormGroup {
    return this.formBuilder.group({
      streetAddress: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipcode: ['', [Validators.maxLength(5), Validators.pattern('^[0-9]+')]], //5 number
    });
  }

  //emails cannot be duplicate
  private buildEmailForm(): FormGroup {
    return this.formBuilder.group({
      emailAddress: ['', [Validators.required, Validators.email]],
    });
  }

  //phonenumbers cannot be duplicate
  private buildPhoneNumberForm(): FormGroup {
    return this.formBuilder.group({
      phoneNumber: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]{10,}'),
          this.isDuplicatedPhoneNumber,
        ],
      ],
    });
  }

  public addEmailAddress() {
    const emailAddresses = this.contactForm.get('emailAddresses') as FormArray;
    emailAddresses.push(this.buildEmailForm());
  }

  public addPhoneNumber() {
    const phoneNumbers = this.contactForm.get('phoneNumbers') as FormArray;
    phoneNumbers.push(this.buildPhoneNumberForm());
  }

  public addAddress() {
    const addresses = this.contactForm.get('addresses') as FormArray;
    addresses.push(this.buildAddressForm());
  }

  public deleteEmail(index: any) {
    const emailAddresses = this.contactForm.get('emailAddresses') as FormArray;
    emailAddresses.removeAt(index);
  }

  public deletePhoneNumber(index: any) {
    const phoneNumbers = this.contactForm.get('phoneNumbers') as FormArray;
    phoneNumbers.removeAt(index);
  }

  public isDuplicatedPhoneNumber(input: FormControl) {
    const phoneFormGroup = input.parent;
    const phoneFormArray = phoneFormGroup?.parent as FormArray;

    if (phoneFormGroup && phoneFormArray) {
      const phoneNumbers =
        (phoneFormArray?.controls as FormGroup[])?.map(
          (group) => group.get('phoneNumber')?.value
        ) ?? [];

      let result = phoneNumbers.filter(
        (phoneNumber) => phoneNumber === input.value
      );
      return result.length <= 1 ? null : { isDuplicatedPhoneNumber: true };
    }
    return null;
  }
}
