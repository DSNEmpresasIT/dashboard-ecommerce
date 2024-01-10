import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService, AlertsType } from '../../services/alert.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../../services/supabase/supabase.service';
import { ModalNewProductService } from '../../services/modal-new-product.service';
import { Supplier } from '../../interfaces/supplier';
import { ButtonSpinerComponent } from "../button-spiner/button-spiner.component";
import { SupplierService } from '../../services/supabase/supplier.service';


@Component({
    selector: 'app-form-supplier',
    standalone: true,
    templateUrl: './form-supplier.component.html',
    styleUrl: './form-supplier.component.css',
    imports: [CommonModule, ButtonSpinerComponent, ReactiveFormsModule, FormsModule]
})
export class FormSupplierComponent {
  supplierForm: FormGroup ;
  isLoading: boolean= false;
  suppliers: Supplier[] | null = []; 
  supplierToEddit: Supplier | null = null;
  isEdit: boolean= false;
 

  constructor(private formBuilder: FormBuilder,
    private supabase: SupabaseService,
    private modalToggleService : ModalNewProductService,
    private supplierServ: SupplierService,
    private alertServ: AlertService
    ) {
    this.supplierForm = this.formBuilder.group({
      id: [ null ],
      name: ['', [Validators.required]],
      description: [''],
      phone: [''],
      address: [''],
    });
  }

  ngOnInit(): void {
    this.fetchAllSuppliers()
  }

  fetchAllSuppliers(){
    this.supplierServ.getSuppliers()
    .then((arg: Supplier[] | null)=>{
      this.suppliers = arg
    })
    .catch(error =>{
      console.log('error fetching suppliers', error)
    })
  }

  toggleModal(value: boolean) {
    this.modalToggleService.toggleEditSupplier(false)
  }

  toggleLoading(){
    this.isLoading = !this.isLoading
  }

  async onSubmit(): Promise<void> {
    if (this.supplierForm.valid) {
      this.toggleLoading();
      const supplier = this.supplierForm.value;
      if(!this.isEdit){
        delete supplier.id
      }
      try {
        if(this.isEdit){
           this.supplierServ.editSupplier(supplier);
        }else{
           this.supplierServ.createSupplier(supplier);
        }
        this.modalToggleService.toggleEditSupplier(false);
      } catch (error) {
        this.alertServ.show(6000, `${this.isEdit ? `No se pudo crear el proveedor error: ${error}` : `No se pudo editar el proveedor error: ${error}`}`, AlertsType.ERROR);
      } finally {
        this.toggleLoading();
        this.toggleModal(false);
      }
    }
  }

  editSuppliers(){
    this.isEdit = !this.isEdit;
    this.supplierForm.reset();
    this.supplierToEddit = null;
    this.fetchAllSuppliers()
  }

  getSupplierById(id: number | undefined){
    console.log(id, ' id supplier')
    this.supplierServ.getSupplierById(id).then((arg: Supplier | null)=>{
      this.supplierToEddit = arg
      console.log(arg, ' supplier to edit')
      this.updateFormValues(arg)
      console.log(this.supplierToEddit)
    })
  }

  private updateFormValues(arg: Supplier | null) {
    const supplier = arg;
    this.supplierForm.patchValue({
      id: supplier?.id,
      name: supplier?.name,
      description: supplier?.description,
      phone: supplier?.phone,
      address: supplier?.address,
    });
  }

}
