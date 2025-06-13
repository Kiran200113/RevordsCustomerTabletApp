import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function dateValidator(
  control: AbstractControl
): ValidationErrors | null {
  const dateValue = control.value;

  // Return null if the value is empty (optional for your use case)
  if (!dateValue) {
    return null;
  }

  const [month, day, year] = dateValue.split('/');

  // Construct a date object from the input
  const enteredDate = new Date(`${year}-${month}-${day}`);

  // Check if the date is valid
  if (
    enteredDate.getDate() !== parseInt(day, 10) ||
    enteredDate.getMonth() + 1 !== parseInt(month, 10) ||
    enteredDate.getFullYear() !== parseInt(year, 10)
  ) {
    return { invalidDate: true }; // Invalid date format
  }

  // Get the current date and compare it with the entered date
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0); // Normalize current date to midnight
  enteredDate.setHours(0, 0, 0, 0); // Normalize entered date to midnight

  if (enteredDate > currentDate) {
    return { futureDate: true }; // Date is in the future
  }

  return null; // Valid date
}
